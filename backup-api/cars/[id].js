// Vercel serverless function for managing individual cars
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract car ID from the query parameters
  const { id } = req.query;
  console.log('Car ID from query:', id);

  if (!id || isNaN(parseInt(id))) {
    console.error('Invalid car ID:', id);
    return res.status(400).json({ error: 'Invalid car ID' });
  }

  // Handle different HTTP methods
  try {
    switch (req.method) {
      case 'GET':
        return await getCar(req, res, id);
      case 'PUT':
        return await updateCar(req, res, id);
      case 'DELETE':
        return await deleteCar(req, res, id);
      default:
        console.error('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in cars/[id] handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};

// Get a car by ID
async function getCar(req, res, id) {
  console.log('Fetching car with ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching car:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch car', 
        message: error.message
      });
    }

    if (!data) {
      console.error('Car not found:', id);
      return res.status(404).json({ error: 'Car not found' });
    }

    // Process JSON fields
    const processedData = {
      ...data,
      images: processJsonField(data.images),
      features: processJsonField(data.features)
    };

    console.log('Car fetched successfully:', id);
    return res.status(200).json(processedData);
  } catch (error) {
    console.error('Error in getCar:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch car', 
      message: error.message
    });
  }
}

// Update a car
async function updateCar(req, res, id) {
  console.log('Updating car with ID:', id);
  
  try {
    // Validate request body
    if (!req.body) {
      console.error('No data provided for update');
      return res.status(400).json({ error: 'No data provided for update' });
    }
    
    console.log('Request body:', JSON.stringify(req.body));
    
    const carData = req.body;
    
    // Validate required fields
    if (!carData.name || !carData.category) {
      console.error('Missing required fields: name or category');
      return res.status(400).json({ error: 'Name and category are required' });
    }
    
    // Process data for storage
    const processedData = {
      ...carData,
      images: Array.isArray(carData.images) ? JSON.stringify(carData.images) : carData.images,
      features: Array.isArray(carData.features) ? JSON.stringify(carData.features) : carData.features
    };
    
    console.log('Processed car data for update:', JSON.stringify(processedData));
    
    // Update car in database
    const { data, error } = await supabase
      .from('cars')
      .update(processedData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating car:', error);
      return res.status(500).json({ 
        error: 'Failed to update car', 
        message: error.message
      });
    }

    if (!data || data.length === 0) {
      console.error('Car not found for update:', id);
      return res.status(404).json({ error: 'Car not found' });
    }

    // Process JSON fields for response
    const processedResponse = {
      ...data[0],
      images: processJsonField(data[0].images),
      features: processJsonField(data[0].features)
    };

    console.log('Car updated successfully:', id);
    return res.status(200).json(processedResponse);
  } catch (error) {
    console.error('Error in updateCar:', error);
    return res.status(500).json({ 
      error: 'Failed to update car', 
      message: error.message
    });
  }
}

// Delete a car
async function deleteCar(req, res, id) {
  console.log('Deleting car with ID:', id);
  
  try {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting car:', error);
      return res.status(500).json({ 
        error: 'Failed to delete car', 
        message: error.message
      });
    }

    console.log('Car deleted successfully:', id);
    return res.status(200).json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCar:', error);
    return res.status(500).json({ 
      error: 'Failed to delete car', 
      message: error.message
    });
  }
}

// Helper function to process JSON fields
function processJsonField(field) {
  if (!field) return [];
  
  try {
    if (typeof field === 'string') {
      return JSON.parse(field);
    }
    return field;
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return [];
  }
}

// Vercel serverless function for managing individual cars
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('API Request received to /api/cars/[id]');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. URL or key is empty.');
}

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

  // Extract car ID from the URL
  const id = req.url.split('/').pop();
  console.log('Car ID:', id);

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
      message: error.message,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
};

// Get a single car by ID
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
      return res.status(404).json({ error: 'Car not found', details: error.message });
    }

    if (!data) {
      console.error('Car not found with ID:', id);
      return res.status(404).json({ error: 'Car not found' });
    }

    console.log('Car found:', data.id);
    
    // Process arrays if needed
    if (data.images && typeof data.images === 'string') {
      try {
        data.images = JSON.parse(data.images);
      } catch (e) {
        console.error('Error parsing images JSON:', e);
        data.images = data.images.split(',').map(url => url.trim());
      }
    }
    
    if (data.features && typeof data.features === 'string') {
      try {
        data.features = JSON.parse(data.features);
      } catch (e) {
        console.error('Error parsing features JSON:', e);
        data.features = data.features.split(',').map(feature => feature.trim());
      }
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in getCar:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch car', 
      message: error.message,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
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
    
    // Create a processed copy of the data for storage
    const processedData = { ...carData };
    
    // Process images array
    if (processedData.images) {
      if (Array.isArray(processedData.images)) {
        console.log('Processing images array:', processedData.images.length, 'images');
        processedData.images = JSON.stringify(processedData.images);
      } else if (typeof processedData.images === 'string') {
        // Check if it's already a JSON string
        try {
          JSON.parse(processedData.images);
          console.log('Images already in JSON string format');
        } catch (e) {
          // If not a valid JSON string, convert to JSON
          console.log('Converting images string to JSON');
          processedData.images = JSON.stringify(processedData.images.split(',').map(url => url.trim()));
        }
      } else {
        console.error('Invalid images format:', typeof processedData.images);
        return res.status(400).json({ error: 'Invalid images format' });
      }
    } else {
      // Default to empty array if images is missing
      processedData.images = JSON.stringify([]);
    }
    
    // Process features array
    if (processedData.features) {
      if (Array.isArray(processedData.features)) {
        console.log('Processing features array:', processedData.features.length, 'features');
        // Filter out empty features
        processedData.features = JSON.stringify(processedData.features.filter(f => f.trim() !== ''));
      } else if (typeof processedData.features === 'string') {
        // Check if it's already a JSON string
        try {
          JSON.parse(processedData.features);
          console.log('Features already in JSON string format');
        } catch (e) {
          // If not a valid JSON string, convert to JSON
          console.log('Converting features string to JSON');
          processedData.features = JSON.stringify(processedData.features.split(',')
            .map(feature => feature.trim())
            .filter(feature => feature !== ''));
        }
      } else {
        console.error('Invalid features format:', typeof processedData.features);
        return res.status(400).json({ error: 'Invalid features format' });
      }
    } else {
      // Default to empty array if features is missing
      processedData.features = JSON.stringify([]);
    }
    
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
        message: error.message,
        details: error
      });
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update operation');
      // Check if the car exists
      const { data: checkData, error: checkError } = await supabase
        .from('cars')
        .select('id')
        .eq('id', id)
        .single();
        
      if (checkError || !checkData) {
        return res.status(404).json({ error: 'Car not found' });
      }
      
      // Car exists but no data returned (might be no changes)
      return res.status(200).json({ id: parseInt(id), message: 'No changes applied' });
    }

    console.log('Car updated successfully:', id);
    
    // Process arrays for response
    const processedResponse = { ...data[0] };
    
    if (processedResponse.images && typeof processedResponse.images === 'string') {
      try {
        processedResponse.images = JSON.parse(processedResponse.images);
      } catch (e) {
        console.error('Error parsing response images JSON:', e);
        processedResponse.images = processedResponse.images.split(',').map(url => url.trim());
      }
    }
    
    if (processedResponse.features && typeof processedResponse.features === 'string') {
      try {
        processedResponse.features = JSON.parse(processedResponse.features);
      } catch (e) {
        console.error('Error parsing response features JSON:', e);
        processedResponse.features = processedResponse.features.split(',').map(feature => feature.trim());
      }
    }
    
    return res.status(200).json(processedResponse);
  } catch (error) {
    console.error('Error in updateCar:', error);
    return res.status(500).json({ 
      error: 'Failed to update car', 
      message: error.message,
      stack: error.stack,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
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
        message: error.message,
        details: error
      });
    }

    console.log('Car deleted successfully:', id);
    return res.status(200).json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCar:', error);
    return res.status(500).json({ 
      error: 'Failed to delete car', 
      message: error.message,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
}

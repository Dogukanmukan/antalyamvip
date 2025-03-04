// Vercel serverless function for fetching cars
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. URL or key is empty.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
  console.log('API Request received to /api/cars');
  console.log('Request method:', req.method);

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getCars(req, res);
      case 'POST':
        return await createCar(req, res);
      default:
        console.error('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in cars handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message, 
      stack: error.stack,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
}

// Get all cars
async function getCars(req, res) {
  console.log('Fetching all cars from Supabase...');
  
  try {
    // Fetch cars from Supabase
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data ? data.length : 0} cars`);
    
    if (!data || data.length === 0) {
      console.log('No cars found in database');
      return res.status(200).json([]);
    }
    
    // Process arrays for response
    const processedData = data.map(car => ({
      ...car,
      images: processJsonField(car.images),
      features: processJsonField(car.features)
    }));
    
    return res.status(200).json(processedData);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch cars', 
      message: error.message,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
}

// Create a new car
async function createCar(req, res) {
  console.log('Creating new car...');
  console.log('Request body:', JSON.stringify(req.body));
  
  try {
    const carData = req.body;
    
    if (!carData) {
      console.error('No car data provided');
      return res.status(400).json({ 
        success: false,
        error: 'No car data provided' 
      });
    }
    
    // Validate required fields
    if (!carData.name || !carData.category) {
      console.error('Missing required fields: name or category');
      return res.status(400).json({ 
        success: false,
        error: 'Name and category are required' 
      });
    }
    
    // Process arrays for storage
    const processedData = {
      ...carData,
      images: Array.isArray(carData.images) ? JSON.stringify(carData.images) : carData.images,
      features: Array.isArray(carData.features) ? JSON.stringify(carData.features) : carData.features
    };
    
    console.log('Processed car data:', JSON.stringify(processedData));
    
    // Insert car into database
    const { data, error } = await supabase
      .from('cars')
      .insert([processedData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('No data returned from insert operation');
      throw new Error('No data returned from insert operation');
    }

    console.log('Car created successfully:', data[0].id);
    
    // Process arrays for response
    const processedResponse = {
      ...data[0],
      images: processJsonField(data[0].images),
      features: processJsonField(data[0].features)
    };
    
    return res.status(201).json({
      success: true,
      car: processedResponse
    });
  } catch (error) {
    console.error('Error creating car:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create car',
      message: error.message,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
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

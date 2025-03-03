// Vercel serverless function for fetching cars
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('API Request received to /api/cars');
console.log('Request method:', req.method);
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  console.log('Request method:', req.method);
  
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
    return res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
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

    if (error) throw error;

    console.log(`Successfully fetched ${data.length} cars`);
    
    // Process arrays for response
    const processedData = data.map(car => ({
      ...car,
      images: typeof car.images === 'string' ? JSON.parse(car.images) : car.images || [],
      features: typeof car.features === 'string' ? JSON.parse(car.features) : car.features || []
    }));
    
    return res.status(200).json(processedData);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return res.status(500).json({ error: 'Failed to fetch cars' });
  }
}

// Create a new car
async function createCar(req, res) {
  console.log('Creating new car...');
  console.log('Request body:', req.body);
  
  try {
    const carData = req.body;
    
    if (!carData || !carData.name || !carData.category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    
    // Process arrays for storage
    const processedData = {
      ...carData,
      images: Array.isArray(carData.images) ? JSON.stringify(carData.images) : carData.images,
      features: Array.isArray(carData.features) ? JSON.stringify(carData.features) : carData.features
    };
    
    // Insert car into database
    const { data, error } = await supabase
      .from('cars')
      .insert([processedData])
      .select();

    if (error) throw error;

    console.log('Car created successfully:', data[0].id);
    
    // Process arrays for response
    const processedResponse = {
      ...data[0],
      images: typeof data[0].images === 'string' ? JSON.parse(data[0].images) : data[0].images || [],
      features: typeof data[0].features === 'string' ? JSON.parse(data[0].features) : data[0].features || []
    };
    
    return res.status(201).json(processedResponse);
  } catch (error) {
    console.error('Error creating car:', error);
    return res.status(500).json({ error: 'Failed to create car' });
  }
}

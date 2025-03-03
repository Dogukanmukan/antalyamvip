// Vercel serverless function for managing individual cars
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('API Request received to /api/cars/[id]');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

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
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get a single car by ID
async function getCar(req, res, id) {
  console.log('Fetching car with ID:', id);
  
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching car:', error);
    return res.status(404).json({ error: 'Car not found', details: error });
  }

  console.log('Car found:', data.id);
  
  // Process arrays if needed
  if (data.images && typeof data.images === 'string') {
    try {
      data.images = JSON.parse(data.images);
    } catch (e) {
      data.images = data.images.split(',').map(url => url.trim());
    }
  }
  
  if (data.features && typeof data.features === 'string') {
    try {
      data.features = JSON.parse(data.features);
    } catch (e) {
      data.features = data.features.split(',').map(feature => feature.trim());
    }
  }
  
  return res.status(200).json(data);
}

// Update a car
async function updateCar(req, res, id) {
  console.log('Updating car with ID:', id);
  console.log('Request body:', req.body);
  
  // Validate request body
  if (!req.body) {
    return res.status(400).json({ error: 'No data provided' });
  }
  
  const carData = req.body;
  
  // Process arrays if needed
  if (carData.images && Array.isArray(carData.images)) {
    carData.images = JSON.stringify(carData.images);
  }
  
  if (carData.features && Array.isArray(carData.features)) {
    carData.features = JSON.stringify(carData.features);
  }
  
  // Update car in database
  const { data, error } = await supabase
    .from('cars')
    .update(carData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating car:', error);
    return res.status(500).json({ error: 'Failed to update car', details: error });
  }

  console.log('Car updated successfully:', id);
  
  // Process arrays for response
  if (data && data[0]) {
    if (data[0].images && typeof data[0].images === 'string') {
      try {
        data[0].images = JSON.parse(data[0].images);
      } catch (e) {
        data[0].images = data[0].images.split(',').map(url => url.trim());
      }
    }
    
    if (data[0].features && typeof data[0].features === 'string') {
      try {
        data[0].features = JSON.parse(data[0].features);
      } catch (e) {
        data[0].features = data[0].features.split(',').map(feature => feature.trim());
      }
    }
  }
  
  return res.status(200).json(data ? data[0] : { id });
}

// Delete a car
async function deleteCar(req, res, id) {
  console.log('Deleting car with ID:', id);
  
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting car:', error);
    return res.status(500).json({ error: 'Failed to delete car', details: error });
  }

  console.log('Car deleted successfully:', id);
  return res.status(200).json({ success: true, message: 'Car deleted successfully' });
}

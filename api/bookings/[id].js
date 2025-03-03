// Vercel serverless function for handling a single booking by ID
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Get booking ID from URL
  const { id } = req.query;
  
  console.log(`API Request received to /api/bookings/${id}`);
  console.log('Request method:', req.method);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!id) {
    return res.status(400).json({ 
      success: false,
      error: 'Booking ID is required' 
    });
  }

  try {
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getBookingById(req, res, id);
      case 'PUT':
        return await updateBookingById(req, res, id);
      case 'DELETE':
        return await deleteBookingById(req, res, id);
      default:
        console.error('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in booking handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Get a booking by ID
async function getBookingById(req, res, id) {
  console.log(`Fetching booking with ID: ${id}`);
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars (
          id,
          name,
          category,
          price,
          images
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'Booking not found' 
        });
      }
      
      throw error;
    }

    if (!data) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    console.log('Booking fetched successfully');
    
    // Process car images if they exist
    const processedData = {
      ...data,
      cars: data.cars ? {
        ...data.cars,
        images: typeof data.cars.images === 'string' 
          ? JSON.parse(data.cars.images) 
          : data.cars.images || []
      } : null
    };
    
    return res.status(200).json({
      success: true,
      booking: processedData
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch booking',
      details: error.message
    });
  }
}

// Update a booking by ID
async function updateBookingById(req, res, id) {
  console.log(`Updating booking with ID: ${id}`);
  console.log('Request body:', req.body);
  
  try {
    const updateData = req.body;
    
    // Update booking in database
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    console.log('Booking updated successfully');
    
    return res.status(200).json({
      success: true,
      booking: data[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update booking',
      details: error.message
    });
  }
}

// Delete a booking by ID
async function deleteBookingById(req, res, id) {
  console.log(`Deleting booking with ID: ${id}`);
  
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Booking deleted successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete booking',
      details: error.message
    });
  }
} 
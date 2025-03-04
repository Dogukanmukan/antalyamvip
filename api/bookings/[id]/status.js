// Vercel serverless function for updating booking status
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
  
  console.log(`API Request received to /api/bookings/${id}/status`);
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

  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('Request body:', req.body);
    
    // Check if status is provided
    const { status } = req.body;
    
    if (status === undefined || status === null) {
      return res.status(400).json({ 
        success: false,
        error: 'Status is required' 
      });
    }
    
    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', ''];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status value',
        validValues: validStatuses
      });
    }
    
    console.log(`Updating booking ${id} status to: ${status || 'empty'}`);
    
    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    // Only include status if it's not empty
    if (status !== '') {
      updateData.status = status;
    }
    
    // Update booking status in database
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Database error',
        message: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    console.log('Booking status updated successfully');
    
    return res.status(200).json({
      success: true,
      booking: data[0]
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update booking status',
      message: error.message || 'Unknown error'
    });
  }
} 
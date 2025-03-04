// Vercel serverless function for bookings
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

// Güvenli JSON ayrıştırma yardımcı fonksiyonu
function safeJsonParse(jsonString) {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('JSON parse error:', error);
    return [];
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  console.log('Request method:', req.method);
  console.log('API Request received to /api/bookings');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Route based on HTTP method
    switch (req.method) {
      case 'GET':
        return await getBookings(req, res);
      case 'POST':
        return await createBooking(req, res);
      case 'PUT':
        return await updateBooking(req, res);
      default:
        console.error('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in bookings handler:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      message: error.message || 'Unknown error', 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
}

// Get all bookings
async function getBookings(req, res) {
  console.log('Fetching all bookings from Supabase...');
  
  try {
    // Parse query parameters
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const status = req.query.status;
    
    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        cars (
          id,
          name,
          category,
          price_per_day,
          images
        )
      `);
    
    // Apply filters if provided
    if (startDate) {
      query = query.gte('pickup_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('pickup_date', endDate);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Order by created_at
    query = query.order('created_at', { ascending: false });
    
    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database query error',
        message: error.message
      });
    }

    console.log(`Successfully fetched ${data ? data.length : 0} bookings`);
    
    if (!data || data.length === 0) {
      console.log('No bookings found in database');
      return res.status(200).json({
        success: true,
        bookings: []
      });
    }
    
    // Process data if needed
    const processedData = data.map(booking => {
      try {
        // Araç bilgisi varsa işle
        const carData = booking.cars ? {
          ...booking.cars,
          // Güvenli JSON ayrıştırma
          images: safeJsonParse(booking.cars.images)
        } : null;
        
        return {
          ...booking,
          cars: carData
        };
      } catch (err) {
        console.error('Error processing booking data:', err, booking);
        // Hata olsa bile rezervasyonu döndür, sadece araç bilgisini null olarak ayarla
        return {
          ...booking,
          cars: null,
          _processingError: err.message
        };
      }
    });
    
    return res.status(200).json({
      success: true,
      bookings: processedData
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch bookings',
      message: error.message || 'Unknown error',
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
}

// Create a new booking
async function createBooking(req, res) {
  console.log('Creating new booking...');
  console.log('Request body:', JSON.stringify(req.body));
  
  try {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData) {
      console.error('No booking data provided');
      return res.status(400).json({ 
        success: false,
        error: 'No booking data provided' 
      });
    }
    
    // Check for required fields
    const requiredFields = ['pickup_location', 'dropoff_location', 'pickup_date', 'car_id', 'full_name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        error: 'Required fields are missing',
        missingFields: missingFields
      });
    }
    
    // Set default status if not provided
    if (!bookingData.status) {
      bookingData.status = 'pending';
    }
    
    console.log('Prepared booking data:', JSON.stringify(bookingData));
    
    // Insert booking into database
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('No data returned from insert operation');
      throw new Error('No data returned from insert operation');
    }

    console.log('Booking created successfully:', data[0].id);
    
    return res.status(201).json({
      success: true,
      booking: data[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create booking',
      message: error.message,
      supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
      supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
    });
  }
}

// Update a booking
async function updateBooking(req, res) {
  console.log('Updating booking...');
  console.log('Request body:', req.body);
  
  try {
    const { id, ...updateData } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Booking ID is required' 
      });
    }
    
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

    console.log('Booking updated successfully:', id);
    
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
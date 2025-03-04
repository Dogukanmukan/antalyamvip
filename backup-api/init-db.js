// Vercel serverless function for database initialization
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check tables existence
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const { data: carsData, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .limit(1);
    
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
    
    // Check table status
    const tablesStatus = {
      users: usersError ? false : true,
      cars: carsError ? false : true,
      bookings: bookingsError ? false : true
    };
    
    if (!tablesStatus.users || !tablesStatus.cars || !tablesStatus.bookings) {
      return res.status(200).json({ 
        success: false, 
        message: 'Some tables are missing. Please run the SQL queries in sql/init.sql in the Supabase SQL editor.',
        tablesStatus
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'All tables exist. Database initialized successfully.',
      tablesStatus
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return res.status(500).json({ success: false, message: 'Error initializing database' });
  }
};

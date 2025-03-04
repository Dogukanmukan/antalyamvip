import { createClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from '../../lib/config';

// This file is used to check the Supabase connection independently

// Get Supabase configuration
const supabaseUrl = getRuntimeConfig('SUPABASE_URL');
const supabaseKey = getRuntimeConfig('SUPABASE_ANON_KEY');

console.log('Connection Check - Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseKey ? supabaseKey.length : 0
});

// Create a test client
const testClient = createClient(supabaseUrl, supabaseKey);

// Function to test the connection
export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Try to fetch a simple count from cars table
    const { data, error } = await testClient
      .from('cars')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection test FAILED:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('Supabase connection test SUCCESS:', data);
    return {
      success: true,
      data
    };
  } catch (err: any) {
    console.error('Supabase connection test EXCEPTION:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

// Run the test immediately
testSupabaseConnection();

// Export a function to check RLS policies
export async function checkRlsPolicies() {
  console.log('Checking RLS policies...');
  
  try {
    // Try to fetch data from different tables
    const [carsResult, bookingsResult] = await Promise.all([
      testClient.from('cars').select('count').limit(1),
      testClient.from('bookings').select('count').limit(1)
    ]);
    
    console.log('RLS Policy Check Results:', {
      cars: carsResult.error ? 'ERROR: ' + carsResult.error.message : 'SUCCESS',
      bookings: bookingsResult.error ? 'ERROR: ' + bookingsResult.error.message : 'SUCCESS'
    });
    
    return {
      cars: {
        success: !carsResult.error,
        error: carsResult.error?.message
      },
      bookings: {
        success: !bookingsResult.error,
        error: bookingsResult.error?.message
      }
    };
  } catch (err: any) {
    console.error('RLS policy check EXCEPTION:', err.message);
    return {
      cars: { success: false, error: err.message },
      bookings: { success: false, error: err.message }
    };
  }
}

// Run the RLS check immediately
checkRlsPolicies(); 
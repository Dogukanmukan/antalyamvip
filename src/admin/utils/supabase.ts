import { createClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from '../../lib/config';

// Get Supabase configuration from runtime config
const supabaseUrl = getRuntimeConfig('SUPABASE_URL');
const supabaseAnonKey = getRuntimeConfig('SUPABASE_ANON_KEY');

// Ensure we have valid Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Missing Supabase credentials in admin/utils/supabase.ts', {
    url: supabaseUrl ? 'defined' : 'undefined',
    key: supabaseAnonKey ? 'defined (length: ' + supabaseAnonKey.length + ')' : 'undefined'
  });
}

// Log configuration source for debugging
console.log('Admin Supabase Client Initializing:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

// Create a single supabase client for the admin panel with detailed options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Test the connection
(async () => {
  try {
    const { data, error } = await supabase.from('cars').select('count').limit(1);
    if (error) {
      console.error('Admin Supabase connection test failed:', error.message);
    } else {
      console.log('Admin Supabase connection test successful:', data);
    }
  } catch (err) {
    console.error('Admin Supabase connection test exception:', err);
  }
})();

// Type definitions for database tables
export type User = {
  id: string;
  email: string;
  password?: string;
  username?: string;
  created_at: string;
};

export type Car = {
  id: string;
  name: string;
  category: string;
  image?: string;
  images?: string[] | string; // Can be string (JSON) or parsed array
  year?: number;
  fuel_type?: string;
  seats: number;
  features?: any; // JSON object
  price_per_day: number;
  status?: 'active' | 'maintenance' | 'unavailable';
  created_at: string;
};

export type Booking = {
  id: string;
  trip_type: 'oneWay' | 'roundTrip';
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  return_pickup_location?: string;
  return_dropoff_location?: string;
  return_date?: string;
  passengers: number;
  car_id: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  car?: Car;
};

export type DashboardStats = {
  totalBookings: number;
  totalCars: number;
  activeBookings: number;
  monthlyRevenue: number;
  bookingCompletionRate: number;
  carOccupancyRate: number;
  cancellationRate: number;
}; 
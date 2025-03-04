import { createClient } from '@supabase/supabase-js';

// Environment variables are already set up in your project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the admin panel
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
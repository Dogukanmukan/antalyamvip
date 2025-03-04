import { createClient } from '@supabase/supabase-js';
import { User, Car, Booking, DashboardStats } from './supabase';
import { safeJsonParse } from './migration-helper';

// Initialize Supabase client
const DEFAULT_URL = 'https://exdgeyldiufinjgwkeqy.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGdleWxkaXVmaW5qZ3drZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjYyOTgsImV4cCI6MjA1NjY0MjI5OH0.6_-UHxCaWL8twSGkHZQulQCSwvpvIMVVJ7ngSUnuQDc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

// Değerleri kontrol et
if (supabaseUrl === DEFAULT_URL || supabaseKey === DEFAULT_KEY) {
  console.warn('API-Supabase: Supabase için varsayılan değerler kullanılıyor!', {
    url: supabaseUrl === DEFAULT_URL ? 'DEFAULT' : 'ENV',
    key: supabaseKey === DEFAULT_KEY ? 'DEFAULT' : 'ENV'
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    // Get user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    return {
      user: userData as User,
      token: data.session.access_token,
    };
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    
    // Clear local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    // First check if we have a session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      return null;
    }
    
    // Get user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    if (userError) {
      return null;
    }

    return userData as User;
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, car:cars(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(booking => ({
      ...booking,
      // Parse JSON strings if needed
      car: booking.car as Car
    })) as Booking[];
  },

  getById: async (id: string): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, car:cars(*)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      car: data.car as Car
    } as Booking;
  },

  create: async (bookingData: Partial<Booking>): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select('*, car:cars(*)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      car: data.car as Car
    } as Booking;
  },

  updateStatus: async (id: string, status: string): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*, car:cars(*)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      car: data.car as Car
    } as Booking;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
};

// Cars API
export const carsAPI = {
  getAll: async (): Promise<Car[]> => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(car => ({
      ...car,
      // Parse JSON strings if needed
      images: safeJsonParse(car.images as string, []),
      features: safeJsonParse(car.features as string, {})
    })) as Car[];
  },

  getById: async (id: string): Promise<Car> => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      // Parse JSON strings if needed
      images: safeJsonParse(data.images as string, []),
      features: safeJsonParse(data.features as string, {})
    } as Car;
  },

  create: async (carData: Partial<Car>): Promise<Car> => {
    // Convert arrays/objects to JSON strings for storage
    const dataToInsert = {
      ...carData,
      images: Array.isArray(carData.images) ? JSON.stringify(carData.images) : carData.images,
      features: carData.features ? JSON.stringify(carData.features) : undefined
    };

    const { data, error } = await supabase
      .from('cars')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      // Parse JSON strings back to objects/arrays
      images: safeJsonParse(data.images as string, []),
      features: safeJsonParse(data.features as string, {})
    } as Car;
  },

  update: async (id: string, carData: Partial<Car>): Promise<Car> => {
    // Convert arrays/objects to JSON strings for storage
    const dataToUpdate = {
      ...carData,
      images: Array.isArray(carData.images) ? JSON.stringify(carData.images) : carData.images,
      features: carData.features ? JSON.stringify(carData.features) : undefined
    };

    const { data, error } = await supabase
      .from('cars')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ...data,
      // Parse JSON strings back to objects/arrays
      images: safeJsonParse(data.images as string, []),
      features: safeJsonParse(data.features as string, {})
    } as Car;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
};

// Stats API
export const statsAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Get stats from the dashboard_stats view
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single();

    if (error) {
      // Fallback to calculating stats manually if view doesn't exist
      return await calculateDashboardStats();
    }

    return data as DashboardStats;
  }
};

// Helper function to calculate dashboard stats if the view doesn't exist
async function calculateDashboardStats(): Promise<DashboardStats> {
  // Get total bookings
  const { count: totalBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get active bookings (pending or confirmed)
  const { count: activeBookings, error: activeError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'confirmed']);

  // Get total cars
  const { count: totalCars, error: carsError } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true });

  // Get cancelled bookings for cancellation rate
  const { count: cancelledBookings, error: cancelledError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled');

  // Get completed bookings for completion rate
  const { count: completedBookings, error: completedError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  if (bookingsError || activeError || carsError || cancelledError || completedError) {
    throw new Error('Failed to calculate dashboard stats');
  }

  // Calculate rates
  const bookingCompletionRate = totalBookings ? (completedBookings || 0) / totalBookings * 100 : 0;
  const cancellationRate = totalBookings ? (cancelledBookings || 0) / totalBookings * 100 : 0;
  
  // For car occupancy and monthly revenue, we would need more complex queries
  // This is a simplified version
  const carOccupancyRate = totalCars ? (activeBookings || 0) / totalCars * 100 : 0;
  
  // For monthly revenue, we would ideally sum the prices from completed bookings in the current month
  // For now, we'll use a placeholder value
  const monthlyRevenue = 5000; // Placeholder

  return {
    totalBookings: totalBookings || 0,
    totalCars: totalCars || 0,
    activeBookings: activeBookings || 0,
    monthlyRevenue,
    bookingCompletionRate,
    carOccupancyRate,
    cancellationRate
  };
}

// Settings API
export const settingsAPI = {
  getSettings: async (): Promise<any> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      // Return default settings if none exist
      return {
        id: 1,
        general: {
          siteName: 'Alanyam VIP',
          contactEmail: 'info@alanyamvip.com',
          contactPhone: '+90 555 123 4567'
        },
        appearance: {
          theme: 'light',
          primaryColor: '#F59E0B',
          logo: '/uploads/logo.png'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false
        }
      };
    }

    return {
      ...data,
      general: safeJsonParse(data.general as string, {}),
      appearance: safeJsonParse(data.appearance as string, {}),
      notifications: safeJsonParse(data.notifications as string, {}),
      security: safeJsonParse(data.security as string, {})
    };
  },

  updateSettings: async (settings: any): Promise<any> => {
    // Convert objects to JSON strings for storage
    const dataToUpdate = {
      ...settings,
      general: typeof settings.general === 'object' ? JSON.stringify(settings.general) : settings.general,
      appearance: typeof settings.appearance === 'object' ? JSON.stringify(settings.appearance) : settings.appearance,
      notifications: typeof settings.notifications === 'object' ? JSON.stringify(settings.notifications) : settings.notifications,
      security: typeof settings.security === 'object' ? JSON.stringify(settings.security) : settings.security
    };

    // Check if settings already exist
    const { data: existingData, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .single();

    let result;
    
    if (checkError || !existingData) {
      // Insert new settings
      const { data, error } = await supabase
        .from('settings')
        .insert([dataToUpdate])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      result = data;
    } else {
      // Update existing settings
      const { data, error } = await supabase
        .from('settings')
        .update(dataToUpdate)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      
      result = data;
    }

    return {
      ...result,
      general: safeJsonParse(result.general as string, {}),
      appearance: safeJsonParse(result.appearance as string, {}),
      notifications: safeJsonParse(result.notifications as string, {}),
      security: safeJsonParse(result.security as string, {})
    };
  }
};

export default {
  auth: authAPI,
  bookings: bookingsAPI,
  cars: carsAPI,
  stats: statsAPI,
  settings: settingsAPI
}; 
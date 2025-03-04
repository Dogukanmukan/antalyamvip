import { createClient } from '@supabase/supabase-js';
import { User, Car, Booking, DashboardStats } from './supabase';
import { safeJsonParse } from './migration-helper';
import { getRuntimeConfig } from '../../lib/config';

// Initialize Supabase client using runtime config
const supabaseUrl = getRuntimeConfig('SUPABASE_URL');
const supabaseKey = getRuntimeConfig('SUPABASE_ANON_KEY');

// Ensure we have valid Supabase credentials
if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Missing Supabase credentials in api-supabase.ts', {
    url: supabaseUrl ? 'defined' : 'undefined',
    key: supabaseKey ? 'defined (length: ' + supabaseKey.length + ')' : 'undefined'
  });
}

// Log configuration for debugging
console.log('API-Supabase Client Initializing:', { 
  url: supabaseUrl,
  keyLength: supabaseKey ? supabaseKey.length : 0
});

// Create Supabase client with detailed options
const supabase = createClient(supabaseUrl, supabaseKey, {
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
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection test successful:', data);
    }
  } catch (err) {
    console.error('Supabase connection test exception:', err);
  }
})();

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
    console.log('bookingsAPI.getAll: Fetching all bookings from Supabase');
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, car:cars(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('bookingsAPI.getAll: Supabase error:', error);
        throw new Error(error.message);
      }

      console.log(`bookingsAPI.getAll: Successfully fetched ${data?.length || 0} bookings`);
      
      return (data || []).map(booking => ({
        ...booking,
        // Parse JSON strings if needed
        car: booking.car as Car
      })) as Booking[];
    } catch (err) {
      console.error('bookingsAPI.getAll: Exception:', err);
      throw err;
    }
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
    console.log('carsAPI.getAll: Fetching all cars from Supabase');
    
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('carsAPI.getAll: Supabase error:', error);
        throw new Error(error.message);
      }

      console.log(`carsAPI.getAll: Successfully fetched ${data?.length || 0} cars`);
      
      return (data || []).map(car => ({
        ...car,
        // Parse JSON strings if needed
        images: safeJsonParse(car.images as string, []),
        features: safeJsonParse(car.features as string, {})
      })) as Car[];
    } catch (err) {
      console.error('carsAPI.getAll: Exception:', err);
      throw err;
    }
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
          theme: 'dark',
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

// File Upload API
export const fileAPI = {
  uploadFile: async (file: File, folder: string = 'car-images'): Promise<{ url: string; path: string }> => {
    try {
      // Dosya adını oluştur (UUID + orijinal dosya uzantısı)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log('Uploading file to Supabase storage:', { fileName, filePath, fileType: file.type });
      
      // Dosyayı Supabase storage'a yükle
      const { error } = await supabase.storage
        .from('public-images')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });
        
      if (error) {
        console.error('Supabase storage upload error:', error);
        throw new Error(`File upload failed: ${error.message}`);
      }
      
      // Dosya URL'sini al
      const { data: urlData } = supabase.storage
        .from('public-images')
        .getPublicUrl(filePath);
        
      console.log('File uploaded successfully:', urlData.publicUrl);
      
      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
};

export default {
  auth: authAPI,
  bookings: bookingsAPI,
  cars: carsAPI,
  stats: statsAPI,
  settings: settingsAPI,
  files: fileAPI
}; 
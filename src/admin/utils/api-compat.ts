import { authAPI as oldAuthAPI, bookingsAPI as oldBookingsAPI, carsAPI as oldCarsAPI, statsAPI as oldStatsAPI } from './api';
import { authAPI as newAuthAPI, bookingsAPI as newBookingsAPI, carsAPI as newCarsAPI, statsAPI as newStatsAPI } from './api-supabase';
import { settingsAPI as newSettingsAPI } from './api-supabase';
import { convertOldBookingToSupabase, convertSupabaseBookingToOld, convertOldCarToSupabase, convertSupabaseCarToOld } from './migration-helper';

// Flag to control which API to use
// Set this to true to use the new Supabase API
const USE_SUPABASE_API = false;

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    if (USE_SUPABASE_API) {
      return await newAuthAPI.login(email, password);
    } else {
      return await oldAuthAPI.login(email, password);
    }
  },
  
  logout: () => {
    if (USE_SUPABASE_API) {
      return newAuthAPI.logout();
    } else {
      return oldAuthAPI.logout();
    }
  },
  
  getCurrentUser: () => {
    if (USE_SUPABASE_API) {
      return newAuthAPI.getCurrentUser();
    } else {
      return oldAuthAPI.getCurrentUser();
    }
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    if (USE_SUPABASE_API) {
      const bookings = await newBookingsAPI.getAll();
      // Convert to old format for backward compatibility
      return bookings.map(convertSupabaseBookingToOld);
    } else {
      return await oldBookingsAPI.getAll();
    }
  },
  
  getById: async (id: number | string) => {
    if (USE_SUPABASE_API) {
      const booking = await newBookingsAPI.getById(id.toString());
      // Convert to old format for backward compatibility
      return convertSupabaseBookingToOld(booking);
    } else {
      return await oldBookingsAPI.getById(Number(id));
    }
  },
  
  updateStatus: async (id: number | string, status: string) => {
    if (USE_SUPABASE_API) {
      const booking = await newBookingsAPI.updateStatus(id.toString(), status);
      // Convert to old format for backward compatibility
      return convertSupabaseBookingToOld(booking);
    } else {
      return await oldBookingsAPI.updateStatus(Number(id), status);
    }
  },
  
  delete: async (id: number | string) => {
    if (USE_SUPABASE_API) {
      return await newBookingsAPI.delete(id.toString());
    } else {
      return await oldBookingsAPI.delete(Number(id));
    }
  }
};

// Cars API
export const carsAPI = {
  getAll: async () => {
    if (USE_SUPABASE_API) {
      const cars = await newCarsAPI.getAll();
      // Convert to old format for backward compatibility
      return cars.map(convertSupabaseCarToOld);
    } else {
      return await oldCarsAPI.getAll();
    }
  },
  
  getById: async (id: number | string) => {
    if (USE_SUPABASE_API) {
      const car = await newCarsAPI.getById(id.toString());
      // Convert to old format for backward compatibility
      return convertSupabaseCarToOld(car);
    } else {
      return await oldCarsAPI.getById(Number(id));
    }
  },
  
  create: async (carData: any) => {
    if (USE_SUPABASE_API) {
      // Convert to Supabase format
      const supabaseCar = convertOldCarToSupabase(carData);
      const car = await newCarsAPI.create(supabaseCar);
      // Convert back to old format for backward compatibility
      return convertSupabaseCarToOld(car);
    } else {
      return await oldCarsAPI.create(carData);
    }
  },
  
  update: async (id: number | string, carData: any) => {
    if (USE_SUPABASE_API) {
      // Convert to Supabase format
      const supabaseCar = convertOldCarToSupabase(carData);
      const car = await newCarsAPI.update(id.toString(), supabaseCar);
      // Convert back to old format for backward compatibility
      return convertSupabaseCarToOld(car);
    } else {
      return await oldCarsAPI.update(Number(id), carData);
    }
  },
  
  delete: async (id: number | string) => {
    if (USE_SUPABASE_API) {
      return await newCarsAPI.delete(id.toString());
    } else {
      return await oldCarsAPI.delete(Number(id));
    }
  }
};

// Stats API
export const statsAPI = {
  getDashboardStats: async () => {
    if (USE_SUPABASE_API) {
      return await newStatsAPI.getDashboardStats();
    } else {
      return await oldStatsAPI.getDashboardStats();
    }
  }
};

// Settings API (only available in new API)
export const settingsAPI = {
  getSettings: async (): Promise<any> => {
    if (USE_SUPABASE_API) {
      return await newSettingsAPI.getSettings();
    } else {
      // Fallback for old API
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
  },
  
  updateSettings: async (settings: any): Promise<any> => {
    if (USE_SUPABASE_API) {
      return await newSettingsAPI.updateSettings(settings);
    } else {
      // Fallback for old API - just return the settings as if they were saved
      return settings;
    }
  }
};

export default {
  auth: authAPI,
  bookings: bookingsAPI,
  cars: carsAPI,
  stats: statsAPI,
  settings: settingsAPI
}; 
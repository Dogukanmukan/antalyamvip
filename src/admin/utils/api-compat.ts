import { Car, Booking, DashboardStats } from './supabase';
import apiClient from './api-client';
import * as supabaseApi from './api-supabase';

// API seçimi için değişken
export const USE_SUPABASE_API = true;

// Uyumluluk katmanı - API'ler arasında geçiş yapmayı kolaylaştırır
const api = {
  // Kimlik doğrulama işlemleri
  auth: {
    login: async (email: string, password: string) => {
      if (USE_SUPABASE_API) {
        return supabaseApi.authAPI.login(email, password);
      }
      return apiClient.login(email, password);
    },
    
    getCurrentUser: async () => {
      if (USE_SUPABASE_API) {
        return supabaseApi.authAPI.getCurrentUser();
      }
      return apiClient.getCurrentUser();
    },
    
    logout: async () => {
      if (USE_SUPABASE_API) {
        return supabaseApi.authAPI.logout();
      }
      // Vercel API'de logout işlemi client-side yapılır
      localStorage.removeItem('adminToken');
      return Promise.resolve();
    }
  },
  
  // Araç işlemleri
  cars: {
    getAll: async (params?: { status?: string; limit?: number; offset?: number }): Promise<Car[]> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.carsAPI.getAll();
      }
      return apiClient.getCars(params);
    },
    
    getById: async (id: string): Promise<Car> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.carsAPI.getById(id);
      }
      return apiClient.getCar(id);
    },
    
    create: async (carData: Partial<Car>): Promise<Car> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.carsAPI.create(carData);
      }
      return apiClient.createCar(carData);
    },
    
    update: async (id: string, carData: Partial<Car>): Promise<Car> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.carsAPI.update(id, carData);
      }
      return apiClient.updateCar(id, carData);
    },
    
    updateStatus: async (id: string, status: string): Promise<Car> => {
      if (USE_SUPABASE_API) {
        // Eğer Supabase API'de updateStatus metodu yoksa update metodunu kullan
        return supabaseApi.carsAPI.update(id, { status: status as any });
      }
      return apiClient.updateCarStatus(id, status);
    },
    
    delete: async (id: string): Promise<void> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.carsAPI.delete(id);
      }
      return apiClient.deleteCar(id);
    }
  },
  
  // Rezervasyon işlemleri
  bookings: {
    getAll: async (params?: { status?: string; limit?: number; offset?: number }): Promise<Booking[]> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.bookingsAPI.getAll();
      }
      return apiClient.getBookings(params);
    },
    
    getById: async (id: string): Promise<Booking> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.bookingsAPI.getById(id);
      }
      return apiClient.getBooking(id);
    },
    
    create: async (bookingData: Partial<Booking>): Promise<Booking> => {
      if (USE_SUPABASE_API) {
        // Supabase API'de create metodu yoksa, uygun bir alternatif kullan
        throw new Error('Create booking method not implemented in Supabase API');
      }
      return apiClient.createBooking(bookingData);
    },
    
    update: async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
      if (USE_SUPABASE_API) {
        // Supabase API'de update metodu yoksa, uygun bir alternatif kullan
        throw new Error('Update booking method not implemented in Supabase API');
      }
      return apiClient.updateBooking(id, bookingData);
    },
    
    updateStatus: async (id: string, status: string): Promise<Booking> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.bookingsAPI.updateStatus(id, status);
      }
      return apiClient.updateBookingStatus(id, status);
    },
    
    delete: async (id: string): Promise<void> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.bookingsAPI.delete(id);
      }
      return apiClient.deleteBooking(id);
    }
  },
  
  // İstatistik işlemleri
  stats: {
    getDashboardStats: async (params?: { start_date?: string; end_date?: string }): Promise<DashboardStats> => {
      if (USE_SUPABASE_API) {
        return supabaseApi.statsAPI.getDashboardStats();
      }
      return apiClient.getDashboardStats(params);
    }
  },
  
  // Dosya yükleme işlemleri
  files: {
    upload: async (file: File, folder: string = 'uploads'): Promise<{ url: string; path: string }> => {
      if (USE_SUPABASE_API) {
        // Supabase API'de dosya yükleme işlemi yoksa, uygun bir alternatif kullan
        throw new Error('File upload method not implemented in Supabase API');
      }
      return apiClient.uploadFile(file, folder);
    }
  },
  
  // Veritabanı işlemleri
  database: {
    init: async (seedData: boolean = false): Promise<any> => {
      if (USE_SUPABASE_API) {
        // Supabase API'de veritabanı başlatma işlemi yoksa, uygun bir alternatif kullan
        throw new Error('Database initialization method not implemented in Supabase API');
      }
      return apiClient.initDatabase(seedData);
    }
  }
};

export default api; 
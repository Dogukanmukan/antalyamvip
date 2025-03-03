import axios from 'axios';
import { getRuntimeConfig } from '../../lib/config';
import { supabase } from '../../lib/supabaseClient';

// API temel URL'si
const API_BASE_URL = getRuntimeConfig('API_BASE_URL');

// Axios instance oluşturma
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek interceptor'ı - her istekte token ekler
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap interceptor'ı - hataları yakalar
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Eğer 401 hatası alırsak (yetkisiz), kullanıcıyı login sayfasına yönlendir
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API servisleri
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log('API: Attempting login with Supabase Auth');
      console.log('API: Request payload:', { email, password: '******' });
      
      // Supabase Auth ile giriş yap
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('API: Supabase auth error:', error);
        throw new Error(error.message || 'Giriş başarısız');
      }
      
      if (!data.session || !data.user) {
        console.error('API: Invalid auth response:', data);
        throw new Error('Geçersiz kimlik doğrulama yanıtı');
      }
      
      console.log('API: Login successful');
      
      // Kullanıcı rolünü kontrol et
      const userRole = data.user.app_metadata?.role || 'user';
      
      // Token ve kullanıcı bilgilerini döndür
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userRole
        },
        token: data.session.access_token
      };
    } catch (error: any) {
      console.error('API: Login request failed:', error);
      throw new Error(error.message || 'Giriş başarısız');
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
};

export const bookingsAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/bookings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateStatus: async (id: number, status: string) => {
    try {
      const response = await apiClient.patch(`/bookings/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const carsAPI = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/cars');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await apiClient.get(`/cars/id?id=${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (carData: any) => {
    try {
      const requiredFields = ['name', 'make', 'model'];
      const missingFields = requiredFields.filter(field => !carData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Veri dönüşümü - passengers ve price alanlarını API'nin beklediği formata dönüştür
      const apiData = {
        ...carData,
      };
      
      console.log('Creating car with data:', apiData);
      const response = await apiClient.post('/cars', apiData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in create car API call:', error);
      if (error.response) {
        console.error('API error response:', error.response.data);
      }
      throw error;
    }
  },
  
  update: async (id: number, carData: any) => {
    try {
      const response = await apiClient.put(`/cars/id?id=${id}`, carData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      console.log(`Deleting car with ID: ${id}`);
      const response = await apiClient.delete(`/cars/id?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in delete car API call:', error);
      throw error;
    }
  }
};

export const statsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/stats/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  auth: authAPI,
  bookings: bookingsAPI,
  cars: carsAPI,
  stats: statsAPI
}; 
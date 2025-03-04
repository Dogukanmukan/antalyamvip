import axios from 'axios';
import { getRuntimeConfig } from '../../lib/config';

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
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
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
      const response = await apiClient.get(`/cars/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (carData: any) => {
    try {
      const response = await apiClient.post('/cars', carData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: number, carData: any) => {
    try {
      const response = await apiClient.put(`/cars/${id}`, carData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: number) => {
    try {
      const response = await apiClient.delete(`/cars/${id}`);
      return response.data;
    } catch (error) {
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
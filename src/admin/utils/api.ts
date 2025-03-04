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
      // URL'deki /api yolunu düzelt - API_BASE_URL zaten /api içeriyor olabilir
      const loginUrl = API_BASE_URL.endsWith('/api') 
        ? `${API_BASE_URL}/auth/login` 
        : `${API_BASE_URL}/api/auth/login`;
      
      console.log('API: Sending login request to', loginUrl);
      console.log('API: Request payload:', { email, password: '******' });
      
      const response = await axios.post(loginUrl, {
        email,
        password,
      });
      
      console.log('API: Login response status:', response.status);
      console.log('API: Login response headers:', response.headers);
      
      // Yanıt verilerini kontrol et
      if (!response.data) {
        console.error('API: Empty response data');
        throw new Error('Sunucudan boş yanıt alındı');
      }
      
      console.log('API: Login response data structure:', Object.keys(response.data));
      
      // Başarı durumunu kontrol et
      if (response.data.error) {
        console.error('API: Error in response data:', response.data.error);
        throw new Error(response.data.error || 'Giriş başarısız');
      }
      
      // Token ve kullanıcı verilerini kontrol et
      if (!response.data.token || !response.data.user) {
        console.error('API: Missing token or user data in response:', response.data);
        throw new Error('Sunucudan geçersiz yanıt alındı: Token veya kullanıcı bilgisi eksik');
      }
      
      console.log('API: Login successful, returning response data');
      return response.data;
    } catch (error: any) {
      console.error('API: Login request failed:', error);
      
      // Axios hata yanıtını kontrol et
      if (error.response) {
        console.error('API: Error response status:', error.response.status);
        console.error('API: Error response data:', error.response.data);
        
        // Sunucu hata mesajını kullan
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Giriş başarısız';
        throw new Error(errorMessage);
      }
      
      // Ağ hatası veya diğer hatalar
      throw new Error(error.message || 'Sunucuya bağlanılamadı');
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
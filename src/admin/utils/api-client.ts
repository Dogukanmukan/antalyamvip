import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Car, Booking, User, DashboardStats } from './supabase';

// API temel URL'si
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// API istemci sınıfı
class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // İstek interceptor'ı - her istekte token ekler
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Yanıt interceptor'ı - hataları işler
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // 401 Unauthorized hatası durumunda oturumu sonlandır
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Genel istek metodu
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.client(config);
      
      // API yanıtı farklı formatlarda olabilir
      // 1. { success: true, data: [...] } formatı
      // 2. { success: true, message: 'Success', data: [...] } formatı
      // 3. Doğrudan veri formatı
      
      if (response.data && response.data.data !== undefined) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
  
  // Kimlik doğrulama işlemleri
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  }
  
  async getCurrentUser(): Promise<User> {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }
  
  // Araç işlemleri
  async getCars(params?: { status?: string; limit?: number; offset?: number }): Promise<Car[]> {
    return this.request({
      method: 'GET',
      url: '/cars',
      params,
    });
  }
  
  async getCar(id: string): Promise<Car> {
    return this.request({
      method: 'GET',
      url: `/cars/id?id=${id}`,
    });
  }
  
  async createCar(carData: Partial<Car>): Promise<Car> {
    return this.request({
      method: 'POST',
      url: '/cars',
      data: carData,
    });
  }
  
  async updateCar(id: string, carData: Partial<Car>): Promise<Car> {
    return this.request({
      method: 'PUT',
      url: `/cars/id?id=${id}`,
      data: carData,
    });
  }
  
  async updateCarStatus(id: string, status: string): Promise<Car> {
    return this.request({
      method: 'PATCH',
      url: `/cars/id?id=${id}`,
      data: { status },
    });
  }
  
  async deleteCar(id: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      url: `/cars/id?id=${id}`,
    });
  }
  
  // Rezervasyon işlemleri
  async getBookings(params?: { status?: string; limit?: number; offset?: number }): Promise<Booking[]> {
    return this.request({
      method: 'GET',
      url: '/bookings',
      params,
    });
  }
  
  async getBooking(id: string): Promise<Booking> {
    return this.request({
      method: 'GET',
      url: `/bookings/id?id=${id}`,
    });
  }
  
  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return this.request({
      method: 'POST',
      url: '/bookings',
      data: bookingData,
    });
  }
  
  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    return this.request({
      method: 'PUT',
      url: `/bookings/id?id=${id}`,
      data: bookingData,
    });
  }
  
  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    return this.request({
      method: 'PATCH',
      url: `/bookings/id/status?id=${id}`,
      data: { status },
    });
  }
  
  async deleteBooking(id: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      url: `/bookings/id?id=${id}`,
    });
  }
  
  // İstatistik işlemleri
  async getDashboardStats(params?: { start_date?: string; end_date?: string }): Promise<DashboardStats> {
    return this.request({
      method: 'GET',
      url: '/stats',
      params,
    });
  }
  
  // Dosya yükleme işlemi
  async uploadFile(file: File, folder: string = 'uploads'): Promise<{ url: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return this.request({
      method: 'POST',
      url: '/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  
  // Veritabanı başlatma işlemi (sadece admin)
  async initDatabase(seedData: boolean = false): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/init-db',
      data: { seedData },
    });
  }
}

// Singleton instance oluştur
const apiClient = new ApiClient();

export default apiClient; 
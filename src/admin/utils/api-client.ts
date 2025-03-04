import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Car, Booking, User, DashboardStats } from './supabase';
import { getRuntimeConfig } from '../../lib/config';

// API temel URL'si
const API_BASE_URL = getRuntimeConfig('API_BASE_URL');

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
      
      console.log('API Response:', response.data);
      
      // API yanıtı farklı formatlarda olabilir
      // 1. { success: true, data: [...] } formatı
      // 2. { success: true, message: 'Success', data: [...] } formatı
      // 3. Doğrudan veri formatı
      // 4. { data: [...] } formatı (Supabase)
      
      let result;
      if (response.data && response.data.success && response.data.data !== undefined) {
        // Format: { success: true, data: [...] }
        result = response.data.data;
      } else if (response.data && response.data.data !== undefined) {
        // Format: { data: [...] } (Supabase)
        result = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Format: Doğrudan dizi
        result = response.data;
      } else {
        // Diğer formatlar
        result = response.data;
      }
      
      console.log('Processed API result:', result);
      return result as T;
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
    
    // Token'ı manuel olarak alıp headers'a ekleyelim
    const token = localStorage.getItem('adminToken');
    
    console.log('Uploading file to API:', { fileName: file.name, fileSize: file.size, folder });
    console.log('Authentication token present:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
    }
    
    try {
      const response = await this.client({
        method: 'POST',
        url: '/upload',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('File upload response:', response.status, response.statusText);
      
      if (response.data && response.data.success && response.data.data) {
        console.log('File upload successful:', response.data.data.url);
        return {
          url: response.data.data.url,
          path: response.data.data.path
        };
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      
      // Axios hata yanıtını kontrol et
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        // 401 hatası için özel mesaj
        if (error.response.status === 401) {
          throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        }
        
        // Sunucu hata mesajını kullan
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Dosya yüklenirken bir hata oluştu';
        throw new Error(errorMessage);
      }
      
      // Diğer hatalar
      throw error;
    }
  }
  
  // Çoklu dosya yükleme işlemi
  async uploadMultipleFiles(files: File[], folder: string = 'uploads'): Promise<{ url: string; path: string }[]> {
    console.log(`Uploading ${files.length} files to API:`, { 
      fileNames: files.map(f => f.name), 
      totalSize: files.reduce((acc, f) => acc + f.size, 0), 
      folder 
    });
    
    // Token'ı manuel olarak alıp headers'a ekleyelim
    const token = localStorage.getItem('adminToken');
    console.log('Authentication token present:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
    }
    
    try {
      // Her dosya için ayrı bir yükleme işlemi yap ve sonuçları topla
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        const response = await this.client({
          method: 'POST',
          url: '/upload',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        
        console.log(`File ${file.name} upload response:`, response.status, response.statusText);
        
        if (response.data && response.data.success && response.data.data) {
          console.log(`File ${file.name} upload successful:`, response.data.data.url);
          return {
            url: response.data.data.url,
            path: response.data.data.path
          };
        } else {
          console.error(`Invalid response format for ${file.name}:`, response.data);
          throw new Error(`Dosya ${file.name} için sunucudan geçersiz yanıt alındı`);
        }
      });
      
      // Tüm yükleme işlemlerinin tamamlanmasını bekle
      const results = await Promise.all(uploadPromises);
      console.log('All files uploaded successfully:', results);
      return results;
    } catch (error: any) {
      console.error('Multiple file upload error:', error);
      
      // Axios hata yanıtını kontrol et
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        // 401 hatası için özel mesaj
        if (error.response.status === 401) {
          throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        }
        
        // Sunucu hata mesajını kullan
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Dosya yükleme hatası';
        throw new Error(errorMessage);
      }
      
      // Ağ hatası veya diğer hatalar
      throw new Error(error.message || 'Dosya yüklenirken bir hata oluştu');
    }
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
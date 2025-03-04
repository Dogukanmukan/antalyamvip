import { fetch } from '../lib/fetch';
import { getRuntimeConfig } from '../lib/config';

// Get API base URL from runtime config
const getApiBaseUrl = () => getRuntimeConfig('API_BASE_URL');

// Veritabanı başlatma
export async function initializeDatabase() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/init-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing database:', error);
    return {
      success: false,
      message: 'Veritabanı başlatılırken bir hata oluştu'
    };
  }
}

// Araçları getir
export async function getCars() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/cars`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cars:', error);
    throw new Error('Araçlar yüklenirken bir hata oluştu');
  }
}

// Araç ekle
export async function createCar(carData: any) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating car:', error);
    throw new Error('Araç eklenirken bir hata oluştu');
  }
}

// Resim yükle
export async function uploadImage(imageFile: File) {
  try {
    // Dosyayı base64'e çevir
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(imageFile);
    });

    const response = await fetch(`${getApiBaseUrl()}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
        filename: imageFile.name
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Resim yüklenirken bir hata oluştu');
  }
} 
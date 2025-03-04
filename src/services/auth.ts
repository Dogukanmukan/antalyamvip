import { fetch } from '../lib/fetch';
import { getRuntimeConfig } from '../lib/config';

// Get API base URL from runtime config
const getApiBaseUrl = () => getRuntimeConfig('API_BASE_URL');

// Admin kullanıcısı oluştur
export async function createAdmin(username: string, password: string, email: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: 'Admin kullanıcısı oluşturulurken bir hata oluştu'
    };
  }
}

// Kullanıcı girişi
export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return {
      success: false,
      message: 'Giriş sırasında bir hata oluştu'
    };
  }
} 
import { fetch } from '../lib/fetch';
import { API_BASE_URL } from '../lib/config';

// Admin kullanıcısı oluştur
export async function createAdmin(username: string, password: string, email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/create-admin`, {
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
    const response = await fetch(`${API_BASE_URL}/login`, {
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
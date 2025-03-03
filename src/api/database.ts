import { fetch } from '../lib/fetch';

// Veritabanı başlatma
export async function initializeDatabase() {
  try {
    const response = await fetch('http://localhost:3001/api/init-db', {
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

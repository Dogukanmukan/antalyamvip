// Admin kullanıcısı oluşturma API endpoint
import { setCorsHeaders, errorResponse, successResponse } from '../_lib/supabase.js';
import { createAdminUser, findAdminByEmail } from '../_lib/db/adminUsers.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/auth/create-admin');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }
  
  // API anahtarını kontrol et (güvenlik için)
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return errorResponse(res, 401, 'Unauthorized');
  }

  try {
    const { email, password, username, role } = req.body;
    
    // Gerekli alanları kontrol et
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }
    
    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 400, 'Invalid email format');
    }
    
    // Şifre uzunluğunu kontrol et
    if (password.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters long');
    }
    
    // E-posta adresi zaten kullanılıyor mu kontrol et
    const existingUser = await findAdminByEmail(email);
    if (existingUser) {
      return errorResponse(res, 409, 'Email already in use');
    }
    
    // Admin kullanıcısını oluştur
    const newUser = await createAdminUser({
      email,
      password,
      username: username || email.split('@')[0],
      role: role || 'admin'
    });
    
    if (!newUser) {
      return errorResponse(res, 500, 'Failed to create admin user');
    }
    
    // Hassas bilgileri kaldır
    const userData = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      created_at: newUser.created_at
    };
    
    // Başarılı yanıt
    return successResponse(res, {
      message: 'Admin user created successfully',
      user: userData
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
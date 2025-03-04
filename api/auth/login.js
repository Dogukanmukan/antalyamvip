// Giriş yapma API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../_lib/supabase.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/auth/login');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { email, password } = req.body;
    
    // Gerekli alanları kontrol et
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }
    
    // Supabase ile kimlik doğrulama
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return errorResponse(res, 401, 'Invalid credentials', error.message);
    }

    // Kullanıcı bilgilerini al
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username, role')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Supabase user fetch error:', userError);
      return errorResponse(res, 500, 'Failed to fetch user data', userError.message);
    }

    // JWT token oluştur
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return errorResponse(res, 500, 'Server configuration error');
    }

    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email,
        role: userData.role || 'user'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Başarılı yanıt
    return successResponse(res, {
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'user'
      },
      token,
      expiresIn: 86400 // 24 saat (saniye cinsinden)
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
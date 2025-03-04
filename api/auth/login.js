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
    
    console.log('Login attempt for email:', email);
    
    // Gerekli alanları kontrol et
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }
    
    // Supabase ile kimlik doğrulama
    console.log('Authenticating with Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return errorResponse(res, 401, 'Invalid credentials', error.message);
    }

    console.log('Supabase authentication successful, fetching user data...');
    
    // Doğrudan auth.users tablosundan kullanıcı bilgilerini al
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser || !authUser.user) {
      console.error('Failed to get authenticated user data');
      return errorResponse(res, 500, 'Failed to fetch user data');
    }
    
    console.log('User data fetched successfully:', authUser.user);
    
    // Kullanıcı rolünü al
    const userRole = authUser.user.app_metadata?.role || 'user';
    
    // JWT token oluştur
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return errorResponse(res, 500, 'Server configuration error');
    }

    console.log('Creating JWT token...');
    const token = jwt.sign(
      { 
        id: authUser.user.id, 
        email: authUser.user.email,
        role: userRole
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Login successful, sending response with token');
    // Başarılı yanıt
    return successResponse(res, {
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        username: authUser.user.email.split('@')[0], // E-postadan basit bir kullanıcı adı oluştur
        role: userRole
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
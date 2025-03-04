// Kullanıcı bilgileri API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../_lib/supabase.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/auth/me');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece GET isteklerini kabul et
  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    // Token doğrulama
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authorization header is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return errorResponse(res, 401, 'Invalid or expired token', error.message);
    }

    // Kullanıcı bilgilerini al
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, role')
      .eq('id', decoded.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return errorResponse(res, 500, 'Database error', error.message);
    }

    if (!data) {
      return errorResponse(res, 404, 'User not found');
    }

    // Başarılı yanıt
    return successResponse(res, {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role || 'user'
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
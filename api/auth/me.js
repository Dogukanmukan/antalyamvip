// Kullanıcı bilgilerini getiren API endpoint
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

  // Token doğrulaması yap
  const tokenResult = verifyToken(req, res);
  if (tokenResult !== true) {
    return tokenResult;
  }

  try {
    // Kullanıcı ID'sini al
    const userId = req.user.id;
    
    // Kullanıcı bilgilerini getir
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, role, created_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return errorResponse(res, 500, 'Database error', error.message);
    }
    
    if (!data) {
      return errorResponse(res, 404, 'User not found');
    }
    
    // Hassas bilgileri kaldır
    delete data.password;
    
    return successResponse(res, data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
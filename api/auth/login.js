// Giriş yapma API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../_lib/supabase.js';
import jwt from 'jsonwebtoken';

// Varsayılan JWT Secret (güvenlik için gerçek uygulamalarda çevre değişkeni kullanılmalıdır)
const DEFAULT_JWT_SECRET = '/Of6UT0971EdZSnVm3rsD+JnHVoS4FflV1zgBH5rDClQChwkbs4UiS1gWYp++cXQ0DWVSvbzFWhCJ+ZocuiQfg==';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/auth/login');
  console.log('Request method:', req.method);
  console.log('Environment check - JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('Environment check - SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('Environment check - SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return errorResponse(res, 401, 'Invalid credentials', authError.message);
    }

    console.log('Supabase authentication successful:', authData);
    
    // Doğrudan session'dan kullanıcı bilgilerini al
    if (!authData || !authData.user) {
      console.error('Auth data is missing user information:', authData);
      return errorResponse(res, 500, 'Authentication successful but user data is missing');
    }
    
    const userData = authData.user;
    console.log('User data from auth response:', userData);
    
    // Kullanıcı rolünü al
    const userRole = userData.app_metadata?.role || 'user';
    console.log('User role:', userRole);
    
    // JWT token oluştur
    const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    console.log('Using JWT secret:', jwtSecret ? 'Secret is defined' : 'Secret is NOT defined');
    
    try {
      console.log('Creating JWT token...');
      const token = jwt.sign(
        { 
          id: userData.id, 
          email: userData.email,
          role: userRole
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('JWT token created successfully');
      
      // Başarılı yanıt
      return successResponse(res, {
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.email.split('@')[0], // E-postadan basit bir kullanıcı adı oluştur
          role: userRole
        },
        token
      });
    } catch (jwtError) {
      console.error('JWT token creation error:', jwtError);
      return errorResponse(res, 500, 'Failed to create authentication token', jwtError.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
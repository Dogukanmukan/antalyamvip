// Giriş yapma API endpoint
import { setCorsHeaders, errorResponse, successResponse } from '../_lib/supabase.js';
import { findAdminByEmail, verifyPassword } from '../_lib/db/adminUsers.js';
import jwt from 'jsonwebtoken';

// Varsayılan JWT Secret (güvenlik için gerçek uygulamalarda çevre değişkeni kullanılmalıdır)
// Bu sadece geçici bir çözümdür, Vercel'de JWT_SECRET çevre değişkenini ayarlamanız önerilir
const DEFAULT_JWT_SECRET = 'temporary_secret_key_for_development_only_please_set_env_variable';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/auth/login');
  console.log('Request method:', req.method);
  console.log('Environment check - JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  // JWT_SECRET çevre değişkenini kontrol et, yoksa varsayılan değeri kullan
  const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: Using default JWT_SECRET. Please set the JWT_SECRET environment variable in Vercel.');
  }
  
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
    
    // Admin kullanıcısını bul
    console.log('Finding admin user by email...');
    const adminUser = await findAdminByEmail(email);
    
    if (!adminUser) {
      console.error('Admin user not found for email:', email);
      return errorResponse(res, 401, 'Invalid credentials');
    }
    
    console.log('Admin user found, verifying password...');
    
    // Şifreyi doğrula
    const isPasswordValid = await verifyPassword(password, adminUser.password_hash);
    
    if (!isPasswordValid) {
      console.error('Invalid password for user:', email);
      return errorResponse(res, 401, 'Invalid credentials');
    }
    
    console.log('Password verified successfully');
    
    // Hassas bilgileri kaldır
    const userData = {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username || adminUser.email.split('@')[0],
      role: adminUser.role
    };
    
    try {
      console.log('Creating JWT token...');
      const token = jwt.sign(
        { 
          id: userData.id, 
          email: userData.email,
          role: userData.role
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      console.log('JWT token created successfully');
      
      // Başarılı yanıt
      return successResponse(res, {
        user: userData,
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
// Kimlik doğrulama yardımcı fonksiyonları
import jwt from 'jsonwebtoken';
import { errorResponse } from './supabase.js';

/**
 * JWT token'ını doğrulayan middleware
 * @param {Object} req - İstek nesnesi
 * @param {Object} res - Yanıt nesnesi
 * @param {Function} next - Sonraki middleware fonksiyonu
 * @returns {Function|Object} Sonraki middleware veya hata yanıtı
 */
export function verifyToken(req, res, next) {
  // Authorization başlığını al
  const authHeader = req.headers.authorization;
  
  // Token kontrolü
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'No token provided');
  }
  
  // Token'ı ayıkla
  const token = authHeader.split(' ')[1];
  
  // JWT secret kontrolü
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    return errorResponse(res, 500, 'Server configuration error');
  }
  
  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, jwtSecret);
    
    // Kullanıcı bilgilerini istek nesnesine ekle
    req.user = decoded;
    
    // Sonraki middleware'e geç
    if (typeof next === 'function') {
      return next();
    }
    
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired');
    }
    
    return errorResponse(res, 401, 'Invalid token');
  }
}

/**
 * Belirli bir role sahip kullanıcıları kontrol eden middleware
 * @param {string|string[]} roles - İzin verilen roller
 * @returns {Function} Middleware fonksiyonu
 */
export function checkRole(roles) {
  return (req, res, next) => {
    // Önce token doğrulaması yap
    const tokenResult = verifyToken(req, res);
    if (tokenResult !== true) {
      return tokenResult;
    }
    
    // Rolleri diziye çevir
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Kullanıcının rolünü kontrol et
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Access denied: insufficient permissions');
    }
    
    // Sonraki middleware'e geç
    if (typeof next === 'function') {
      return next();
    }
    
    return true;
  };
}

/**
 * Middleware'leri birleştiren yardımcı fonksiyon
 * @param {Function[]} middlewares - Middleware fonksiyonları
 * @returns {Function} Birleştirilmiş middleware
 */
export function combineMiddlewares(middlewares) {
  return async (req, res) => {
    for (const middleware of middlewares) {
      const result = await middleware(req, res);
      if (result !== true) {
        return result;
      }
    }
    return true;
  };
} 
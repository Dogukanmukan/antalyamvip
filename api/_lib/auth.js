// Kimlik doğrulama yardımcı fonksiyonları
import jwt from 'jsonwebtoken';
import { errorResponse } from './supabase.js';

// JWT token doğrulama
export function verifyToken(token) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Middleware: Token doğrulama
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authorization header is missing or invalid');
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = decoded;
    
    // Sonraki middleware'e geç
    if (typeof next === 'function') {
      return next();
    }
    
    return true;
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token', error.message);
  }
}

// Middleware: Rol kontrolü
export function checkRole(roles) {
  return (req, res, next) => {
    // Önce token doğrulama
    const authResult = authMiddleware(req, res, () => true);
    
    if (authResult !== true) {
      return authResult;
    }
    
    // Rol kontrolü
    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return errorResponse(res, 403, 'Access denied. Insufficient permissions');
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
// Supabase istemcisini oluşturan yardımcı dosya
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

// Supabase bağlantı bilgileri
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Bağlantı bilgilerini kontrol et
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. URL or key is empty.');
}

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Güvenli JSON ayrıştırma yardımcı fonksiyonu
export function safeJsonParse(jsonString, defaultValue = []) {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

// CORS başlıklarını ayarlama yardımcı fonksiyonu
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
}

// Hata yanıtı oluşturma yardımcı fonksiyonu
export function errorResponse(res, statusCode, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details: details
  });
}

// Başarılı yanıt oluşturma yardımcı fonksiyonu
export function successResponse(res, data, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data
  });
} 
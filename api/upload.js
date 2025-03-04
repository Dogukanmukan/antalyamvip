// Dosya yükleme API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from './_lib/supabase.js';
import { authMiddleware } from './_lib/auth.js';
import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// formidable'ın body-parser ile çakışmasını önlemek için
export const config = {
  api: {
    bodyParser: false,
  },
};

// JWT token doğrulama fonksiyonu
const validateToken = (token) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || '/Of6UT0971EdZSnVm3rsD+JnHVoS4FflV1zgBH5rDClQChwkbs4UiS1gWYp++cXQ0DWVSvbzFWhCJ+ZocuiQfg==';
    
    console.log('JWT Secret length:', jwtSecret.length);
    console.log('Token length:', token.length);
    
    // Token formatını kontrol et
    if (!token || token.length < 10) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Geliştirme modunda token doğrulamasını atla
    if (process.env.NODE_ENV === 'development' && token === 'development_token') {
      console.log('Development mode: Skipping token validation');
      return { valid: true, user: { role: 'admin', id: 'dev-user' } };
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decoded successfully:', decoded);
    return { valid: true, user: decoded };
  } catch (error) {
    console.error('Token validation error:', error.message);
    return { valid: false, error: error.message };
  }
};

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/upload');
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  // Kimlik doğrulama
  try {
    console.log('Authorization header:', req.headers.authorization);
    
    // Authorization header'ı kontrol et
    if (!req.headers.authorization) {
      console.error('Missing Authorization header');
      return errorResponse(res, 401, 'Missing Authorization header');
    }
    
    // Bearer token formatını kontrol et
    if (!req.headers.authorization.startsWith('Bearer ')) {
      console.error('Invalid Authorization header format');
      
      // Geliştirme modunda daha esnek ol
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Trying to use token directly');
        const token = req.headers.authorization;
        const validation = validateToken(token);
        
        if (!validation.valid) {
          return errorResponse(res, 401, 'Invalid token format', validation.error);
        }
        
        req.user = validation.user;
      } else {
        return errorResponse(res, 401, 'Invalid Authorization header format');
      }
    } else {
      // Token'ı çıkar
      const token = req.headers.authorization.split(' ')[1];
      
      // Token'ı doğrula
      const validation = validateToken(token);
      
      if (!validation.valid) {
        console.error('Invalid token:', validation.error);
        return errorResponse(res, 401, 'Invalid token', validation.error);
      }
      
      // Kullanıcı bilgilerini req nesnesine ekle
      req.user = validation.user;
    }
    
    console.log('Authentication successful, proceeding with file upload');
  } catch (authError) {
    console.error('Authentication error:', authError);
    return errorResponse(res, 401, 'Authentication failed', authError.message);
  }

  try {
    // Formidable v3 kullanımı - IncomingForm bir constructor değil, bir fonksiyon
    const formOptions = {
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    };
    
    // Formidable v3 ile form verilerini parse et
    const [fields, files] = await formidable(formOptions).parse(req);
    
    // Dosya kontrolü
    const file = files.file?.[0]; // Formidable v3'te dosyalar bir dizi içinde geliyor
    if (!file) {
      return errorResponse(res, 400, 'No file uploaded');
    }
    
    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return errorResponse(res, 400, 'Invalid file type. Only images are allowed');
    }
    
    try {
      // Dosya içeriğini oku
      const fileContent = fs.readFileSync(file.filepath);
      
      // Dosya adını oluştur
      const fileName = `${uuidv4()}${path.extname(file.originalFilename)}`;
      const filePath = `uploads/${fileName}`;
      
      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, fileContent, {
          contentType: file.mimetype,
          upsert: false
        });
        
      if (error) {
        console.error('Supabase storage error:', error);
        return errorResponse(res, 500, 'Error uploading file to storage', error.message);
      }
      
      // Dosya URL'sini al
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      // Dosya bilgilerini veritabanına kaydet
      const entityType = fields.entity_type?.[0] || null; // Formidable v3'te alanlar da dizi içinde
      const entityId = fields.entity_id?.[0] || null;
      
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          name: fileName,
          original_name: file.originalFilename,
          path: filePath,
          size: file.size,
          type: file.mimetype,
          url: urlData.publicUrl,
          entity_type: entityType,
          entity_id: entityId
        })
        .select()
        .single();
        
      if (fileError) {
        console.error('Supabase database error:', fileError);
        return errorResponse(res, 500, 'Error saving file metadata', fileError.message);
      }
      
      // Başarılı yanıt
      return successResponse(res, fileData, 'File uploaded successfully');
    } catch (error) {
      console.error('File processing error:', error);
      return errorResponse(res, 500, 'Error processing file', error.message);
    } finally {
      // Geçici dosyayı temizle
      fs.unlinkSync(file.filepath);
    }
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
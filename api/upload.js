// Dosya yükleme API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from './_lib/supabase.js';
import { verifyToken, checkRole } from './_lib/auth.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// formidable'ın body-parser ile çakışmasını önlemek için
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/upload');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  // Yetkilendirme kontrolü - admin veya editor rolü gerekli
  const authResult = checkRole(['admin', 'editor'])(req, res);
  if (authResult !== true) {
    return authResult;
  }

  try {
    // Form verilerini ayrıştır
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          resolve(errorResponse(res, 500, 'Error parsing form data', err.message));
          return;
        }
        
        // Dosya kontrolü
        const file = files.file;
        if (!file) {
          resolve(errorResponse(res, 400, 'No file uploaded'));
          return;
        }
        
        // Dosya türü kontrolü
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          resolve(errorResponse(res, 400, 'Invalid file type. Only images are allowed.'));
          return;
        }
        
        // Dosya boyutu kontrolü (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          resolve(errorResponse(res, 400, 'File too large. Maximum size is 5MB.'));
          return;
        }
        
        try {
          // Dosya içeriğini oku
          const fileContent = fs.readFileSync(file.filepath);
          
          // Benzersiz dosya adı oluştur
          const fileExt = path.extname(file.originalFilename);
          const fileName = `${uuidv4()}${fileExt}`;
          
          // Dosya yolu belirle
          const folderPath = fields.folder || 'uploads';
          const filePath = `${folderPath}/${fileName}`;
          
          // Supabase Storage'a yükle
          const { data, error } = await supabase.storage
            .from('public')
            .upload(filePath, fileContent, {
              contentType: file.mimetype,
              upsert: false
            });
          
          if (error) {
            console.error('Supabase storage error:', error);
            resolve(errorResponse(res, 500, 'Error uploading file to storage', error.message));
            return;
          }
          
          // Dosya URL'sini al
          const { data: urlData } = supabase.storage
            .from('public')
            .getPublicUrl(filePath);
          
          // Başarılı yanıt
          resolve(successResponse(res, {
            fileName,
            originalName: file.originalFilename,
            size: file.size,
            type: file.mimetype,
            url: urlData.publicUrl,
            path: filePath
          }, 'File uploaded successfully'));
        } catch (error) {
          console.error('File processing error:', error);
          resolve(errorResponse(res, 500, 'Error processing file', error.message));
        } finally {
          // Geçici dosyayı temizle
          fs.unlinkSync(file.filepath);
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
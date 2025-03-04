// Dosya yükleme API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from './_lib/supabase.js';
import { authMiddleware } from './_lib/auth.js';
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

  // Kimlik doğrulama
  const authResult = authMiddleware(req, res, () => true);
  if (authResult !== true) {
    return authResult;
  }

  try {
    // Form verilerini parse et
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return errorResponse(res, 500, 'Error parsing form data', err.message);
      }
      
      // Dosya kontrolü
      const file = files.file;
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
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .insert({
            name: fileName,
            original_name: file.originalFilename,
            path: filePath,
            size: file.size,
            type: file.mimetype,
            url: urlData.publicUrl,
            entity_type: fields.entity_type || null,
            entity_id: fields.entity_id || null
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
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(res, 500, 'Server error', error.message);
  }
} 
// Vercel serverless function for image upload
import { createClient } from '@supabase/supabase-js';
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('API Request received to /api/upload');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  console.log('Request method:', req.method);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { image, filename } = req.body;
      
      // Base64 formatındaki resmi Buffer'a çevir
      const buffer = Buffer.from(image.split(',')[1], 'base64');
      
      // Dosya uzantısını al
      const fileExt = filename.split('.').pop();
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(uniqueFilename, buffer, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) throw error;

      // Yüklenen dosyanın public URL'sini al
      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(uniqueFilename);

      return res.status(200).json({
        success: true,
        url: publicUrl,
        filename: uniqueFilename
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

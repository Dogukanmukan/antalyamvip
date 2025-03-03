// Vercel serverless function for image upload
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Supabase credentials check
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. URL or key is empty.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  console.log('API Request received to /api/upload');
  console.log('Request method:', req.method);
  console.log('Supabase URL configured:', !!supabaseUrl);
  console.log('Supabase Key configured:', !!supabaseServiceKey);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // Check if Supabase is properly configured
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Supabase credentials are missing or invalid');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error',
          message: 'Supabase credentials are missing or invalid',
          supabaseUrl: !!supabaseUrl,
          supabaseKeyConfigured: !!supabaseServiceKey
        });
      }

      // Check if request body exists
      if (!req.body) {
        console.error('Request body is empty');
        return res.status(400).json({
          success: false,
          error: 'Request body is empty'
        });
      }

      const { image, filename } = req.body;
      
      // Validate required fields
      if (!image) {
        console.error('Missing image in request body');
        return res.status(400).json({ 
          success: false, 
          error: 'Missing image in request body' 
        });
      }
      
      if (!filename) {
        console.error('Missing filename in request body');
        return res.status(400).json({ 
          success: false, 
          error: 'Missing filename in request body' 
        });
      }
      
      console.log('Processing image upload for file:', filename);
      
      // Validate base64 image format
      const base64Parts = image.split(',');
      if (base64Parts.length !== 2) {
        console.error('Invalid base64 image format - missing data URI scheme');
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid base64 image format - must include data URI scheme (e.g., data:image/jpeg;base64,)' 
        });
      }
      
      const base64Data = base64Parts[1];
      if (!base64Data) {
        console.error('Invalid base64 image format - no data after comma');
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid base64 image format - no data after comma' 
        });
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Get file extension and create unique filename
      const fileExt = filename.split('.').pop().toLowerCase();
      const uniqueFilename = `${uuidv4()}.${fileExt}`;
      
      console.log('Uploading to Supabase Storage with filename:', uniqueFilename);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(uniqueFilename, buffer, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Image upload failed', 
          message: error.message,
          details: error
        });
      }

      console.log('Image uploaded successfully, getting public URL');
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(uniqueFilename);

      console.log('Public URL generated:', publicUrl);
      
      return res.status(200).json({
        success: true,
        url: publicUrl,
        filename: uniqueFilename
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Image upload failed', 
        message: error.message,
        stack: error.stack,
        supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
        supabaseKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
      });
    }
  }

  return res.status(405).json({ 
    success: false,
    error: 'Method not allowed',
    allowedMethods: ['POST', 'OPTIONS']
  });
}

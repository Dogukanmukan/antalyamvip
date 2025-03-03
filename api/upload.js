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

// Helper function to validate base64 image
function validateBase64Image(base64String) {
  // Check if it's a valid data URI
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'Invalid image format: not a string' };
  }
  
  // Check for data URI scheme
  if (!base64String.startsWith('data:')) {
    return { valid: false, error: 'Invalid image format: missing data URI scheme' };
  }
  
  // Split the data URI
  const parts = base64String.split(',');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid image format: incorrect data URI format' };
  }
  
  // Check mime type
  const mimeType = parts[0].match(/data:(.*?);/);
  if (!mimeType || !mimeType[1].startsWith('image/')) {
    return { valid: false, error: 'Invalid image format: not an image mime type' };
  }
  
  // Check base64 encoding
  if (!parts[0].includes('base64')) {
    return { valid: false, error: 'Invalid image format: not base64 encoded' };
  }
  
  // Check if there's actual data
  if (!parts[1] || parts[1].trim() === '') {
    return { valid: false, error: 'Invalid image format: no data after comma' };
  }
  
  // Check if the base64 data is valid
  try {
    const decoded = Buffer.from(parts[1], 'base64');
    if (decoded.length === 0) {
      return { valid: false, error: 'Invalid image format: empty data' };
    }
    
    // Check if the file is too large (5MB)
    if (decoded.length > 5 * 1024 * 1024) {
      return { valid: false, error: 'Image too large: maximum size is 5MB' };
    }
  } catch (error) {
    return { valid: false, error: 'Invalid base64 encoding' };
  }
  
  return { valid: true, mimeType: mimeType[1] };
}

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
      const validation = validateBase64Image(image);
      if (!validation.valid) {
        console.error('Image validation failed:', validation.error);
        return res.status(400).json({ 
          success: false, 
          error: validation.error
        });
      }
      
      // Split the data URI
      const base64Parts = image.split(',');
      const base64Data = base64Parts[1];
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Get file extension from mime type or filename
      let fileExt;
      if (validation.mimeType) {
        fileExt = validation.mimeType.split('/')[1];
      } else {
        fileExt = filename.split('.').pop().toLowerCase();
      }
      
      // Validate file extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!allowedExtensions.includes(fileExt)) {
        console.error('Invalid file extension:', fileExt);
        return res.status(400).json({ 
          success: false, 
          error: `Invalid file extension: ${fileExt}. Allowed extensions: ${allowedExtensions.join(', ')}` 
        });
      }
      
      // Create unique filename
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
        
        // Check for specific error types
        if (error.message.includes('duplicate')) {
          return res.status(409).json({ 
            success: false, 
            error: 'Duplicate file name', 
            message: 'A file with this name already exists',
            details: error
          });
        }
        
        if (error.message.includes('permission')) {
          return res.status(403).json({ 
            success: false, 
            error: 'Permission denied', 
            message: 'Not authorized to upload to this bucket',
            details: error
          });
        }
        
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

// Vercel serverless function for image upload
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bucket name - make sure this matches your Supabase bucket name
const BUCKET_NAME = 'cars';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  console.log('API Request received to /api/upload');
  
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
          message: 'Supabase credentials are missing'
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
      
      // Basic validation for base64 image
      if (!image.includes('base64')) {
        console.error('Invalid image format - not base64 encoded');
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid image format - not base64 encoded' 
        });
      }
      
      // Split the data URI
      const base64Parts = image.split(',');
      if (base64Parts.length !== 2) {
        console.error('Invalid image format - incorrect format');
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid image format - incorrect format' 
        });
      }
      
      const base64Data = base64Parts[1];
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Get file extension and create unique filename
      const fileExt = filename.split('.').pop().toLowerCase();
      const uniqueFilename = `${uuidv4()}.${fileExt}`;
      
      console.log('Uploading to Supabase Storage with filename:', uniqueFilename);
      
      // Check if bucket exists, if not try to create it
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        return res.status(500).json({ 
          success: false, 
          error: 'Storage configuration error', 
          message: bucketsError.message 
        });
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
      
      if (!bucketExists) {
        console.log(`Bucket "${BUCKET_NAME}" not found, attempting to create it...`);
        try {
          const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true
          });
          
          if (createBucketError) {
            console.error('Error creating bucket:', createBucketError);
            return res.status(500).json({ 
              success: false, 
              error: 'Failed to create storage bucket', 
              message: createBucketError.message 
            });
          }
          
          console.log(`Bucket "${BUCKET_NAME}" created successfully`);
        } catch (bucketError) {
          console.error('Error creating bucket:', bucketError);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to create storage bucket', 
            message: bucketError.message 
          });
        }
      }
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueFilename, buffer, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Image upload failed', 
          message: error.message
        });
      }

      console.log('Image uploaded successfully, getting public URL');
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
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
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  return res.status(405).json({ 
    success: false,
    error: 'Method not allowed'
  });
}

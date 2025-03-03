// Vercel serverless function for multiple image uploads
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if request has images
    if (!req.body || !req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({ error: 'No image data provided or invalid format' });
    }

    // Get images data from request
    const { images } = req.body;
    
    console.log(`Processing ${images.length} images`);
    
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return res.status(500).json({ error: 'Failed to list storage buckets', details: bucketsError });
    }
    
    console.log('Available buckets:', buckets.map(b => b.name).join(', '));
    
    const imagesBucket = buckets.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      console.log('Creating images bucket...');
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('images', { public: true });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return res.status(500).json({ error: 'Failed to create storage bucket', details: createError });
      }
      
      console.log('Bucket created:', newBucket);
    }

    // Process each image
    const uploadPromises = images.map(async (imageData, index) => {
      // Validate image data (base64)
      if (!imageData.image || !imageData.image.startsWith('data:image/')) {
        throw new Error(`Invalid image format for image ${index}`);
      }

      // Extract base64 data
      const base64Data = imageData.image.split(';base64,').pop();
      
      // Generate unique filename
      const uniqueFilename = `${uuidv4()}-${imageData.filename || `image${index}.jpg`}`;
      
      console.log(`Uploading image ${index + 1}/${images.length} to Supabase Storage`);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('images')
        .upload(`public/${uniqueFilename}`, Buffer.from(base64Data, 'base64'), {
          contentType: imageData.image.split(';')[0].split(':')[1],
          upsert: false
        });

      if (error) {
        console.error(`Supabase storage upload error for image ${index}:`, error);
        throw new Error(`Failed to upload image ${index} to storage: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(`public/${uniqueFilename}`);

      return { 
        url: publicUrlData.publicUrl,
        filename: uniqueFilename
      };
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    console.log(`Successfully uploaded ${results.length} images`);
    
    return res.status(200).json({ 
      urls: results
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    return res.status(500).json({ error: 'Image upload failed', details: error.message });
  }
};

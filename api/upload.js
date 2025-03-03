// Vercel serverless function for image upload
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
    // Check if request has a file
    if (!req.body || !req.body.image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Get image data from request
    const { image, filename } = req.body;
    
    // Validate image data (base64)
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Extract base64 data
    const base64Data = image.split(';base64,').pop();
    
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${filename || 'image.jpg'}`;
    
    console.log('Uploading to Supabase Storage, bucket: images, path: public/' + uniqueFilename);
    
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
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(`public/${uniqueFilename}`, Buffer.from(base64Data, 'base64'), {
        contentType: image.split(';')[0].split(':')[1],
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image to storage', details: error });
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(`public/${uniqueFilename}`);

    return res.status(200).json({ 
      url: publicUrlData.publicUrl,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ error: 'Image upload failed', details: error.message });
  }
};

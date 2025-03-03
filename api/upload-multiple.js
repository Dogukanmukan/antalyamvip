// Vercel serverless function for multiple image uploads
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const busboy = require('busboy');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
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
    // Parse multipart form data
    const bb = busboy({ headers: req.headers });
    const files = [];
    
    // Process file upload
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      
      // Only accept images
      if (!mimeType.startsWith('image/')) {
        return;
      }
      
      const chunks = [];
      
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        files.push({
          buffer: Buffer.concat(chunks),
          filename,
          mimeType
        });
      });
    });
    
    // Handle form parsing completion
    const uploadPromise = new Promise((resolve, reject) => {
      bb.on('close', async () => {
        try {
          // Upload all files to Supabase Storage
          const uploadResults = await Promise.all(
            files.map(async (file) => {
              const uniqueFilename = `${uuidv4()}-${file.filename}`;
              
              const { data, error } = await supabase
                .storage
                .from('images')
                .upload(`public/${uniqueFilename}`, file.buffer, {
                  contentType: file.mimeType,
                  upsert: false
                });
              
              if (error) {
                throw error;
              }
              
              // Get public URL
              const { data: publicUrlData } = supabase
                .storage
                .from('images')
                .getPublicUrl(`public/${uniqueFilename}`);
              
              return {
                url: publicUrlData.publicUrl,
                filename: uniqueFilename,
                originalname: file.filename
              };
            })
          );
          
          resolve(uploadResults);
        } catch (error) {
          reject(error);
        }
      });
      
      bb.on('error', (error) => {
        reject(error);
      });
    });
    
    // Pass request to busboy for processing
    req.pipe(bb);
    
    // Wait for all uploads to complete
    const uploadResults = await uploadPromise;
    
    return res.status(200).json({ files: uploadResults });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    return res.status(500).json({ error: 'Multiple image upload failed' });
  }
};

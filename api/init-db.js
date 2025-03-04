// Veritabanı başlatma API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from './_lib/supabase.js';
import { authMiddleware } from './_lib/auth.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/init-db');
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
    // SQL dosyasını oku
    const sqlFilePath = path.join(process.cwd(), 'database_setup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // SQL komutlarını ayır
    const sqlCommands = sqlContent
      .replace(/--.*$/gm, '') // Yorumları kaldır
      .split(';')
      .filter(cmd => cmd.trim().length > 0);
    
    console.log(`Executing ${sqlCommands.length} SQL commands...`);
    
    // Her komutu çalıştır
    const results = [];
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim() + ';';
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });
        
        if (error) {
          console.error(`Error executing SQL command #${i + 1}:`, error);
          results.push({
            command: command.substring(0, 100) + '...',
            success: false,
            error: error.message
          });
        } else {
          results.push({
            command: command.substring(0, 100) + '...',
            success: true
          });
        }
      } catch (error) {
        console.error(`Error executing SQL command #${i + 1}:`, error);
        results.push({
          command: command.substring(0, 100) + '...',
          success: false,
          error: error.message
        });
      }
    }
    
    // Başarılı yanıt
    return successResponse(res, {
      message: 'Database initialization completed',
      totalCommands: sqlCommands.length,
      results: results
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return errorResponse(res, 500, 'Failed to initialize database', error.message);
  }
} 
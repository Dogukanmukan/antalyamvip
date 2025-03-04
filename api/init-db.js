// Veritabanı başlatma API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from './_lib/supabase.js';
import { verifyToken, checkRole } from './_lib/auth.js';

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

  // Yetkilendirme kontrolü - sadece admin rolü
  const authResult = checkRole('admin')(req, res);
  if (authResult !== true) {
    return authResult;
  }

  try {
    // Veritabanı tablolarını oluştur
    const results = await createTables();
    
    // Örnek verileri ekle (isteğe bağlı)
    const { seedData } = req.body || {};
    let seedResults = {};
    
    if (seedData) {
      seedResults = await seedDatabase();
    }
    
    return successResponse(res, {
      tables: results,
      seed: seedResults
    }, 'Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    return errorResponse(res, 500, 'Error initializing database', error.message);
  }
}

// Tabloları oluşturan fonksiyon
async function createTables() {
  const results = {};
  
  try {
    // Users tablosu
    const { error: usersError } = await supabase.rpc('create_users_table_if_not_exists');
    results.users = usersError ? { error: usersError.message } : { success: true };
    
    // Cars tablosu
    const { error: carsError } = await supabase.rpc('create_cars_table_if_not_exists');
    results.cars = carsError ? { error: carsError.message } : { success: true };
    
    // Bookings tablosu
    const { error: bookingsError } = await supabase.rpc('create_bookings_table_if_not_exists');
    results.bookings = bookingsError ? { error: bookingsError.message } : { success: true };
    
    // Settings tablosu
    const { error: settingsError } = await supabase.rpc('create_settings_table_if_not_exists');
    results.settings = settingsError ? { error: settingsError.message } : { success: true };
    
    return results;
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Örnek verileri ekleyen fonksiyon
async function seedDatabase() {
  const results = {};
  
  try {
    // Admin kullanıcısı ekle
    const adminUser = {
      email: 'admin@example.com',
      password: 'Admin123!', // Gerçek uygulamada güvenli bir şekilde hashlenmelidir
      username: 'admin',
      role: 'admin',
      created_at: new Date().toISOString()
    };
    
    // Önce Supabase Auth'a kullanıcı ekle
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminUser.email,
      password: adminUser.password
    });
    
    if (authError) {
      results.admin = { error: authError.message };
    } else {
      // Kullanıcı tablosuna ekle
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: adminUser.email,
            username: adminUser.username,
            role: adminUser.role,
            created_at: adminUser.created_at
          }
        ])
        .select();
      
      results.admin = userError ? { error: userError.message } : { success: true, user: userData[0] };
    }
    
    // Örnek araçlar ekle
    const cars = [
      {
        name: 'Mercedes-Benz S-Class',
        category: 'luxury',
        make: 'Mercedes-Benz',
        model: 'S-Class',
        year: 2023,
        fuel_type: 'hybrid',
        seats: 5,
        luggage: 3,
        price_per_day: 250,
        status: 'active',
        features: JSON.stringify(['Leather seats', 'Panoramic roof', 'Navigation', 'Bluetooth']),
        created_at: new Date().toISOString()
      },
      {
        name: 'BMW 7 Series',
        category: 'luxury',
        make: 'BMW',
        model: '7 Series',
        year: 2023,
        fuel_type: 'diesel',
        seats: 5,
        luggage: 3,
        price_per_day: 230,
        status: 'active',
        features: JSON.stringify(['Leather seats', 'Climate control', 'Navigation', 'Bluetooth']),
        created_at: new Date().toISOString()
      }
    ];
    
    const { data: carsData, error: carsError } = await supabase
      .from('cars')
      .upsert(cars)
      .select();
    
    results.cars = carsError ? { error: carsError.message } : { success: true, count: carsData.length };
    
    return results;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 
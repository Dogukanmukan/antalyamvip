// Araçlar API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse, safeJsonParse } from '../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/cars');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET isteği - tüm araçları getir
  if (req.method === 'GET') {
    try {
      // Query parametrelerini al
      const { status, limit = 50, offset = 0, sort_by = 'created_at', sort_order = 'desc' } = req.query;
      
      // Sorguyu oluştur
      let query = supabase
        .from('cars')
        .select('*');
      
      // Filtreleri uygula
      if (status) {
        query = query.eq('status', status);
      }
      
      // Sıralama ve sayfalama
      query = query
        .order(sort_by, { ascending: sort_order.toLowerCase() === 'asc' })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      // Sorguyu çalıştır
      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      return successResponse(res, data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      return errorResponse(res, 500, 'Failed to fetch cars', error.message);
    }
  }

  // POST isteği - yeni araç ekle
  if (req.method === 'POST') {
    try {
      const carData = req.body;
      
      // Gerekli alanları kontrol et
      const requiredFields = ['make', 'model', 'year', 'price_per_day'];
      const missingFields = requiredFields.filter(field => !carData[field]);
      
      if (missingFields.length > 0) {
        return errorResponse(res, 400, 'Missing required fields', { missingFields });
      }
      
      // Zaman damgalarını ekle
      const now = new Date().toISOString();
      carData.created_at = now;
      carData.updated_at = now;
      
      // Varsayılan durum ekle
      if (!carData.status) {
        carData.status = 'active';
      }
      
      // Aracı ekle
      const { data, error } = await supabase
        .from('cars')
        .insert(carData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      return successResponse(res, data[0], 'Car created successfully', 201);
    } catch (error) {
      console.error('Error creating car:', error);
      return errorResponse(res, 500, 'Failed to create car', error.message);
    }
  }

  // Toplu işlem - birden fazla aracı güncelle veya sil
  if (req.method === 'PATCH') {
    try {
      const { action, car_ids, data: updateData } = req.body;
      
      if (!action || !car_ids || !Array.isArray(car_ids) || car_ids.length === 0) {
        return errorResponse(res, 400, 'Invalid request. Action and car_ids array are required');
      }
      
      let result;
      
      // Toplu güncelleme
      if (action === 'update' && updateData) {
        // Güncelleme zamanını ekle
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('cars')
          .update(updateData)
          .in('id', car_ids)
          .select();
          
        if (error) {
          console.error('Supabase error:', error);
          return errorResponse(res, 500, 'Database error', error.message);
        }
        
        result = { updated: data.length, cars: data };
      } 
      // Toplu silme
      else if (action === 'delete') {
        // Önce bu araçlarla ilişkili rezervasyonları kontrol et
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('car_id')
          .in('car_id', car_ids);
        
        if (bookingsError) {
          console.error('Supabase error checking bookings:', bookingsError);
          return errorResponse(res, 500, 'Database error', bookingsError.message);
        }
        
        // İlişkili rezervasyonları olan araçları filtrele
        const carsWithBookings = bookings.map(booking => booking.car_id);
        const carsToDelete = car_ids.filter(id => !carsWithBookings.includes(id));
        
        if (carsToDelete.length === 0) {
          return errorResponse(res, 409, 'Cannot delete cars with existing bookings', 
            { carsWithBookings });
        }
        
        const { data, error } = await supabase
          .from('cars')
          .delete()
          .in('id', carsToDelete)
          .select();
          
        if (error) {
          console.error('Supabase error:', error);
          return errorResponse(res, 500, 'Database error', error.message);
        }
        
        result = { 
          deleted: data.length, 
          skipped: car_ids.length - carsToDelete.length,
          cars: data 
        };
      } else {
        return errorResponse(res, 400, 'Invalid action. Supported actions: update, delete');
      }
      
      return successResponse(res, result, `Bulk ${action} completed successfully`);
    } catch (error) {
      console.error('Error in bulk operation:', error);
      return errorResponse(res, 500, 'Failed to perform bulk operation', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
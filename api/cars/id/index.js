// Araç detay API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse, safeJsonParse } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  // Araç ID'sini al
  const { id } = req.query;
  
  console.log(`API Request received to /api/cars/${id}`);
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ID kontrolü
  if (!id) {
    return errorResponse(res, 400, 'Car ID is required');
  }

  // GET isteği - araç detaylarını getir
  if (req.method === 'GET') {
    try {
      // Aracı getir
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          return errorResponse(res, 404, 'Car not found');
        }
        return errorResponse(res, 500, 'Database error', error.message);
      }

      // JSON alanlarını parse et
      const formattedData = {
        ...data,
        features: safeJsonParse(data.features, []),
        // images alanı PostgreSQL text[] tipinde, JavaScript'te dizi olarak geliyor
        // Eğer null değerler varsa temizleyelim
        images: Array.isArray(data.images) 
          ? data.images.filter(img => img !== null && img !== 'null') 
          : []
      };

      return successResponse(res, formattedData);
    } catch (error) {
      console.error('Error fetching car:', error);
      return errorResponse(res, 500, 'Failed to fetch car', error.message);
    }
  }

  // PUT isteği - aracı güncelle
  if (req.method === 'PUT') {
    try {
      const carData = req.body;
      
      // JSON alanlarını string'e çevir
      if (carData.features && Array.isArray(carData.features)) {
        carData.features = JSON.stringify(carData.features);
      }
      
      // images alanını temizle - null değerleri kaldır
      if (carData.images && Array.isArray(carData.images)) {
        carData.images = carData.images.filter(img => img !== null && img !== 'null' && img !== '');
      } else {
        carData.images = [];
      }
      
      // Aracı güncelle
      const { data, error } = await supabase
        .from('cars')
        .update(carData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (data.length === 0) {
        return errorResponse(res, 404, 'Car not found');
      }

      // JSON alanlarını parse et
      const formattedData = {
        ...data[0],
        features: safeJsonParse(data[0].features, []),
        // images alanı PostgreSQL text[] tipinde, JavaScript'te dizi olarak geliyor
        // Eğer null değerler varsa temizleyelim
        images: Array.isArray(data[0].images) 
          ? data[0].images.filter(img => img !== null && img !== 'null') 
          : []
      };

      return successResponse(res, formattedData, 'Car updated successfully');
    } catch (error) {
      console.error('Error updating car:', error);
      return errorResponse(res, 500, 'Failed to update car', error.message);
    }
  }

  // DELETE isteği - aracı sil
  if (req.method === 'DELETE') {
    try {
      // Önce bu araçla ilişkili rezervasyonları kontrol et
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('car_id', id);
      
      if (bookingsError) {
        console.error('Supabase error checking bookings:', bookingsError);
        return errorResponse(res, 500, 'Database error', bookingsError.message);
      }
      
      if (bookings && bookings.length > 0) {
        return errorResponse(res, 409, 'Cannot delete car with existing bookings');
      }
      
      // Aracı sil
      const { data, error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (data.length === 0) {
        return errorResponse(res, 404, 'Car not found');
      }

      return successResponse(res, data[0], 'Car deleted successfully');
    } catch (error) {
      console.error('Error deleting car:', error);
      return errorResponse(res, 500, 'Failed to delete car', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
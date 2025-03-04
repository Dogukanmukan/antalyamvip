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
      const { featured, status, limit = 50, offset = 0 } = req.query;
      
      // Sorguyu oluştur
      let query = supabase
        .from('cars')
        .select('*');
      
      // Filtreleri uygula
      if (status) {
        query = query.eq('status', status);
      }
      
      // Öne çıkan araçları getir
      if (featured === 'true') {
        query = query.eq('status', 'active').order('price_per_day', { ascending: false }).limit(3);
      } else {
        // Sıralama ve sayfalama
        query = query
          .order('created_at', { ascending: false })
          .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      }
      
      // Sorguyu çalıştır
      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        // Hata durumunda boş dizi döndür
        return successResponse(res, []);
      }

      // JSON alanlarını parse et
      const formattedData = data.map(car => ({
        ...car,
        features: safeJsonParse(car.features, []),
        images: Array.isArray(car.images) 
          ? car.images.filter(img => img !== null && img !== 'null') 
          : []
      }));

      return successResponse(res, formattedData);
    } catch (error) {
      console.error('Error fetching cars:', error);
      // Hata durumunda boş dizi döndür
      return successResponse(res, []);
    }
  }

  // POST isteği - yeni araç ekle
  if (req.method === 'POST') {
    try {
      const carData = req.body;
      console.log('Received car data:', carData);
      
      // Gerekli alanları kontrol et
      const requiredFields = ['name', 'make', 'model'];
      const missingFields = requiredFields.filter(field => !carData[field]);
      
      if (missingFields.length > 0) {
        return errorResponse(res, 400, 'Missing required fields', { missingFields });
      }
      
      // Varsayılan değerleri ekle
      if (!carData.seats) carData.seats = 4;
      if (!carData.price_per_day) carData.price_per_day = 0;
      
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
      
      // image alanı varsa ve images alanı boşsa, image'ı images'e ekle
      if (carData.image && (!carData.images || carData.images.length === 0)) {
        carData.images = [carData.image];
        delete carData.image; // image alanını kaldır
      }
      
      // Varsayılan durum ekle
      if (!carData.status) {
        carData.status = 'active';
      }
      
      console.log('Processed car data for insert:', carData);
      
      // Aracı ekle
      const { data, error } = await supabase
        .from('cars')
        .insert(carData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Failed to add car', error);
      }

      return successResponse(res, data[0], 'Car created successfully', 201);
    } catch (error) {
      console.error('Error creating car:', error);
      return errorResponse(res, 500, 'Failed to create car', error.message);
    }
  }

  // PUT isteği - aracı güncelle
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const carData = req.body;
      
      if (!id) {
        return errorResponse(res, 400, 'Car ID is required');
      }
      
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
      
      // image alanı varsa ve images alanı boşsa, image'ı images'e ekle
      if (carData.image && (!carData.images || carData.images.length === 0)) {
        carData.images = [carData.image];
        delete carData.image; // image alanını kaldır
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

      return successResponse(res, data[0], 'Car updated successfully');
    } catch (error) {
      console.error('Error updating car:', error);
      return errorResponse(res, 500, 'Failed to update car', error.message);
    }
  }

  // DELETE isteği - aracı sil
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return errorResponse(res, 400, 'Car ID is required');
      }
      
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
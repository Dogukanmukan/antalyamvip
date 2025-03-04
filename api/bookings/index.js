// Bookings API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse, safeJsonParse } from '../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/bookings');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET isteği - tüm rezervasyonları getir
  if (req.method === 'GET') {
    try {
      // Query parametrelerini al
      const { status, limit = 50, offset = 0 } = req.query;
      
      // Sorguyu oluştur
      let query = supabase
        .from('bookings')
        .select(`
          *,
          car:cars(id, name, make, model, image, price_per_day)
        `)
        .order('created_at', { ascending: false });
      
      // Filtreleri uygula
      if (status) {
        query = query.eq('status', status);
      }
      
      // Sayfalama
      if (limit && offset) {
        query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      }
      
      // Sorguyu çalıştır
      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      // JSON alanlarını parse et
      const formattedData = data.map(booking => ({
        ...booking,
        car: booking.car || null
      }));

      return successResponse(res, formattedData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return errorResponse(res, 500, 'Failed to fetch bookings', error.message);
    }
  }

  // POST isteği - yeni rezervasyon oluştur
  if (req.method === 'POST') {
    try {
      const bookingData = req.body;
      
      // Gerekli alanları kontrol et
      const requiredFields = ['trip_type', 'pickup_location', 'dropoff_location', 'pickup_date', 'car_id', 'full_name', 'email', 'phone', 'passengers', 'total_price'];
      const missingFields = requiredFields.filter(field => !bookingData[field]);
      
      if (missingFields.length > 0) {
        return errorResponse(res, 400, 'Missing required fields', { missingFields });
      }
      
      // Yeni rezervasyon oluştur
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          status: 'pending'
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      // Araç bilgilerini getir
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('name, make, model, image')
        .eq('id', bookingData.car_id)
        .single();
        
      if (carError) {
        console.error('Supabase error fetching car:', carError);
      }
      
      // Yanıt verisi
      const responseData = {
        ...data[0],
        car: carError ? null : carData
      };

      return successResponse(res, responseData, 'Booking created successfully');
    } catch (error) {
      console.error('Error creating booking:', error);
      return errorResponse(res, 500, 'Failed to create booking', error.message);
    }
  }

  // PUT isteği - rezervasyon güncelle
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const bookingData = req.body;
      
      if (!id) {
        return errorResponse(res, 400, 'Booking ID is required');
      }
      
      // Rezervasyonu güncelle
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (data.length === 0) {
        return errorResponse(res, 404, 'Booking not found');
      }

      return successResponse(res, data[0], 'Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      return errorResponse(res, 500, 'Failed to update booking', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
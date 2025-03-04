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
      // Rezervasyonları ve ilişkili araç bilgilerini getir
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:cars(*)
        `)
        .order('created_at', { ascending: false });

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
      const requiredFields = ['trip_type', 'pickup_location', 'pickup_date', 'car_id', 'full_name', 'email', 'phone'];
      const missingFields = requiredFields.filter(field => !bookingData[field]);
      
      if (missingFields.length > 0) {
        return errorResponse(res, 400, 'Missing required fields', missingFields);
      }
      
      // Yeni rezervasyon oluştur
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      return successResponse(res, data[0], 'Booking created successfully');
    } catch (error) {
      console.error('Error creating booking:', error);
      return errorResponse(res, 500, 'Failed to create booking', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
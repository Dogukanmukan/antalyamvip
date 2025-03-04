// Booking detay API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  // Rezervasyon ID'sini al
  const { id } = req.query;
  
  console.log(`API Request received to /api/bookings/${id}`);
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ID kontrolü
  if (!id) {
    return errorResponse(res, 400, 'Booking ID is required');
  }

  // GET isteği - rezervasyon detaylarını getir
  if (req.method === 'GET') {
    try {
      // Rezervasyon ve ilişkili araç bilgilerini getir
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          car:cars(id, name, make, model, image, price_per_day)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          return errorResponse(res, 404, 'Booking not found');
        }
        return errorResponse(res, 500, 'Database error', error.message);
      }

      return successResponse(res, data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      return errorResponse(res, 500, 'Failed to fetch booking', error.message);
    }
  }

  // PUT isteği - rezervasyon güncelle
  if (req.method === 'PUT') {
    try {
      const bookingData = req.body;
      
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

  // DELETE isteği - rezervasyon sil
  if (req.method === 'DELETE') {
    try {
      // Rezervasyonu sil
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (data.length === 0) {
        return errorResponse(res, 404, 'Booking not found');
      }

      return successResponse(res, data[0], 'Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      return errorResponse(res, 500, 'Failed to delete booking', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
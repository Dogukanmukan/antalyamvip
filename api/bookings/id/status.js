// Rezervasyon durumu güncelleme API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  // Rezervasyon ID'sini al
  const { id } = req.query;
  
  console.log(`API Request received to /api/bookings/${id}/status`);
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ID kontrolü
  if (!id) {
    return errorResponse(res, 400, 'Booking ID is required');
  }

  // PATCH isteği - rezervasyon durumunu güncelle
  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      
      // Durum kontrolü
      if (!status) {
        return errorResponse(res, 400, 'Status is required');
      }
      
      // Geçerli durum değerlerini kontrol et
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return errorResponse(res, 400, 'Invalid status value', { validValues: validStatuses });
      }
      
      // Rezervasyon durumunu güncelle
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (data.length === 0) {
        return errorResponse(res, 404, 'Booking not found');
      }

      return successResponse(res, data[0], 'Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      return errorResponse(res, 500, 'Failed to update booking status', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
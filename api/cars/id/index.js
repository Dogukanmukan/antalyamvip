// Araç detay API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../../_lib/supabase.js';

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

  // GET isteği - belirli bir aracı getir
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
        return errorResponse(res, error.code === 'PGRST116' ? 404 : 500, 
          error.code === 'PGRST116' ? 'Car not found' : 'Database error', 
          error.message);
      }

      return successResponse(res, data);
    } catch (error) {
      console.error(`Error fetching car ${id}:`, error);
      return errorResponse(res, 500, 'Failed to fetch car', error.message);
    }
  }

  // PUT isteği - aracı güncelle
  if (req.method === 'PUT') {
    try {
      const updateData = req.body;
      
      // Güncelleme verilerini kontrol et
      if (!updateData || Object.keys(updateData).length === 0) {
        return errorResponse(res, 400, 'No update data provided');
      }
      
      // Güncelleme zamanını ekle
      updateData.updated_at = new Date().toISOString();
      
      // Aracı güncelle
      const { data, error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (!data || data.length === 0) {
        return errorResponse(res, 404, 'Car not found');
      }

      return successResponse(res, data[0], 'Car updated successfully');
    } catch (error) {
      console.error(`Error updating car ${id}:`, error);
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
      
      // Eğer araçla ilişkili rezervasyonlar varsa, silme işlemini reddet
      if (bookings && bookings.length > 0) {
        return errorResponse(res, 409, 'Cannot delete car with existing bookings', 
          { bookingCount: bookings.length });
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

      if (!data || data.length === 0) {
        return errorResponse(res, 404, 'Car not found');
      }

      return successResponse(res, null, 'Car deleted successfully');
    } catch (error) {
      console.error(`Error deleting car ${id}:`, error);
      return errorResponse(res, 500, 'Failed to delete car', error.message);
    }
  }

  // PATCH isteği - araç durumunu güncelle (örn. aktif/pasif)
  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      
      // Durum kontrolü
      if (status === undefined || status === null) {
        return errorResponse(res, 400, 'Status is required');
      }
      
      // Geçerli durum değerlerini kontrol et
      const validStatuses = ['active', 'maintenance', 'unavailable'];
      if (!validStatuses.includes(status)) {
        return errorResponse(res, 400, 'Invalid status value', { validValues: validStatuses });
      }
      
      // Araç durumunu güncelle
      const { data, error } = await supabase
        .from('cars')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse(res, 500, 'Database error', error.message);
      }

      if (!data || data.length === 0) {
        return errorResponse(res, 404, 'Car not found');
      }

      return successResponse(res, data[0], 'Car status updated successfully');
    } catch (error) {
      console.error(`Error updating car status ${id}:`, error);
      return errorResponse(res, 500, 'Failed to update car status', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
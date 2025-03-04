// İstatistikler API endpoint
import { supabase, setCorsHeaders, errorResponse, successResponse } from '../_lib/supabase.js';

export default async function handler(req, res) {
  // CORS başlıklarını ayarla
  setCorsHeaders(res);
  
  console.log('API Request received to /api/stats');
  console.log('Request method:', req.method);
  
  // OPTIONS isteğini işle
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET isteği - istatistikleri getir
  if (req.method === 'GET') {
    try {
      // Paralel sorgular için Promise.all kullan
      const [
        totalBookingsResult,
        totalCarsResult,
        activeBookingsResult,
        revenueResult,
        recentBookingsResult
      ] = await Promise.all([
        // 1. Toplam rezervasyon sayısı
        supabase
          .from('bookings')
          .select('id', { count: 'exact' }),
          
        // 2. Toplam araç sayısı
        supabase
          .from('cars')
          .select('id', { count: 'exact' }),
          
        // 3. Aktif rezervasyon sayısı (pending veya confirmed)
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .in('status', ['pending', 'confirmed']),
          
        // 4. Toplam gelir
        supabase
          .from('bookings')
          .select('total_price')
          .in('status', ['confirmed', 'completed']),
          
        // 5. Son rezervasyonlar
        supabase
          .from('bookings')
          .select(`
            id, 
            full_name, 
            pickup_date, 
            status, 
            total_price,
            car:cars(id, name, make, model)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      
      // Hata kontrolü
      const errors = [
        totalBookingsResult.error,
        totalCarsResult.error,
        activeBookingsResult.error,
        revenueResult.error,
        recentBookingsResult.error
      ].filter(Boolean);
      
      if (errors.length > 0) {
        console.error('Supabase errors:', errors);
        return errorResponse(res, 500, 'Database error', errors);
      }
      
      // Toplam geliri hesapla
      const totalRevenue = revenueResult.data.reduce((sum, booking) => {
        return sum + (parseFloat(booking.total_price) || 0);
      }, 0);
      
      // Son rezervasyonları formatla
      const recentBookings = recentBookingsResult.data.map(booking => ({
        id: booking.id,
        customer: booking.full_name,
        date: booking.pickup_date,
        status: booking.status,
        amount: parseFloat(booking.total_price) || 0,
        car: booking.car ? `${booking.car.make} ${booking.car.model}` : 'Unknown'
      }));
      
      // En popüler araçları bul
      const { data: popularCarsData, error: popularCarsError } = await supabase
        .from('cars')
        .select(`
          id,
          name,
          make,
          model,
          image
        `)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (popularCarsError) {
        console.error('Error fetching popular cars:', popularCarsError);
      }
      
      // Popüler araçları formatla
      const popularCars = (popularCarsData || []).map(car => ({
        id: car.id,
        name: car.name || `${car.make} ${car.model}`,
        image: car.image || '/images/car-placeholder.png'
      }));
      
      // Sonuçları birleştir
      const stats = {
        totalBookings: totalBookingsResult.count || 0,
        totalCars: totalCarsResult.count || 0,
        activeBookings: activeBookingsResult.count || 0,
        monthlyRevenue: totalRevenue,
        recentBookings,
        popularCars
      };

      return successResponse(res, stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      return errorResponse(res, 500, 'Failed to fetch statistics', error.message);
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
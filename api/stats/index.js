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
        monthlyRevenueResult,
        carsByStatusResult,
        topBookedCarsResult
      ] = await Promise.all([
        // Toplam rezervasyon sayısı
        supabase.from('bookings').select('id', { count: 'exact' }),
        
        // Toplam araç sayısı
        supabase.from('cars').select('id', { count: 'exact' }),
        
        // Aktif rezervasyon sayısı
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'confirmed'),
        
        // Aylık gelir (son 30 gün)
        supabase.from('bookings')
          .select('price_per_day')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Durumlara göre araç sayıları
        supabase.from('cars').select('status'),
        
        // En çok rezervasyon yapılan araçlar
        supabase.from('cars')
          .select('id, name, image')
          .order('bookings_count', { ascending: false })
          .limit(3)
      ]);

      // Hata kontrolü
      if (totalBookingsResult.error || totalCarsResult.error || activeBookingsResult.error || 
          monthlyRevenueResult.error || carsByStatusResult.error || topBookedCarsResult.error) {
        console.error('Supabase error:', 
          totalBookingsResult.error || totalCarsResult.error || activeBookingsResult.error || 
          monthlyRevenueResult.error || carsByStatusResult.error || topBookedCarsResult.error);
        
        // Hata durumunda varsayılan değerler döndür
        return successResponse(res, {
          totalBookings: 0,
          totalCars: 0,
          activeBookings: 0,
          monthlyRevenue: 0,
          bookingCompletionRate: 0,
          carOccupancyRate: 0,
          cancellationRate: 0,
          carsByStatus: {
            active: 0,
            maintenance: 0,
            inactive: 0
          },
          topBookedCars: []
        });
      }
      
      // Toplam geliri hesapla
      const totalRevenue = monthlyRevenueResult.data.reduce((sum, booking) => {
        return sum + (parseFloat(booking.price_per_day) || 0);
      }, 0);
      
      // Son rezervasyonları formatla
      const recentBookings = topBookedCarsResult.data.map(booking => ({
        id: booking.id,
        customer: booking.name,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        amount: parseFloat(booking.price_per_day) || 0,
        car: booking.name
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
      
      // Hata durumunda varsayılan değerler döndür
      return successResponse(res, {
        totalBookings: 0,
        totalCars: 0,
        activeBookings: 0,
        monthlyRevenue: 0,
        bookingCompletionRate: 0,
        carOccupancyRate: 0,
        cancellationRate: 0,
        carsByStatus: {
          active: 0,
          maintenance: 0,
          inactive: 0
        },
        topBookedCars: []
      });
    }
  }

  // Desteklenmeyen HTTP metodu
  return errorResponse(res, 405, 'Method not allowed');
} 
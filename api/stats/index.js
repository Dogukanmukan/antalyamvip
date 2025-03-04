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
      // Tarih aralığı parametrelerini al
      const { start_date, end_date } = req.query;
      
      // Varsayılan tarih aralığı: son 30 gün
      const endDate = end_date ? new Date(end_date) : new Date();
      const startDate = start_date ? new Date(start_date) : new Date(endDate);
      
      if (!start_date) {
        startDate.setDate(startDate.getDate() - 30);
      }
      
      // Tarih formatını ISO string'e çevir
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();
      
      // Paralel sorgular için Promise.all kullan
      const [
        bookingsCountResult,
        bookingsByStatusResult,
        revenueResult,
        topCarsResult,
        carsByStatusResult
      ] = await Promise.all([
        // 1. Toplam rezervasyon sayısı
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .gte('created_at', startIso)
          .lte('created_at', endIso),
          
        // 2. Durumlara göre rezervasyon sayıları
        supabase
          .from('bookings')
          .select('status')
          .gte('created_at', startIso)
          .lte('created_at', endIso),
          
        // 3. Toplam gelir (onaylanmış rezervasyonlar)
        supabase
          .from('bookings')
          .select('total_price')
          .in('status', ['confirmed', 'completed'])
          .gte('created_at', startIso)
          .lte('created_at', endIso),
          
        // 4. En çok rezerve edilen araçlar
        supabase
          .from('bookings')
          .select(`
            car_id,
            cars!inner(make, model)
          `)
          .gte('created_at', startIso)
          .lte('created_at', endIso),
          
        // 5. Araç durumlarına göre sayılar
        supabase
          .from('cars')
          .select('status')
      ]);
      
      // Hata kontrolü
      const errors = [
        bookingsCountResult.error,
        bookingsByStatusResult.error,
        revenueResult.error,
        topCarsResult.error,
        carsByStatusResult.error
      ].filter(Boolean);
      
      if (errors.length > 0) {
        console.error('Supabase errors:', errors);
        return errorResponse(res, 500, 'Database error', errors);
      }
      
      // Durumlara göre rezervasyon sayılarını hesapla
      const bookingsByStatus = bookingsByStatusResult.data.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});
      
      // Toplam geliri hesapla
      const totalRevenue = revenueResult.data.reduce((sum, booking) => {
        return sum + (booking.total_price || 0);
      }, 0);
      
      // En çok rezerve edilen araçları hesapla
      const carCounts = topCarsResult.data.reduce((acc, booking) => {
        const carId = booking.car_id;
        if (!acc[carId]) {
          acc[carId] = {
            car_id: carId,
            make: booking.cars?.make,
            model: booking.cars?.model,
            count: 0
          };
        }
        acc[carId].count++;
        return acc;
      }, {});
      
      // En çok rezerve edilen 5 aracı al
      const topCars = Object.values(carCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Araç durumlarına göre sayıları hesapla
      const carsByStatus = carsByStatusResult.data.reduce((acc, car) => {
        acc[car.status] = (acc[car.status] || 0) + 1;
        return acc;
      }, {});
      
      // Sonuçları birleştir
      const stats = {
        period: {
          start_date: startIso,
          end_date: endIso
        },
        bookings: {
          total: bookingsCountResult.count,
          by_status: bookingsByStatus
        },
        revenue: {
          total: totalRevenue,
          currency: 'TRY' // Varsayılan para birimi
        },
        cars: {
          by_status: carsByStatus,
          top_booked: topCars
        }
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
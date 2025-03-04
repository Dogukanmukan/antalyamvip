import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Car, Calendar, TrendingUp, 
  ArrowUpRight, ArrowDownRight, 
  ChevronRight, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { statsAPI, bookingsAPI, carsAPI } from '../utils/api';

// Stat kart bileşeni
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeText?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeText, 
  changeType = 'neutral' 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-500' : 
                changeType === 'decrease' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {changeType === 'increase' ? (
                  <ArrowUpRight size={16} className="inline mr-1" />
                ) : changeType === 'decrease' ? (
                  <ArrowDownRight size={16} className="inline mr-1" />
                ) : null}
                {change}% {changeText}
              </span>
            </div>
          )}
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Rezervasyon durumu bileşeni
interface BookingStatusProps {
  status: 'completed' | 'pending' | 'cancelled';
  text: string;
}

const BookingStatus: React.FC<BookingStatusProps> = ({ status, text }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="mr-1" />;
      case 'pending':
        return <Clock size={14} className="mr-1" />;
      case 'cancelled':
        return <XCircle size={14} className="mr-1" />;
      default:
        return <AlertCircle size={14} className="mr-1" />;
    }
  };

  return (
    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusClasses()}`}>
      {getStatusIcon()}
      {text}
    </span>
  );
};

// Dashboard veri tipleri
interface DashboardStats {
  totalBookings: number;
  totalCars: number;
  activeBookings: number;
  monthlyRevenue: number;
  bookingCompletionRate: number;
  carOccupancyRate: number;
  cancellationRate: number;
}

interface RecentBooking {
  id: number;
  customer: string;
  date: string;
  car: string;
  status: 'completed' | 'pending' | 'cancelled';
  amount: number;
}

interface PopularCar {
  id: number;
  name: string;
  bookings: number;
  image: string;
}

// Ana Dashboard bileşeni
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard verileri
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalCars: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    bookingCompletionRate: 0,
    carOccupancyRate: 0,
    cancellationRate: 0
  });
  
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [popularCars, setPopularCars] = useState<PopularCar[]>([]);
  
  // Verileri yükle
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // API'den istatistikleri al
        const statsData = await statsAPI.getDashboardStats();
        setStats(statsData || {
          totalBookings: 0,
          totalCars: 0,
          activeBookings: 0,
          monthlyRevenue: 0,
          bookingCompletionRate: 0,
          carOccupancyRate: 0,
          cancellationRate: 0
        });
        
        // Son rezervasyonları al
        const bookingsData = await bookingsAPI.getAll();
        // API yanıtının dizi olup olmadığını kontrol et
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        
        // Son 5 rezervasyonu al
        const recent = bookingsArray.slice(0, 5).map((booking: any) => ({
          id: booking.id,
          customer: booking.full_name || booking.customer || 'Misafir',
          date: booking.pickup_date,
          car: booking.car?.name || booking.car || 'Araç bilgisi yok',
          status: booking.status || 'pending',
          amount: booking.amount || booking.price || 0
        }));
        setRecentBookings(recent);
        
        // Popüler araçları al
        const carsData = await carsAPI.getAll();
        // API yanıtının dizi olup olmadığını kontrol et
        const carsArray = Array.isArray(carsData) ? carsData : [];
        
        // Rezervasyon sayısına göre sırala ve ilk 3'ü al
        const popular = carsArray
          .sort((a: any, b: any) => (b.bookings_count || 0) - (a.bookings_count || 0))
          .slice(0, 3)
          .map((car: any) => ({
            id: car.id,
            name: car.name,
            bookings: car.bookings_count || 0,
            image: car.image || ''
          }));
        setPopularCars(popular);
      } catch (err) {
        console.error('Dashboard verilerini yüklerken hata:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        
        // Geçici olarak, API entegrasyonu tamamlanana kadar örnek veriler
        setStats({
          totalBookings: 248,
          totalCars: 12,
          activeBookings: 18,
          monthlyRevenue: 42500,
          bookingCompletionRate: 78,
          carOccupancyRate: 65,
          cancellationRate: 12
        });
        
        setRecentBookings([
          { id: 1, customer: 'Ahmet Yılmaz', date: '03.03.2025', car: 'Mercedes Vito VIP', status: 'completed', amount: 1200 },
          { id: 2, customer: 'Mehmet Kaya', date: '04.03.2025', car: 'Mercedes Sprinter', status: 'pending', amount: 1500 },
          { id: 3, customer: 'Ayşe Demir', date: '05.03.2025', car: 'Mercedes V-Class', status: 'pending', amount: 1800 },
          { id: 4, customer: 'Fatma Şahin', date: '02.03.2025', car: 'Mercedes Vito VIP', status: 'cancelled', amount: 1200 },
          { id: 5, customer: 'Ali Yıldız', date: '06.03.2025', car: 'Mercedes Sprinter', status: 'pending', amount: 1500 }
        ]);
        
        setPopularCars([
          { id: 1, name: 'Mercedes Vito VIP', bookings: 86, image: '/uploads/vito.jpg' },
          { id: 2, name: 'Mercedes Sprinter', bookings: 64, image: '/uploads/sprinter.jpg' },
          { id: 3, name: 'Mercedes V-Class', bookings: 42, image: '/uploads/vclass.jpg' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Sayfayı Yenile
        </button>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Kontrol Paneli</h1>
        <p className="text-gray-500 dark:text-gray-400">Hoş geldiniz, işte bugünün özeti.</p>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Toplam Rezervasyon" 
          value={stats.totalBookings} 
          icon={<Calendar size={24} className="text-amber-600 dark:text-amber-400" />}
          change={12}
          changeText="bu ay"
          changeType="increase"
        />
        <StatCard 
          title="Aktif Araçlar" 
          value={stats.totalCars} 
          icon={<Car size={24} className="text-amber-600 dark:text-amber-400" />}
          change={2}
          changeText="geçen aya göre"
          changeType="increase"
        />
        <StatCard 
          title="Aktif Rezervasyonlar" 
          value={stats.activeBookings} 
          icon={<Users size={24} className="text-amber-600 dark:text-amber-400" />}
          change={5}
          changeText="geçen haftaya göre"
          changeType="decrease"
        />
        <StatCard 
          title="Aylık Gelir" 
          value={`₺${stats.monthlyRevenue.toLocaleString()}`} 
          icon={<TrendingUp size={24} className="text-amber-600 dark:text-amber-400" />}
          change={8}
          changeText="geçen aya göre"
          changeType="increase"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son Rezervasyonlar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold dark:text-white">Son Rezervasyonlar</h2>
              <div className="mt-4">
                <button 
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center"
                  onClick={() => navigate('/admin/bookings')}
                >
                  Tüm rezervasyonları görüntüle
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Araç
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {booking.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {booking.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {booking.car}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BookingStatus 
                          status={booking.status} 
                          text={
                            booking.status === 'completed' ? 'Tamamlandı' : 
                            booking.status === 'pending' ? 'Beklemede' : 
                            'İptal Edildi'
                          } 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₺{booking.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-amber-600 hover:text-amber-800 text-xs"
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        >
                          Detayları Görüntüle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Popüler Araçlar */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold dark:text-white">Popüler Araçlar</h2>
              <div className="mt-4">
                <button 
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center"
                  onClick={() => navigate('/admin/cars')}
                >
                  Tüm araçları görüntüle
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {popularCars.map((car) => (
                  <div key={car.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Araç';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium dark:text-white">{car.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{car.bookings} rezervasyon</p>
                    </div>
                    <div>
                      <button 
                        className="text-amber-600 hover:text-amber-800 text-xs"
                        onClick={() => navigate(`/admin/cars/edit/${car.id}`)}
                      >
                        Düzenle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Hızlı İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Hızlı İstatistikler</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium dark:text-white">Rezervasyon Tamamlanma Oranı</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.bookingCompletionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.bookingCompletionRate}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium dark:text-white">Araç Doluluk Oranı</span>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{stats.carOccupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${stats.carOccupancyRate}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium dark:text-white">İptal Oranı</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{stats.cancellationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.cancellationRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 
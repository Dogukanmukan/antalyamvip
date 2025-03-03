import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import BookingDetailModal from '../../components/admin/BookingDetailModal';

// Admin dashboard için basit bir istatistik kartı bileşeni
const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ 
  title, 
  value, 
  icon 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-amber-100 p-3 rounded-full">
          <span className="text-amber-500 text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

// Son rezervasyonlar için tablo satırı bileşeni
const BookingRow: React.FC<{ 
  id: number; 
  name: string; 
  date: string; 
  car: string; 
  status: string;
  onClick: () => void;
}> = ({ id, name, date, car, status, onClick }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass()}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          onClick={onClick}
          className="text-amber-600 hover:text-amber-900"
        >
          Detaylar
        </button>
      </td>
    </tr>
  );
};

// Rezervasyon ve araç arayüzleri
interface Booking {
  id: number;
  trip_type: 'oneWay' | 'roundTrip';
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  return_pickup_location: string | null;
  return_dropoff_location: string | null;
  return_date: string | null;
  passengers: number;
  car_id: number;
  cars: {
    name: string;
  } | null;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: string;
  created_at: string;
}

interface Car {
  id: number;
  name: string;
  category: string;
  images: string[];
  year: number;
  fuel_type: string;
  seats: number;
  features: string[];
  price_per_day: number | null;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Kimlik doğrulama kontrolü
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [navigate]);
  
  // Tüm verileri çek
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Rezervasyonları çek
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      
      if (bookingsData.success) {
        setBookings(bookingsData.bookings);
      }
      
      // Araçları çek
      const carsResponse = await fetch('/api/cars');
      if (carsResponse.ok) {
        const carsData = await carsResponse.json();
        setCars(carsData);
      }
    } catch (error) {
      console.error('Veri çekilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // İstatistikleri hesapla
  const getTotalBookings = () => bookings.length;
  
  const getMonthlyBookings = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === currentMonth && 
             bookingDate.getFullYear() === currentYear;
    }).length;
  };
  
  const getPendingBookings = () => {
    return bookings.filter(booking => booking.status === 'pending').length;
  };
  
  const getTotalCars = () => cars.length;
  
  // Son 5 rezervasyonu al
  const getRecentBookings = () => {
    return bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(booking => ({
        id: booking.id,
        name: booking.full_name,
        date: new Date(booking.created_at).toLocaleDateString('tr-TR'),
        car: booking.cars?.name || 'Bilinmeyen Araç',
        status: booking.status
      }));
  };
  
  // Rezervasyon detaylarını göster
  const handleShowBookingDetails = (bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsModalOpen(true);
    }
  };
  
  // Modal'ı kapat
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };
  
  if (!isAuthenticated) {
    return <div>Yükleniyor...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={t('admin.dashboard.title')} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title={t('admin.dashboard.totalBookings')} value={getTotalBookings()} icon="📅" />
                <StatCard title={t('admin.dashboard.thisMonth')} value={getMonthlyBookings()} icon="📈" />
                <StatCard title={t('admin.dashboard.pending')} value={getPendingBookings()} icon="⏳" />
                <StatCard title={t('admin.dashboard.totalCars')} value={getTotalCars()} icon="🚗" />
              </div>
              
              <div className="bg-white rounded-lg shadow-md mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">{t('admin.dashboard.recentBookings')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.dashboard.bookingDetails.name')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.dashboard.bookingDetails.createdAt')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.dashboard.bookingDetails.car')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.dashboard.bookingDetails.status')}
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">İşlemler</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getRecentBookings().length > 0 ? (
                        getRecentBookings().map((booking) => (
                          <BookingRow 
                            key={booking.id}
                            id={booking.id} 
                            name={booking.name} 
                            date={booking.date} 
                            car={booking.car} 
                            status={booking.status}
                            onClick={() => handleShowBookingDetails(booking.id)}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            {t('admin.dashboard.noBookings')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <a href="/admin/bookings" className="text-amber-600 hover:text-amber-900 text-sm font-medium">{t('admin.dashboard.viewAllBookings')} →</a>
                </div>
              </div>
            </>
          )}
          
          {/* Rezervasyon Detay Modal */}
          <BookingDetailModal 
            booking={selectedBooking} 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
          />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

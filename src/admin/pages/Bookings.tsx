import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronLeft, ChevronRight, 
  Download, Trash2, Edit, Eye, Calendar, Clock, 
  CheckCircle, XCircle, AlertCircle, MoreHorizontal
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../utils/api-compat';

// Rezervasyon arayüzü
interface Booking {
  id: string;
  trip_type: 'oneWay' | 'roundTrip';
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  return_date?: string;
  return_pickup_location?: string;
  return_dropoff_location?: string;
  passengers: number;
  car_id: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  car?: {
    id: string;
    name: string;
    image?: string;
  };
  // UI için ek alanlar - bunları opsiyonel yapıyoruz
  customer?: string;
  amount?: number;
}

// Rezervasyon durumu bileşeni
interface BookingStatusProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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

// Rezervasyon detay modalı
interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Rezervasyon #{booking.id}
                </h3>
                
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Müşteri Bilgileri</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{booking.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{booking.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{booking.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rezervasyon Durumu</p>
                      <div className="mt-1">
                        <BookingStatus 
                          status={booking.status} 
                          text={
                            booking.status === 'completed' ? 'Tamamlandı' : 
                            booking.status === 'pending' ? 'Beklemede' : 
                            'İptal Edildi'
                          } 
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Oluşturulma: {booking.created_at}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Yolculuk Detayları</p>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tarih & Saat</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {booking.pickup_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Araç</p>
                        <p className="text-sm text-gray-900 dark:text-white">{booking.car?.name || `Car ID: ${booking.car_id}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Alış Noktası</p>
                        <p className="text-sm text-gray-900 dark:text-white">{booking.pickup_location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bırakış Noktası</p>
                        <p className="text-sm text-gray-900 dark:text-white">{booking.dropoff_location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Yolcu Sayısı</p>
                        <p className="text-sm text-gray-900 dark:text-white">{booking.passengers} kişi</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tutar</p>
                        <p className="text-sm text-gray-900 dark:text-white">₺{booking.amount}</p>
                      </div>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notlar</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Kapat
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Düzenle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ana Bookings bileşeni
const Bookings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const bookingsPerPage = 10;
  
  // Arama işlemi
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    
    let result = [...bookings];
    
    // Durum filtresini uygula
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Arama terimini uygula
    if (searchTerm) {
      result = result.filter(booking => 
        (booking.full_name?.toLowerCase().includes(searchTerm)) ||
        (booking.email?.toLowerCase().includes(searchTerm)) ||
        (booking.phone?.includes(searchTerm)) ||
        (booking.pickup_location?.toLowerCase().includes(searchTerm)) ||
        (booking.dropoff_location?.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredBookings(result);
    setCurrentPage(1);
  };
  
  // API'den verileri yükle
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching bookings from API...');
        const data = await api.bookings.getAll();
        console.log('Bookings API response:', data);
        
        // API yanıtının dizi olup olmadığını kontrol et
        const bookingsArray = Array.isArray(data) ? data : [];
        console.log(`Processed ${bookingsArray.length} bookings`);
        
        // Verileri işle ve görüntüleme için hazırla
        const processedBookings = bookingsArray.map(booking => {
          // Orijinal rezervasyon nesnesini döndür, UI için ek alanları ekle
          return {
            ...booking,
            customer: booking.full_name,
            // Fiyat bilgisini amount alanına ekle (UI için)
            amount: booking.total_price || 0
          };
        });
        
        setBookings(processedBookings);
        setFilteredBookings(processedBookings);
      } catch (err) {
        console.error('Rezervasyonları yüklerken hata:', err);
        setError('Rezervasyonlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setBookings([]);
        setFilteredBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Sayfalama
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  
  // Sayfa değiştirme
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Rezervasyon durumunu güncelle
  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.bookings.updateStatus(id, status);
      
      // Başarılı olursa, yerel durumu güncelle
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === id 
            ? { ...booking, status: status as 'pending' | 'confirmed' | 'completed' | 'cancelled' } 
            : booking
        )
      );
      
      setFilteredBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === id 
            ? { ...booking, status: status as 'pending' | 'confirmed' | 'completed' | 'cancelled' } 
            : booking
        )
      );
      
      // Eğer detay modalı açıksa, oradaki durumu da güncelle
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({
          ...selectedBooking,
          status: status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
        });
      }
      
      alert('Rezervasyon durumu başarıyla güncellendi.');
    } catch (error) {
      console.error('Rezervasyon durumu güncellenirken hata:', error);
      alert('Rezervasyon durumu güncellenirken bir hata oluştu.');
    }
  };
  
  // Rezervasyon sil
  const deleteBooking = async (id: string) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setIsDeleting(true);
    setDeleteId(id);
    
    try {
      await api.bookings.delete(id);
      
      // Başarılı olursa, yerel durumu güncelle
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
      setFilteredBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
      
      alert('Rezervasyon başarıyla silindi.');
    } catch (error) {
      console.error('Rezervasyon silinirken hata:', error);
      alert('Rezervasyon silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };
  
  // Rezervasyon detaylarını göster
  const showBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };
  
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
        <h1 className="text-2xl font-bold dark:text-white">Rezervasyonlar</h1>
        <p className="text-gray-500 dark:text-gray-400">Tüm rezervasyonları görüntüleyin ve yönetin.</p>
      </div>
      
      {/* Filtreler ve Arama */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Müşteri, e-posta veya konum ara..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="completed">Tamamlandı</option>
                <option value="pending">Beklemede</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            
            <button 
              onClick={() => {
                // CSV formatında dışa aktarma işlemi
                const headers = ['ID', 'Müşteri', 'E-posta', 'Telefon', 'Tarih', 'Saat', 'Alış', 'Bırakış', 'Araç', 'Yolcu', 'Durum', 'Tutar'];
                const csvContent = [
                  headers.join(','),
                  ...filteredBookings.map(b => [
                    b.id,
                    b.customer,
                    b.email,
                    b.phone,
                    b.pickup_date,
                    b.pickup_date,
                    b.pickup_location,
                    b.dropoff_location,
                    b.car,
                    b.passengers,
                    b.status,
                    b.amount
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `rezervasyonlar_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Download size={18} className="mr-2" />
              Dışa Aktar
            </button>
          </div>
        </div>
      </div>
      
      {/* Rezervasyon Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                  Alış/Bırakış
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
              {currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{booking.id.toString().substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.customer || booking.full_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{booking.pickup_date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{booking.pickup_location}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{booking.dropoff_location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {typeof booking.car === 'string' ? booking.car : (booking.car?.name || `Car ID: ${booking.car_id}`)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ₺{booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                        <MoreHorizontal size={18} />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <button 
                          onClick={() => showBookingDetails(booking)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <Eye size={16} className="mr-2" />
                          Detayları Görüntüle
                        </button>
                        <button 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => updateBookingStatus(booking.id, booking.status === 'pending' ? 'completed' : 'pending')}
                        >
                          <Edit size={16} className="mr-2" />
                          {booking.status === 'pending' ? 'Tamamlandı Olarak İşaretle' : 'Beklemede Olarak İşaretle'}
                        </button>
                        <button 
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          onClick={() => deleteBooking(booking.id)}
                          disabled={isDeleting && deleteId === booking.id}
                        >
                          <Trash2 size={16} className="mr-2" />
                          {isDeleting && deleteId === booking.id ? 'Siliniyor...' : 'Sil'}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    {filteredBookings.length === 0 ? (
                      <div>
                        <p className="text-lg font-medium">Henüz rezervasyon bulunmuyor</p>
                        <p className="text-sm mt-1">İlk rezervasyonunuzu bekliyor olacağız.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium">Arama kriterlerinize uygun rezervasyon bulunamadı</p>
                        <p className="text-sm mt-1">Lütfen farklı arama kriterleri deneyin.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Sayfalama */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Toplam <span className="font-medium">{filteredBookings.length}</span> rezervasyondan{' '}
                <span className="font-medium">{filteredBookings.length > 0 ? indexOfFirstBooking + 1 : 0}</span>-
                <span className="font-medium">
                  {indexOfLastBooking > filteredBookings.length ? filteredBookings.length : indexOfLastBooking}
                </span>{' '}
                arası gösteriliyor
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Önceki</span>
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === totalPages || totalPages === 0
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Sonraki</span>
                  <ChevronRight size={18} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rezervasyon Detay Modalı */}
      {selectedBooking && (
        <BookingDetailModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </AdminLayout>
  );
};

export default Bookings; 
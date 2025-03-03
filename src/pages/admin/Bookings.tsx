import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { useTranslation } from 'react-i18next';
import BookingDetailModal from '../../components/admin/BookingDetailModal';
import { Calendar, ArrowUp, ArrowDown } from 'lucide-react';

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

type SortField = 'id' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';

const AdminBookings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchBookings();
    }
  }, [navigate, statusFilter, startDate, endDate, sortField, sortDirection]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // URL parametrelerini oluştur
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/api/bookings?${queryString}` : '/api/bookings';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        let filteredBookings = data.bookings;

        // Status filtresi uygula
        if (statusFilter !== 'all') {
          filteredBookings = filteredBookings.filter(
            (booking: Booking) => booking.status === statusFilter
          );
        }

        // Sıralama uygula
        const sortedBookings = [...filteredBookings].sort((a, b) => {
          if (sortField === 'id') {
            return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
          } else if (sortField === 'date') {
            const dateA = new Date(a.pickup_date).getTime();
            const dateB = new Date(b.pickup_date).getTime();
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          } else if (sortField === 'status') {
            // Status sıralaması: pending -> completed -> cancelled
            const statusOrder = { pending: 1, completed: 2, cancelled: 3 };
            const orderA = statusOrder[a.status] || 999;
            const orderB = statusOrder[b.status] || 999;
            return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
          }
          return 0;
        });

        setBookings(sortedBookings);
      } else {
        setError('Rezervasyonlar yüklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Rezervasyonlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        setBookings(bookings.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        ));

        alert('Rezervasyon durumu güncellendi.');
      } else {
        alert(data.message || 'Rezervasyon durumu güncellenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Rezervasyon durumu güncellenirken bir hata oluştu.');
    }
  };

  const getStatusClass = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Beklemede';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getTripTypeText = (tripType: 'oneWay' | 'roundTrip') => {
    return tripType === 'oneWay' ? 'Tek Yön' : 'Gidiş-Dönüş';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      // Aynı alana tıklandıysa sıralama yönünü değiştir
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Farklı alana tıklandıysa, o alanı seç ve varsayılan sıralama yönünü belirle
      setSortField(field);
      if (field === 'status') {
        setSortDirection('asc'); // Status için varsayılan: pending önce
      } else {
        setSortDirection('desc'); // Diğerleri için varsayılan: azalan
      }
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? 
      <ArrowUp className="inline-block ml-1 w-4 h-4" /> : 
      <ArrowDown className="inline-block ml-1 w-4 h-4" />;
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setSortField('id');
    setSortDirection('desc');
  };

  if (!isAuthenticated) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Rezervasyon Yönetimi" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Rezervasyonlar</h1>

            <div className="flex items-center space-x-4">
              {/* Tarih Filtreleme */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-1 w-4 h-4" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="Başlangıç Tarihi"
                  />
                </div>
                <span className="text-gray-500">-</span>
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-1 w-4 h-4" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="Bitiş Tarihi"
                  />
                </div>
              </div>

              {/* Durum Filtresi */}
              <div className="flex items-center">
                <label htmlFor="status-filter" className="mr-2 text-sm text-gray-600">
                  Durum:
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="all">Tümü</option>
                  <option value="pending">Beklemede</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              {/* Filtreleri Temizle */}
              <button
                onClick={clearFilters}
                className="text-sm text-amber-600 hover:text-amber-800"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="spinner"></div>
              <p className="mt-2 text-gray-600">Rezervasyonlar yükleniyor...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('id')}
                    >
                      ID {getSortIcon('id')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seyahat Tipi
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('date')}
                    >
                      Tarih {getSortIcon('date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Güzergah
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Araç
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('status')}
                    >
                      Durum {getSortIcon('status')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Rezervasyon bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.full_name}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                          <div className="text-sm text-gray-500">{booking.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTripTypeText(booking.trip_type || 'oneWay')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(booking.pickup_date)}
                          </div>
                          {booking.trip_type === 'roundTrip' && booking.return_date && (
                            <div className="text-sm text-gray-500 mt-1 pt-1 border-t border-gray-100">
                              Dönüş: {formatDate(booking.return_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.pickup_location} → {booking.dropoff_location}
                          </div>
                          {booking.trip_type === 'roundTrip' && booking.return_pickup_location && booking.return_dropoff_location && (
                            <div className="text-sm text-gray-500 mt-1 pt-1 border-t border-gray-100">
                              Dönüş: {booking.return_pickup_location} → {booking.return_dropoff_location}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.cars?.name || 'Belirtilmemiş'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="pending">Beklemede</option>
                              <option value="completed">Tamamlandı</option>
                              <option value="cancelled">İptal Edildi</option>
                            </select>
                            <button
                              onClick={() => openDetailModal(booking)}
                              className="text-amber-600 hover:text-amber-900 text-xs border border-amber-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              Detaylar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      
      {/* Detay Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
};

export default AdminBookings;

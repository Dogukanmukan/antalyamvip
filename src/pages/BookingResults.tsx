import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingFormData } from '../types';
import { Car } from '../types';
import { Calendar, Clock, MapPin, Users, Check, Phone, Mail, UserIcon, MessageSquare } from 'lucide-react';
import ImageModal from '../components/ImageModal';

const BookingResults: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // BookingForm'dan gelen verileri al
    if (location.state && location.state.bookingData) {
      setBookingData(location.state.bookingData);
    } else {
      // Eğer veri yoksa anasayfaya yönlendir
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Canlı ortamdaki API endpoint'ini kullanıyoruz
        const response = await fetch('/api/cars');
        
        if (!response.ok) {
          throw new Error('Araçlar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Araçları getirme hatası:', error);
        setError('Araçlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleCarSelect = (car: Car) => {
    setSelectedCar(car);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCar || !bookingData) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Rezervasyon verilerini hazırla
      const bookingDetails = {
        trip_type: bookingData.tripType,
        pickup_location: bookingData.pickupLocation,
        dropoff_location: bookingData.dropoffLocation,
        pickup_date: bookingData.pickupDate,
        return_pickup_location: bookingData.returnPickupLocation,
        return_dropoff_location: bookingData.returnDropoffLocation,
        return_date: bookingData.returnDate,
        passengers: bookingData.passengers,
        car_id: selectedCar.id,
        full_name: contactInfo.fullName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        notes: contactInfo.notes,
        status: 'pending'
      };

      // API'ye gönder
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Rezervasyon oluşturulurken bir hata oluştu');
      }

      setSuccess('Rezervasyonunuz başarıyla oluşturuldu!');

      // Başarılı rezervasyon sonrası yönlendirme
      setTimeout(() => {
        navigate('/booking-confirmation', { 
          state: { 
            booking: result.booking,
            car: selectedCar
          } 
        });
      }, 1500);

    } catch (error) {
      console.error('Rezervasyon hatası:', error);
      setError('Rezervasyon oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tarih formatını düzenle
  const fixDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Eğer bookingData yoksa yükleniyor göster
  if (!bookingData) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('bookingResults.title')}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('bookingResults.tripDetails')}</h2>
        {/* Trip details */}
        {bookingData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">{t('bookingForm.tripType')}:</p>
              <p>{bookingData.tripType === 'oneWay' ? t('bookingForm.oneWay') : t('bookingForm.roundTrip')}</p>
            </div>
            <div>
              <p className="font-semibold">{t('bookingForm.passengers')}:</p>
              <p>{bookingData.passengers}</p>
            </div>
            <div>
              <p className="font-semibold">{t('bookingForm.pickupLocation')}:</p>
              <p>{bookingData.pickupLocation}</p>
            </div>
            <div>
              <p className="font-semibold">{t('bookingForm.dropoffLocation')}:</p>
              <p>{bookingData.dropoffLocation}</p>
            </div>
            <div>
              <p className="font-semibold">{t('bookingForm.pickupDate')}:</p>
              <p>{new Date(bookingData.pickupDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold">{t('bookingForm.pickupTime')}:</p>
              <p>{bookingData.pickupTime}</p>
            </div>
            {bookingData.tripType === 'roundTrip' && (
              <>
                <div>
                  <p className="font-semibold">{t('bookingForm.returnPickupLocation')}:</p>
                  <p>{bookingData.returnPickupLocation}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('bookingForm.returnDropoffLocation')}:</p>
                  <p>{bookingData.returnDropoffLocation}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('bookingForm.returnDate')}:</p>
                  <p>{bookingData.returnDate ? new Date(bookingData.returnDate).toLocaleDateString() : ''}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('bookingForm.returnTime')}:</p>
                  <p>{bookingData.returnTime}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('bookingResults.availableVehicles')}</h2>
        
        {loading ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-600">{t('bookingResults.noVehicles')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div 
                key={car.id} 
                className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                  selectedCar?.id === car.id ? 'border-2 border-amber-500' : 'border-gray-200'
                }`}
                onClick={() => handleCarSelect(car)}
              >
                <div className="relative h-48">
                  <img 
                    src={car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={car.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                  <p className="text-gray-600 mb-2">{car.category}</p>
                  <div className="flex items-center mb-2">
                    <UserIcon className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">{car.seats} {t('common.seats')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-amber-600">{car.price_per_day} ₺</span>
                    <button 
                      className={`px-4 py-2 rounded-md ${
                        selectedCar?.id === car.id 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCarSelect(car);
                      }}
                    >
                      {selectedCar?.id === car.id ? t('common.selected') : t('common.select')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Information */}
      {selectedCar && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">{t('bookingResults.contactInfo')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('bookingResults.fullNamePlaceholder')}
                  value={contactInfo.fullName}
                  onChange={(e) => setContactInfo({...contactInfo, fullName: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('bookingResults.phonePlaceholder')}
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('bookingResults.emailPlaceholder')}
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('bookingResults.notesPlaceholder')}
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo({...contactInfo, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting || !contactInfo.fullName || !contactInfo.phone || !contactInfo.email}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50"
            >
              {isSubmitting ? t('bookingResults.processing') : t('bookingResults.confirmBooking')}
            </button>
          </div>
        </div>
      )}
      
      {/* Image Modal */}
      {isModalOpen && selectedCar && (
        <ImageModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          images={selectedCar.images || []}
          currentIndex={currentImageIndex}
          onPrev={() => {
            if (!selectedCar || !selectedCar.images) return;
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + selectedCar.images.length) % selectedCar.images.length);
          }}
          onNext={() => {
            if (!selectedCar || !selectedCar.images) return;
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedCar.images.length);
          }}
        />
      )}
    </div>
  );
};

export default BookingResults;

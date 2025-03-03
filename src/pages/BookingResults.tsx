import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingFormData } from '../types';
import { Car } from '../types';
import { Calendar, Clock, MapPin, Users, Check, Phone, Mail, User, MessageSquare } from 'lucide-react';
import ImageModal from '../components/ImageModal';

const BookingResults: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookingData] = useState<BookingFormData | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cars');
        if (!response.ok) {
          throw new Error('Araçlar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        console.log('Cars data:', data);
        setCars(data);
      } catch (error) {
        console.error('Araçları getirme hatası:', error);
      }
    };

    fetchData();
  }, []);

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCar || !bookingData) return;

    try {
      setIsSubmitting(true);

      // Booking API'sine gönderilecek veriyi hazırla
      const bookingDetails = {
        trip_type: bookingData.tripType,
        pickup_location: bookingData.pickupLocation,
        dropoff_location: bookingData.dropoffLocation,
        pickup_date: `${bookingData.pickupDate}T${bookingData.pickupTime}:00`,
        return_pickup_location: bookingData.tripType === 'roundTrip' ? bookingData.returnPickupLocation : null,
        return_dropoff_location: bookingData.tripType === 'roundTrip' ? bookingData.returnDropoffLocation : null,
        return_date: bookingData.tripType === 'roundTrip' ? `${bookingData.returnDate}T${bookingData.returnTime}:00` : null,
        passengers: bookingData.passengers,
        car_id: selectedCar.id,
        full_name: contactInfo.fullName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        notes: contactInfo.notes || null,
        status: 'pending'
      };

      console.log('Sending booking data:', bookingDetails);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rezervasyon oluşturulurken bir hata oluştu');
      }

      const responseData = await response.json();
      console.log('Booking response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.error || 'Rezervasyon oluşturulurken bir hata oluştu');
      }

      // Başarılı rezervasyon sonrası yönlendirme
      navigate('/booking-confirmation', { 
        state: { 
          booking: responseData.booking,
          car: selectedCar
        } 
      });

    } catch (error) {
      console.error('Rezervasyon hatası:', error);
      alert(error instanceof Error ? error.message : 'Rezervasyon oluşturulurken bir hata oluştu');
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Booking Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('bookingResults.summary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">{t('bookingResults.pickupDetails')}</h3>
            <div className="space-y-2">
              <p className="flex items-center text-gray-600">
                <MapPin className="mr-2" size={18} />
                {bookingData?.pickupLocation}
              </p>
              <p className="flex items-center text-gray-600">
                <Calendar className="mr-2" size={18} />
                {fixDate(bookingData?.pickupDate)}
              </p>
            </div>
          </div>
          
          {bookingData?.tripType === 'roundTrip' && (
            <div>
              <h3 className="font-semibold mb-2">{t('bookingResults.returnDetails')}</h3>
              <div className="space-y-2">
                <p className="flex items-center text-gray-600">
                  <MapPin className="mr-2" size={18} />
                  {bookingData?.returnPickupLocation}
                </p>
                <p className="flex items-center text-gray-600">
                  <Calendar className="mr-2" size={18} />
                  {fixDate(bookingData?.returnDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Cars */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('bookingResults.availableVehicles')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <div 
              key={car.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition duration-300 ${
                selectedCar?.id === car.id ? 'ring-2 ring-amber-500' : 'hover:shadow-lg'
              }`}
              onClick={() => handleSelectCar(car)}
            >
              <div className="relative">
                <img 
                  src={car.images[0]} 
                  alt={car.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                  {car.category}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{car.name}</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="mr-1" size={16} />
                    <span className="text-sm">{car.seats} {t('common.seats')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="mr-1" size={16} />
                    <span className="text-sm">{t('common.24hours')}</span>
                  </div>
                </div>
                
                {selectedCar?.id === car.id && (
                  <div className="flex items-center text-amber-500">
                    <Check className="mr-2" size={18} />
                    {t('bookingResults.selected')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      {selectedCar && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">{t('bookingResults.contactInfo')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
      {isModalOpen && cars.length > 0 && (
        <ImageModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          images={cars.find(c => c.id === currentImageIndex)?.images || []}
          currentIndex={currentImageIndex}
          onPrev={() => {
            const car = cars.find(c => c.id === currentImageIndex);
            if (!car) return;
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + car.images.length) % car.images.length);
          }}
          onNext={() => {
            const car = cars.find(c => c.id === currentImageIndex);
            if (!car) return;
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % car.images.length);
          }}
        />
      )}
    </div>
  );
};

export default BookingResults;

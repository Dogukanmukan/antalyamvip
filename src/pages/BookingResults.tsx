import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingFormData } from '../types/booking';
import { Car } from '../types';
import { cars } from '../data/cars';
import { Calendar, Clock, MapPin, Users, Car as CarIcon, Check, ChevronLeft, ChevronRight, Phone, Mail, User, MessageSquare } from 'lucide-react';
import ImageModal from '../components/ImageModal';

const BookingResults: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<number, number>>({});
  const [modalState, setModalState] = useState<{isOpen: boolean, carId: number, imageIndex: number}>({
    isOpen: false,
    carId: 0,
    imageIndex: 0
  });
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    phone: false,
    email: false
  });

  useEffect(() => {
    // Retrieve booking data from location state
    if (location.state && location.state.bookingData) {
      setBookingData(location.state.bookingData);
      
      // Filter cars based on passengers
      const data = location.state.bookingData as BookingFormData;
      let filteredCars = cars;
      
      // Filter by passenger capacity
      filteredCars = filteredCars.filter(car => car.seats >= data.passengers);
      
      setAvailableCars(filteredCars);
      
      // Initialize current image indexes
      const initialIndexes: Record<number, number> = {};
      filteredCars.forEach(car => {
        initialIndexes[car.id] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
      
      // Set contact info from booking data if available
      if (data.contactInfo) {
        setContactInfo({
          fullName: data.contactInfo.fullName || '',
          phone: data.contactInfo.phone || '',
          email: data.contactInfo.email || '',
          notes: data.contactInfo.notes || ''
        });
      }
    } else {
      // If no booking data, redirect back to booking page
      navigate('/');
    }
  }, [location, navigate]);

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
  };

  const validateForm = () => {
    const errors = {
      fullName: contactInfo.fullName.trim() === '',
      phone: contactInfo.phone.trim() === '',
      email: !contactInfo.email.includes('@') || contactInfo.email.trim() === ''
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleConfirmBooking = () => {
    if (!selectedCar) {
      alert(t('bookingResults.selectVehicleAlert'));
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    // In a real app, you would send the booking data to your backend
    const completeBookingData = {
      ...bookingData,
      selectedCar,
      contactInfo
    };
    
    console.log('Complete booking data:', completeBookingData);
    
    alert(t('booking.successMessage'));
    navigate('/');
  };

  const nextImage = (e: React.MouseEvent, carId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const car = availableCars.find(c => c.id === carId);
    if (!car) return;
    
    setCurrentImageIndexes(prev => ({
      ...prev,
      [carId]: (prev[carId] + 1) % car.images.length
    }));
  };
  
  const prevImage = (e: React.MouseEvent, carId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const car = availableCars.find(c => c.id === carId);
    if (!car) return;
    
    setCurrentImageIndexes(prev => ({
      ...prev,
      [carId]: (prev[carId] - 1 + car.images.length) % car.images.length
    }));
  };
  
  const openImageModal = (e: React.MouseEvent, carId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setModalState({
      isOpen: true,
      carId,
      imageIndex: currentImageIndexes[carId] || 0
    });
  };

  if (!bookingData) {
    return <div className="container mx-auto p-6 text-center">{t('bookingResults.loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('bookingResults.title')}</h1>
      
      {/* Booking Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('bookingResults.summary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start">
            <MapPin className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.pickupLocation')}</p>
              <p className="font-medium">{bookingData.pickupLocation}</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.dropoffLocation')}</p>
              <p className="font-medium">{bookingData.dropoffLocation}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.pickupDate')}</p>
              <p className="font-medium">{bookingData.pickupDate}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.pickupTime')}</p>
              <p className="font-medium">{bookingData.pickupTime}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.dropoffDate')}</p>
              <p className="font-medium">{bookingData.dropoffDate}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.dropoffTime')}</p>
              <p className="font-medium">{bookingData.dropoffTime}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">{t('booking.passengers')}</p>
              <p className="font-medium">
                {bookingData.passengers} {bookingData.passengers === 1 ? t('booking.passenger') : t('booking.passengers')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Available Cars */}
      <h2 className="text-2xl font-semibold mb-4">{t('bookingResults.availableVehicles')}</h2>
      
      {availableCars.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p>{t('bookingResults.noVehicles')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCars.map(car => (
            <div 
              key={car.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg ${
                selectedCar?.id === car.id ? 'ring-2 ring-amber-500 scale-[1.02]' : ''
              }`}
              onClick={() => handleSelectCar(car)}
              style={{ cursor: 'pointer' }}
            >
              <div className="relative h-48 bg-gray-200">
                <img 
                  src={car.images[currentImageIndexes[car.id] || 0]} 
                  alt={car.name} 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={(e) => openImageModal(e, car.id)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
                
                {car.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => prevImage(e, car.id)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={(e) => nextImage(e, car.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {car.images.map((_, index) => (
                        <span 
                          key={index} 
                          className={`w-2 h-2 rounded-full ${(currentImageIndexes[car.id] || 0) === index ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {selectedCar?.id === car.id && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white p-2 rounded-full">
                    <Check size={16} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{car.name}</h3>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <Users size={16} className="mr-1" />
                  <span>{car.seats} {t('bookingResults.seatsAvailable')}</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('bookingResults.features')}:</h4>
                  <ul className="text-sm text-gray-600">
                    {car.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                    {car.features.length > 3 && (
                      <li>+{car.features.length - 3}</li>
                    )}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <button 
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCar?.id === car.id 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCar(car);
                    }}
                  >
                    {selectedCar?.id === car.id ? t('bookingResults.selected') : t('bookingResults.select')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Contact Information */}
      {selectedCar && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('bookingResults.contactInformation')}</h2>
          <p className="text-gray-600 mb-4">{t('bookingResults.contactDescription')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('bookingResults.fullName')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className={`w-full pl-10 pr-3 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder={t('bookingResults.fullNamePlaceholder')}
                  value={contactInfo.fullName}
                  onChange={(e) => setContactInfo({...contactInfo, fullName: e.target.value})}
                  required
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{t('bookingResults.fullNameRequired')}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('bookingResults.phone')} *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  className={`w-full pl-10 pr-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder={t('bookingResults.phonePlaceholder')}
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  required
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{t('bookingResults.phoneRequired')}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('bookingResults.email')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className={`w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder={t('bookingResults.emailPlaceholder')}
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{t('bookingResults.emailRequired')}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('bookingResults.notes')}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
                  placeholder={t('bookingResults.notesPlaceholder')}
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo({...contactInfo, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">* {t('bookingResults.requiredFields')}</p>
        </div>
      )}
      
      {/* Confirm Booking Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleConfirmBooking}
          disabled={!selectedCar}
          className={`px-8 py-3 rounded-md text-lg font-bold flex items-center ${
            selectedCar 
              ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transition duration-300`}
        >
          {t('bookingResults.confirmButton')}
        </button>
      </div>
      
      {/* Image Modal */}
      {modalState.isOpen && availableCars.length > 0 && (
        <ImageModal 
          isOpen={modalState.isOpen}
          onClose={() => setModalState({...modalState, isOpen: false})}
          images={availableCars.find(c => c.id === modalState.carId)?.images || []}
          currentIndex={modalState.imageIndex}
          onPrev={() => {
            const car = availableCars.find(c => c.id === modalState.carId);
            if (!car) return;
            setModalState({
              ...modalState,
              imageIndex: (modalState.imageIndex - 1 + car.images.length) % car.images.length
            });
          }}
          onNext={() => {
            const car = availableCars.find(c => c.id === modalState.carId);
            if (!car) return;
            setModalState({
              ...modalState,
              imageIndex: (modalState.imageIndex + 1) % car.images.length
            });
          }}
        />
      )}
    </div>
  );
};

export default BookingResults;

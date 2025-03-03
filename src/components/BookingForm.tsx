import { Calendar, Clock, MapPin, Users, ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookingFormData } from '../types';
import { useState, useEffect } from 'react';

const BookingForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<BookingFormData>({
    tripType: 'oneWay',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnPickupLocation: '',
    returnDropoffLocation: '',
    returnDate: '',
    returnTime: '',
    passengers: 1
  });

  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });

  // When trip type changes, update return fields if needed
  useEffect(() => {
    if (formData.tripType === 'roundTrip' && formData.returnPickupLocation === '') {
      // Auto-fill return journey fields with reversed outbound journey
      setFormData({
        ...formData,
        returnPickupLocation: formData.dropoffLocation,
        returnDropoffLocation: formData.pickupLocation
      });
    }
  }, [formData.tripType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time for API format
    const pickupDateTime = formData.pickupDate && formData.pickupTime 
      ? `${formData.pickupDate}T${formData.pickupTime}:00` 
      : '';
    
    const returnDateTime = formData.returnDate && formData.returnTime 
      ? `${formData.returnDate}T${formData.returnTime}:00` 
      : '';
    
    // Prepare data for BookingResults page
    const bookingData = {
      tripType: formData.tripType,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      pickupDate: pickupDateTime,
      returnPickupLocation: formData.returnPickupLocation,
      returnDropoffLocation: formData.returnDropoffLocation,
      returnDate: returnDateTime,
      passengers: formData.passengers
    };
    
    // Navigate to booking results page with form data
    navigate('/booking-results', { state: { bookingData } });
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 -mt-24 relative z-30">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">{t('booking.title')}</h2>
        
        {/* Trip Type Selection */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t('booking.tripType')}
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-amber-500"
                name="tripType"
                value="oneWay"
                checked={formData.tripType === 'oneWay'}
                onChange={() => setFormData({ ...formData, tripType: 'oneWay' })}
              />
              <span className="ml-2 text-gray-700">{t('booking.oneWay')}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-5 w-5 text-amber-500"
                name="tripType"
                value="roundTrip"
                checked={formData.tripType === 'roundTrip'}
                onChange={() => setFormData({ ...formData, tripType: 'roundTrip' })}
              />
              <span className="ml-2 text-gray-700">{t('booking.roundTrip')}</span>
            </label>
          </div>
        </div>
        
        {/* Outbound Journey Section */}
        <div className="mb-6">
          {formData.tripType === 'roundTrip' && (
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {t('booking.outboundJourney')}
            </h3>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('booking.pickupLocation')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('booking.enterLocation')}
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('booking.dropoffLocation')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('booking.enterLocation')}
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('booking.pickupDate')}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('booking.pickupTime')}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="time"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Return Journey Section */}
        {formData.tripType === 'roundTrip' && (
          <div className="mb-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {t('booking.returnJourney')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {t('booking.returnPickupLocation')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={t('booking.enterLocation')}
                    value={formData.returnPickupLocation}
                    onChange={(e) => setFormData({ ...formData, returnPickupLocation: e.target.value })}
                    required={formData.tripType === 'roundTrip'}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {t('booking.returnDropoffLocation')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={t('booking.enterLocation')}
                    value={formData.returnDropoffLocation}
                    onChange={(e) => setFormData({ ...formData, returnDropoffLocation: e.target.value })}
                    required={formData.tripType === 'roundTrip'}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {t('booking.returnDate')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    required={formData.tripType === 'roundTrip'}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {t('booking.returnTime')}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="time"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                    required={formData.tripType === 'roundTrip'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Passenger Information */}
        <div className="mb-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            {t('booking.passengers')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t('booking.passengers')}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? t('booking.passenger') : t('booking.passengers')}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-md flex items-center transition duration-300"
          >
            <Search size={20} className="mr-2" />
            {t('booking.search')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;

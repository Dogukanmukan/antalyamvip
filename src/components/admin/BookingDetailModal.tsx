import React from 'react';
import { useTranslation } from 'react-i18next';

interface BookingDetailModalProps {
  booking: {
    id: number;
    trip_type: 'oneWay' | 'roundTrip';
    pickup_location: string;
    dropoff_location: string;
    pickup_date: string;
    pickup_time?: string;
    return_pickup_location: string | null;
    return_dropoff_location: string | null;
    return_date: string | null;
    return_time?: string | null;
    passengers: number;
    car_id: number;
    cars?: {
      name: string;
    } | null;
    full_name: string;
    email: string;
    phone: string;
    notes: string | null;
    status: string;
    created_at: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, isOpen, onClose }) => {
  const { t } = useTranslation();
  
  if (!isOpen || !booking) return null;

  // Durum sınıfını belirle
  const getStatusClass = () => {
    switch (booking.status) {
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

  // Tarih formatı
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('tr-TR');
    } catch (e) {
      return dateStr;
    }
  };

  // Trip type text
  const getTripTypeText = (tripType: 'oneWay' | 'roundTrip') => {
    return tripType === 'oneWay' ? 'Tek Yön' : 'Gidiş-Dönüş';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {t('admin.dashboard.bookingDetails.title')}
                </h3>
                
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.bookingNumber')}:</span>
                    <span className="text-sm font-bold">#{booking.id}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.status')}:</span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">Seyahat Tipi:</span>
                    <span className="text-sm">{getTripTypeText(booking.trip_type || 'oneWay')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.createdAt')}:</span>
                    <span className="text-sm">{formatDate(booking.created_at)}</span>
                  </div>
                </div>
                
                <div className="border-b pb-4 mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">{t('admin.dashboard.bookingDetails.customerInfo')}</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.name')}:</span>
                    <span className="text-sm">{booking.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.email')}:</span>
                    <span className="text-sm">{booking.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.phone')}:</span>
                    <span className="text-sm">{booking.phone}</span>
                  </div>
                </div>
                
                <div className="border-b pb-4 mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">{t('admin.dashboard.bookingDetails.travelInfo')}</h4>
                  {/* Gidiş bilgileri */}
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Gidiş Yolculuğu:</h5>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.pickupLocation')}:</span>
                      <span className="text-sm">{booking.pickup_location}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.dropoffLocation')}:</span>
                      <span className="text-sm">{booking.dropoff_location}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.pickupDate')}:</span>
                      <span className="text-sm">{formatDate(booking.pickup_date)} {booking.pickup_time || ''}</span>
                    </div>
                  </div>
                  
                  {/* Dönüş bilgileri (eğer gidiş-dönüş ise) */}
                  {booking.trip_type === 'roundTrip' && booking.return_date && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <h5 className="text-sm font-semibold text-gray-700 mb-1">Dönüş Yolculuğu:</h5>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Kalkış Noktası:</span>
                        <span className="text-sm">{booking.return_pickup_location}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Varış Noktası:</span>
                        <span className="text-sm">{booking.return_dropoff_location}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Dönüş Tarihi:</span>
                        <span className="text-sm">{formatDate(booking.return_date)} {booking.return_time || ''}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.passengers')}:</span>
                    <span className="text-sm">{booking.passengers}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">{t('admin.dashboard.bookingDetails.carInfo')}</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">{t('admin.dashboard.bookingDetails.car')}:</span>
                    <span className="text-sm">{booking.cars?.name || t('admin.dashboard.bookingDetails.unknownCar')}</span>
                  </div>
                  {booking.notes && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-500 block mb-1">{t('admin.dashboard.bookingDetails.notes')}:</span>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {t('general.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;

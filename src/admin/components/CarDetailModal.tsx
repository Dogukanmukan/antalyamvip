import React from 'react';
import { X, Car, Users, Briefcase, Tag, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface CarDetailModalProps {
  car: any; // Daha sonra Car tipini tanımlayabiliriz
  onClose: () => void;
}

const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, onClose }) => {
  // Araç durumuna göre renk ve metin belirleme
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          text: 'Aktif'
        };
      case 'maintenance':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: 'Bakımda'
        };
      case 'inactive':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: 'Pasif'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: status
        };
    }
  };

  const statusInfo = getStatusInfo(car.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">{car.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Araç Görseli */}
            <div className="flex flex-col">
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center dark:bg-gray-700">
                {car.image ? (
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : car.images && car.images.length > 0 ? (
                  <img
                    src={car.images[0]}
                    alt={car.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <Car className="h-24 w-24 text-gray-400" />
                )}
              </div>
              
              {/* Galeri Resimleri */}
              {car.images && car.images.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 dark:text-white">Galeri</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${car.name} - ${index + 1}`}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Durum */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 dark:text-white">Durum</h3>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </div>
              </div>
            </div>

            {/* Araç Bilgileri */}
            <div>
              <h3 className="text-lg font-medium mb-4 dark:text-white">Araç Bilgileri</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Tag className="h-5 w-5 mr-2" />
                    <span>Kategori</span>
                  </div>
                  <div className="mt-1 text-gray-900 font-medium dark:text-white">{car.category}</div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Yolcu Kapasitesi</span>
                  </div>
                  <div className="mt-1 text-gray-900 font-medium dark:text-white">{car.passengerCapacity} Kişi</div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <span>Bagaj Kapasitesi</span>
                  </div>
                  <div className="mt-1 text-gray-900 font-medium dark:text-white">{car.luggageCapacity} Parça</div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Eklenme Tarihi</span>
                  </div>
                  <div className="mt-1 text-gray-900 font-medium dark:text-white">
                    {new Date(car.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 dark:text-white">Özellikler</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {car.features && car.features.map((feature: string, index: number) => (
                <div key={index} className="bg-gray-100 px-3 py-2 rounded-md text-sm dark:bg-gray-700 dark:text-gray-300">
                  {feature}
                </div>
              ))}
              
              {(!car.features || car.features.length === 0) && (
                <div className="col-span-full text-gray-500 dark:text-gray-400">
                  Bu araç için belirtilmiş özellik bulunmamaktadır.
                </div>
              )}
            </div>
          </div>

          {/* Fiyat Bilgisi */}
          <div className="mt-8 bg-amber-50 p-4 rounded-lg dark:bg-amber-900/20">
            <h3 className="text-lg font-medium mb-2 text-amber-800 dark:text-amber-400">Fiyat Bilgisi</h3>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              {typeof car.price === 'number' 
                ? `${car.price.toLocaleString('tr-TR')} ₺` 
                : car.price}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-400">Günlük fiyat</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal; 
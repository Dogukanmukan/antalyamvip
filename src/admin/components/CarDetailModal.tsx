import React, { useState } from 'react';
import { X, Car, Users, Briefcase, Tag, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface CarDetailModalProps {
  car: any; // Daha sonra Car tipini tanımlayabiliriz
  isOpen: boolean;
  onClose: () => void;
}

const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, isOpen, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Araç durumuna göre renk belirle
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  // Araç durumuna göre metin belirle
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Bakımda';
      case 'inactive':
        return 'Pasif';
      default:
        return 'Bilinmiyor';
    }
  };
  
  // Görselleri hazırla
  const getImages = () => {
    if (Array.isArray(car.images) && car.images.length > 0) {
      return car.images;
    }
    return ['/images/car-placeholder.jpg'];
  };
  
  const images = getImages();
  
  if (!isOpen || !car) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden dark:bg-gray-800">
        {/* Modal Başlık */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{car.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Modal İçerik */}
        <div className="overflow-y-auto p-4 max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Görsel Galerisi */}
            <div className="space-y-4">
              {/* Ana Görsel */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden dark:bg-gray-700">
                <img
                  src={images[activeImageIndex]}
                  alt={`${car.name} - ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/car-placeholder.jpg';
                  }}
                />
              </div>
              
              {/* Küçük Görseller */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                        index === activeImageIndex
                          ? 'border-amber-500 dark:border-amber-400'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${car.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/car-placeholder.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Araç Bilgileri */}
            <div className="space-y-4">
              {/* Temel Bilgiler */}
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="text-lg font-medium mb-3 dark:text-white">Araç Bilgileri</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Marka</p>
                    <p className="font-medium dark:text-white">{car.make}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                    <p className="font-medium dark:text-white">{car.model}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kategori</p>
                    <p className="font-medium dark:text-white">{car.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Durum</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
                      {getStatusText(car.status)}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yolcu Kapasitesi</p>
                    <p className="font-medium dark:text-white">{car.seats || car.passengers}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bagaj Kapasitesi</p>
                    <p className="font-medium dark:text-white">{car.luggage}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Günlük Fiyat</p>
                    <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                      {car.price_per_day || car.price}₺ <span className="text-sm text-gray-500 dark:text-gray-400">/gün</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Açıklama */}
              {car.description && (
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <h3 className="text-lg font-medium mb-2 dark:text-white">Açıklama</h3>
                  <p className="text-gray-700 dark:text-gray-300">{car.description}</p>
                </div>
              )}
              
              {/* Özellikler */}
              {Array.isArray(car.features) && car.features.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <h3 className="text-lg font-medium mb-3 dark:text-white">Özellikler</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {car.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Modal Alt Kısmı */}
        <div className="p-4 border-t border-gray-200 flex justify-end dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal; 
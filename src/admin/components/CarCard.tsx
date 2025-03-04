import React from 'react';
import { Edit, Trash2, Eye, Users, Briefcase } from 'lucide-react';

interface CarCardProps {
  car: any; // Daha sonra Car tipini tanımlayabiliriz
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (car: any) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onEdit, onDelete, onView }) => {
  // Debug: Araç verilerini konsola yazdır
  console.log('CarCard - car data:', {
    id: car.id,
    name: car.name,
    image: car.image,
    images: car.images,
    imagesType: car.images ? typeof car.images : 'undefined',
    imagesIsArray: car.images ? Array.isArray(car.images) : false
  });

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
  
  // Görsel URL'sini kontrol et
  const getImageUrl = () => {
    // images dizisi varsa ve içinde en az bir öğe varsa ilk öğeyi kullan
    if (Array.isArray(car.images) && car.images.length > 0) {
      return car.images[0];
    }
    
    // Varsayılan görsel
    return '/images/car-placeholder.jpg';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
      {/* Araç Görseli */}
      <div className="relative aspect-w-16 aspect-h-9">
        <img
          src={getImageUrl()}
          alt={car.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/car-placeholder.jpg';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
            {getStatusText(car.status)}
          </span>
        </div>
      </div>
      
      {/* Araç Bilgileri */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{car.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{car.make} {car.model}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{car.seats || car.passengers}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{car.luggage}</span>
            </div>
          </div>
          <div className="text-amber-600 font-semibold dark:text-amber-400">
            {car.price_per_day || car.price}₺<span className="text-xs text-gray-500 dark:text-gray-400">/gün</span>
          </div>
        </div>
        
        {/* İşlem Butonları */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => onView(car)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Görüntüle
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(car.id)}
              className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Düzenle
            </button>
            <button
              onClick={() => onDelete(car.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard; 
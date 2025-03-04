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

  // Araç durumuna göre renk ve metin belirleme
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Bakımda';
      case 'inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
      {/* Araç Görseli */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {car.image ? (
          <img
            src={car.image}
            alt={car.name}
            className="h-full w-full object-cover"
          />
        ) : car.images && Array.isArray(car.images) && car.images.length > 0 ? (
          <img
            src={car.images[0]}
            alt={car.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-lg">Görsel Yok</div>
          </div>
        )}
        
        {/* Durum etiketi */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(car.status)}`}>
          {getStatusText(car.status)}
        </div>
      </div>
      
      {/* Araç Bilgileri */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">{car.name}</h3>
        
        <div className="text-sm text-gray-500 mb-3 dark:text-gray-400">{car.category}</div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{car.passengerCapacity}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Briefcase className="h-4 w-4 mr-1" />
            <span className="text-sm">{car.luggageCapacity}</span>
          </div>
          
          <div className="font-semibold text-amber-600 dark:text-amber-500">
            {typeof car.price === 'number' 
              ? `${car.price.toLocaleString('tr-TR')} ₺` 
              : car.price}
          </div>
        </div>
        
        {/* Aksiyonlar */}
        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onView(car)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title="Görüntüle"
          >
            <Eye className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onEdit(car.id)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Düzenle"
          >
            <Edit className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDelete(car.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Sil"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard; 
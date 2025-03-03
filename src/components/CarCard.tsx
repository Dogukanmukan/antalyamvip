import React, { useState } from 'react';
import { Calendar, Clock, Fuel, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Car } from '../types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ImageModal from './ImageModal';

interface CarCardProps {
  car: Car;
}

// JSON string'i güvenli bir şekilde parse etmek için yardımcı fonksiyon
const safeJsonParse = (jsonString: string | any, defaultValue: any[] = []): any[] => {
  if (Array.isArray(jsonString)) return jsonString;
  if (!jsonString) return defaultValue;
  
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    }
    return defaultValue;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
};

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Güvenli erişim için yardımcı fonksiyonlar
  const safeImages = car && car.images ? safeJsonParse(car.images, []) : [];
  const safeImageUrl = safeImages.length > 0 ? 
    safeImages[currentImageIndex] : 
    (car && car.image ? car.image : '/images/placeholder.jpg');
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % safeImages.length);
    }
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (safeImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    }
  };
  
  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (safeImages.length > 0) {
      setIsModalOpen(true);
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
        <div className="relative">
          <img 
            src={safeImageUrl} 
            alt={car.name || 'Car'} 
            className="w-full h-56 object-cover cursor-pointer"
            onClick={openModal}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
            }}
          />
          
          {safeImages.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1} / {safeImages.length}
              </div>
            </>
          )}
          
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            {car.category || 'Standard'}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{car.name || 'Unnamed Car'}</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-2 text-amber-500" />
              <span className="text-sm">{car.year || '-'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Fuel size={16} className="mr-2 text-amber-500" />
              <span className="text-sm">{car.fuel_type || '-'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users size={16} className="mr-2 text-amber-500" />
              <span className="text-sm">{car.seats || '-'} {t('common.seats')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-2 text-amber-500" />
              <span className="text-sm">{t('common.24hours')}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                {car.price_per_day !== undefined && (
                  <div className="text-amber-500 font-bold">
                    {car.price_per_day} ₺ <span className="text-gray-500 text-sm font-normal">/ {t('common.day')}</span>
                  </div>
                )}
              </div>
              <Link 
                to="/#booking" 
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm transition duration-300"
              >
                {t('common.bookNow')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && safeImages.length > 0 && (
        <ImageModal 
          images={safeImages} 
          currentIndex={currentImageIndex}
          onClose={() => setIsModalOpen(false)}
          onPrev={() => setCurrentImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)}
          onNext={() => setCurrentImageIndex((prev) => (prev + 1) % safeImages.length)}
          isOpen={isModalOpen}
        />
      )}
    </>
  );
};

export default CarCard;
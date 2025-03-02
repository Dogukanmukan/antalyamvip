import React, { useState } from 'react';
import { Calendar, Clock, Fuel, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Car } from '../types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ImageModal from './ImageModal';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
  };
  
  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition duration-300">
        <div className="relative">
          <img 
            src={car.images[currentImageIndex]} 
            alt={car.name} 
            className="w-full h-56 object-cover cursor-pointer"
            onClick={openModal}
          />
          
          {car.images.length > 1 && (
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
              
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {car.images.map((_, index) => (
                  <span 
                    key={index} 
                    className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {car.category === 'Luxury' ? t('fleet.categories.luxury') :
             car.category === 'VIP' ? t('fleet.categories.vip') :
             car.category === 'Ultra Luxury' ? t('fleet.categories.ultraLuxury') : car.category}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{car.name}</h3>
          
          <div className="flex items-center text-gray-500 mb-4">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{car.year}</span>
            <span className="mx-2">•</span>
            <Fuel size={16} className="mr-1" />
            <span className="text-sm">{car.fuelType}</span>
            <span className="mx-2">•</span>
            <Users size={16} className="mr-1" />
            <span className="text-sm">{car.seats} {t('fleet.seats')}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {car.features.map((feature, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                {t(`carFeatures.${feature.toLowerCase().replace(/\s+/g, '')}`)}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <Link to="/#booking" className="w-full flex items-center justify-center bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md transition duration-300">
              <Calendar className="mr-2" size={18} />
              {t('general.bookNow')}
            </Link>
          </div>
        </div>
      </div>
      
      <ImageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={car.images}
        currentIndex={currentImageIndex}
        onPrev={() => setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)}
        onNext={() => setCurrentImageIndex((prev) => (prev + 1) % car.images.length)}
      />
    </>
  );
};

export default CarCard;
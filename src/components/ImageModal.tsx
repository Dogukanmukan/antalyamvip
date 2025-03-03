import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const [currentIndexState, setCurrentIndex] = useState(currentIndex);
  
  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Scroll'u kapat
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto'; // Scroll'u geri aç
    };
  }, [onClose, onPrev, onNext]);
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <div className="relative h-full">
          <img 
            src={images[currentIndexState]} 
            alt="Gallery image" 
            className="w-full h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
              >
                <ChevronRight size={24} />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      currentIndexState === index ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
              
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded">
                {currentIndexState + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

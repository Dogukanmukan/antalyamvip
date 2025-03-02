import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrev,
  onNext
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Disable body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, onPrev, onNext]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ChevronRight size={24} />
        </button>
        
        <div className="max-w-7xl max-h-full flex items-center justify-center">
          <img 
            src={images[currentIndex]} 
            alt="Enlarged view" 
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <span 
              key={index} 
              className={`w-3 h-3 rounded-full cursor-pointer ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
              onClick={(e) => {
                e.stopPropagation();
                // Update current index directly
                const newIndex = index;
                if (newIndex !== currentIndex) {
                  // Call a function that would update the parent's state
                  const goToIndex = () => {
                    // This is a simple implementation that just calls onNext or onPrev
                    // multiple times to reach the desired index
                    let tempIndex = currentIndex;
                    while (tempIndex !== newIndex) {
                      if (tempIndex < newIndex) {
                        onNext();
                        tempIndex = (tempIndex + 1) % images.length;
                      } else {
                        onPrev();
                        tempIndex = (tempIndex - 1 + images.length) % images.length;
                      }
                    }
                  };
                  goToIndex();
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

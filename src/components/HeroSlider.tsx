import React, { useState, useEffect } from 'react';

interface SlideImage {
  src: string;
  alt: string;
}

interface HeroSliderProps {
  images: SlideImage[];
  interval?: number;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ images, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50 z-10"></div>
      
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}
      
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 mx-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-amber-500 scale-110' : 'bg-white/60 hover:bg-white/80'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Sayfa değiştiğinde en üste scroll yap
    if (!hash) {
      window.scrollTo(0, 0);
    }
    // Eğer hash varsa (örneğin #booking), o elemente scroll yap
    else {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

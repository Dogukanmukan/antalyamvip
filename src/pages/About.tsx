import { useState, useEffect, useRef } from 'react';
import { Award, Check, Star, Users, ThumbsUp, Repeat, Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Sayaç animasyonu için state'ler
  const [clientCount, setClientCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [retentionCount, setRetentionCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  
  // Görünürlük kontrolü için
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);
  
  // Sayaç animasyonları
  useEffect(() => {
    if (isVisible) {
      // Memnun müşteri sayacı
      const clientTarget = 2500;
      const clientDuration = 2000; // 2 saniye
      const clientInterval = 20; // Her 20ms'de bir artış
      const clientStep = Math.ceil(clientTarget / (clientDuration / clientInterval));
      
      const clientTimer = setInterval(() => {
        setClientCount(prev => {
          const next = prev + clientStep;
          if (next >= clientTarget) {
            clearInterval(clientTimer);
            return clientTarget;
          }
          return next;
        });
      }, clientInterval);
      
      // Başarılı seyahat sayacı
      const tripTarget = 10000;
      const tripDuration = 2000;
      const tripInterval = 20;
      const tripStep = Math.ceil(tripTarget / (tripDuration / tripInterval));
      
      const tripTimer = setInterval(() => {
        setTripCount(prev => {
          const next = prev + tripStep;
          if (next >= tripTarget) {
            clearInterval(tripTimer);
            return tripTarget;
          }
          return next;
        });
      }, tripInterval);
      
      // Müşteri sadakati sayacı
      const retentionTarget = 100;
      const retentionDuration = 2000;
      const retentionInterval = 20;
      const retentionStep = Math.ceil(retentionTarget / (retentionDuration / retentionInterval));
      
      const retentionTimer = setInterval(() => {
        setRetentionCount(prev => {
          const next = prev + retentionStep;
          if (next >= retentionTarget) {
            clearInterval(retentionTimer);
            return retentionTarget;
          }
          return next;
        });
      }, retentionInterval);
      
      // Müşteri değerlendirmesi sayacı
      const ratingTarget = 5;
      const ratingInterval = 50;
      
      const ratingTimer = setInterval(() => {
        setRatingCount(prev => {
          const next = parseFloat((prev + 0.1).toFixed(1));
          if (next >= ratingTarget) {
            clearInterval(ratingTimer);
            return ratingTarget;
          }
          return next;
        });
      }, ratingInterval);
      
      return () => {
        clearInterval(clientTimer);
        clearInterval(tripTimer);
        clearInterval(retentionTimer);
        clearInterval(ratingTimer);
      };
    }
  }, [isVisible]);
  
  // Sayfa yüklendiğinde animasyonu başlat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, []);
  
  return (
    <div>
      <PageHeader 
        title={t('about.title')} 
        description={t('about.subtitle')}
        backgroundImage="/images/showrombg.jpg"
      />

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('about.ourStory.title')}</h2>
              <p className="text-gray-600 mb-4">
                {t('about.ourStory.description')}
              </p>
              <p className="text-gray-600">
                {t('about.today.description')}
              </p>
            </div>
            <div className="relative">
              <img 
                src="/images/showroom.jpg" 
                alt={t('about.showroom')} 
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-amber-500 text-white p-4 rounded-lg shadow-lg">
                <p className="text-xl font-bold">15+</p>
                <p className="text-sm">{t('about.yearsOfExcellence')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Award className="text-amber-500" size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h2>
              <p className="text-gray-600">
                {t('about.mission.description')}
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Star className="text-amber-500" size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t('about.vision.title')}</h2>
              <p className="text-gray-600">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Success in Numbers */}
      <section ref={statsRef} className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.stats.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('about.stats.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '0ms' }}>
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ThumbsUp className="text-amber-500" size={28} />
              </div>
              <p className="text-3xl font-bold text-amber-500 mb-2">{clientCount}+</p>
              <p className="text-gray-600 font-medium">{t('about.stats.satisfiedClients.label')}</p>
            </div>

            <div className={`bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '150ms' }}>
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Repeat className="text-amber-500" size={28} />
              </div>
              <p className="text-3xl font-bold text-amber-500 mb-2">{tripCount}+</p>
              <p className="text-gray-600 font-medium">{t('about.stats.successfulTrips.label')}</p>
            </div>

            <div className={`bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Heart className="text-amber-500" size={28} />
              </div>
              <p className="text-3xl font-bold text-amber-500 mb-2">{retentionCount}%</p>
              <p className="text-gray-600 font-medium">{t('about.stats.clientRetention.label')}</p>
            </div>

            <div className={`bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '450ms' }}>
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Star className="text-amber-500" size={28} />
              </div>
              <p className="text-3xl font-bold text-amber-500 mb-2">{ratingCount}/5</p>
              <p className="text-gray-600 font-medium">{t('about.stats.customerRating.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('about.values.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('about.values.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Star className="text-amber-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.excellence.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.values.excellence.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.excellence.point1')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.excellence.point2')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.excellence.point3')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="text-amber-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.personalization.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.values.personalization.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.personalization.point1')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.personalization.point2')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.personalization.point3')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Award className="text-amber-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.integrity.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.values.integrity.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.integrity.point1')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.integrity.point2')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-600">{t('about.values.integrity.point3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
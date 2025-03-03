import { useState, useEffect } from 'react';
import { Car, ChevronRight, Crown, MapPin, Phone, Shield, Star, Users } from 'lucide-react';
import CarCard from '../components/CarCard';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BookingForm from '../components/BookingForm';
import HeroSlider from '../components/HeroSlider';
import { Car as CarType } from '../types';

function Home() {
  const { t } = useTranslation();
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Veritabanından araçları çek
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cars');
        
        if (!response.ok) {
          throw new Error('Araçlar yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        // İlk 3 aracı öne çıkan araçlar olarak göster
        setFeaturedCars(data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Araçlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, []);
  
  const heroImages = [
    {
      src: "/images/cars/banner/AYT3.jpg",
      alt: "Professional Driver Service"
    },
    {
      src: "/images/cars/banner/ada-vip-7.jpg",
      alt: "Luxury Vehicle Interior"
    },
    {
      src: "/images/cars/banner/hizmet3.jpg",
      alt: "Premium Vehicle"
    },
    {
      src: "/images/cars/banner/61220200581775.jpg",
      alt: "Luxury Transportation"
    }
  ];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Booking Form */}
      <section className="relative">
        {/* Hero Background */}
        <div className="relative h-[60vh] bg-black">
          <HeroSlider images={heroImages} interval={6000} />
          <div className="absolute inset-0 z-20 container mx-auto px-4 flex items-center">
            <div className="max-w-2xl">
              <div className="flex items-center mb-3">
                <Crown className="text-amber-400 mr-2" size={20} />
                <span className="text-amber-400 font-semibold text-sm md:text-base">{t('home.hero.premium')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{t('home.hero.title')}</h1>
              <p className="text-lg text-gray-200 mb-6">{t('home.hero.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/fleet" className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-6 rounded-md transition duration-300 text-center text-sm md:text-base">
                  {t('home.cta.viewFleet')}
                </Link>
                <Link to="/contact" className="bg-transparent hover:bg-white/10 text-white border border-white font-medium py-2.5 px-6 rounded-md transition duration-300 text-center text-sm md:text-base">
                  {t('home.cta.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Form Overlay */}
        <div className="container mx-auto px-4 relative z-30">
          <div className="max-w-5xl mx-auto -mt-24 mb-16">
            <div id="booking" className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('booking.title')}</h2>
                <p className="text-gray-600 mb-6">{t('booking.subtitle')}</p>
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.featuredCars.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('home.featuredCars.subtitle')}</p>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/fleet" className="inline-flex items-center text-amber-500 font-semibold hover:text-amber-600 transition">
              {t('general.viewAll')}
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.services.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('home.services.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.services.chauffeur.title')}</h3>
              <p className="text-gray-600 mb-4">{t('home.services.chauffeur.description')}</p>
              <Link to="/services" className="text-amber-500 font-semibold hover:text-amber-600 inline-flex items-center transition">
                {t('general.learnMore')} <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Service 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.services.airport.title')}</h3>
              <p className="text-gray-600 mb-4">{t('home.services.airport.description')}</p>
              <Link to="/services" className="text-amber-500 font-semibold hover:text-amber-600 inline-flex items-center transition">
                {t('general.learnMore')} <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Service 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Star className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.services.events.title')}</h3>
              <p className="text-gray-600 mb-4">{t('home.services.events.description')}</p>
              <Link to="/services" className="text-amber-500 font-semibold hover:text-amber-600 inline-flex items-center transition">
                {t('general.learnMore')} <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Service 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.services.corporate.title')}</h3>
              <p className="text-gray-600 mb-4">{t('home.services.corporate.description')}</p>
              <Link to="/services" className="text-amber-500 font-semibold hover:text-amber-600 inline-flex items-center transition">
                {t('general.learnMore')} <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.whyChooseUs.title')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('home.whyChooseUs.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Reason 1 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <Car className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.whyChooseUs.reasons.luxury.title')}</h3>
              <p className="text-gray-400">{t('home.whyChooseUs.reasons.luxury.description')}</p>
            </div>
            
            {/* Reason 2 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <Star className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.whyChooseUs.reasons.service.title')}</h3>
              <p className="text-gray-400">{t('home.whyChooseUs.reasons.service.description')}</p>
            </div>
            
            {/* Reason 3 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.whyChooseUs.reasons.convenience.title')}</h3>
              <p className="text-gray-400">{t('home.whyChooseUs.reasons.convenience.description')}</p>
            </div>
            
            {/* Reason 4 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('home.whyChooseUs.reasons.safety.title')}</h3>
              <p className="text-gray-400">{t('home.whyChooseUs.reasons.safety.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.hero.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          <Link to="/contact" className="bg-white text-amber-500 hover:bg-gray-100 font-bold py-3 px-8 rounded-md transition duration-300 inline-block">
            {t('general.contactUs')}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
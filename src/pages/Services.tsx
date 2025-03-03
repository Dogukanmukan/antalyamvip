import { Award, Calendar, Car, Clock, Gift, Globe, MapPin, Phone, Shield, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  
  const services = [
    {
      icon: <Car className="text-amber-500" size={36} />,
      title: t('services.luxuryCar.title'),
      description: t('services.luxuryCar.description')
    },
    {
      icon: <Users className="text-amber-500" size={36} />,
      title: t('services.chauffeur.title'),
      description: t('services.chauffeur.description')
    },
    {
      icon: <MapPin className="text-amber-500" size={36} />,
      title: t('services.doorstep.title'),
      description: t('services.doorstep.description')
    },
    {
      icon: <Globe className="text-amber-500" size={36} />,
      title: t('services.airport.title'),
      description: t('services.airport.description')
    },
    {
      icon: <Calendar className="text-amber-500" size={36} />,
      title: t('services.wedding.title'),
      description: t('services.wedding.description')
    },
    {
      icon: <Award className="text-amber-500" size={36} />,
      title: t('services.corporate.title'),
      description: t('services.corporate.description')
    },
    {
      icon: <Clock className="text-amber-500" size={36} />,
      title: t('services.longTerm.title'),
      description: t('services.longTerm.description')
    },
    {
      icon: <Shield className="text-amber-500" size={36} />,
      title: t('services.insurance.title'),
      description: t('services.insurance.description')
    },
    {
      icon: <Gift className="text-amber-500" size={36} />,
      title: t('services.vip.title'),
      description: t('services.vip.description')
    }
  ];

  return (
    <div>
      <PageHeader 
        title={t('services.title')} 
        description={t('services.subtitle')}
        backgroundImage="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
      />

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                <div className="mb-6">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('services.process.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('services.process.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-white text-xl font-bold">1</span>
                <div className="hidden md:block absolute top-1/2 left-full h-1 bg-amber-300 w-full transform -translate-y-1/2"></div>
              </div>
              <h3 className="text-lg font-bold mb-3">{t('services.process.step1.title')}</h3>
              <p className="text-gray-600">{t('services.process.step1.description')}</p>
            </div>

            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-white text-xl font-bold">2</span>
                <div className="hidden md:block absolute top-1/2 left-full h-1 bg-amber-300 w-full transform -translate-y-1/2"></div>
              </div>
              <h3 className="text-lg font-bold mb-3">{t('services.process.step2.title')}</h3>
              <p className="text-gray-600">{t('services.process.step2.description')}</p>
            </div>

            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-white text-xl font-bold">3</span>
                <div className="hidden md:block absolute top-1/2 left-full h-1 bg-amber-300 w-full transform -translate-y-1/2"></div>
              </div>
              <h3 className="text-lg font-bold mb-3">{t('services.process.step3.title')}</h3>
              <p className="text-gray-600">{t('services.process.step3.description')}</p>
            </div>

            <div className="text-center">
              <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold mb-3">{t('services.process.step4.title')}</h3>
              <p className="text-gray-600">{t('services.process.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('services.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">{t('services.cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/fleet" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-md transition duration-300 inline-flex items-center justify-center">
              <Car className="mr-2" size={20} />
              {t('services.cta.viewFleet')}
            </a>
            <a href="/contact" className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-md transition duration-300 inline-flex items-center justify-center">
              <Phone className="mr-2" size={20} />
              {t('services.cta.contactUs')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
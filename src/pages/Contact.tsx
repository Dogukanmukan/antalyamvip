import React, { useState } from 'react';
import { Calendar, Mail, MapPin, Phone, Send, User } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle form submission here
    alert(t('contact.form.success'));
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div>
      <PageHeader 
        title={t('contact.title')} 
        description={t('contact.subtitle')}
        backgroundImage="/images/cars/banner/banner2.png"
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">{t('contact.info.title')}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <Phone className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.info.phone')}</h3>
                      <p className="text-gray-600">
                        <a href="tel:05321134125" className="hover:text-amber-500 transition">+90 532 113 41 25</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <Mail className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.info.email')}</h3>
                      <p className="text-gray-600">
                        <a href="mailto:info@antalyamvip.com" className="hover:text-amber-500 transition">info@antalyamvip.com</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <MapPin className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.info.address')}</h3>
                      <p className="text-gray-600">
                        Antalya, Turkey
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <Calendar className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.info.hours')}</h3>
                      <p className="text-gray-600">
                        {t('contact.info.workDays')}<br />
                        {t('contact.info.weekends')}<br />
                        <span className="text-sm font-medium text-amber-500">{t('contact.info.support')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 text-white p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t('contact.info.immediate')}</h3>
                <p className="mb-6">{t('contact.info.immediateText')}</p>
                <a href="tel:05321134125" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-md transition duration-300 inline-flex items-center">
                  <Phone className="mr-2" size={18} />
                  {t('contact.info.call')}
                </a>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">{t('contact.form.title')}</h2>
              
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={t('contact.form.namePlaceholder')}
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.email')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={t('contact.form.emailPlaceholder')}
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.phone')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={t('contact.form.phonePlaceholder')}
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.startDate')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.endDate')}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    {t('contact.form.message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={t('contact.form.messagePlaceholder')}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-md transition duration-300 inline-flex items-center"
                >
                  <Send className="mr-2" size={18} />
                  {t('contact.form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('contact.map.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('contact.map.subtitle')}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102151.55491580851!2d30.65710183546875!3d36.897809500000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c39aaeddadadc1%3A0x95c69f73f9e32e33!2sAntalya%2C%20Turkey!5e0!3m2!1sen!2sus!4v1645784449363!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Antalya Map"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
import React, { useState } from 'react';
import { Calendar, Car, Clock, Mail, MapPin, Phone, Send, User } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { cars } from '../data/cars';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    carModel: '',
    startDate: '',
    endDate: '',
    message: ''
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
      carModel: '',
      startDate: '',
      endDate: '',
      message: ''
    });
  };

  return (
    <div>
      <PageHeader 
        title={t('contact.title')} 
        description={t('contact.subtitle')}
        backgroundImage="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">{t('contact.info.title')}</h2>
              
              <div className="bg-gray-50 p-8 rounded-lg mb-8">
                <div className="flex items-start mb-6">
                  <MapPin className="text-amber-500 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold mb-1">{t('contact.info.location')}</h3>
                    <p className="text-gray-600">
                      {t('contact.info.address.line1')}<br />
                      {t('contact.info.address.line2')}<br />
                      {t('contact.info.address.line3')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <Phone className="text-amber-500 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold mb-1">{t('general.phone')}</h3>
                    <p className="text-gray-600">
                      <a href="tel:05321134125" className="hover:text-amber-500 transition">{t('contact.info.phone')}</a><br />
                      <span className="text-sm">{t('contact.info.phoneSupport')}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <Phone className="text-amber-500 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold mb-1">{t('contact.info.fax')}</h3>
                    <p className="text-gray-600">
                      <span className="hover:text-amber-500 transition">0532 113 4125</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <Mail className="text-amber-500 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold mb-1">{t('general.email')}</h3>
                    <p className="text-gray-600">
                      <a href="mailto:info@alanyamviptransfer.com" className="hover:text-amber-500 transition">info@alanyamviptransfer.com</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-amber-500 mr-4 mt-1" size={24} />
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.phone')}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={t('contact.form.phonePlaceholder')}
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="carModel" className="block text-gray-700 font-medium mb-2">
                      {t('contact.form.carModel')}
                    </label>
                    <div className="relative">
                      <select
                        id="carModel"
                        name="carModel"
                        value={formData.carModel}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                      >
                        <option value="">{t('contact.form.selectCar')}</option>
                        {cars.map(car => (
                          <option key={car.id} value={car.name}>{car.name}</option>
                        ))}
                      </select>
                      <Car className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
                  className="flex items-center justify-center bg-amber-500 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-600 transition w-full md:w-auto"
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
            <p className="text-gray-600 max-w-2xl mx-auto">{t('contact.map.description')}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6505940532517!2d29.058618776042963!3d40.97146012035047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab8679bfb3d31%3A0x7d75715e081dfa5c!2zQmHEn2RhdCBDYWRkZXNpLCBLYWTEsWvDtnkvxLBzdGFuYnVs!5e0!3m2!1sen!2str!4v1653394696045!5m2!1sen!2str" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="VIPCars Location"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
import React, { useState } from 'react';
import { Car, Menu, Phone, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Dil değiştirme fonksiyonu
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Car className="text-amber-500" size={32} />
            <span className="ml-2 text-2xl font-bold">AntalyamVip</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition ${isActive('/') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
            >
              {t('navbar.home')}
            </Link>
            <Link 
              to="/fleet" 
              className={`font-medium transition ${isActive('/fleet') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
            >
              {t('navbar.fleet')}
            </Link>
            <Link 
              to="/services" 
              className={`font-medium transition ${isActive('/services') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
            >
              {t('navbar.services')}
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition ${isActive('/about') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
            >
              {t('navbar.about')}
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition ${isActive('/contact') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
            >
              {t('navbar.contact')}
            </Link>
            
            {/* Dil Seçimi */}
            <div className="flex space-x-2 ml-4">
              <button 
                onClick={() => changeLanguage('en')} 
                className={`px-2 py-1 rounded flex items-center ${i18n.language === 'en' ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
                title="English"
              >
                <img src="/images/flags/en.svg" alt="English" className="w-5 h-auto mr-1" />
                <span>EN</span>
              </button>
              <button 
                onClick={() => changeLanguage('tr')} 
                className={`px-2 py-1 rounded flex items-center ${i18n.language === 'tr' ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
                title="Türkçe"
              >
                <img src="/images/flags/tr.svg" alt="Türkçe" className="w-5 h-auto mr-1" />
                <span>TR</span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-amber-500 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`font-medium transition ${isActive('/') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.home')}
              </Link>
              <Link 
                to="/fleet" 
                className={`font-medium transition ${isActive('/fleet') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.fleet')}
              </Link>
              <Link 
                to="/services" 
                className={`font-medium transition ${isActive('/services') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.services')}
              </Link>
              <Link 
                to="/about" 
                className={`font-medium transition ${isActive('/about') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.about')}
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium transition ${isActive('/contact') ? 'text-amber-500' : 'text-gray-800 hover:text-amber-500'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.contact')}
              </Link>
              
              {/* Dil Seçimi - Mobil */}
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => {
                    changeLanguage('en');
                    setIsMenuOpen(false);
                  }} 
                  className={`px-2 py-1 rounded flex items-center ${i18n.language === 'en' ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
                  title="English"
                >
                  <img src="/images/flags/en.svg" alt="English" className="w-5 h-auto mr-1" />
                  <span>EN</span>
                </button>
                <button 
                  onClick={() => {
                    changeLanguage('tr');
                    setIsMenuOpen(false);
                  }} 
                  className={`px-2 py-1 rounded flex items-center ${i18n.language === 'tr' ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
                  title="Türkçe"
                >
                  <img src="/images/flags/tr.svg" alt="Türkçe" className="w-5 h-auto mr-1" />
                  <span>TR</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
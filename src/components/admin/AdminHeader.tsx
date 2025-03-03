import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Kullanıcı bilgisini al
  const userString = localStorage.getItem('adminUser');
  const user = userString ? JSON.parse(userString) : { username: 'Admin' };
  
  // Çıkış yap
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobil menü butonu */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menüyü Aç</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            <h1 className="ml-3 text-xl font-semibold text-gray-800">{title}</h1>
          </div>
          
          <div className="flex items-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700 mr-4" target="_blank">
              <span className="hidden sm:inline">Siteyi Görüntüle</span>
              <span className="sm:hidden">Site</span>
            </Link>
            
            <div className="relative">
              <button
                type="button"
                className="flex items-center focus:outline-none"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Kullanıcı menüsünü aç</span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 text-gray-700 hidden sm:block">{user.username}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobil menü */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/admin/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/bookings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rezervasyonlar
            </Link>
            <Link
              to="/admin/cars"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Araçlar
            </Link>
            <Link
              to="/admin/settings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ayarlar
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;

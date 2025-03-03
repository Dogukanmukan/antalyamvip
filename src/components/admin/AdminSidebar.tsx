import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Aktif menü öğesini kontrol et
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Çıkış yap
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };
  
  return (
    <div className="bg-gray-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Alanyam VIP</h1>
        <p className="text-gray-400 text-sm">Admin Paneli</p>
      </div>
      
      <nav className="mt-6">
        <Link
          to="/admin/dashboard"
          className={`flex items-center px-6 py-3 hover:bg-gray-700 ${
            isActive('/admin/dashboard') ? 'bg-gray-700' : ''
          }`}
        >
          <span className="mr-3">📊</span>
          <span>Kontrol Paneli</span>
        </Link>
        
        <Link
          to="/admin/bookings"
          className={`flex items-center px-6 py-3 hover:bg-gray-700 ${
            isActive('/admin/bookings') ? 'bg-gray-700' : ''
          }`}
        >
          <span className="mr-3">📅</span>
          <span>Rezervasyonlar</span>
        </Link>
        
        <Link
          to="/admin/cars"
          className={`flex items-center px-6 py-3 hover:bg-gray-700 ${
            isActive('/admin/cars') ? 'bg-gray-700' : ''
          }`}
        >
          <span className="mr-3">🚗</span>
          <span>Araçlar</span>
        </Link>
        
        <Link
          to="/admin/settings"
          className={`flex items-center px-6 py-3 hover:bg-gray-700 ${
            isActive('/admin/settings') ? 'bg-gray-700' : ''
          }`}
        >
          <span className="mr-3">⚙️</span>
          <span>Ayarlar</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 hover:bg-gray-700 w-full text-left mt-auto"
        >
          <span className="mr-3">🚪</span>
          <span>Çıkış Yap</span>
        </button>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">admin@alanyamvip.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

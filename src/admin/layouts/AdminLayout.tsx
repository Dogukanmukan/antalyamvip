import React, { useState, ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Calendar, Car, Settings, LogOut, 
  ChevronDown, Bell, Search, User, Moon, Sun
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <header className={`fixed w-full z-30 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left side - Logo and menu toggle */}
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md lg:hidden focus:outline-none"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="ml-4 lg:ml-0 flex items-center">
              <span className="text-xl font-bold text-amber-600">Alanyam</span>
              <span className="text-xl font-bold ml-1">VIP</span>
            </div>
          </div>
          
          {/* Center - Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
            <div className={`relative w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Ara..."
                className={`block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          {/* Right side - User menu, notifications, theme toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg py-2 z-50`}>
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold">Bildirimler</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <p className="text-sm font-medium">Yeni rezervasyon alındı</p>
                      <p className="text-xs text-gray-500">2 dakika önce</p>
                    </div>
                    <div className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <p className="text-sm font-medium">Araç bakım hatırlatması</p>
                      <p className="text-xs text-gray-500">1 saat önce</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <a href="#" className="text-sm text-amber-600 hover:text-amber-800">Tüm bildirimleri gör</a>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="hidden md:block text-sm font-medium">Admin</span>
                <ChevronDown size={16} />
              </button>
              
              {/* User Dropdown */}
              {userMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg py-2 z-50`}>
                  <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>Profil</a>
                  <a href="#" className={`block px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>Ayarlar</a>
                  <button 
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <div className="flex flex-1 pt-16">
        <aside 
          className={`fixed inset-y-0 left-0 z-20 w-64 mt-16 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <nav className="flex flex-col h-full py-4">
            <div className="space-y-1 px-3">
              <Link
                to="/admin/dashboard"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/dashboard') 
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link
                to="/admin/bookings"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/bookings') 
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Rezervasyonlar
              </Link>
              
              <Link
                to="/admin/cars"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/cars') 
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Car className="mr-3 h-5 w-5" />
                Araçlar
              </Link>
              
              <Link
                to="/admin/settings"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/settings') 
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Ayarlar
              </Link>
            </div>
            
            <div className="mt-auto px-3">
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LogOut size={20} className="mr-3" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className={`flex-1 lg:ml-64 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
              onClick={toggleSidebar}
            ></div>
          )}
          
          {/* Page Content */}
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 
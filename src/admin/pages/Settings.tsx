import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Moon, Bell, Shield, Save, AlertCircle } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';

// Ayarlar arayüzü
interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
  };
  appearance: {
    darkMode: boolean;
    primaryColor: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newBookingNotification: boolean;
    bookingStatusChangeNotification: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
}

// Tab bileşeni
interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (id: string) => void;
}

const Tab: React.FC<TabProps> = ({ id, label, icon, active, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
        active 
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
};

// Ana Settings bileşeni
const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      contactPhone: ''
    },
    appearance: {
      darkMode: false,
      primaryColor: '#f59e0b',
      language: 'tr'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      newBookingNotification: true,
      bookingStatusChangeNotification: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // API'den ayarları yükle
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // API çağrısı
        const response = await axios.get('/api/settings');
        setSettings(response.data);
      } catch (err) {
        console.error('Ayarları yüklerken hata:', err);
        setError('Ayarlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        
        // Geçici olarak, API entegrasyonu tamamlanana kadar örnek veriler
        setSettings({
          general: {
            siteName: 'Alanyam VIP',
            siteDescription: 'Premium Mercedes Vito VIP Taşımacılık',
            contactEmail: 'info@alanyamvip.com',
            contactPhone: '+90 555 123 4567'
          },
          appearance: {
            darkMode: false,
            primaryColor: '#f59e0b',
            language: 'tr'
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            newBookingNotification: true,
            bookingStatusChangeNotification: true
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Ayarları kaydet
  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    setError(null);
    
    try {
      // API çağrısı
      await axios.put('/api/settings', settings);
      setSuccessMessage('Ayarlar başarıyla kaydedildi.');
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Ayarları kaydederken hata:', err);
      setError('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Input değişikliklerini işle
  const handleChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [field]: value
      }
    }));
  };
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Ayarlar</h1>
        <p className="text-gray-500 dark:text-gray-400">Sistem ayarlarını yapılandırın.</p>
      </div>
      
      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Başarı Mesajı */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Save className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sekmeler */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 md:border-b-0">
              <h2 className="text-lg font-medium dark:text-white">Ayarlar</h2>
            </div>
            <div className="p-2">
              <Tab 
                id="general" 
                label="Genel" 
                icon={<SettingsIcon size={18} />} 
                active={activeTab === 'general'} 
                onClick={setActiveTab} 
              />
              <Tab 
                id="appearance" 
                label="Görünüm" 
                icon={<Moon size={18} />} 
                active={activeTab === 'appearance'} 
                onClick={setActiveTab} 
              />
              <Tab 
                id="notifications" 
                label="Bildirimler" 
                icon={<Bell size={18} />} 
                active={activeTab === 'notifications'} 
                onClick={setActiveTab} 
              />
              <Tab 
                id="security" 
                label="Güvenlik" 
                icon={<Shield size={18} />} 
                active={activeTab === 'security'} 
                onClick={setActiveTab} 
              />
              <Tab 
                id="profile" 
                label="Profil" 
                icon={<User size={18} />} 
                active={activeTab === 'profile'} 
                onClick={setActiveTab} 
              />
            </div>
          </div>
          
          {/* İçerik */}
          <div className="flex-1 p-6 md:border-l border-gray-200 dark:border-gray-600">
            {/* Genel Ayarlar */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-lg font-medium dark:text-white mb-4">Genel Ayarlar</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Adı
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Açıklaması
                    </label>
                    <input
                      type="text"
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      İletişim E-posta
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      İletişim Telefon
                    </label>
                    <input
                      type="text"
                      id="contactPhone"
                      value={settings.general.contactPhone}
                      onChange={(e) => handleChange('general', 'contactPhone', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Görünüm Ayarları */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-medium dark:text-white mb-4">Görünüm Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="darkMode"
                      checked={settings.appearance.darkMode}
                      onChange={(e) => handleChange('appearance', 'darkMode', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Karanlık Mod
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ana Renk
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        id="primaryColor"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                        className="h-8 w-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                      />
                      <input
                        type="text"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                        className="ml-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dil
                    </label>
                    <select
                      id="language"
                      value={settings.appearance.language}
                      onChange={(e) => handleChange('appearance', 'language', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bildirim Ayarları */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium dark:text-white mb-4">Bildirim Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      E-posta Bildirimleri
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => handleChange('notifications', 'smsNotifications', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      SMS Bildirimleri
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newBookingNotification"
                      checked={settings.notifications.newBookingNotification}
                      onChange={(e) => handleChange('notifications', 'newBookingNotification', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newBookingNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Yeni Rezervasyon Bildirimleri
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bookingStatusChangeNotification"
                      checked={settings.notifications.bookingStatusChangeNotification}
                      onChange={(e) => handleChange('notifications', 'bookingStatusChangeNotification', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="bookingStatusChangeNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Rezervasyon Durumu Değişikliği Bildirimleri
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Güvenlik Ayarları */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-medium dark:text-white mb-4">Güvenlik Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      İki Faktörlü Kimlik Doğrulama
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Oturum Zaman Aşımı (dakika)
                    </label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      min="5"
                      max="120"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Profil Ayarları */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium dark:text-white mb-4">Profil Ayarları</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      defaultValue="Admin Kullanıcı"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      defaultValue="admin@alanyamvip.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Telefon
                    </label>
                    <input
                      type="text"
                      id="phone"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                      defaultValue="+90 555 123 4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Kaydet Butonu */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSaving ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
              >
                <Save size={18} className="mr-2" />
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings; 
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { createAdmin } from '../../api/auth';
import { initializeDatabase } from '../../api/database';

// Form validation schema for password change
const passwordSchema = yup.object({
  currentPassword: yup.string().required('Mevcut şifre gerekli'),
  newPassword: yup.string()
    .required('Yeni şifre gerekli')
    .min(8, 'Şifre en az 8 karakter olmalı'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Şifreler eşleşmiyor')
    .required('Şifre onayı gerekli'),
}).required();

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Kimlik doğrulama kontrolü
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema)
  });
  
  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Burada gerçek API çağrısı yapılacak
      // Şimdilik sadece başarılı olduğunu varsayalım
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Şifreniz başarıyla güncellendi.');
      reset();
    } catch (err) {
      console.error('Error updating password:', err);
      setErrorMessage('Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Admin kullanıcısı oluştur
  const handleCreateAdmin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const result = await createAdmin('admin', 'admin123', 'admin@alanyamvip.com');
      
      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      console.error('Error creating admin user:', err);
      setErrorMessage('Admin kullanıcısı oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Veritabanını başlat
  const handleInitDb = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const result = await initializeDatabase();
      
      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      setErrorMessage('Veritabanı başlatılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return <div>Yükleniyor...</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Ayarlar" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Ayarlar</h1>
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Şifre Değiştir</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    {...register('currentPassword')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    {...register('newPassword')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
                >
                  {loading ? 'İşleniyor...' : 'Şifreyi Değiştir'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Veritabanı Yönetimi</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Veritabanı işlemleri için aşağıdaki butonları kullanabilirsiniz.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCreateAdmin}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
                >
                  Admin Kullanıcısı Oluştur
                </button>
                
                <button
                  onClick={handleInitDb}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
                >
                  Veritabanını Başlat
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;

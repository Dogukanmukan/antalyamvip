import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { createAdmin } from '../../services/auth';
import { initializeDatabase } from '../../services/database';

// Form validation schema
const passwordSchema = yup.object({
  currentPassword: yup.string().required('Mevcut şifre gerekli'),
  newPassword: yup.string()
    .min(6, 'Şifre en az 6 karakter olmalı')
    .required('Yeni şifre gerekli'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Şifreler eşleşmiyor')
    .required('Şifre onayı gerekli'),
});

// Form data type
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema)
  });

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setMessage('');
      setIsError(false);
      
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Şifre başarıyla değiştirildi');
        setIsError(false);
      } else {
        setMessage(result.message || 'Şifre değiştirme işlemi başarısız');
        setIsError(true);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setMessage('Şifre değiştirme sırasında bir hata oluştu');
      setIsError(true);
    }
  };

  const handleDatabaseInit = async () => {
    try {
      await initializeDatabase();
      setMessage('Veritabanı başarıyla sıfırlandı');
      setIsError(false);
    } catch (error) {
      setMessage('Veritabanı sıfırlama işlemi başarısız oldu');
      setIsError(true);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await createAdmin('admin', 'admin123', 'admin@example.com');
      setMessage('Admin hesabı başarıyla oluşturuldu');
      setIsError(false);
    } catch (error) {
      setMessage('Admin hesabı oluşturma işlemi başarısız oldu');
      setIsError(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Ayarlar" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h3 className="text-gray-700 text-3xl font-medium">Ayarlar</h3>
            
            <div className="mt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Şifre Değiştir</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Güvenliğiniz için şifrenizi düzenli olarak değiştirin
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Mevcut Şifre
                          </label>
                          <input
                            type="password"
                            {...register('currentPassword')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.currentPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
                          )}
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Yeni Şifre
                          </label>
                          <input
                            type="password"
                            {...register('newPassword')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.newPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                          )}
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Yeni Şifre (Tekrar)
                          </label>
                          <input
                            type="password"
                            {...register('confirmPassword')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Şifreyi Değiştir
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-8 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Veritabanı İşlemleri</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Dikkat: Bu işlemler geri alınamaz!
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-4">
                      <button
                        onClick={handleDatabaseInit}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                      >
                        Veritabanını Sıfırla
                      </button>
                      <button
                        onClick={handleCreateAdmin}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                      >
                        Yeni Admin Oluştur
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {message && (
                <div className={`mt-4 p-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;

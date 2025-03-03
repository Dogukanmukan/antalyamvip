import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';

// Form validation schema
const schema = yup.object({
  username: yup.string().required('Kullanıcı adı gerekli'),
  password: yup.string().required('Şifre gerekli'),
}).required();

type LoginFormData = {
  username: string;
  password: string;
};

const AdminLogin: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(schema)
  });
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // TEST MODU: Doğrudan giriş yap
      if (data.username === 'admin' && data.password === 'admin123') {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('adminToken', 'test-token');
        localStorage.setItem('adminUser', JSON.stringify({
          id: 1,
          username: 'admin',
          email: 'admin@alanyamvip.com'
        }));
        
        // Dashboard'a yönlendir
        navigate('/admin/dashboard');
        return;
      }
      
      const result = await login(data.username, data.password);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminUser', JSON.stringify(result.user));
      
      // Dashboard'a yönlendir
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Alanyam VIP Admin</h1>
          <p className="text-gray-600">Yönetim paneline giriş yapın</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              {...register('username')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

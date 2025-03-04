import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { isValidEmail, hasMinLength } from '../utils/validation';
import { supabase } from '../../lib/supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  
  // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/admin/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  // Input değişikliklerinde anlık doğrulama
  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!isValidEmail(value)) {
          error = 'Geçerli bir e-posta adresi giriniz';
        }
        break;
      case 'password':
        if (!hasMinLength(value, 6)) {
          error = 'Şifre en az 6 karakter olmalıdır';
        }
        break;
      default:
        break;
    }
    
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === '';
  };
  
  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Hata mesajını temizle
    if (error) {
      setError('');
    }
    
    // Anlık doğrulama
    validateField(field, value);
  };
  
  // Form validation function
  const validateForm = () => {
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    return emailValid && passwordValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulamasını yap
    if (!validateForm()) {
      console.error('Form validation failed');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email });
      
      // Supabase ile giriş yap
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Supabase auth response:', data);
      
      if (authError) {
        console.error('Supabase auth error:', authError);
        throw new Error(authError.message || 'Giriş başarısız');
      }
      
      if (!data.session || !data.user) {
        console.error('Invalid auth response:', data);
        throw new Error('Geçersiz kimlik doğrulama yanıtı');
      }
      
      // Kullanıcı rolünü kontrol et (opsiyonel)
      const userRole = data.user.app_metadata?.role || 'user';
      console.log('User role:', userRole);
      
      // Token ve kullanıcı bilgilerini kaydet
      console.log('Storing authentication data...');
      localStorage.setItem('adminToken', data.session.access_token);
      localStorage.setItem('adminUser', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: userRole
      }));
      
      console.log('Login successful, redirecting to dashboard...');
      
      // Yönlendirme işlemi - önce navigate ile dene
      try {
        navigate('/admin/dashboard');
        console.log('Navigation with React Router successful');
      } catch (navError) {
        console.error('Navigation with React Router failed:', navError);
        
        // React Router başarısız olursa window.location ile dene
        console.log('Trying with window.location.href...');
        window.location.href = '/admin/dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-amber-600">Alanyam</span>
              <span className="text-3xl font-bold ml-1">VIP</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Admin Paneli Girişi
          </h2>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta Adresi
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={(e) => validateField('email', e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  placeholder="admin@alanyamvip.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={(e) => validateField('password', e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Beni hatırla
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                  Şifremi unuttum
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white ${
                  loading ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-amber-300" />
                </span>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 
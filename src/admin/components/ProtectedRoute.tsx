import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Token kontrolü
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('Token bulunamadı, yönlendiriliyor...');
        setIsAuthenticated(false);
        return;
      }
      
      // Kullanıcı bilgilerini kontrol et
      const user = authAPI.getCurrentUser();
      if (!user) {
        console.log('Kullanıcı bilgisi bulunamadı, yönlendiriliyor...');
        setIsAuthenticated(false);
        return;
      }
      
      console.log('Kullanıcı doğrulandı:', user);
      setIsAuthenticated(true);
    };
    
    checkAuth();
  }, []);

  // Yükleniyor durumu
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Kimlik doğrulama başarısız ise login sayfasına yönlendir
  if (isAuthenticated === false) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Kimlik doğrulama başarılı ise çocuk bileşenleri göster
  return <>{children}</>;
};

export default ProtectedRoute; 
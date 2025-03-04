import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Supabase oturumunu kontrol et
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          navigate('/admin/login');
          return;
        }
        
        if (!data.session) {
          console.log('No active session found, redirecting to login');
          navigate('/admin/login');
          return;
        }
        
        // Kullanıcı rolünü kontrol et (opsiyonel)
        const userRole = data.session.user.app_metadata?.role || 'user';
        console.log('User authenticated with role:', userRole);
        
        // Admin rolü kontrolü (opsiyonel)
        // if (userRole !== 'admin') {
        //   console.log('User does not have admin role, redirecting to login');
        //   navigate('/admin/login');
        //   return;
        // }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/admin/login');
      }
    };
    
    checkAuth();
    
    // Auth durumu değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/admin/login');
      }
    });
    
    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 
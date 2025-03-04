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
        console.log('Checking authentication...');
        
        // Önce localStorage'daki token'ı kontrol et
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');
        
        console.log('Local storage check:', { 
          tokenExists: !!adminToken, 
          userExists: !!adminUser 
        });
        
        if (!adminToken || !adminUser) {
          console.log('No admin token or user in localStorage, checking Supabase session');
          
          // Supabase oturumunu kontrol et
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth session error:', error);
            navigate('/admin/login');
            return;
          }
          
          if (!data.session) {
            console.log('No active Supabase session found, redirecting to login');
            navigate('/admin/login');
            return;
          }
          
          // Supabase oturumu var ama localStorage'da token yok, token'ı localStorage'a kaydet
          console.log('Supabase session found, saving token to localStorage');
          localStorage.setItem('adminToken', data.session.access_token);
          
          // Kullanıcı bilgilerini al ve localStorage'a kaydet
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (!userError && userData) {
            localStorage.setItem('adminUser', JSON.stringify(userData));
          }
        }
        
        // Token var, kullanıcı doğrulanmış kabul et
        console.log('Authentication successful');
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        // Hata durumunda login sayfasına yönlendir
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    };
    
    checkAuth();
    
    // Auth durumu değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
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
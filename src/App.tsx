import React, { useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import BookingResults from './pages/BookingResults';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './components/ScrollToTop';

// Admin sayfaları
import AdminLogin from './admin/pages/Login';
import AdminDashboard from './admin/pages/Dashboard';
import AdminBookings from './admin/pages/Bookings';
import AdminCars from './admin/pages/Cars';
import AdminSettings from './admin/pages/Settings';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Layout bileşenleri
interface MainLayoutProps {
  children: ReactNode;
}

// Ana site layout
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

// Admin layout wrapper
const AdminWrapper: React.FC<MainLayoutProps> = ({ children }) => {
  // Admin sayfalarında navbar ve footer gösterme
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      {children}
    </div>
  );
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Kullanıcının tercih ettiği dili localStorage'dan al
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <Router>
      <Routes>
        {/* Ana site rotaları */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/fleet" element={<MainLayout><Fleet /></MainLayout>} />
        <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/booking-results" element={<MainLayout><BookingResults /></MainLayout>} />
        
        {/* Admin rotaları */}
        <Route path="/admin/login" element={<AdminWrapper><AdminLogin /></AdminWrapper>} />
        <Route path="/admin/dashboard" element={
          <AdminWrapper>
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          </AdminWrapper>
        } />
        <Route path="/admin/bookings" element={
          <AdminWrapper>
            <ProtectedRoute>
              <AdminBookings />
            </ProtectedRoute>
          </AdminWrapper>
        } />
        <Route path="/admin/cars" element={
          <AdminWrapper>
            <ProtectedRoute>
              <AdminCars />
            </ProtectedRoute>
          </AdminWrapper>
        } />
        <Route path="/admin/cars/add" element={
          <AdminWrapper>
            <ProtectedRoute>
              <AdminCars isAddMode={true} />
            </ProtectedRoute>
          </AdminWrapper>
        } />
        <Route path="/admin/cars/edit/:id" element={
          <AdminWrapper>
            <ProtectedRoute>
              <AdminCars isEditMode={true} />
            </ProtectedRoute>
          </AdminWrapper>
        } />
        <Route path="/admin/settings" element={
          <AdminWrapper>
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          </AdminWrapper>
        } />
      </Routes>
    </Router>
  );
}

export default App;
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
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCars from './pages/admin/Cars';
import EditCar from './pages/admin/EditCar';
import AdminBookings from './pages/admin/Bookings';
import AdminSettings from './pages/admin/Settings';

// Layout bileşenleri
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <>
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </>
);

// Admin sayfaları için dili Türkçe olarak sabitleyen wrapper bileşeni
const AdminWrapper: React.FC<MainLayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Bileşen yüklendiğinde dili Türkçe olarak ayarla
  useEffect(() => {
    if (i18n.language !== 'tr') {
      i18n.changeLanguage('tr');
    }
  }, [i18n]);
  
  return <>{children}</>;
};

function App() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    document.title = i18n.language === 'tr' 
      ? 'AntalyamVip | Premium Mercedes Vito VIP Taşımacılık' 
      : 'AntalyamVip | Premium Mercedes Vito VIP Transportation';
  }, [i18n.language]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white flex flex-col">
        <Routes>
          {/* Admin Rotaları */}
          <Route path="/admin/login" element={<AdminWrapper><AdminLogin /></AdminWrapper>} />
          <Route path="/admin/dashboard" element={<AdminWrapper><AdminDashboard /></AdminWrapper>} />
          <Route path="/admin/cars" element={<AdminWrapper><AdminCars /></AdminWrapper>} />
          <Route path="/admin/cars/add" element={<AdminWrapper><EditCar /></AdminWrapper>} />
          <Route path="/admin/cars/edit/:id" element={<AdminWrapper><EditCar /></AdminWrapper>} />
          <Route path="/admin/bookings" element={<AdminWrapper><AdminBookings /></AdminWrapper>} />
          <Route path="/admin/settings" element={<AdminWrapper><AdminSettings /></AdminWrapper>} />
          
          {/* Ana Site Rotaları */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/fleet" element={<MainLayout><Fleet /></MainLayout>} />
          <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/booking-results" element={<MainLayout><BookingResults /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
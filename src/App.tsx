import React, { useEffect } from 'react';
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
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking-results" element={<BookingResults />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
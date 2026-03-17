import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Loader from './components/Loader/Loader';
import Chatbot from './components/Chatbot/Chatbot';
import Home from './pages/Home/Home';
import Worker from './pages/Worker/Worker';
import Provider from './pages/Provider/Provider';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Admin from './pages/Admin/Admin';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import './App.css';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

const PAGE_TITLES = {
  '/':        'Home',
  '/worker':  'Find Work',
  '/provider':'Post a Job',
  '/about':   'About',
  '/contact': 'Contact',
  '/login':    'Sign In',
  '/admin':    'Admin',
  '/profile': 'My Profile',
};

function AnimatedRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    const name = PAGE_TITLES[location.pathname] || 'MattersUrSkills';
    document.title = name;
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setLoading(true);
      const t = setTimeout(() => {
        setDisplayLocation(location);
        setLoading(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [location, displayLocation]);

  return (
    <>
      {loading && <Loader />}
      <AnimatePresence mode="wait">
        <Routes location={displayLocation} key={displayLocation.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/worker" element={<PageWrapper><Worker /></PageWrapper>} />
          <Route path="/provider" element={<PageWrapper><Provider /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />
        <ScrollToTop />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
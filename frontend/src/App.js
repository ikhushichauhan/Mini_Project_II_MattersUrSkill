import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Loader from './components/Loader/Loader';

import Home from './pages/Home/Home';
import Worker from './pages/Worker/Worker';
import Provider from './pages/Provider/Provider';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import JobDetails from './pages/JobDetails/JobDetails';
import WorkHistory from './pages/WorkHistory/WorkHistory';
import ApplicantsDetails from './pages/ApplicantsDetails/ApplicantsDetails';
import WorkerProfile from './pages/WorkerProfile/WorkerProfile';
import DebugAuth from './components/DebugAuth/DebugAuth';
import './App.css';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.15, 
        ease: 'easeInOut'
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
  '/work-history': 'Work History',
  '/applicants': 'Applicants Details',
};

function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated, isProvider, isWorker, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  const hideFooter = location.pathname === '/login';

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
      }, 150);
      return () => clearTimeout(t);
    }
  }, [location, displayLocation]);

  return (
    <>
      {loading && <Loader />}
      <AnimatePresence mode="wait">
        <Routes location={displayLocation} key={displayLocation.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route
            path="/worker"
            element={
              isAuthenticated && isWorker
                ? <PageWrapper><Worker /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/provider"
            element={
              isAuthenticated && isProvider
                ? <PageWrapper><Provider /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
          <Route
            path="/admin"
            element={
              isAuthenticated && user?.role === 'admin'
                ? <PageWrapper><AdminDashboard /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated
                ? <PageWrapper><Profile /></PageWrapper>
                : <Navigate to="/login" replace />
            }
          />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route
            path="/job/:jobId"
            element={
              isAuthenticated && isProvider
                ? <PageWrapper><JobDetails /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/work-history"
            element={
              isAuthenticated && isWorker
                ? <PageWrapper><WorkHistory /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/applicants"
            element={
              isAuthenticated && isProvider
                ? <PageWrapper><ApplicantsDetails /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
          <Route
            path="/worker/:workerId"
            element={
              isAuthenticated && isProvider
                ? <PageWrapper><WorkerProfile /></PageWrapper>
                : <Navigate to="/" replace />
            }
          />
        </Routes>
      </AnimatePresence>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SocketProvider>
        <div className="min-h-screen bg-surface flex flex-col">
          <Navbar />
          <ScrollToTop />
          <DebugAuth />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
        </div>
      </SocketProvider>
    </Router>
  );
}

export default App;
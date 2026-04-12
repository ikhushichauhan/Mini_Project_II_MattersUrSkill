import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext/ThemeContext';
import NotificationBell from '../NotificationBell/NotificationBell';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isWorker, isProvider, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const openProfilePage = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  let mainLinks = [];

  if (isAdmin) {
    mainLinks = [
      { path: '/', label: 'Home' },
      { path: '/admin', label: 'Admin Dashboard' },
    ];
  } else if (isWorker) {
    mainLinks = [
      { path: '/', label: 'Home' },
      { path: '/worker', label: 'Find Work' },
      { path: '/about', label: 'About' },
    ];
  } else if (isProvider) {
    mainLinks = [
      { path: '/', label: 'Home' },
      { path: '/provider', label: 'Post Work' },
      { path: '/about', label: 'About' },
    ];
  } else {
    mainLinks = [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' },
    ];
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'shadow-sm'
          : ''
      }`} style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--navbar-border)'
      }}>
        <div className="section-container-wide">
          <div className="flex items-center justify-between h-16">

            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none"
              aria-label="Home"
            >
              <img
                src="/images/logo.png"
                alt="MattersUrSkills"
                className="h-8 w-auto object-contain select-none"
                draggable="false"
                style={{ filter: 'invert(1)' }}
              />
              <span className="text-base font-bold tracking-tight hidden sm:inline font-rubik" style={{ color: 'var(--navbar-text)' }}>
                MattersUrSkills
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-sm font-medium transition-colors font-inter rounded-md hover:bg-gray-100"
                  style={{
                    color: 'var(--navbar-text)'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && <NotificationBell />}

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                style={{ background: 'var(--card-bg, #f3f4f6)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--navbar-text)' }}>
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--navbar-text)' }}>
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={openProfilePage}
                    aria-label="Go to profile"
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-black hover:border-black transition-colors"
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {(user?.name?.[0] || '?').toUpperCase()}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm font-medium transition-colors font-inter"
                    style={{ color: 'var(--navbar-text)' }}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/login?tab=register"
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors font-rubik"
                    style={{ 
                      background: 'white',
                      color: 'var(--navbar-text)',
                      border: '1px solid var(--navbar-text)'
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-black transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-200 ${menuOpen ? 'max-h-96 border-t border-white/30' : 'max-h-0'}`} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)'
        }}>
          <div className="px-4 py-3 space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors font-inter ${
                  isActive(link.path) ? 'text-white bg-black' : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium text-black text-left hover:bg-gray-100 transition-colors flex items-center gap-2 font-inter"
                >
                  <span className="w-7 h-7 rounded-full overflow-hidden border border-border flex items-center justify-center bg-primary flex-shrink-0">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-foreground font-bold text-xs">{(user?.name?.[0] || '?').toUpperCase()}</span>
                    )}
                  </span>
                  My Profile
                </Link>
                {isWorker && (
                  <Link
                    to="/work-history"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-3 py-2 rounded-md text-sm font-medium text-black text-left hover:bg-gray-100 transition-colors font-inter"
                  >
                    Work History
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium text-black text-left hover:text-black hover:bg-gray-100 transition-colors font-inter"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 transition-colors font-inter"
                >
                  Log in
                </Link>
                <Link
                  to="/login?tab=register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold text-black hover:bg-gray-100 transition-colors font-rubik"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
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

  const mainLinks = [
    { path: '/',         label: 'Home' },
    { path: '/worker',   label: 'Find Work' },
    { path: '/provider', label: 'Post Work' },
    { path: '/about',    label: 'About' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-xl border-b border-surface-border'
          : 'bg-transparent'
      }`}>
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
                className="h-9 w-auto object-contain select-none"
                draggable="false"
              />
              <span className="text-base font-extrabold tracking-tight text-white hidden sm:inline">
                MattersUrSkills
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive(link.path)
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                aria-label="Open AI Assistant"
                title="AI Assistant"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-surface-hover transition-colors duration-150"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={openProfilePage}
                    aria-label="Go to profile"
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-500/40 hover:border-brand-500 transition-colors duration-150"
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                        {(user?.name?.[0] || '?').toUpperCase()}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors duration-150"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/login?tab=register"
                    className="btn-primary text-sm"
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
              <span className={`block w-5 h-0.5 bg-white transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? 'opacity-0 w-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-200 ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="bg-surface-card border-t border-surface-border px-4 py-3 space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'text-white bg-surface-hover' : 'text-neutral-400 hover:text-white hover:bg-surface-hover'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('openChatbot')); }}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 text-left hover:text-white hover:bg-surface-hover transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="flex-shrink-0">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              AI Assistant
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 text-left hover:bg-surface-hover transition-colors flex items-center gap-2"
                >
                  <span className="w-7 h-7 rounded-full overflow-hidden border border-brand-500/40 flex items-center justify-center bg-brand-gradient flex-shrink-0">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xs">{(user?.name?.[0] || '?').toUpperCase()}</span>
                    )}
                  </span>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 text-left hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/login?tab=register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-brand-400 hover:bg-surface-hover transition-colors"
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
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_SECTIONS = [
  {
    heading: 'Platform',
    links: [
      { to: '/worker',   label: 'Browse Jobs' },
      { to: '/provider', label: 'Post Work' },
      { to: '/about',    label: 'About Us' },
      { to: '/',         label: 'Register' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/contact', label: 'Help Center' },
      { to: '/contact', label: 'Privacy Policy' },
      { to: '/contact', label: 'Terms of Service' },
      { to: '/contact', label: 'FAQs' },
    ],
  },
];

const Footer = () => {
  const location = useLocation();
  const isDarkFooter = location.pathname === '/worker' || location.pathname === '/provider' || location.pathname.startsWith('/worker/') || location.pathname.startsWith('/provider/') || location.pathname === '/work-history' || location.pathname === '/about' || location.pathname.startsWith('/job/');

  return (
    <footer style={{ 
      background: isDarkFooter ? 'var(--bg-primary)' : 'var(--button-primary-bg)',
      borderTop: isDarkFooter ? '1px solid var(--border-color)' : '1px solid var(--navbar-border, #e5e7eb)'
    }} className="relative z-10">
      <div className="section-container-wide">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14">

          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/images/logo.png"
                alt="MattersUrSkills"
                className="h-9 w-auto object-contain select-none"
                draggable="false"
                style={{ filter: isDarkFooter ? 'invert(0)' : 'invert(1)' }}
              />
            </Link>
            <p className={`text-sm leading-relaxed max-w-xs mb-6 ${isDarkFooter ? 'text-gray-300' : 'text-black'}`}>
              Empowering India's skilled workforce with verified opportunities, safe payments,
              and transparent reviews — connecting workers and businesses since 2024.
            </p>
            <div className="space-y-2.5">
              {[
                { href: 'mailto:khushichauhan@gmail.com', label: 'khushichauhan@gmail.com' },
                { href: 'tel:+918860013597',              label: '+91 88600 13597' },
                { href: '#',                              label: 'Gurugram, Haryana 122001' },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  className={`block text-sm transition-colors duration-150 ${isDarkFooter ? 'text-gray-400 hover:text-white' : 'text-black hover:text-gray-600'}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {NAV_SECTIONS.map(({ heading, links }) => (
            <div key={heading}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkFooter ? 'text-gray-400' : 'text-black'}`}>{heading}</p>
              <ul className="space-y-2.5">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className={`text-sm transition-colors duration-150 ${isDarkFooter ? 'text-gray-300 hover:text-white' : 'text-black hover:text-gray-600'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`border-t py-5 flex flex-col sm:flex-row items-center justify-between gap-3 ${isDarkFooter ? 'border-black' : 'border-gray-200'}`}>
          <p className={`text-xs ${isDarkFooter ? 'text-gray-400' : 'text-black'}`}>
            &copy; {new Date().getFullYear()} MattersUrSkills. All rights reserved.
          </p>
          <p className={`text-xs ${isDarkFooter ? 'text-gray-400' : 'text-black'}`}>
            Made for India's skilled workforce.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';

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

const Footer = () => (
  <footer className="bg-black border-t border-surface-border relative z-10">
    <div className="section-container-wide">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14">

        <div className="lg:col-span-2">
          <Link to="/" className="inline-block mb-4">
            <img
              src="/images/logo.png"
              alt="MattersUrSkills"
              className="h-9 w-auto object-contain select-none"
              draggable="false"
            />
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mb-6">
            Empowering India's skilled workforce with verified opportunities, safe payments,
            and transparent reviews  connecting workers and businesses since 2024.
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
                className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {NAV_SECTIONS.map(({ heading, links }) => (
          <div key={heading}>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">{heading}</p>
            <ul className="space-y-2.5">
              {links.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-surface-border py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-neutral-600">
          &copy; {new Date().getFullYear()} MattersUrSkills. All rights reserved.
        </p>
        <p className="text-xs text-neutral-600">
          Made for India's skilled workforce.
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;
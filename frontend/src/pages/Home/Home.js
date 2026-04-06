import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('reveal-visible'); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Verified Work',
    body:  'Trusted tasks from real, identity-verified providers.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Secure Payments',
    body:  'Escrow-protected payments released only on job completion.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Skill Matching',
    body:  'Smart matching connects the right worker to every job.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Local & Remote',
    body:  'Discover work near you or take on fully remote contracts.',
  },
];

const CATEGORIES = [
  { label: 'Development',   sub: 'Web, App, Software' },
  { label: 'Design',        sub: 'UI/UX, Graphic' },
  { label: 'Marketing',     sub: 'SEO, Social, Content' },
  { label: 'Local Services',sub: 'Cleaning, Repair' },
  { label: 'Data & Finance',sub: 'Accounting, Entry' },
  { label: 'Part-Time',     sub: 'Flexible schedules' },
];

const TRUST_STATS = [
  { value: '10,000+', label: 'Verified Workers' },
  { value: '5,000+',  label: 'Active Businesses' },
  { value: '50,000+', label: 'Jobs Completed' },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  useReveal();

  const goToWork = () => navigate(isAuthenticated ? '/worker' : '/login');
  const goToPost = () => navigate(isAuthenticated ? '/provider' : '/login');

  return (
    <div className="min-h-screen" style={{
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)'
    }}>

      <section
        ref={heroRef}
        className="relative min-h-[calc(100vh-64px)] flex items-center py-12 border-b border-black home-hero-section"
        style={{ paddingTop: '5rem' }}
      >
        <div className="section-container-wide w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="animate-fadeUp">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-6xl sm:text-7xl font-rubik font-bold tracking-tight leading-[1.1] mb-6"
                style={{ marginTop: '2rem', color: 'var(--card-bg)' }}
              >
                Find Real Work & Get Paid{' '}
                <span style={{ color: 'var(--card-bg)' }}>Fairly</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-gray-300 text-lg leading-relaxed mb-16 max-w-lg font-inter"
              >
                MattersUrSkills connects skilled professionals with verified businesses. Flexible, fair, and fully transparent.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-3 mb-12"
              >
                <button
                  onClick={goToWork}
                  className="btn-primary font-rubik"
                  style={{ border: '1px solid rgba(0, 0, 0, 0.3)' }}
                >
                  Find Work
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={goToPost}
                  className="font-rubik px-4 py-2 rounded-md font-medium text-sm transition-colors"
                  style={{ background: '#d1d5db', color: '#000000', border: '1px solid rgba(0, 0, 0, 0.3)' }}
                >
                  Post a Job
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-8"
              >
                {TRUST_STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold font-rubik" style={{ color: 'var(--card-bg)' }}>{value}</p>
                    <p className="text-xs font-inter" style={{ color: 'var(--card-bg)' }}>{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              <img 
                src="/images/newbg.png" 
                alt="MattersUrSkills Platform" 
                className="w-full h-auto max-w-lg rounded-lg"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {FEATURES.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="rounded-lg p-5 border transition-all duration-200 hover:shadow-md"
                style={{ background: 'var(--card-bg)', borderColor: '#000000' }}
              >
                <div className="text-black mb-3">{icon}</div>
                <h3 className="font-semibold text-sm mb-1.5 font-rubik text-black">{title}</h3>
                <p className="text-xs leading-relaxed font-inter text-black">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'var(--button-primary-bg)' }}>
        <div className="section-container">
          <div className="mb-12 text-center reveal">
            <p className="section-label font-rubik text-black">Categories</p>
            <h2 className="section-title font-rubik mb-4 text-black">Work opportunities for every skill</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-inter">
              Browse through diverse job categories and find the perfect match for your expertise.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map(({ label, sub }, i) => (
              <a
                key={label}
                href={isAuthenticated ? '/worker' : '/login'}
                className={`card-hover group cursor-pointer reveal reveal-delay-${Math.min(i + 1, 4)}`}
                style={{ background: 'var(--card-bg)', borderColor: '#000000' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm font-rubik mb-1 text-black">{label}</p>
                    <p className="text-xs font-inter text-black">{sub}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-black home-ready-section">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 font-rubik home-ready-text" style={{ color: 'var(--text-primary)' }}>
            Ready to start?
          </h2>
          <p className="text-gray-300 text-sm max-w-md mx-auto mb-7 font-inter home-ready-text">
            Join 10,000+ workers and 5,000+ businesses already using MattersUrSkills.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={goToWork} className="btn-primary font-rubik" style={{ border: '1px solid rgba(0, 0, 0, 0.3)' }}>
              Register as Worker
            </button>
            <button onClick={goToPost} className="btn-outline font-rubik" style={{ border: '1px solid rgba(0, 0, 0, 0.3)' }}>
              Post a Job
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

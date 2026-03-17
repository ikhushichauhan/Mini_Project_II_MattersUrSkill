import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Verified Work',
    body:  'Trusted tasks from real, identity-verified providers.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Secure Payments',
    body:  'Escrow-protected payments released only on job completion.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Skill Matching',
    body:  'Smart matching connects the right worker to every job.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Local & Remote',
    body:  'Discover work near you or take on fully remote contracts.',
  },
];

const WorkersSVG = () => (
  <svg viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-md mx-auto">
    <ellipse cx="240" cy="310" rx="180" ry="30" fill="#7cbd67" fillOpacity="0.08" />
    <circle cx="240" cy="170" r="155" fill="#7cbd67" fillOpacity="0.04" />

    <rect x="100" y="280" width="280" height="12" rx="6" fill="#232b1e" />
    <rect x="130" y="268" width="220" height="14" rx="6" fill="#2e3828" />

    <circle cx="240" cy="120" r="32" fill="#232b1e" stroke="#7cbd67" strokeWidth="2" />
    <circle cx="240" cy="108" r="12" fill="#7cbd67" fillOpacity="0.85" />
    <path d="M216 152 Q240 136 264 152 L268 200 Q240 210 212 200Z" fill="#7cbd67" fillOpacity="0.7" />
    <rect x="224" y="200" width="10" height="68" rx="5" fill="#629d51" />
    <rect x="246" y="200" width="10" height="68" rx="5" fill="#629d51" />

    <circle cx="110" cy="148" r="24" fill="#232b1e" stroke="#8ec96a" strokeWidth="1.5" />
    <circle cx="110" cy="138" r="9" fill="#8ec96a" fillOpacity="0.8" />
    <path d="M92 168 Q110 156 128 168 L131 206 Q110 214 89 206Z" fill="#8ec96a" fillOpacity="0.6" />
    <rect x="103" y="206" width="8" height="62" rx="4" fill="#629d51" />
    <rect x="117" y="206" width="8" height="62" rx="4" fill="#629d51" />

    <circle cx="370" cy="148" r="24" fill="#232b1e" stroke="#a4d978" strokeWidth="1.5" />
    <circle cx="370" cy="138" r="9" fill="#a4d978" fillOpacity="0.8" />
    <path d="M352 168 Q370 156 388 168 L391 206 Q370 214 349 206Z" fill="#a4d978" fillOpacity="0.6" />
    <rect x="363" y="206" width="8" height="62" rx="4" fill="#629d51" />
    <rect x="377" y="206" width="8" height="62" rx="4" fill="#629d51" />

    <line x1="134" y1="168" x2="208" y2="148" stroke="#7cbd67" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="5 4" />
    <line x1="346" y1="168" x2="272" y2="148" stroke="#7cbd67" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="5 4" />

    <rect x="30" y="80" width="92" height="26" rx="13" fill="#232b1e" stroke="#7cbd67" strokeOpacity="0.4" strokeWidth="1" />
    <text x="46" y="97" fontSize="9.5" fontWeight="600" fill="#7cbd67"> Verified Job</text>

    <rect x="355" y="65" width="96" height="26" rx="13" fill="#232b1e" stroke="#8ec96a" strokeOpacity="0.4" strokeWidth="1" />
    <text x="370" y="82" fontSize="9.5" fontWeight="600" fill="#8ec96a">Our Platform</text>

    <rect x="170" y="28" width="140" height="26" rx="13" fill="#232b1e" stroke="#a4d978" strokeOpacity="0.4" strokeWidth="1" />
    <text x="196" y="45" fontSize="9.5" fontWeight="600" fill="#a4d978">Verified Workers</text>

    <rect x="192" y="170" width="96" height="8" rx="4" fill="#7cbd67" fillOpacity="0.15" />
    <rect x="192" y="182" width="60" height="6" rx="3" fill="#7cbd67" fillOpacity="0.1" />
  </svg>
);

const CATEGORIES = [
  { label: 'Development',   sub: 'Web, App, Software',   color: '#7cbd67' },
  { label: 'Design',        sub: 'UI/UX, Graphic',        color: '#8ec96a' },
  { label: 'Marketing',     sub: 'SEO, Social, Content',  color: '#a4d978' },
  { label: 'Local Services',sub: 'Cleaning, Repair',      color: '#629d51' },
  { label: 'Data & Finance',sub: 'Accounting, Entry',     color: '#bfcdb5' },
  { label: 'Part-Time',     sub: 'Flexible schedules',    color: '#4e7d3e' },
];

const HOW_STEPS = [
  { num: '01', head: 'Create Your Profile',  body: 'Register and verify your identity with a phone OTP in under 2 minutes.' },
  { num: '02', head: 'Find or Post Work',    body: 'Browse open opportunities filtered by category, location, and pay  or post your own job.' },
  { num: '03', head: 'Get Paid Safely',      body: 'Payments are held in escrow and released only after work is confirmed complete.' },
];

const TRUST_STATS = [
  { value: '10,000+', label: 'Verified Workers' },
  { value: '5,000+',  label: 'Active Businesses' },
  { value: '50,000+', label: 'Jobs Completed' },
  { value: '4.8 / 5', label: 'Average Rating' },
];

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  useReveal();

  return (
    <div className="min-h-screen bg-surface">

      <section
        ref={heroRef}
        className="relative min-h-[calc(100vh-64px)] flex items-center py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161d12 0%, #1f2d17 40%, #191f13 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 10s ease infinite',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px', height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,189,103,0.18) 0%, rgba(124,189,103,0.06) 45%, transparent 70%)',
            animation: 'glowPulse 5s ease-in-out infinite',
          }} />
        </div>

        <div className="section-container-wide w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="animate-fadeUp">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6"
              >
                Find Real Work & Get Paid{' '}
                <span className="text-brand-400">Fairly</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-lg"
              >
                MattersUrSkills connects skilled professionals  from electricians to designers  with verified businesses.
                Flexible, fair, and fully transparent.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card/60 backdrop-blur-sm p-6 mb-8"
              >
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: '-20%', left: 0,
                    display: 'flex', gap: '40px', height: '160%',
                    animation: 'shineBeam 5s linear infinite',
                  }}>
                    <div style={{ width: '80px', height: '100%', background: 'rgba(255,255,255,0.09)', transform: 'skewX(-42deg)' }} />
                    <div style={{ width: '50px', height: '100%', background: 'rgba(255,255,255,0.06)', transform: 'skewX(-42deg)' }} />
                  </div>
                </div>
                <div className="relative z-10 flex flex-col gap-5">
                  {TRUST_STATS.slice(0, 3).map(({ value, label }, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full bg-brand-gradient flex-shrink-0" />
                      <div>
                        <span className="text-xl font-extrabold text-white leading-none">{value}</span>
                        <span className="block text-xs text-neutral-500 font-medium mt-0.5">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center justify-center animate-float"
            >
              <WorkersSVG />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {FEATURES.map(({ icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="bg-surface-card border border-surface-border rounded-xl p-5
                           hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10
                           hover:scale-105 hover:-translate-y-1
                           transition-all duration-300 cursor-default"
              >
                <div className="text-brand-400 mb-3">{icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-card">
        <div className="section-container">
          <div className="text-center mb-14 reveal">
            <p className="section-label">Simple Process</p>
            <h2 className="section-title">How MattersUrSkills works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-surface-border reveal" style={{ boxShadow: '0 0 40px rgba(124,189,103,0.08)' }}>
              <img
                src="/images/second.png"
                alt="How MattersUrSkills works"
                className="w-full h-full object-cover"
                style={{ minHeight: '280px', maxHeight: '400px' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(22,29,18,0.3) 0%, transparent 60%)' }} />
            </div>
            <div className="flex flex-col gap-8">
              {HOW_STEPS.map(({ num, head, body }, i) => (
                <div key={num} className={`flex items-start gap-5 reveal reveal-delay-${i + 1}`}>
                  <div className="step-number flex-shrink-0">{num}</div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-2">{head}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-20 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7cbd67 0%, #629d51 55%, #8ec96a 100%)',
        }}
      >
        <div className="section-container relative z-10">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 reveal relative z-10">
            <div>
              <p className="text-white font-extrabold text-2xl sm:text-3xl leading-none mb-3">Categories</p>
              <h2 className="section-title">Work opportunities for every skill</h2>
            </div>
            <a
              href="/worker"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-surface/45 bg-white/60 text-surface font-extrabold text-sm whitespace-nowrap self-start sm:self-auto transition-colors duration-150 hover:bg-white/75"
            >
              Browse All Jobs
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
            {CATEGORIES.map(({ label, sub, color }, i) => (
              <a
                key={label}
                href="/worker"
                className={`flex flex-col gap-3 no-underline rounded-3xl border border-brand-300/35 bg-gradient-to-br from-brand-800/95 via-brand-700/94 to-brand-700/88 p-6 shadow-[0_10px_28px_rgba(20,34,14,0.35)] hover:scale-[1.02] hover:shadow-brand transition-all duration-300 reveal reveal-delay-${Math.min(i + 1, 4)}`}
              >
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: color + '25', border: `1px solid ${color}40` }}>
                  <div className="w-3 h-3 rounded-full m-2.5" style={{ backgroundColor: color }} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-xs text-white/85 mt-0.5">{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-14 reveal">
            <p className="section-label">Trust and Safety</p>
            <h2 className="section-title">Built for India's workforce</h2>
            <p className="section-body mt-3 max-w-lg mx-auto">
              Every worker is phone-verified. Every payment is escrowed. Every review is from a real job.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-border rounded-xl overflow-hidden reveal reveal-delay-1">
            {TRUST_STATS.map(({ value, label }) => (
              <div key={label} className="bg-surface-card text-center py-8 px-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{value}</p>
                <p className="text-xs text-neutral-500 font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { head: 'OTP Verified Users',      body: 'Every worker and provider is verified with phone OTP before they can access the platform.' },
              { head: 'Escrow Payments',          body: 'Your money stays safe in escrow until the job is completed to your satisfaction.' },
              { head: 'Transparent Reviews',      body: 'Ratings are posted only by confirmed contract participants  no fake reviews.' },
            ].map(({ head, body }) => (
              <div key={head} className="card-hover p-5">
                <div className="w-1.5 h-6 rounded-full bg-brand-gradient mb-4" />
                <h3 className="font-semibold text-white text-sm mb-2">{head}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(78,125,62,0.92) 0%, rgba(98,157,81,0.88) 100%)' }} />
        <div className="section-container text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight relative z-10">
            Ready to start?
          </h2>
          <p className="text-white/80 text-sm max-w-md mx-auto mb-7 relative z-10">
            Join 10,000+ workers and 5,000+ businesses already using MattersUrSkills.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <button
              onClick={() => navigate('/worker')}
              className="btn-white"
            >
              Register as Worker
            </button>
            <button
              onClick={() => navigate('/provider')}
              className="px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Post a Job
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
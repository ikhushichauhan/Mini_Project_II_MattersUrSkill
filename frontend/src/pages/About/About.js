import React from 'react';

const teamMembers = [
  { name: 'Khushi Chauhan',  role: 'Hosting & Deploy Manager', email: '2401201167@krmu.edu.in', image: '/images/team/khushi.png' },
  { name: 'Shweta Jha',      role: 'Backend Developer',        email: '2401201127@krmu.edu.in', image: '/images/team/shweta.png' },
  { name: 'Kartik Malhotra', role: 'Frontend Developer',       email: '2401201160@krmu.edu.in', image: '/images/team/kartik.png' },
  { name: 'Akanksha Kumari', role: 'Database Manager',         email: '2401201162@krmu.edu.in', image: '/images/team/akanksha.png' },
  { name: 'Vikram Das',      role: 'UI/UX Designer',           email: '2401201217@krmu.edu.in', image: '/images/team/vikram.png' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-surface">

      <section
        className="relative pt-24 pb-16 overflow-hidden"
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
        <div className="section-container relative z-10">
          <p className="section-label">About Us</p>
          <h1 className="section-title">The team behind MattersUrSkills</h1>
          <p className="text-neutral-400 text-sm mt-2 mb-8 max-w-lg">
            Students from KRMU building real-world solutions for India's skilled workforce.
          </p>
          <p className="section-label mb-5">Our Team</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {teamMembers.map((member, i) => (
              <div key={i} className="card-hover text-center p-5">
                <div className="w-20 h-20 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border border-surface-border"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=4F46E5&color=fff&bold=true`;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{member.name}</h3>
                <span className="badge-brand mb-2 inline-block">{member.role}</span>
                <a
                  href={`mailto:${member.email}`}
                  className="block text-xs text-neutral-500 hover:text-neutral-300 transition-colors truncate mt-1"
                >
                  {member.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-16"
        style={{
          background: 'linear-gradient(135deg, #7cbd67 0%, #629d51 55%, #8ec96a 100%)',
        }}
      >
        <div className="section-container">
          <div className="mb-10">
            <p className="text-white font-extrabold text-2xl sm:text-3xl leading-none mb-3">Our Purpose</p>
            <h2 className="section-title">Mission, vision and values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { accent: '#4F46E5', title: 'Our Mission',  text: "To connect India's skilled workforce with genuine work opportunities, eliminating fake job scams and predatory middlemen." },
              { accent: '#06B6D4', title: 'Our Vision',   text: 'A future where every skilled individual has equal access to work opportunities, regardless of background or location.' },
              { accent: '#10B981', title: 'Our Values',   text: 'Transparency, trust, and technology  three pillars that guide every product and business decision we make.' },
            ].map(({ accent, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-brand-300/35 bg-gradient-to-br from-brand-800/95 via-brand-700/94 to-brand-700/88 p-6 shadow-[0_10px_28px_rgba(20,34,14,0.35)] hover:scale-[1.02] hover:shadow-brand transition-all duration-300"
              >
                <div className="w-1.5 h-6 rounded-full mb-4" style={{ backgroundColor: accent }} />
                <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                <p className="text-sm text-white/85 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
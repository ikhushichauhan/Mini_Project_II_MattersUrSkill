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
    <div className="min-h-screen" style={{
      background: 'var(--bg-primary)',
      backdropFilter: 'blur(10px)'
    }}>

      <section className="relative pt-24 pb-16 border-b border-black">
        <div className="section-container">
          <p className="section-label font-rubik about-section-header" style={{ color: '#ffffff' }}>About Us</p>
          <h1 className="section-title font-rubik mb-4 about-section-header" style={{ color: '#ffffff' }}>The team behind MattersUrSkills</h1>
          <p className="text-gray-300 text-base mb-16 max-w-2xl font-inter" style={{ color: '#ffffff' }}>
            Students from KRMU building real-world solutions for India's skilled workforce.
          </p>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 font-rubik" style={{ color: '#ffffff' }}>Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {teamMembers.map((member, i) => (
                <div key={i} className="text-center group p-5 transition-all duration-200 hover:shadow-md about-team-card" style={{
                  background: '#000000'
                }}>
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-2 border-black group-hover:border-gray-400 transition-colors"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=000&color=fff&bold=true`;
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 font-rubik about-team-text" style={{ color: '#ffffff' }}>{member.name}</h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 font-inter" style={{ background: 'var(--bg-primary)', color: '#ffffff', border: '1px solid #6b7280' }}>{member.role}</span>
                  <a
                    href={`mailto:${member.email}`}
                    className="block text-xs transition-colors truncate mt-1 font-inter about-team-text"
                    style={{ color: '#ffffff' }}
                  >
                    {member.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black my-6"></div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--button-primary-bg)' }}>
        <div className="section-container">
          <div className="mb-10 text-center">
            <p className="text-black font-bold text-2xl sm:text-3xl leading-none mb-3 font-rubik">Our Purpose</p>
            <h2 className="text-lg text-gray-600 font-inter">Mission, vision and values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Our Mission',  text: "To connect India's skilled workforce with genuine work opportunities, eliminating fake job scams and predatory middlemen." },
              { title: 'Our Vision',   text: 'A future where every skilled individual has equal access to work opportunities, regardless of background or location.' },
              { title: 'Our Values',   text: 'Transparency, trust, and technology — three pillars that guide every product and business decision we make.' },
            ].map(({ title, text }) => (
              <div
                key={title}
                className="rounded-lg p-6 border transition-all duration-300 hover:shadow-md"
                style={{ background: 'var(--card-bg)', borderColor: '#000000' }}
              >
                <div className="w-1 h-8 rounded-full bg-black mb-4" />
                <h3 className="font-bold text-black text-base mb-3 font-rubik">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-inter">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

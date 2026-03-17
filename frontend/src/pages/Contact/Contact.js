import React, { useState } from 'react';

const faqs = [
  { q: 'How do I register on the platform?',     a: 'Click "Get Started" on the homepage and fill in your details. You must be 18 or older to register.' },
  { q: 'Is the platform free to use?',            a: 'Registration is free. We charge a small commission only when you successfully complete a job through our platform.' },
  { q: 'How are payments handled?',               a: 'We use an escrow-based payment system. Payments are released only when both parties are satisfied with the work.' },
  { q: 'How do I verify my account?',             a: 'After registration, verify your account via OTP sent to your phone number.' },
  { q: 'What if I face issues with a job?',       a: 'Report issues through the complaint section. Our admin team resolves matters within 2448 hours.' },
  { q: 'Can I work remotely?',                    a: 'Yes! Many jobs support remote work. You can filter jobs by location or select the "Remote" option.' },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', feedbackType: 'general' });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '', feedbackType: 'general' });
    }, 3000);
  };

  const contactCards = [
    { title: 'Email Us',  lines: ['support@mattersurskills.com', 'contact@mattersurskills.com'] },
    { title: 'Call Us',   lines: ['+91 98765 43210', '+91 98765 43211'] },
    { title: 'Visit Us',  lines: ['123 Tech Park, Cyber City', 'Gurugram, Haryana - 122001'] },
  ];

  const inputCls = 'input-field';

  return (
    <div className="min-h-screen bg-surface">

      <div className="bg-surface-card border-b border-surface-border pt-16">
        <div className="section-container py-10">
          <p className="section-label">Contact</p>
          <h1 className="section-title">Get in touch</h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-lg">
            Have questions? Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <section className="py-10 bg-surface-card">
        <div className="section-container">
          <div className="grid sm:grid-cols-3 gap-5">
            {contactCards.map(({ title, lines }) => (
              <div key={title} className="card p-5">
                <p className="font-semibold text-white text-sm mb-2">{title}</p>
                {lines.map((l) => <p key={l} className="text-xs text-neutral-400 leading-relaxed">{l}</p>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="section-container">
          <div className="max-w-2xl">
            <h2 className="font-bold text-white text-base mb-5">Send Us a Message</h2>

            {submitted && (
              <div className="text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-lg px-4 py-3 mb-5">
                Thank you for contacting us. We'll respond within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    required placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label className="label-text">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    required placeholder="you@example.com" className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                    required placeholder="How can we help?" className={inputCls} />
                </div>
                <div>
                  <label className="label-text">Type</label>
                  <select name="feedbackType" value={formData.feedbackType} onChange={handleInputChange} className={inputCls}>
                    <option value="general">General Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="support">Technical Support</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">Message</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange}
                  required rows={5} placeholder="Tell us more about your inquiry..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-14 bg-surface-card">
        <div className="section-container">
          <div className="max-w-2xl">
            <div className="mb-8">
              <p className="section-label">FAQs</p>
              <h2 className="section-title">Frequently asked questions</h2>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`card cursor-pointer border ${
                    activeFaq === i ? 'border-brand-500/30' : 'border-surface-border'
                  }`}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white text-sm">{faq.q}</p>
                    <span className={`text-brand-400 font-bold text-lg flex-shrink-0 leading-none transition-transform duration-150 ${
                      activeFaq === i ? 'rotate-45' : ''
                    }`}>+</span>
                  </div>
                  {activeFaq === i && (
                    <p className="mt-3 text-xs text-neutral-400 leading-relaxed border-t border-surface-border pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
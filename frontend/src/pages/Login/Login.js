import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifyOTP } from '../../api/authAPI';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, loginWithData, isAuthenticated, loading: authLoading } = useAuth();

  const [formType,   setFormType]   = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [regStep,    setRegStep]    = useState('details');
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');
  const [formData,   setFormData]   = useState({
    name: '', email: '', password: '', phone: '', dateOfBirth: '', profileImage: '',
  });

  const [otpCode,      setOtpCode]      = useState('');
  const [otpEmail,     setOtpEmail]     = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError,     setOtpError]     = useState('');
  const [devOTP,       setDevOTP]       = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please choose an image file for profile picture.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormError('');
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const switchForm = (type) => {
    setFormType(type); setFormError(''); setRegStep('details'); setOtpCode(''); setOtpError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setFormError(''); setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setFormError(err.message);
    } finally { setSubmitting(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setFormError('');
    const { name, email, password, phone, dateOfBirth, profileImage } = formData;
    if (!name || !email || !password || !phone || !dateOfBirth || !profileImage) {
      setFormError('Please fill in all fields'); return;
    }
    setSubmitting(true);
    try {
      const res = await register({
        name,
        email,
        password,
        phone,
        dateOfBirth,
        role: 'user',
        profileImage: profileImage || '',
      });
      if (res.pendingVerification) {
        setOtpEmail(res.email);
        if (res.devOTP) setDevOTP(res.devOTP);
        setRegStep('verify-otp');
      }
    } catch (err) {
      setFormError(err.message);
    } finally { setSubmitting(false); }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    if (otpCode.length !== 6) { setOtpError('Please enter the 6-digit OTP'); return; }
    setOtpVerifying(true);
    try {
      const res = await verifyOTP(formData.email, otpCode);
      loginWithData(res.data);
      navigate('/');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally { setOtpVerifying(false); }
  };

  const inputCls = 'input-field';
  const maxDOB   = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-20">

      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(135deg, rgba(9,13,9,0.84) 0%, rgba(13,19,11,0.72) 55%, rgba(9,13,9,0.84) 100%), url(/images/seventh.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.72,
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 25% 15%, rgba(78,125,62,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(31,45,23,0.28) 0%, transparent 50%)',
        }} />

        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '60vw', height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,189,103,0.22) 0%, rgba(78,125,62,0.10) 40%, transparent 70%)',
          filter: 'blur(48px)',
          animation: 'orbFloat1 20s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', top: '25%', right: '-12%',
          width: '45vw', height: '45vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(98,157,81,0.18) 0%, rgba(31,45,23,0.07) 50%, transparent 70%)',
          filter: 'blur(56px)',
          animation: 'orbFloat2 26s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', bottom: '-8%', left: '30%',
          width: '38vw', height: '38vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,189,103,0.15) 0%, transparent 65%)',
          filter: 'blur(40px)',
          animation: 'orbFloat3 17s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', top: '8%', right: '8%',
          width: '320px', height: '320px',
          borderRadius: '50%',
          border: '1px solid rgba(124,189,103,0.10)',
          animation: 'orbSpin 35s linear infinite',
        }} />
        <div style={{
          position: 'absolute', top: 'calc(8% + 30px)', right: 'calc(8% + 30px)',
          width: '260px', height: '260px',
          borderRadius: '50%',
          border: '1px solid rgba(124,189,103,0.06)',
          animation: 'orbSpin 25s linear infinite reverse',
        }} />

        <div style={{
          position: 'absolute', bottom: '10%', left: '6%',
          width: '220px', height: '220px',
          borderRadius: '50%',
          border: '1px solid rgba(124,189,103,0.08)',
          animation: 'orbSpin 28s linear infinite',
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(124,189,103,0.07) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          animation: 'dotPulse 9s ease-in-out infinite',
        }} />

        <div style={{
          position: 'absolute', top: 0, left: '-100%',
          width: '40%', height: '100%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(124,189,103,0.04) 50%, transparent 60%)',
          animation: 'shineBeam 12s ease-in-out infinite',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center">
            <img src="/images/logo.png" alt="MattersUrSkills" className="h-10 w-auto select-none" draggable="false" />
            <span className="text-xl font-extrabold tracking-tight text-white">MattersUrSkills</span>
          </Link>
          <p className="text-xs text-neutral-500 mt-2">
            {formType === 'login' ? 'Welcome back  sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        <div className="card-glass">

          <div className="tab-bar mb-6">
            <button onClick={() => switchForm('login')}    className={formType === 'login'    ? 'tab-item-active' : 'tab-item'}>Log in</button>
            <button onClick={() => switchForm('register')} className={formType === 'register' ? 'tab-item-active' : 'tab-item'}>Register</button>
          </div>

          {formType === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label-text">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  required placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className="label-text">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                  required placeholder="Enter your password" className={inputCls} />
              </div>
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-neutral-500 pt-1">
                No account?{' '}
                <button type="button" onClick={() => switchForm('register')} className="text-brand-400 hover:text-brand-300 font-semibold">
                  Register free
                </button>
              </p>
            </form>
          )}

          {formType === 'register' && regStep === 'details' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    required placeholder="Your full name" className={inputCls} />
                </div>
                <div>
                  <label className="label-text">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    required placeholder="you@example.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="label-text">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                  required placeholder="Minimum 6 characters" minLength={6} className={inputCls} />
              </div>
              <div>
                <label className="label-text">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  required placeholder="+91 98765 43210" className={inputCls} />
              </div>
              <div>
                <label className="label-text">Date of Birth <span className="font-normal normal-case text-neutral-500">(18+)</span></label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange}
                  required max={maxDOB} className={inputCls} />
              </div>
              <div>
                <label className="label-text">Profile Picture</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 accent-brand-500 flex-shrink-0" />
                <span className="text-xs text-neutral-400">I confirm I am 18 years or older and agree to the Terms of Service.</span>
              </label>
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Creating account...' : 'Create Account & Send OTP'}
              </button>
              <p className="text-center text-xs text-neutral-500">
                Have an account?{' '}
                <button type="button" onClick={() => switchForm('login')} className="text-brand-400 hover:text-brand-300 font-semibold">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {formType === 'register' && regStep === 'verify-otp' && (
            <div className="space-y-5">
              <div className="text-center pb-4 border-b border-surface-border">
                <p className="font-bold text-white text-base mb-1">Verify Your Email</p>
                <p className="text-xs text-neutral-400">
                  A 6-digit code was sent to{' '}
                  <span className="text-white font-semibold">{otpEmail}</span>
                </p>
              </div>
              {devOTP && (
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-4 text-center">
                  <p className="text-brand-300 text-xs font-semibold uppercase tracking-wide mb-2">
                    Dev Mode  Brevo not configured
                  </p>
                  <p className="text-white text-3xl font-black tracking-[14px]">{devOTP}</p>
                  <p className="text-neutral-500 text-xs mt-1.5">Visible in development only</p>
                </div>
              )}
              <div>
                <label className="label-text">Enter 6-digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="- - - - - -"
                  className="input-field text-center text-2xl font-black tracking-[14px]"
                  autoFocus
                />
              </div>
              {otpError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{otpError}</p>
              )}
              <button onClick={handleVerifyOTP} disabled={otpVerifying} className="btn-primary w-full">
                {otpVerifying ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>
              <button
                onClick={() => { setRegStep('details'); setOtpCode(''); setOtpError(''); }}
                className="w-full text-xs text-neutral-500 hover:text-white transition-colors text-center"
              >
                Go back and resend
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          <Link to="/" className="hover:text-neutral-400 transition-colors"> Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
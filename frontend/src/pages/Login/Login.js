import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifyOTP } from '../../api/authAPI';

const ROLE_OPTIONS = [
  {
    value: 'worker',
    label: 'Worker',
    description: 'Find jobs, showcase CVs, and apply to opportunities.',
  },
  {
    value: 'provider',
    label: 'Provider',
    description: 'Post jobs, review applicants, and manage hiring.',
  },
];

const WORKER_CATEGORY_OPTIONS = [
  { value: 'graduate',   label: 'Graduate' },
  { value: 'student',    label: 'Student' },
  { value: 'housewife',  label: 'Homemaker' },
  { value: 'unemployed', label: 'Searching for work' },
  { value: 'other',      label: 'Other' },
];

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
  const [roleChoice,   setRoleChoice]   = useState('worker');
  const [workerCategory, setWorkerCategory] = useState('graduate');

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
    setFormType(type);
    setFormError('');
    setRegStep('details');
    setOtpCode('');
    setOtpError('');
    setRoleChoice('worker');
    setWorkerCategory('graduate');
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
    if (!roleChoice) {
      setFormError('Please choose whether you are registering as a worker or provider.');
      return;
    }
    if (roleChoice === 'worker' && !workerCategory) {
      setFormError('Please select the worker category that fits you best.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        email,
        password,
        phone,
        dateOfBirth,
        role: roleChoice,
        profileImage: profileImage || '',
      };

      if (roleChoice === 'worker') {
        payload.category = workerCategory;
      }

      const res = await register({
        ...payload,
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
    <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{
      background: 'var(--bg-primary)'
    }}>



      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center">
            <img src="/images/logo.png" alt="MattersUrSkills" className="h-10 w-auto select-none" draggable="false" />
            <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>MattersUrSkills</span>
          </Link>
        </div>

        <div className="rounded-lg p-8" style={{
          background: 'var(--button-primary-bg)',
          border: '1px solid rgba(0, 0, 0, 0.3)'
        }}>

          {formType === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label-text text-black">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  required placeholder="you@example.com" className="input-field text-black placeholder-gray-400" />
              </div>
              <div>
                <label className="label-text text-black">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                  required placeholder="Enter your password" className="input-field text-black placeholder-gray-400" />
              </div>
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>
              )}
              <button type="submit" disabled={submitting} className="w-full mt-2" style={{
                background: 'var(--button-primary-bg)',
                border: '1px solid black',
                color: 'black',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-black pt-1">
                No account?{' '}
                <button type="button" onClick={() => switchForm('register')} className="text-black hover:text-gray-600 font-semibold">
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
              <div>
                <label className="label-text">Choose Account Type</label>
                <div className="grid sm:grid-cols-2 gap-3 mt-1">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setRoleChoice(option.value)}
                      className={`text-left rounded-2xl border px-4 py-3 transition-colors ${
                        roleChoice === option.value
                          ? 'border-black text-white'
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                      style={{
                        background: roleChoice === option.value ? 'var(--bg-primary)' : 'transparent'
                      }}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              {roleChoice === 'worker' && (
                <div>
                  <label className="label-text">Worker Category</label>
                  <select
                    className={inputCls}
                    value={workerCategory}
                    onChange={(e) => setWorkerCategory(e.target.value)}
                  >
                    {WORKER_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 accent-black flex-shrink-0" />
                <span className="text-xs text-black">I confirm I am 18 years or older and agree to the Terms of Service.</span>
              </label>
              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{formError}</p>
              )}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Creating account...' : 'Create Account & Send OTP'}
              </button>
              <p className="text-center text-xs text-black">
                Have an account?{' '}
                <button type="button" onClick={() => switchForm('login')} className="text-black hover:text-gray-600 font-semibold">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {formType === 'register' && regStep === 'verify-otp' && (
            <div className="space-y-5">
              <div className="text-center pb-4 border-b border-gray-300">
                <p className="font-bold text-black text-base mb-1">Verify Your Email</p>
                <p className="text-xs text-black">
                  A 6-digit code was sent to{' '}
                  <span className="text-black font-semibold">{otpEmail}</span>
                </p>
              </div>
              {devOTP && (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-black text-xs font-semibold uppercase tracking-wide mb-2">
                    Dev Mode — Brevo not configured
                  </p>
                  <p className="text-black text-3xl font-black tracking-[14px]">{devOTP}</p>
                  <p className="text-black text-xs mt-1.5">Visible in development only</p>
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
                className="w-full text-xs text-black hover:text-gray-600 transition-colors text-center"
              >
                Go back and resend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
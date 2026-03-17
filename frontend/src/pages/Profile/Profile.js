import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/authAPI';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
};

const buildFormData = (sourceUser) => ({
  name: sourceUser?.name || '',
  phone: sourceUser?.phone || '',
  profileImage: sourceUser?.profileImage || '',
  city: sourceUser?.location?.city || '',
  state: sourceUser?.location?.state || '',
  pincode: sourceUser?.location?.pincode || '',
  skills: Array.isArray(sourceUser?.skills)
    ? sourceUser.skills.join(', ')
    : sourceUser?.skills || '',
  bio: sourceUser?.bio || '',
  isAvailable: sourceUser?.availability?.isAvailable ?? true,
});

const SectionCard = ({ title, action, children }) => (
  <section className="rounded-2xl border border-brand-500/35 bg-brand-500/10 shadow-inner-brand overflow-hidden">
    <header className="flex items-center justify-between px-5 py-4 border-b border-brand-500/25 bg-brand-500/10">
      <h2 className="text-sm uppercase tracking-wider font-bold text-white">{title}</h2>
      {action}
    </header>
    <div className="px-5 py-4">{children}</div>
  </section>
);

const FieldRow = ({ label, children, last = false }) => (
  <div className={`grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-5 py-3 ${last ? '' : 'border-b border-brand-500/20'}`}>
    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
    <div className="text-sm text-neutral-200">{children}</div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, loginWithData, logout } = useAuth();
  const avatarInputRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [formData, setFormData] = useState(buildFormData(null));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(buildFormData(user));
    }
  }, [user]);

  useEffect(() => {
    if (!saveMsg.includes('successfully')) return undefined;

    const timeoutId = setTimeout(() => {
      setSaveMsg('');
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [saveMsg]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSaveMsg('Please choose a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSaveMsg('');
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleAvatarButtonClick = () => {
    if (!editMode) {
      setEditMode(true);
    }
    setSaveMsg('');
    avatarInputRef.current?.click();
  };

  const handleCancel = () => {
    if (user) {
      setFormData(buildFormData(user));
    }
    setEditMode(false);
    setSaveMsg('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setSaveMsg('Full name is required.');
      return;
    }

    setSaving(true);
    setSaveMsg('');

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        profileImage: formData.profileImage || '',
        bio: formData.bio.trim(),
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        location: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        availability: {
          ...(user?.availability || {}),
          isAvailable: formData.isAvailable,
        },
      };

      const res = await updateProfile(payload);
      loginWithData({ ...res.data, token: localStorage.getItem('token') });
      setSaveMsg('Profile updated successfully.');
      setEditMode(false);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || !user) return null;

  const initials =
    user.name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  const roleLabel = user.role
    ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`
    : 'Member';

  const rating = Number(user.ratings?.average || 0);
  const completedJobs = Number(user.completedJobs || 0);
  const availabilityText = formData.isAvailable ? 'Available for work' : 'Busy';

  const skillsList = formData.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const cityLocation = [formData.city, formData.state].filter(Boolean).join(', ') || 'Not added';
  const fullAddress = [formData.city, formData.state, formData.pincode].filter(Boolean).join(', ') || 'Not added';

  return (
    <div className="min-h-screen bg-surface pt-20 pb-14">
      <div className="section-container">
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
          <motion.section variants={cardVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700/95 via-brand-600/90 to-brand-500/85 shadow-brand p-6 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-300/15 blur-3xl"
                animate={{ x: [0, 38, 0], y: [0, 22, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
                animate={{ x: [0, -40, 0], y: [0, -26, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-0 left-0 h-full w-28 bg-gradient-to-r from-transparent via-brand-200/10 to-transparent"
                animate={{ x: [-90, 1180] }}
                transition={{ duration: 9, repeat: Infinity, repeatDelay: 1, ease: 'linear' }}
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-brand-500/40 bg-surface-hover flex items-center justify-center">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt={formData.name || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-white">{initials}</span>
                  )}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarButtonClick}
                  className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-500/40 bg-surface text-brand-300 shadow-sm transition-colors hover:bg-surface-hover hover:text-brand-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M5 7h2l1.3-2h7.4L17 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className="sr-only">Change profile photo</span>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
                  {formData.name || 'Profile'}
                </h1>
                <p className="text-sm text-brand-100/90 mt-1 truncate">{user.email}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="badge-brand capitalize">{roleLabel}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      formData.isAvailable
                        ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    {availabilityText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!editMode ? (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setSaveMsg('');
                    }}
                    className="btn-outline text-sm !text-white !border-white font-bold"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={handleCancel} className="btn-ghost text-sm">
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={handleLogout} className="btn-ghost text-sm !text-white font-bold">
                  Log out
                </button>
              </div>
            </div>

            {saveMsg && (
              <p className={`relative z-10 mt-4 text-sm ${saveMsg.includes('successfully') ? 'text-brand-300' : 'text-red-400'}`}>
                {saveMsg}
              </p>
            )}
          </motion.section>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div variants={cardVariants} className="lg:col-span-2">
              <SectionCard title="User Information">
                <FieldRow label="Full Name">
                  {editMode ? (
                    <input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input-field"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <span className="text-white">{formData.name || 'Not added'}</span>
                  )}
                </FieldRow>

                <FieldRow label="Email Address">
                  <span className="text-white">{user.email || 'Not added'}</span>
                </FieldRow>

                <FieldRow label="Phone Number">
                  {editMode ? (
                    <input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  ) : (
                    <span>{formData.phone || 'Not added'}</span>
                  )}
                </FieldRow>

                <FieldRow label="City / Location">
                  {editMode ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="input-field"
                        placeholder="City"
                      />
                      <input
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="input-field"
                        placeholder="State"
                      />
                    </div>
                  ) : (
                    <span>{cityLocation}</span>
                  )}
                </FieldRow>

                <FieldRow label="Full Address">
                  {editMode ? (
                    <div className="space-y-2">
                      <input
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="input-field"
                        placeholder="Pincode"
                      />
                      <p className="text-xs text-neutral-500">Preview: {fullAddress}</p>
                    </div>
                  ) : (
                    <span>{fullAddress}</span>
                  )}
                </FieldRow>

                <FieldRow label="Skills">
                  {editMode ? (
                    <div>
                      <input
                        value={formData.skills}
                        onChange={(e) => handleInputChange('skills', e.target.value)}
                        className="input-field"
                        placeholder="Plumbing, Carpentry, Electrical"
                      />
                      <p className="text-xs text-neutral-500 mt-1.5">Use commas to separate each skill.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsList.length > 0 ? (
                        skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-full border border-brand-500/25 bg-brand-500/10 text-brand-300 text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-500">Not added</span>
                      )}
                    </div>
                  )}
                </FieldRow>

                <FieldRow label="Short Bio / About" last>
                  {editMode ? (
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="input-field resize-none"
                      placeholder="Write a short professional summary"
                    />
                  ) : (
                    <p className="leading-relaxed text-neutral-300">{formData.bio || 'Not added'}</p>
                  )}
                </FieldRow>
              </SectionCard>
            </motion.div>

            <div className="space-y-6">
              <motion.div variants={cardVariants}>
                <SectionCard title="Work Information">
                  <FieldRow label="Availability Status">
                    {editMode ? (
                      <button
                        type="button"
                        onClick={() => handleInputChange('isAvailable', !formData.isAvailable)}
                        className={`inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                          formData.isAvailable
                            ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                        }`}
                      >
                        {availabilityText}
                      </button>
                    ) : (
                      <span>{availabilityText}</span>
                    )}
                  </FieldRow>

                  <FieldRow label="Rating">
                    <span className="text-white font-semibold">{rating.toFixed(1)} / 5</span>
                  </FieldRow>

                  <FieldRow label="Completed Jobs Count" last>
                    <span className="text-white font-semibold">{completedJobs}</span>
                  </FieldRow>
                </SectionCard>
              </motion.div>

              <motion.div variants={cardVariants}>
                <SectionCard title="Contact">
                  <FieldRow label="Phone">
                    {formData.phone ? (
                      <a href={`tel:${formData.phone}`} className="text-brand-300 hover:text-brand-200 transition-colors">
                        {formData.phone}
                      </a>
                    ) : (
                      <span className="text-neutral-500">Not added</span>
                    )}
                  </FieldRow>

                  <FieldRow label="Email" last>
                    <a href={`mailto:${user.email}`} className="text-brand-300 hover:text-brand-200 transition-colors break-all">
                      {user.email}
                    </a>
                  </FieldRow>
                </SectionCard>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
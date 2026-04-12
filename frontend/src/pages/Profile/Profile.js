import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/authAPI';
import {
  getWorkerProfile as fetchWorkerProfile,
  updateWorkerProfile as updateWorkerCareer,
} from '../../api/workerAPI';

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

const CV_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const CV_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const blankExperience = () => ({
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
});

const buildCareerFormData = (workerProfile) => ({
  isGraduate: workerProfile?.isGraduate ?? false,
  cv: workerProfile?.cv || null,
  workExperience: Array.isArray(workerProfile?.workExperience)
    ? workerProfile.workExperience.map((exp) => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        currentlyWorking: Boolean(exp.currentlyWorking),
        description: exp.description || '',
      }))
    : [],
});

const parseSkillsList = (skills) =>
  String(skills || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const buildWorkerPayload = (form) => {
  const experiences = (form?.workExperience || [])
    .map((exp) => ({
      title: exp.title?.trim() || '',
      company: exp.company?.trim() || '',
      location: exp.location?.trim() || '',
      startDate: exp.startDate?.trim() || '',
      endDate: exp.currentlyWorking ? 'Present' : exp.endDate?.trim() || '',
      currentlyWorking: Boolean(exp.currentlyWorking),
      description: exp.description?.trim() || '',
    }))
    .filter((exp) => exp.title || exp.company || exp.description);

  return {
    skills: parseSkillsList(form?.skills),
    isGraduate: Boolean(form?.isGraduate),
    workExperience: experiences,
    cv: form?.isGraduate ? form?.cv || null : null,
  };
};

const SectionCard = ({ title, action, children }) => (
  <section className="rounded-md border overflow-hidden shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderColor: user?.role === 'admin' ? '#9ca3af' : '#ffffff' }}>
    <header className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)' }}>
      <h2 className="text-sm uppercase tracking-wider font-bold" style={{ color: '#ffffff' }}>{title}</h2>
      {action}
    </header>
    <div className="px-5 py-4">{children}</div>
  </section>
);

const FieldRow = ({ label, children, last = false }) => (
  <div className={`grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-5 py-3 ${last ? '' : 'border-b border-gray-200'}`}>
    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ffffff' }}>{label}</p>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, loginWithData, logout } = useAuth();
  const avatarInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [formData, setFormData] = useState(buildFormData(null));
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerForm, setWorkerForm] = useState(buildCareerFormData(null));
  const [loadingWorkerProfile, setLoadingWorkerProfile] = useState(false);
  const [workerError, setWorkerError] = useState('');

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
    if (!user || user.role !== 'worker') {
      setWorkerProfile(null);
      setWorkerForm(buildCareerFormData(null));
      return undefined;
    }

    let ignore = false;

    const loadWorkerProfile = async () => {
      setLoadingWorkerProfile(true);
      setWorkerError('');
      try {
        const data = await fetchWorkerProfile();
        if (!ignore) {
          setWorkerProfile(data);
          setWorkerForm(buildCareerFormData(data));
        }
      } catch (err) {
        if (!ignore) {
          setWorkerError(err.response?.data?.message || 'Failed to load worker profile.');
        }
      } finally {
        if (!ignore) {
          setLoadingWorkerProfile(false);
        }
      }
    };

    loadWorkerProfile();

    return () => {
      ignore = true;
    };
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

  const toggleGraduateStatus = () => {
    setWorkerForm((prev) => ({
      ...prev,
      isGraduate: !prev.isGraduate,
      cv: prev.isGraduate ? null : prev.cv,
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setWorkerForm((prev) => {
      const nextExperiences = [...(prev.workExperience || [])];
      nextExperiences[index] = {
        ...nextExperiences[index],
        [field]: field === 'currentlyWorking' ? Boolean(value) : value,
      };
      if (field === 'currentlyWorking' && value) {
        nextExperiences[index].endDate = '';
      }
      return { ...prev, workExperience: nextExperiences };
    });
  };

  const handleAddExperience = () => {
    setWorkerForm((prev) => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), blankExperience()],
    }));
  };

  const handleRemoveExperience = (index) => {
    setWorkerForm((prev) => {
      const nextExperiences = [...(prev.workExperience || [])];
      nextExperiences.splice(index, 1);
      return { ...prev, workExperience: nextExperiences };
    });
  };

  const handleCvInputChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!CV_ALLOWED_TYPES.includes(file.type)) {
      setSaveMsg('Only PDF or Word documents are supported for CV upload.');
      event.target.value = '';
      return;
    }

    if (file.size > CV_MAX_BYTES) {
      setSaveMsg('CV file size must be under 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setWorkerForm((prev) => ({
        ...prev,
        cv: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: reader.result,
          uploadedAt: new Date().toISOString(),
        },
      }));
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleCvButtonClick = () => {
    if (!workerForm.isGraduate) {
      setSaveMsg('Enable graduate status to upload a CV.');
      return;
    }
    if (!editMode) {
      setEditMode(true);
    }
    setSaveMsg('');
    cvInputRef.current?.click();
  };

  const handleCvRemove = () => {
    setWorkerForm((prev) => ({ ...prev, cv: null }));
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
    if (workerProfile) {
      setWorkerForm(buildCareerFormData(workerProfile));
    } else {
      setWorkerForm(buildCareerFormData(null));
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
    const isWorker = user?.role === 'worker';
    const workerPayload = isWorker ? buildWorkerPayload(workerForm) : null;

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

      if (isWorker) {
        const updatedWorker = await updateWorkerCareer(workerPayload);
        setWorkerProfile(updatedWorker);
        setWorkerForm(buildCareerFormData(updatedWorker));
      }

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
  const availabilityText = (() => {
    if (user.role === 'provider') {
      return formData.isAvailable ? 'Hiring workers' : 'Not hiring currently';
    }
    return formData.isAvailable ? 'Available for work' : 'Busy';
  })();

  const skillsList = formData.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const cityLocation = [formData.city, formData.state].filter(Boolean).join(', ') || 'Not added';
  const fullAddress = [formData.city, formData.state, formData.pincode].filter(Boolean).join(', ') || 'Not added';

  return (
    <div className="min-h-screen pt-20 pb-14" style={{ background: 'var(--bg-primary)' }}>
      <div className="section-container">
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="space-y-6">
          <motion.section variants={cardVariants} className="relative overflow-hidden rounded-md shadow-md profile-header-sparkle">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5" style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center" style={{ borderColor: '#000000', background: 'var(--bg-primary)' }}>
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
                  className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors"
                  style={{ borderColor: '#000000', background: 'var(--card-bg)', color: '#000000' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M5 7h2l1.3-2h7.4L17 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className="sr-only">Change profile photo</span>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate" style={{ color: '#000000' }}>
                  {formData.name || 'Profile'}
                </h1>
                <p className="text-sm mt-1 truncate" style={{ color: '#000000' }}>{user.email}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-semibold capitalize" style={{ color: '#000000' }}>{roleLabel}</span>
                  {user.role !== 'admin' && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border`}
                      style={{
                        color: formData.isAvailable ? '#ffffff' : '#000000',
                        borderColor: '#000000',
                        background: formData.isAvailable ? 'var(--bg-primary)' : '#fbbf24'
                      }}
                    >
                      {availabilityText}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!editMode ? (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setSaveMsg('');
                    }}
                    className="px-4 py-2 text-sm font-medium border rounded-md transition-colors"
                    style={{ borderColor: '#000000', color: '#000000', background: 'transparent', display: user.role === 'admin' ? 'none' : 'block' }}
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
                <button onClick={handleLogout} className="btn-ghost text-sm" style={{ color: '#000000', fontWeight: 'bold' }}>
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
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={cardVariants}>
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
                      <span style={{ color: '#ffffff' }}>{formData.name || 'Not added'}</span>
                    )}
                  </FieldRow>

                  <FieldRow label="Email Address">
                    <span style={{ color: '#ffffff' }}>{user.email || 'Not added'}</span>
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
                      <span style={{ color: '#ffffff' }}>{formData.phone || 'Not added'}</span>
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
                      <span style={{ color: '#ffffff' }}>{cityLocation}</span>
                    )}
                  </FieldRow>

                  {user.role !== 'admin' && (
                    <>
                      <FieldRow label="Full Address">
                        {editMode ? (
                          <div className="space-y-2">
                            <input
                              value={formData.pincode}
                              onChange={(e) => handleInputChange('pincode', e.target.value)}
                              className="input-field text-black placeholder-gray-500"
                              placeholder="Pincode"
                            />
                            <p className="text-xs text-gray-500">Preview: {fullAddress}</p>
                          </div>
                        ) : (
                          <span style={{ color: '#ffffff' }}>{fullAddress}</span>
                        )}
                      </FieldRow>

                      <FieldRow label="Skills">
                        {editMode ? (
                          <div>
                            <input
                              value={formData.skills}
                              onChange={(e) => handleInputChange('skills', e.target.value)}
                              className="input-field text-black placeholder-gray-500"
                              placeholder="Plumbing, Carpentry, Electrical"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">Use commas to separate each skill.</p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {skillsList.length > 0 ? (
                              skillsList.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 rounded-full border border-gray-300 bg-gray-100 text-gray-700 text-xs font-semibold"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">Not added</span>
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
                            className="input-field resize-none text-black placeholder-gray-500"
                            placeholder="Write a short professional summary"
                          />
                        ) : (
                          <p className="leading-relaxed" style={{ color: '#ffffff' }}>{formData.bio || 'Not added'}</p>
                        )}
                      </FieldRow>
                    </>
                  )}
                  
                  {user.role === 'provider' && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate('/applicants')}
                        className="btn-primary w-full"
                      >
                        View Applicants Details
                      </button>
                    </div>
                  )}
                </SectionCard>
              </motion.div>

              {user.role === 'worker' && (
                <motion.div variants={cardVariants}>
                  <SectionCard title="Career Portfolio">
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept={CV_ALLOWED_TYPES.join(',')}
                      onChange={handleCvInputChange}
                      className="hidden"
                    />

                    {workerError && (
                      <p className="text-xs text-red-400 mb-4">{workerError}</p>
                    )}

                    {loadingWorkerProfile ? (
                      <div className="py-6 text-sm text-neutral-400">Loading worker portfolio...</div>
                    ) : (
                      <>
                        <FieldRow label="Graduate Status">
                          {editMode ? (
                            <button
                              type="button"
                              onClick={toggleGraduateStatus}
                              className={`inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                                workerForm.isGraduate
                                  ? 'text-brand-300 border-brand-400/40 bg-brand-400/10'
                                  : 'text-neutral-300 border-neutral-600/60 bg-neutral-700/30'
                              }`}
                            >
                              {workerForm.isGraduate ? 'Graduate (CV enabled)' : 'Non-graduate'}
                            </button>
                          ) : (
                            <span style={{ color: '#ffffff' }}>{workerForm.isGraduate ? 'Graduate' : 'Non-graduate'}</span>
                          )}
                        </FieldRow>

                        <FieldRow label="Resume / CV">
                          {!workerForm.isGraduate ? (
                            <div className="text-sm text-gray-600">
                              <p>Mark yourself as a graduate to enable CV uploads.</p>
                              <p className="text-[11px] text-gray-500 mt-1.5">Use the toggle above and save to unlock this slot.</p>
                            </div>
                          ) : workerForm.cv ? (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>{workerForm.cv.fileName}</p>
                              <p className="text-xs text-gray-600">
                                {workerForm.cv.fileSize
                                  ? `${(workerForm.cv.fileSize / 1024).toFixed(1)} KB`
                                  : 'Size unavailable'}
                                {workerForm.cv.uploadedAt
                                  ? ` • Uploaded ${new Date(workerForm.cv.uploadedAt).toLocaleDateString()}`
                                  : ''}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={workerForm.cv.fileData}
                                  download={workerForm.cv.fileName || 'cv'}
                                  className="btn-outline text-xs"
                                >
                                  Download CV
                                </a>
                                <>
                                  <button type="button" onClick={handleCvButtonClick} className="btn-primary text-xs">
                                    {editMode ? 'Replace CV' : 'Replace CV (edit mode)'}
                                  </button>
                                  {editMode && (
                                    <button type="button" onClick={handleCvRemove} className="btn-ghost text-xs">
                                      Remove
                                    </button>
                                  )}
                                </>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              <p>No CV uploaded yet.</p>
                              <>
                                <button type="button" onClick={handleCvButtonClick} className="btn-outline text-xs mt-3">
                                  {editMode ? 'Upload CV' : 'Add CV (enter edit mode)'}
                                </button>
                                <p className="text-[11px] text-gray-500 mt-2">PDF or Word documents, up to 2 MB.</p>
                              </>
                            </div>
                          )}
                        </FieldRow>

                        <FieldRow label="Work Experience" last>
                          {workerForm.workExperience.length > 0 ? (
                            editMode ? (
                              <div className="space-y-4">
                                {workerForm.workExperience.map((exp, index) => (
                                  <div
                                    key={`${exp.title || 'experience'}-${index}`}
                                    className="rounded-2xl border border-brand-500/25 bg-brand-500/5 p-4 space-y-3"
                                  >
                                    <input
                                      value={exp.title}
                                      onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                      className="input-field"
                                      placeholder="Role / Position"
                                    />
                                    <input
                                      value={exp.company}
                                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                      className="input-field"
                                      placeholder="Company / Client"
                                    />
                                    <input
                                      value={exp.location}
                                      onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                                      className="input-field"
                                      placeholder="Location (optional)"
                                    />
                                    <div className="grid sm:grid-cols-2 gap-3">
                                      <input
                                        value={exp.startDate}
                                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                        className="input-field"
                                        placeholder="Start (e.g., Jan 2023)"
                                      />
                                      <input
                                        value={exp.endDate}
                                        onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                        className="input-field"
                                        placeholder="End (e.g., Dec 2023)"
                                        disabled={exp.currentlyWorking}
                                      />
                                    </div>
                                    <textarea
                                      rows={3}
                                      value={exp.description}
                                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                      className="input-field resize-none"
                                      placeholder="Key responsibilities or achievements"
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <button
                                        type="button"
                                        onClick={() => handleExperienceChange(index, 'currentlyWorking', !exp.currentlyWorking)}
                                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                                          exp.currentlyWorking
                                            ? 'text-brand-200 border-brand-500/40 bg-brand-500/10'
                                            : 'text-neutral-300 border-neutral-600/60 bg-neutral-700/30'
                                        }`}
                                      >
                                        {exp.currentlyWorking ? 'Marked as current role' : 'Mark as current role'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExperience(index)}
                                        className="text-xs text-red-300 hover:text-red-200"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {workerForm.workExperience.map((exp, index) => (
                                  <div key={`exp-${index}`} className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4">
                                    <p className="text-sm font-semibold text-white">{exp.title || 'Role not provided'}</p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                      {[exp.company, exp.location].filter(Boolean).join(' • ') || 'Organisation details pending'}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                      {[exp.startDate || 'Start', exp.endDate || 'End'].filter(Boolean).join(' — ')}
                                    </p>
                                    {exp.description && (
                                      <p className="text-sm text-neutral-200 mt-2 leading-relaxed">{exp.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <p className="text-sm text-gray-600">
                              {editMode
                                ? 'Add your work experience so providers can match you to relevant jobs.'
                                : 'No work experience added yet.'}
                            </p>
                          )}

                          {editMode && (
                            <button type="button" onClick={handleAddExperience} className="btn-outline text-xs mt-3">
                              Add experience
                            </button>
                          )}
                        </FieldRow>
                      </>
                    )}
                  </SectionCard>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              {user.role !== 'admin' && (
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
                        <span style={{ color: '#ffffff' }}>{availabilityText}</span>
                      )}
                    </FieldRow>

                    <FieldRow label="Rating">
                      <span className="font-semibold" style={{ color: '#ffffff' }}>{rating.toFixed(1)} / 5</span>
                    </FieldRow>

                    <FieldRow label="Completed Jobs Count" last>
                      <span className="font-semibold" style={{ color: '#ffffff' }}>{completedJobs}</span>
                    </FieldRow>
                  </SectionCard>
                </motion.div>
              )}

              <motion.div variants={cardVariants}>
                <SectionCard title="Contact">
                  <FieldRow label="Phone">
                    {formData.phone ? (
                      <a href={`tel:${formData.phone}`} className="transition-colors" style={{ color: '#ffffff' }}>
                        {formData.phone}
                      </a>
                    ) : (
                      <span className="text-gray-500">Not added</span>
                    )}
                  </FieldRow>

                  <FieldRow label="Email" last>
                    <a href={`mailto:${user.email}`} className="transition-colors break-all" style={{ color: '#ffffff' }}>
                      {user.email}
                    </a>
                  </FieldRow>
                  
                  {user.role === 'worker' && (
                    <div className="pt-4 border-t border-brand-500/20">
                      <button
                        onClick={() => navigate('/work-history')}
                        className="btn-primary w-full"
                      >
                        View Work History
                      </button>
                    </div>
                  )}
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
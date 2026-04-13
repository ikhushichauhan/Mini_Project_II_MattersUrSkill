import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createTask, getMyPostedTasks } from '../../api/taskAPI';

const CATEGORIES = [
  { value: 'home-based',    label: 'Home-Based' },
  { value: 'part-time',     label: 'Part-Time' },
  { value: 'freelance',     label: 'Freelancing' },
  { value: 'local-service', label: 'Local Services' },
  { value: 'internship',    label: 'Internship' },
];

const STATUS_MAP = {
  open:       'badge-active',
  closed:     'badge-closed',
  'in-progress':'badge-brand',
  pending:    'badge-pending',
};

const EMPHASIS_CARD = 'rounded border border-gray-300 shadow-md';
const EMPHASIS_CARD_HOVER = `${EMPHASIS_CARD} hover:scale-[1.01] hover:shadow-lg transition-all duration-300`;

const Provider = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    jobTitle: '', category: 'home-based', description: '',
    location: '', duration: '', payment: '', skills: '', workType: 'full-time',
  });
  const [postedJobs,  setPostedJobs]  = useState([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      setLoadingJobs(true);
      try { const r = await getMyPostedTasks(); setPostedJobs(r.data || []); }
      catch {}
      finally { setLoadingJobs(false); }
    };
    fetch();
  }, [isAuthenticated]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setSubmitting(true);
    try {
      const dp  = formData.duration.trim().split(' ');
      const res = await createTask({
        title:       formData.jobTitle,
        category:    formData.category,
        description: formData.description,
        location:    { city: formData.location, isRemote: formData.location.toLowerCase() === 'remote' },
        duration:    { value: parseInt(dp[0]) || 1, unit: ['hours','days','weeks','months'].includes(dp[1]?.toLowerCase()) ? dp[1].toLowerCase() : 'days' },
        budget:      { amount: parseFloat(formData.payment.replace(/[^0-9.]/g, '')) || 0, currency: 'INR', type: 'fixed' },
        skillsRequired: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setPostedJobs((p) => [res.data, ...p]);
      setFormSuccess('Task posted successfully. Workers can now apply.');
      setFormData({ jobTitle: '', category: 'home-based', description: '', location: '', duration: '', payment: '', skills: '', workType: 'full-time' });
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to post task');
    } finally { setSubmitting(false); }
  };

  const inputCls = 'input-field text-black placeholder-gray-500';

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--button-primary-bg)' }}>

      <div className="py-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="section-container">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Post a Job & Find the Right Talent</h1>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          <aside className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-black text-base">Your Posted Jobs</h2>
              {!loadingJobs && (
                <span className="text-xs text-black">{postedJobs.length} total</span>
              )}
            </div>

            {!isAuthenticated && (
              <div className={`${EMPHASIS_CARD} p-5 text-center`}>
                <p className="text-sm text-black mb-3">Sign in to view your posted jobs.</p>
              </div>
            )}

            {isAuthenticated && loadingJobs && (
              <div className="flex justify-center py-10">
                <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {isAuthenticated && !loadingJobs && postedJobs.length === 0 && (
              <div className={`${EMPHASIS_CARD} p-6 text-center`}>
                <p className="text-sm font-semibold text-black mb-1">No jobs posted yet</p>
                <p className="text-xs text-gray-600">Use the form to create your first listing.</p>
              </div>
            )}

            <div className="space-y-3">
              {postedJobs.map((job) => {
                const statusKey = job.status || 'open';
                return (
                  <div key={job._id} className={`${EMPHASIS_CARD_HOVER} p-4`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-black text-sm leading-snug">{job.title}</p>
                      <span className={STATUS_MAP[statusKey] || 'badge-closed'}>
                        {statusKey}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-black">
                      {job.budget?.amount > 0 && (
                        <span className="text-black font-semibold">
                          &#8377;{job.budget.amount}
                        </span>
                      )}
                      {job.location?.city && <span>{job.location.city}</span>}
                      {job.category && <span className="capitalize">{job.category}</span>}
                    </div>
                    {job.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.skillsRequired.slice(0, 3).map((s) => (
                          <span key={s} className="badge-closed text-black text-xs">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
                      <p className="text-xs text-black">
                        {Array.isArray(job.applications) && job.applications.length > 0
                          ? `${job.applications.length} application${job.applications.length !== 1 ? 's' : ''}`
                          : 'No applications yet'}
                      </p>
                      <button
                        onClick={() => navigate(`/job/${job._id}`)}
                        className="rounded-full bg-black text-white px-5 py-2 text-xs font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="lg:col-span-3">
            <h2 className="font-bold text-black text-base mb-5">Create a New Listing</h2>
            <form onSubmit={handleSubmit} className={`${EMPHASIS_CARD} space-y-5 p-6 sm:p-7`}>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Job Title</label>
                  <input
                    type="text" name="jobTitle" value={formData.jobTitle}
                    onChange={handleInputChange} required
                    placeholder="e.g. Content Writer"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="label-text">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={inputCls}>
                    {CATEGORIES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-text">Description</label>
                <textarea
                  name="description" value={formData.description}
                  onChange={handleInputChange} required
                  rows={4} placeholder="Describe the work, requirements, and expectations..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Location</label>
                  <input
                    type="text" name="location" value={formData.location}
                    onChange={handleInputChange} required
                    placeholder='City or "Remote"'
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="label-text">Duration</label>
                  <input
                    type="text" name="duration" value={formData.duration}
                    onChange={handleInputChange} required
                    placeholder="e.g. 2 months"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Budget (INR)</label>
                  <input
                    type="text" name="payment" value={formData.payment}
                    onChange={handleInputChange} required
                    placeholder="e.g. 15000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="label-text">Work Type</label>
                  <select name="workType" value={formData.workType} onChange={handleInputChange} className={inputCls}>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-text text-black">Skills Required
                  <span className="normal-case font-normal text-gray-500 ml-1">(comma-separated)</span>
                </label>
                <input
                  type="text" name="skills" value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g. Communication, MS Excel, Driving"
                  className={inputCls}
                />
              </div>

              {formError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2">
                  {formSuccess}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ jobTitle: '', category: 'home-based', description: '', location: '', duration: '', payment: '', skills: '', workType: 'full-time' })}
                  className="btn-ghost text-sm"
                >
                  Clear
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Provider;
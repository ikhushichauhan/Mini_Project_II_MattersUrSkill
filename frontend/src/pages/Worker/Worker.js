import React, { useState, useEffect, useMemo } from 'react';
import { getRelevantAndAllJobs, applyForTask, getMyApplications } from '../../api/taskAPI';
import { getWorkerProfile as fetchWorkerProfile } from '../../api/workerAPI';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { value: 'all',           label: 'All Categories' },
  { value: 'home-based',    label: 'Home-Based' },
  { value: 'part-time',     label: 'Part-Time' },
  { value: 'freelance',     label: 'Freelancing' },
  { value: 'local-service', label: 'Local Services' },
];

const EMPHASIS_CARD = 'rounded border border-gray-300 shadow-md';
const EMPHASIS_CARD_HOVER = `${EMPHASIS_CARD} hover:scale-[1.01] hover:shadow-lg transition-all duration-300`;

const INITIAL_APPLY_FORM = {
  message: '',
  availabilityDate: '',
  availabilityHours: '',
  expectedRateAmount: '',
  expectedRateType: 'fixed',
  expectedRateCurrency: 'INR',
  portfolioLink: '',
};

const APPLY_INPUT_CLASS = 'w-full rounded-xl border border-gray-300 text-black placeholder-gray-500 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all';

const Worker = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm,        setSearchTerm]       = useState('');
  const [locationFilter,    setLocationFilter]   = useState('');
  const [relevantJobs,      setRelevantJobs]     = useState([]);
  const [allJobs,           setAllJobs]          = useState([]);
  const [loadingJobs,       setLoadingJobs]      = useState(false);
  const [jobsError,         setJobsError]        = useState('');
  const [showApplyModal,    setShowApplyModal]   = useState(false);
  const [selectedJob,       setSelectedJob]      = useState(null);
  const [applyForm,         setApplyForm]        = useState(INITIAL_APPLY_FORM);
  const [applying,          setApplying]         = useState(false);
  const [applyError,        setApplyError]       = useState('');
  const [applySuccess,      setApplySuccess]     = useState('');
  const [applicationToast,  setApplicationToast] = useState('');
  const [applications,      setApplications]     = useState([]);
  const [applicationsVersion, setApplicationsVersion] = useState(0);


  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true); setJobsError('');
      try {
        const res = await getRelevantAndAllJobs();
        
        const mapJob = (t) => ({
          id:          t._id,
          title:       t.title,
          category:    t.category || 'other',
          description: t.description,
          location:    t.location?.isRemote ? 'Remote' : [t.location?.city, t.location?.state].filter(Boolean).join(', ') || 'N/A',
          payment:     `\u20B9${t.budget?.amount ?? 0} (${t.budget?.type ?? 'fixed'})`,
          duration:    `${t.duration?.value ?? ''} ${t.duration?.unit ?? ''}`.trim(),
          skills:      t.skillsRequired || [],
          provider:    t.postedBy?.name || 'Unknown',
          rating:      t.postedBy?.ratings?.average ?? 0,
          verified:    t.status === 'open',
          budget: {
            amount:   t.budget?.amount ?? null,
            type:     t.budget?.type || 'fixed',
            currency: t.budget?.currency || 'INR',
          },
        });

        setRelevantJobs((res.relevantJobs || []).map(mapJob));
        setAllJobs((res.allJobs || []).map(mapJob));
      } catch {
        setJobsError('Failed to load tasks. Please try again.');
      } finally { setLoadingJobs(false); }
    };
    
    if (user?.role === 'worker') {
      fetchJobs();
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      setApplications([]);
      return;
    }

    let ignore = false;

    const fetchProfile = async () => {
      try {
        await fetchWorkerProfile();
      } catch {}
    };

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      setApplications([]);
      return;
    }

    let ignore = false;

    const fetchApplications = async () => {
      try {
        const res = await getMyApplications();
        if (!ignore) setApplications(res.data || []);
      } catch {
        if (!ignore) setApplications([]);
      }
    };

    fetchApplications();

    return () => {
      ignore = true;
    };
  }, [user, applicationsVersion]);

  useEffect(() => {
    if (!applicationToast) return undefined;
    const timeoutId = setTimeout(() => setApplicationToast(''), 4000);
    return () => clearTimeout(timeoutId);
  }, [applicationToast]);

  useEffect(() => {
    if (!applySuccess) return undefined;
    const timeoutId = setTimeout(() => setApplySuccess(''), 5000);
    return () => clearTimeout(timeoutId);
  }, [applySuccess]);

  const filteredRelevantJobs = useMemo(() => {
    return relevantJobs.filter(job => {
      const matchCategory = selectedCategory === 'all' || job.category === selectedCategory;
      const matchSearch = !searchTerm || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchCategory && matchSearch && matchLocation;
    });
  }, [relevantJobs, selectedCategory, searchTerm, locationFilter]);

  const filteredAllJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchCategory = selectedCategory === 'all' || job.category === selectedCategory;
      const matchSearch = !searchTerm || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchCategory && matchSearch && matchLocation;
    });
  }, [allJobs, selectedCategory, searchTerm, locationFilter]);


  const isWorker = user?.role === 'worker';

  const appliedTaskIds = useMemo(() => {
    if (!Array.isArray(applications)) return new Set();
    return new Set(
      applications
        .map((item) => item?.task?._id)
        .filter(Boolean)
    );
  }, [applications]);



  const handleOpenApply = (job, isEligible) => {
    if (!job || !isWorker) return;
    if (!isEligible) {
      setApplicationToast('You need to add the required skills to your profile before applying to this job.');
      return;
    }
    setSelectedJob(job);
    setApplyForm({
      ...INITIAL_APPLY_FORM,
      expectedRateAmount: job.budget?.amount ?? '',
      expectedRateType:   job.budget?.type || 'fixed',
      expectedRateCurrency: job.budget?.currency || 'INR',
    });
    setApplyError('');
    setApplySuccess('');
    setShowApplyModal(true);
  };

  const handleCloseApply = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplyError('');
    setApplyForm(INITIAL_APPLY_FORM);
    setApplying(false);
  };

  const handleApplyInputChange = (field, value) => {
    setApplyForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitApplication = async (event) => {
    if (event) event.preventDefault();
    if (!selectedJob) return;

    const jobMeta = {
      id:       selectedJob.id,
      title:    selectedJob.title,
      provider: selectedJob.provider,
    };

    setApplying(true);
    setApplyError('');

    try {
      await applyForTask(jobMeta.id, {
        ...applyForm,
        expectedRateAmount:
          applyForm.expectedRateAmount === ''
            ? undefined
            : Number(applyForm.expectedRateAmount),
      });

      setApplySuccess(`Application sent for ${jobMeta.title}.`);
      setApplicationToast(`Sent your application to ${jobMeta.provider || jobMeta.title}.`);
      setApplicationsVersion((prev) => prev + 1);
      handleCloseApply();
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };





  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--button-primary-bg)' }}>

      <div className="py-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="section-container">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Find Jobs that Match Your Skills</h1>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className={`${EMPHASIS_CARD} p-5`} style={{ background: 'var(--card-bg, white)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--small-text, black)' }}>Search</p>
              <input type="text" placeholder="Job title, skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" />
            </div>
            <div className={`${EMPHASIS_CARD} p-5`} style={{ background: 'var(--card-bg, white)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--small-text, black)' }}>Location</p>
              <input type="text" placeholder="City or type Remote" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="input-field" />
            </div>
            <div className={`${EMPHASIS_CARD} p-5`} style={{ background: 'var(--card-bg, white)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">Category</p>
              <div className="space-y-1">
                {CATEGORIES.map(({ value, label }) => (
                  <button key={value} onClick={() => setSelectedCategory(value)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${selectedCategory === value ? 'bg-black text-white font-semibold' : 'text-black hover:text-black hover:bg-gray-100'}`}>{label}</button>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-8">
            {showApplyModal && selectedJob && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 py-8">
                <div className="w-full max-w-md rounded-md border border-black p-6 shadow-lg" style={{ background: 'var(--button-primary-bg)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black">Apply for {selectedJob.title}</h3>
                      <p className="text-xs text-black">{selectedJob.provider} &bull; {selectedJob.location}</p>
                    </div>
                    <button type="button" onClick={handleCloseApply} className="text-black hover:text-black text-lg">✕</button>
                  </div>
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-black mb-1">Message<span className="text-red-400">*</span></label>
                      <textarea value={applyForm.message} onChange={(e) => handleApplyInputChange('message', e.target.value)} rows={3} required placeholder="Why are you a good fit?" className={APPLY_INPUT_CLASS} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Start Date</label>
                        <input type="date" value={applyForm.availabilityDate} onChange={(e) => handleApplyInputChange('availabilityDate', e.target.value)} className={APPLY_INPUT_CLASS} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Hours per week</label>
                        <input type="text" value={applyForm.availabilityHours} onChange={(e) => handleApplyInputChange('availabilityHours', e.target.value)} placeholder="e.g. 20" className={APPLY_INPUT_CLASS} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-black mb-1">Expected Rate</label>
                        <div className="flex gap-2">
                          <input type="number" min="0" step="0.5" value={applyForm.expectedRateAmount} onChange={(e) => handleApplyInputChange('expectedRateAmount', e.target.value)} placeholder="Amount" className={APPLY_INPUT_CLASS} />
                          <select value={applyForm.expectedRateType} onChange={(e) => handleApplyInputChange('expectedRateType', e.target.value)} className={APPLY_INPUT_CLASS}>
                            <option value="fixed">Fixed</option>
                            <option value="hourly">Hourly</option>
                            <option value="monthly">Monthly</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Currency</label>
                        <select value={applyForm.expectedRateCurrency} onChange={(e) => handleApplyInputChange('expectedRateCurrency', e.target.value)} className={APPLY_INPUT_CLASS}>
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-black mb-1">Portfolio link</label>
                      <input type="url" value={applyForm.portfolioLink} onChange={(e) => handleApplyInputChange('portfolioLink', e.target.value)} placeholder="https://..." className={APPLY_INPUT_CLASS} />
                    </div>
                    {applyError && <p className="rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-xs text-red-600">{applyError}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={handleCloseApply} className="rounded-md border border-black px-5 py-2 text-sm font-medium text-black hover:bg-gray-100">Cancel</button>
                      <button type="submit" disabled={applying} className={`rounded-md px-6 py-2 text-sm font-semibold text-white transition-colors ${applying ? 'bg-black cursor-wait' : 'bg-black hover:bg-gray-900'}`}>{applying ? 'Submitting...' : 'Send Application'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {applicationToast && (
              <div className="fixed bottom-5 right-5 z-40 rounded-2xl border border-black px-4 py-3 text-xs text-black shadow-lg" style={{ background: 'var(--button-primary-bg)' }}>
                <div className="flex items-center gap-3">
                  <span>{applicationToast}</span>
                  <button type="button" onClick={() => setApplicationToast('')} className="text-black hover:text-black">✕</button>
                </div>
              </div>
            )}

            {applySuccess && <div className="rounded-2xl border px-4 py-3 text-xs" style={{ borderColor: 'var(--bg-primary)', background: 'var(--card-bg)', color: 'var(--bg-primary)' }}>{applySuccess}</div>}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-black text-base">Relevant Jobs</h2>
                {!loadingJobs && <span className="text-xs text-black">{filteredRelevantJobs.length} job{filteredRelevantJobs.length !== 1 ? 's' : ''} matching your skills</span>}
              </div>

              {loadingJobs && <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}
              {jobsError && !loadingJobs && <div className={`${EMPHASIS_CARD} p-5 text-center`}><p className="text-sm text-red-600 mb-3">{jobsError}</p><button onClick={() => window.location.reload()} className="btn-outline text-xs">Retry</button></div>}
              {!loadingJobs && !jobsError && filteredRelevantJobs.length === 0 && <div className={`${EMPHASIS_CARD} p-10 text-center`}><p className="font-semibold text-black text-sm mb-1">No relevant jobs found</p><p className="text-xs text-gray-600">Add more skills to your profile to see jobs matching your expertise.</p></div>}

              <div className="space-y-4">
                {filteredRelevantJobs.map((job) => {
                  const alreadyApplied = appliedTaskIds.has(job.id);
                  return (
                    <div key={job.id} className={`${EMPHASIS_CARD_HOVER} p-5`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-black text-sm">{job.title}</h3>
                            {job.verified && <span className="badge-active text-xs">Verified</span>}
                          </div>
                          <p className="text-xs text-gray-600">{job.provider} &bull; {job.location}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">{job.payment}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{job.duration}</p>
                        </div>
                      </div>
                      {job.description && <p className="text-xs text-black leading-relaxed mb-3 line-clamp-2">{job.description}</p>}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 4).map((s) => <span key={s} className="badge-closed text-xs">{s}</span>)}
                          {job.skills.length > 4 && <span className="badge-closed text-xs">+{job.skills.length - 4} more</span>}
                        </div>
                      )}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 pt-3">
                        <p className="text-xs text-black">{alreadyApplied ? 'You have already applied to this task.' : 'You are eligible for this job!'}</p>
                        {isWorker ? (
                          <button type="button" onClick={() => handleOpenApply(job, true)} disabled={alreadyApplied} className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-[11px] font-semibold transition-colors ${alreadyApplied ? 'bg-gray-200 text-black cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}>{alreadyApplied ? 'Applied' : 'Apply Now'}</button>
                        ) : (
                          <a href="/login" className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2 text-[11px] font-semibold text-black hover:text-black hover:border-black">Sign in to Apply</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-black text-base">All Jobs</h2>
                {!loadingJobs && <span className="text-xs text-black">{filteredAllJobs.length} job{filteredAllJobs.length !== 1 ? 's' : ''}</span>}
              </div>

              {!loadingJobs && !jobsError && filteredAllJobs.length === 0 && <div className={`${EMPHASIS_CARD} p-10 text-center`}><p className="font-semibold text-black text-sm mb-1">No other jobs available</p><p className="text-xs text-gray-600">Check back later for more opportunities.</p></div>}

              <div className="space-y-4">
                {filteredAllJobs.map((job) => {
                  return (
                    <div key={job.id} className={`${EMPHASIS_CARD_HOVER} p-5 opacity-75`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-black text-sm">{job.title}</h3>
                            {job.verified && <span className="badge-active text-xs">Verified</span>}
                          </div>
                          <p className="text-xs text-gray-600">{job.provider} &bull; {job.location}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">{job.payment}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{job.duration}</p>
                        </div>
                      </div>
                      {job.description && <p className="text-xs text-black leading-relaxed mb-3 line-clamp-2">{job.description}</p>}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 4).map((s) => <span key={s} className="badge-closed text-xs">{s}</span>)}
                          {job.skills.length > 4 && <span className="badge-closed text-xs">+{job.skills.length - 4} more</span>}
                        </div>
                      )}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 pt-3">
                        <p className="text-xs text-red-600">Update your profile with required skills to apply for this job.</p>
                        {isWorker ? (
                          <button type="button" onClick={() => handleOpenApply(job, false)} disabled className="inline-flex items-center justify-center rounded-full px-5 py-2 text-[11px] font-semibold bg-gray-300 text-gray-500 cursor-not-allowed">Not Eligible</button>
                        ) : (
                          <a href="/login" className="inline-flex items-center justify-center rounded-full border border-black px-5 py-2 text-[11px] font-semibold text-black hover:text-black hover:border-black">Sign in to Apply</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>


    </div>
  );
};

export default Worker;

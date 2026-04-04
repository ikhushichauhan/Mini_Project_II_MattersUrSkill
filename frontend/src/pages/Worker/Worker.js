import React, { useState, useEffect, useMemo } from 'react';
import { getOpenTasks, applyForTask, getMyApplications, getMyAssignedTasks, markTaskCompleted, withdrawApplication } from '../../api/taskAPI';
import { getWorkerProfile as fetchWorkerProfile } from '../../api/workerAPI';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow/ChatWindow';

const CATEGORIES = [
  { value: 'all',           label: 'All Categories' },
  { value: 'home-based',    label: 'Home-Based' },
  { value: 'part-time',     label: 'Part-Time' },
  { value: 'freelance',     label: 'Freelancing' },
  { value: 'local-service', label: 'Local Services' },
];

const STATUS_MAP = {
  completed: 'badge-active',
  active:    'badge-brand',
  pending:   'badge-pending',
};

const APPLICATION_STATUS_MAP = {
  pending:  'badge-pending',
  accepted: 'badge-active',
  rejected: 'badge-closed',
};

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
  const [jobs,              setJobs]             = useState([]);
  const [loadingJobs,       setLoadingJobs]      = useState(false);
  const [jobsError,         setJobsError]        = useState('');
  const [workerProfile,     setWorkerProfile]    = useState(null);
  const [loadingWorker,     setLoadingWorker]    = useState(false);
  const [profileError,      setProfileError]     = useState('');
  const [matchProfileOnly,  setMatchProfileOnly] = useState(false);
  const [showApplyModal,    setShowApplyModal]   = useState(false);
  const [selectedJob,       setSelectedJob]      = useState(null);
  const [applyForm,         setApplyForm]        = useState(INITIAL_APPLY_FORM);
  const [applying,          setApplying]         = useState(false);
  const [applyError,        setApplyError]       = useState('');
  const [applySuccess,      setApplySuccess]     = useState('');
  const [applicationToast,  setApplicationToast] = useState('');
  const [applications,      setApplications]     = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsVersion, setApplicationsVersion] = useState(0);
  const [assignedTasks,     setAssignedTasks]    = useState([]);
  const [loadingAssigned,   setLoadingAssigned]  = useState(false);
  const [showChatWindow,    setShowChatWindow]   = useState(false);
  const [chatTask,          setChatTask]         = useState(null);
  const [chatOtherUser,     setChatOtherUser]    = useState(null);
  const [showDetailsModal,  setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingJobs(true); setJobsError('');
      try {
        const filters = {};
        if (selectedCategory !== 'all') filters.category = selectedCategory;
        if (locationFilter)             filters.city     = locationFilter;
        if (searchTerm)                 filters.search   = searchTerm;
        const res = await getOpenTasks(filters);
        setJobs((res.data || []).map((t) => ({
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
        })));
      } catch {
        setJobsError('Failed to load tasks. Please try again.');
      } finally { setLoadingJobs(false); }
    };
    fetchTasks();
  }, [selectedCategory, locationFilter, searchTerm]);

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      setWorkerProfile(null);
      setMatchProfileOnly(false);
      setApplications([]);
      return;
    }

    let ignore = false;

    const fetchProfile = async () => {
      setLoadingWorker(true);
      setProfileError('');
      try {
        const data = await fetchWorkerProfile();
        if (!ignore) {
          setWorkerProfile(data);
        }
      } catch (err) {
        if (!ignore) {
          setProfileError(err.response?.data?.message || 'Failed to load your profile.');
          setMatchProfileOnly(false);
        }
      } finally {
        if (!ignore) {
          setLoadingWorker(false);
        }
      }
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
      setLoadingApplications(true);
      try {
        const res = await getMyApplications();
        if (!ignore) {
          setApplications(res.data || []);
        }
      } catch (err) {
        if (!ignore) {
          setApplications([]);
        }
      } finally {
        if (!ignore) {
          setLoadingApplications(false);
        }
      }
    };

    fetchApplications();

    return () => {
      ignore = true;
    };
  }, [user, applicationsVersion]);

  useEffect(() => {
    if (!user || user.role !== 'worker') {
      setAssignedTasks([]);
      return;
    }

    let ignore = false;

    const fetchAssigned = async () => {
      setLoadingAssigned(true);
      try {
        const res = await getMyAssignedTasks();
        if (!ignore) {
          setAssignedTasks(res.data || []);
        }
      } catch (err) {
        if (!ignore) {
          setAssignedTasks([]);
        }
      } finally {
        if (!ignore) {
          setLoadingAssigned(false);
        }
      }
    };

    fetchAssigned();

    return () => {
      ignore = true;
    };
  }, [user]);

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

  const displayedJobs = useMemo(() => {
    if (!matchProfileOnly || !workerProfile || !user) {
      return jobs;
    }

    const normalizedSkills = new Set(
      [...(user.skills || []), ...(workerProfile.skills || [])]
        .filter(Boolean)
        .map((skill) => String(skill).toLowerCase())
    );

    const userCity = String(user.location?.city || '').toLowerCase();
    const workerCity = typeof workerProfile.location === 'string'
      ? workerProfile.location.toLowerCase()
      : '';
    const preferredCity = userCity || workerCity;

    const experiences = Array.isArray(workerProfile.workExperience)
      ? workerProfile.workExperience
      : [];

    return jobs.filter((job) => {
      const jobSkills = (job.skills || []).map((skill) => String(skill || '').toLowerCase());
      const skillMatch = normalizedSkills.size === 0 || jobSkills.some((skill) => normalizedSkills.has(skill));

      const jobLocation = String(job.location || '').toLowerCase();
      const locationMatch =
        !preferredCity ||
        jobLocation.includes(preferredCity) ||
        jobLocation.includes('remote');

      const experienceMatch =
        experiences.length === 0 ||
        experiences.some((exp) => {
          const role = String(exp.title || '').toLowerCase();
          if (!role) return false;
          const jobTitle = String(job.title || '').toLowerCase();
          const jobDesc = String(job.description || '').toLowerCase();
          return jobTitle.includes(role) || jobDesc.includes(role);
        });

      return skillMatch && locationMatch && experienceMatch;
    });
  }, [jobs, matchProfileOnly, workerProfile, user]);

  const workHistory = Array.isArray(workerProfile?.workExperience) ? workerProfile.workExperience : [];
  const hasCvOnFile = Boolean(workerProfile?.cv);
  const smartMatchDisabled =
    !user || user.role !== 'worker' || loadingWorker || !workerProfile || Boolean(profileError);
  const isWorker = user?.role === 'worker';

  const appliedTaskIds = useMemo(() => {
    if (!Array.isArray(applications)) return new Set();
    return new Set(
      applications
        .map((item) => item?.task?._id)
        .filter(Boolean)
    );
  }, [applications]);

  const handleMarkCompleted = async (taskId) => {
    if (!taskId) return;
    try {
      await markTaskCompleted(taskId, undefined);
      setAssignedTasks((prev) => prev.map((t) => (
        t._id === taskId ? { ...t, status: 'completed' } : t
      )));
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  const handleOpenApply = (job) => {
    if (!job || !isWorker) return;
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

  const refreshApplications = () => setApplicationsVersion((prev) => prev + 1);

  const handleWithdrawApplication = async (taskId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      await withdrawApplication(taskId);
      setApplicationToast('Application withdrawn successfully');
      refreshApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    }
  };

  const handleOpenChat = (task, otherUser) => {
    setChatTask(task._id);
    setChatOtherUser(otherUser);
    setShowChatWindow(true);
  };

  const handleCloseChat = () => {
    setShowChatWindow(false);
    setChatTask(null);
    setChatOtherUser(null);
  };

  const handleShowDetails = (application, task) => {
    setSelectedApplication({ application, task });
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
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
                <h2 className="font-bold text-black text-base">Open Positions</h2>
                {!loadingJobs && <span className="text-xs text-black">{matchProfileOnly ? `${displayedJobs.length} matched of ${jobs.length} total` : `${displayedJobs.length} result${displayedJobs.length !== 1 ? 's' : ''}`}</span>}
              </div>

              {loadingJobs && <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}
              {jobsError && !loadingJobs && <div className={`${EMPHASIS_CARD} p-5 text-center`}><p className="text-sm text-red-600 mb-3">{jobsError}</p><button onClick={() => setSelectedCategory(selectedCategory)} className="btn-outline text-xs">Retry</button></div>}
              {!loadingJobs && !jobsError && displayedJobs.length === 0 && <div className={`${EMPHASIS_CARD} p-10 text-center`}><p className="font-semibold text-black text-sm mb-1">{matchProfileOnly ? 'No matched jobs yet' : 'No jobs found'}</p><p className="text-xs text-gray-600">{matchProfileOnly ? 'Add more skills or experience details, or turn off Smart Match to see all roles.' : 'Try adjusting your filters or check back later.'}</p>{matchProfileOnly && <button onClick={() => setMatchProfileOnly(false)} className="btn-outline text-xs mt-4">Clear Smart Match</button>}</div>}

              <div className="space-y-4">
                {displayedJobs.map((job) => {
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
                        <p className="text-xs text-black">{alreadyApplied ? 'You have already applied to this task.' : 'Match looks good? Share your availability and rate.'}</p>
                        {isWorker ? (
                          <button type="button" onClick={() => handleOpenApply(job)} disabled={alreadyApplied} className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-[11px] font-semibold transition-colors ${alreadyApplied ? 'bg-gray-200 text-black cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}>{alreadyApplied ? 'Applied' : 'Apply Now'}</button>
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

      {showChatWindow && chatTask && chatOtherUser && <ChatWindow taskId={chatTask} otherUser={chatOtherUser} onClose={handleCloseChat} />}
    </div>
  );
};

export default Worker;

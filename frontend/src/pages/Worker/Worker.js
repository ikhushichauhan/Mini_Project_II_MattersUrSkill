import React, { useState, useEffect } from 'react';
import { getOpenTasks } from '../../api/taskAPI';

const CATEGORIES = [
  { value: 'all',           label: 'All Categories' },
  { value: 'home-based',    label: 'Home-Based' },
  { value: 'part-time',     label: 'Part-Time' },
  { value: 'freelance',     label: 'Freelancing' },
  { value: 'local-service', label: 'Local Services' },
];

const WORK_HISTORY = [
  { id: 1, title: 'Content Writing - Tech Blog',  company: 'TechVision Media',   status: 'completed', payment: '12,000',   duration: '2 months',  rating: 4.9, date: '28 Jan 2024' },
  { id: 2, title: 'Social Media Management',      company: 'LocalBiz Solutions', status: 'active',    payment: '8,000/mo',  duration: null,        rating: null, date: '01 Feb 2024' },
  { id: 3, title: 'Data Entry Operator',           company: 'ShopFlow India',     status: 'completed', payment: '9,600',    duration: '1 month',   rating: 4.5, date: '15 Jan 2024' },
];

const STATUS_MAP = {
  completed: 'badge-active',
  active:    'badge-brand',
  pending:   'badge-pending',
};

const EMPHASIS_CARD =
  'rounded-3xl border border-brand-300/35 bg-gradient-to-br from-brand-800/95 via-brand-700/94 to-brand-700/88 shadow-[0_10px_28px_rgba(20,34,14,0.35)]';
const EMPHASIS_CARD_HOVER = `${EMPHASIS_CARD} hover:scale-[1.01] hover:shadow-brand transition-all duration-300`;

const Worker = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm,        setSearchTerm]       = useState('');
  const [locationFilter,    setLocationFilter]   = useState('');
  const [jobs,              setJobs]             = useState([]);
  const [loadingJobs,       setLoadingJobs]      = useState(false);
  const [jobsError,         setJobsError]        = useState('');

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
        })));
      } catch {
        setJobsError('Failed to load tasks. Please try again.');
      } finally { setLoadingJobs(false); }
    };
    fetchTasks();
  }, [selectedCategory, locationFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-surface">

      <div
        className="border-b border-surface-border pt-16"
        style={{
          background: 'linear-gradient(135deg, rgba(124,189,103,0.14) 0%, rgba(31,45,23,0.96) 45%, rgba(25,31,19,1) 100%)',
        }}
      >
        <div className="section-container py-10 relative overflow-hidden">
          <p className="section-label">Worker Dashboard</p>
          <h1 className="section-title">Find Work Opportunities</h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-lg">
            Browse verified work listings from trusted businesses across India.
          </p>
          <img
            src="/images/sixth.png"
            alt=""
            aria-hidden="true"
            className="hidden sm:block absolute right-4 bottom-0 w-32 md:w-48 lg:w-64 h-auto object-contain pointer-events-none select-none"
          />
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid lg:grid-cols-4 gap-8">

          <aside className="lg:col-span-1 space-y-6">

            <div className={`${EMPHASIS_CARD} p-5`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/85 mb-3">Search</p>
              <input
                type="text"
                placeholder="Job title, skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>

            <div className={`${EMPHASIS_CARD} p-5`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/85 mb-3">Location</p>
              <input
                type="text"
                placeholder="City or type Remote"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="input-field"
              />
            </div>

            <div className={`${EMPHASIS_CARD} p-5`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/85 mb-3">Category</p>
              <div className="space-y-1">
                {CATEGORIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedCategory(value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                      selectedCategory === value
                        ? 'bg-brand-500/15 text-brand-300 font-semibold'
                        : 'text-white/85 hover:text-white hover:bg-brand-500/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          <main className="lg:col-span-3 space-y-8">

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white text-base">Open Positions</h2>
                {!loadingJobs && (
                  <span className="text-xs text-white/85">{jobs.length} result{jobs.length !== 1 ? 's' : ''}</span>
                )}
              </div>

              {loadingJobs && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {jobsError && !loadingJobs && (
                <div className={`${EMPHASIS_CARD} p-5 text-center`}>
                  <p className="text-sm text-red-400 mb-3">{jobsError}</p>
                  <button
                    onClick={() => setSelectedCategory(selectedCategory)}
                    className="btn-outline text-xs"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingJobs && !jobsError && jobs.length === 0 && (
                <div className={`${EMPHASIS_CARD} p-10 text-center`}>
                  <p className="font-semibold text-white text-sm mb-1">No jobs found</p>
                  <p className="text-xs text-white/80">Try adjusting your filters or check back later.</p>
                </div>
              )}

              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className={`${EMPHASIS_CARD_HOVER} p-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-white text-sm">{job.title}</h3>
                          {job.verified && <span className="badge-active text-xs">Verified</span>}
                        </div>
                        <p className="text-xs text-white/85">{job.provider} &bull; {job.location}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-brand-400">{job.payment}</p>
                        <p className="text-xs text-white/75 mt-0.5">{job.duration}</p>
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-xs text-white/85 leading-relaxed mb-3 line-clamp-2">{job.description}</p>
                    )}
                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 4).map((s) => (
                          <span key={s} className="badge-closed text-xs">{s}</span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="badge-closed text-xs">+{job.skills.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-bold text-white text-base mb-4">Your Work History</h2>
              <div className="space-y-3">
                {WORK_HISTORY.map((item) => (
                  <div key={item.id} className={`${EMPHASIS_CARD} p-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                          <span className={STATUS_MAP[item.status] || 'badge-closed'}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/80">{item.company} &bull; {item.date}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-400">&thinsp;&#8377;{item.payment}</p>
                          {item.duration && <p className="text-xs text-white/75">{item.duration}</p>}
                        </div>
                        {item.rating !== null && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-brand-300">{item.rating}</p>
                            <p className="text-xs text-white/75">rating</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Worker;
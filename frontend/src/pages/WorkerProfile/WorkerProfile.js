import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const EMPHASIS_CARD = 'rounded border border-gray-300 bg-white shadow-sm';

const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { isProvider } = useAuth();
  const [worker, setWorker] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isProvider) {
      navigate('/login');
      return;
    }

    const fetchWorkerProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const userRes = await axiosInstance.get(`/api/auth/user/${workerId}`);
        setWorker(userRes.data.data);

        try {
          const profileRes = await axiosInstance.get(`/api/workers/profile/${workerId}`);
          setWorkerProfile(profileRes.data);
        } catch (err) {
          console.log('No worker profile found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load worker profile');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, [workerId, isProvider, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="section-container py-10">
          <div className={`${EMPHASIS_CARD} p-8 text-center`}>
            <p className="text-red-400 mb-4">{error || 'Worker not found'}</p>
            <button onClick={() => navigate(-1)} className="btn-outline">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const initials = worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const skillsList = Array.isArray(worker.skills) ? worker.skills : [];
  const workExperience = workerProfile?.workExperience || [];
  const hasCV = workerProfile?.cv && workerProfile.cv.fileData;

  return (
    <div className="min-h-screen bg-white">
      <div
        className="border-b border-gray-200 pt-16 worker-profile-header"
        style={{
          background: 'rgba(64, 64, 64, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="text-sm text-white hover:text-gray-300 mb-4 worker-profile-header-text">
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-400">
              {worker.profileImage ? (
                <img src={worker.profileImage} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white worker-profile-header-text">Worker</h1>
              <p className="text-gray-900 text-sm mt-1 worker-profile-header-text">{worker.name}</p>
              <p className="text-gray-900 text-sm mt-1 worker-profile-header-text">{worker.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white worker-profile-header-text">★</span>
                <span className="text-white text-sm worker-profile-header-text">
                  {worker.ratings?.average?.toFixed(1) || '0.0'} ({worker.ratings?.count || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className={EMPHASIS_CARD}>
                <div className="p-6">
                  <h2 className="font-bold text-black text-lg mb-4">About</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {worker.bio || 'No bio provided'}
                  </p>
                </div>
              </div>

            {skillsList.length > 0 && (
              <div className={EMPHASIS_CARD}>
                <div className="p-6">
                  <h2 className="font-bold text-black text-lg mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill) => (
                      <span key={skill} className="badge-closed text-black">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {workExperience.length > 0 && (
              <div className={EMPHASIS_CARD}>
                <div className="p-6">
                  <h2 className="font-bold text-black text-lg mb-4">Work Experience</h2>
                  <div className="space-y-4">
                    {workExperience.map((exp, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                        <p className="font-semibold text-black text-sm">{exp.title || 'Position'}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {exp.company || 'Company'} {exp.location && `• ${exp.location}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.startDate || 'Start'} - {exp.currentlyWorking ? 'Present' : exp.endDate || 'End'}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hasCV && (
              <div className={EMPHASIS_CARD}>
                <div className="p-6">
                  <h2 className="font-bold text-black text-lg mb-4">Resume / CV</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-black font-medium">{workerProfile.cv.fileName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {workerProfile.cv.fileSize ? `${(workerProfile.cv.fileSize / 1024).toFixed(1)} KB` : 'Size unavailable'}
                      </p>
                    </div>
                    <a
                      href={workerProfile.cv.fileData}
                      download={workerProfile.cv.fileName || 'cv'}
                      className="btn-primary text-xs"
                    >
                      Download CV
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="worker-profile-sidebar-card" style={{ background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div className="p-6">
                <h3 className="font-bold text-black text-base mb-4">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <a href={`mailto:${worker.email}`} className="text-blue-600 hover:text-blue-700">
                      {worker.email}
                    </a>
                  </div>
                  {worker.phone && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <a href={`tel:${worker.phone}`} className="text-blue-600 hover:text-blue-700">
                        {worker.phone}
                      </a>
                    </div>
                  )}
                  {worker.location?.city && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                      <p className="text-black">
                        {[worker.location.city, worker.location.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="worker-profile-sidebar-card" style={{ background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <div className="p-6">
                <h3 className="font-bold text-black text-base mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{worker.completedJobs || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-sm text-black">
                      {new Date(worker.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;

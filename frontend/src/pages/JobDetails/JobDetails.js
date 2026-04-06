import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTaskById, updateTask, deleteTask, handleApplication } from '../../api/taskAPI';
import ChatWindow from '../../components/ChatWindow/ChatWindow';

const EMPHASIS_CARD = 'rounded-lg border border-gray-300 bg-white shadow-md';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isProvider } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatWorker, setChatWorker] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getTaskById(jobId);
        setJob(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      await updateTask(jobId, { status: newStatus });
      setJob((prev) => ({ ...prev, status: newStatus }));
      setActionMessage(`Job status updated to ${newStatus}`);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      await deleteTask(jobId);
      setActionMessage('Job deleted successfully');
      setTimeout(() => navigate('/provider'), 1500);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to delete job');
      setActionLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      await handleApplication(jobId, applicationId, 'accepted');
      setJob((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app._id === applicationId ? { ...app, status: 'accepted' } : { ...app, status: app.status === 'pending' ? 'rejected' : app.status }
        ),
      }));
      setActionMessage('Application accepted and worker assigned');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to accept application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      await handleApplication(jobId, applicationId, 'rejected');
      setJob((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app._id === applicationId ? { ...app, status: 'rejected' } : app
        ),
      }));
      setActionMessage('Application rejected');
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = (worker) => {
    setChatWorker(worker);
    setShowChatWindow(true);
  };

  const handleCloseChat = () => {
    setShowChatWindow(false);
    setChatWorker(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-surface pt-20">
        <div className="section-container py-10">
          <div className={`${EMPHASIS_CARD} p-8 text-center`}>
            <p className="text-red-400 mb-4">{error || 'Job not found'}</p>
            <button onClick={() => navigate(-1)} className="btn-outline">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === job.postedBy?._id || user?.role === 'provider';

  return (
    <div className="min-h-screen bg-white">
      <div
        className="border-b border-gray-300 pt-16"
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
        }}
      >
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="text-sm text-white hover:text-gray-200 mb-4">
            ← Back
          </button>
          <h1 className="section-title text-white">{job.title}</h1>
          <p className="text-gray-300 text-sm mt-2">
            Posted by {job.postedBy?.name || 'Provider'} • {job.location?.isRemote ? 'Remote' : job.location?.city || 'Location not specified'}
          </p>
        </div>
      </div>

      <div className="section-container py-10">
        {actionMessage && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            actionMessage.includes('success') || actionMessage.includes('accepted')
              ? 'border-gray-300 bg-gray-100 text-gray-800'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}>
            {actionMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={EMPHASIS_CARD}>
              <div className="p-6 border-b border-gray-300">
                <h2 className="font-bold text-black text-lg mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{job.description || 'No description provided'}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm text-black capitalize">{job.category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-sm text-black">{job.duration?.value} {job.duration?.unit || 'N/A'}</p>
                    </div>
                  </div>
                  {job.skillsRequired?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.map((skill) => (
                          <span key={skill} className="badge-closed text-black text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isOwner && isProvider && (
                <div className="p-6">
                  <h3 className="font-bold text-black text-base mb-4">Job Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={actionLoading}
                      className="input-field text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={handleDeleteJob}
                      disabled={actionLoading}
                      className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete Job
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isOwner && isProvider && (
              <div className={EMPHASIS_CARD}>
                <div className="p-6">
                  <h2 className="font-bold text-black text-lg mb-4">
                    Applications ({job.applications?.length || 0})
                  </h2>
                  {!job.applications || job.applications.length === 0 ? (
                    <p className="text-sm text-gray-600">No applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {job.applications.map((app) => (
                        <div key={app._id} className="rounded-lg border border-gray-300 bg-white p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-semibold text-black text-sm">{app.applicant?.name || 'Worker'}</p>
                              <p className="text-xs text-gray-600">{app.applicant?.email || 'No email'}</p>
                              {app.applicant?.phone && (
                                <p className="text-xs text-gray-600">{app.applicant.phone}</p>
                              )}
                            </div>
                            <span className={`badge-${app.status === 'accepted' ? 'active' : app.status === 'rejected' ? 'closed' : 'pending'} text-xs`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="space-y-2 text-xs text-gray-700 mb-3">
                            <p><span className="font-semibold">Message:</span> {app.message || 'No message'}</p>
                            {app.availability?.startDate && (
                              <p><span className="font-semibold">Available from:</span> {app.availability.startDate}</p>
                            )}
                            {app.availability?.hoursPerWeek && (
                              <p><span className="font-semibold">Hours per week:</span> {app.availability.hoursPerWeek}</p>
                            )}
                            {app.expectedRate?.amount !== undefined && (
                              <p><span className="font-semibold">Expected rate:</span> {app.expectedRate.currency} {app.expectedRate.amount} ({app.expectedRate.type})</p>
                            )}
                            {app.portfolioLink && (
                              <p>
                                <span className="font-semibold">Portfolio:</span>{' '}
                                <a href={app.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                                  View
                                </a>
                              </p>
                            )}
                          </div>
                          {app.applicant?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {app.applicant.skills.map((skill) => (
                                <span key={skill} className="badge-closed text-black text-xs">{skill}</span>
                              ))}
                            </div>
                          )}
                          {app.applicant?.cv?.fileData && (
                            <div className="mb-3">
                              <a
                                href={app.applicant.cv.fileData}
                                download={app.applicant.cv.fileName || 'cv'}
                                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-black border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Download CV
                              </a>
                            </div>
                          )}
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptApplication(app._id)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-xs font-medium bg-black text-white rounded-md hover:bg-gray-900 transition-colors"
                              >
                                Accept & Assign
                              </button>
                              <button
                                onClick={() => handleRejectApplication(app._id)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-xs font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {app.status === 'accepted' && (
                            <button
                              onClick={() => handleOpenChat(app.applicant)}
                              className="px-4 py-2 text-xs font-medium bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                            >
                              Chat with Worker
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={EMPHASIS_CARD}>
              <div className="p-6">
                <h3 className="font-bold text-black text-base mb-4">Budget & Payment</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                    <p className="text-2xl font-bold text-black">₹{job.budget?.amount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-sm text-black capitalize">{job.budget?.type || 'Fixed'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={EMPHASIS_CARD}>
              <div className="p-6">
                <h3 className="font-bold text-black text-base mb-4">Status</h3>
                <span className={`badge-${job.status === 'open' ? 'active' : job.status === 'in_progress' ? 'brand' : 'closed'} text-sm`} style={{ color: '#000000' }}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChatWindow && chatWorker && (
        <ChatWindow
          taskId={jobId}
          otherUser={chatWorker}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default JobDetails;

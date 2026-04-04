import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyPostedTasks } from '../../api/taskAPI';
import ChatWindow from '../../components/ChatWindow/ChatWindow';

const EMPHASIS_CARD = 'rounded-lg border shadow-md';

const ApplicantsDetails = () => {
  const navigate = useNavigate();
  const { user, isProvider } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatWorker, setChatWorker] = useState(null);
  const [chatTaskId, setChatTaskId] = useState(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!isProvider) {
      navigate('/login');
      return;
    }

    const fetchApplicants = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching applicants...');
        const res = await getMyPostedTasks();
        console.log('Response:', res);
        const tasks = res.data || [];
        console.log('Tasks:', tasks);
        
        const allApplicants = [];
        const seen = new Set();
        
        tasks.forEach(task => {
          if (task.applications && task.applications.length > 0) {
            task.applications.forEach(app => {
              const workerId = app.applicant?._id?.toString();
              if (workerId && !seen.has(workerId)) {
                seen.add(workerId);
                allApplicants.push({
                  worker: app.applicant,
                  task: { _id: task._id, title: task.title },
                  application: app,
                  hasCV: Boolean(app.applicant?.cv?.fileData),
                });
              }
            });
          }
        });
        
        console.log('All applicants:', allApplicants);
        
        // Sort: CV holders first, then by rating
        allApplicants.sort((a, b) => {
          if (a.hasCV && !b.hasCV) return -1;
          if (!a.hasCV && b.hasCV) return 1;
          const aRating = a.worker?.ratings?.average || 0;
          const bRating = b.worker?.ratings?.average || 0;
          return bRating - aRating;
        });
        
        setApplicants(allApplicants);
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load applicants');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [isProvider, navigate]);

  const handleOpenChat = (worker, taskId) => {
    setChatWorker(worker);
    setChatTaskId(taskId);
    setShowChatWindow(true);
  };

  const handleCloseChat = () => {
    setShowChatWindow(false);
    setChatWorker(null);
    setChatTaskId(null);
  };

  const handleViewCV = (cvData) => {
    if (!cvData || !cvData.fileData) {
      alert('CV not available');
      return;
    }
    setSelectedCV(cvData.fileData);
    setShowCVModal(true);
  };

  const handleCloseCVModal = () => {
    setShowCVModal(false);
    setSelectedCV(null);
  };

  const handleAcceptApplication = async (taskId, applicationId) => {
    if (!window.confirm('Accept this application and assign the job to this worker?')) return;
    
    setActionLoading(true);
    setActionMessage('');
    try {
      const { handleApplication } = await import('../../api/taskAPI');
      await handleApplication(taskId, applicationId, 'accepted');
      setActionMessage('Application accepted and worker assigned successfully!');
      
      // Refresh applicants list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to accept application');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="border-b applicants-header-separator pt-16"
        style={{
          background: '#ffffff',
        }}
      >
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="text-sm hover:text-gray-600 mb-4 applicants-header-text" style={{ color: '#000000' }}>
            ← Back
          </button>
          <h1 className="section-title applicants-header-text" style={{ color: '#000000' }}>Applicants Details</h1>
          <p className="text-sm mt-2 applicants-header-text" style={{ color: '#000000' }}>
            View all workers who have applied to your jobs
          </p>
        </div>
      </div>

      <div className="section-container py-10">
        {actionMessage && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            actionMessage.includes('success')
              ? 'border-gray-300 bg-gray-100 text-gray-800'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}>
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {applicants.length === 0 ? (
          <div className={`${EMPHASIS_CARD} p-8 text-center`}>
            <p className="text-gray-700 text-sm">No applicants yet</p>
            <p className="text-gray-500 text-xs mt-2">When workers apply to your jobs, they will appear here</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((item) => (
              <div key={item.worker._id} className={`${EMPHASIS_CARD} ${item.hasCV ? 'ring-2 ring-gray-400' : ''}`} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0 relative">
                      {item.worker.profileImage ? (
                        <img src={item.worker.profileImage} alt={item.worker.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center text-white font-bold">
                          {item.worker.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      {item.hasCV && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                            <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black text-sm truncate">{item.worker.name}</p>
                      <p className="text-xs text-gray-600">{item.worker.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-gray-700 text-xs">★</span>
                        <span className="text-xs text-gray-700">
                          {item.worker.ratings?.average?.toFixed(1) || '0.0'} ({item.worker.ratings?.count || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.worker.skills && item.worker.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.worker.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="badge-closed text-xs" style={{ color: '#000000' }}>{skill}</span>
                        ))}
                        {item.worker.skills.length > 3 && (
                          <span className="badge-closed text-xs" style={{ color: '#000000' }}>+{item.worker.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 pb-4 border-b border-gray-300">
                    <p className="text-xs text-gray-500 mb-1">Applied for:</p>
                    <p className="text-sm text-black font-medium">{item.task.title}</p>
                    <span className={`badge-${item.application.status === 'accepted' ? 'active' : item.application.status === 'rejected' ? 'closed' : 'pending'} text-xs mt-2 inline-block`}>
                      {item.application.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/worker/${item.worker._id}`)}
                        className="flex-1 btn-primary text-xs"
                      >
                        Open Profile
                      </button>
                      {item.worker.cv && item.worker.cv.fileData && (
                        <button
                          onClick={() => handleViewCV(item.worker.cv)}
                          className="flex-1 btn-outline text-xs"
                        >
                          View CV
                        </button>
                      )}
                    </div>
                    
                    {item.application.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptApplication(item.task._id, item.application._id)}
                        disabled={actionLoading}
                        className={`w-full btn-primary text-xs ${
                          actionLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {actionLoading ? 'Processing...' : 'Accept & Assign'}
                      </button>
                    )}

                    {item.application.status === 'accepted' && (
                      <button
                        onClick={() => handleOpenChat(item.worker, item.task._id)}
                        className="w-full btn-primary text-xs"
                      >
                        Chat with Worker
                      </button>
                    )}

                    {item.application.status === 'rejected' && (
                      <button
                        onClick={() => navigate(`/job/${item.task._id}`)}
                        className="w-full btn-outline text-xs"
                      >
                        View Job Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showChatWindow && chatWorker && chatTaskId && (
        <ChatWindow
          taskId={chatTaskId}
          otherUser={chatWorker}
          onClose={handleCloseChat}
        />
      )}

      {showCVModal && selectedCV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-2 py-8">
          <div className="w-full max-w-4xl h-[90vh] rounded-2xl border border-neutral-200 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-gray-900">Worker CV</h3>
              <button
                onClick={handleCloseCVModal}
                className="text-gray-400 hover:text-gray-700 text-xl"
                aria-label="Close CV viewer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedCV}
                className="w-full h-full"
                title="Worker CV"
                type="application/pdf"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsDetails;

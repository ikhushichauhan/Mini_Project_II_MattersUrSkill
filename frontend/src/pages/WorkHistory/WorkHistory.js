import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications, getMyAssignedTasks, markTaskCompleted, withdrawApplication } from '../../api/taskAPI';
import ChatWindow from '../../components/ChatWindow/ChatWindow';

const EMPHASIS_CARD = 'rounded-lg border shadow-md';

const APPLICATION_STATUS_MAP = {
  pending: 'badge-pending',
  accepted: 'badge-active',
  rejected: 'badge-closed',
};

const WorkHistory = () => {
  const navigate = useNavigate();
  const { user, isWorker } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatTask, setChatTask] = useState(null);
  const [chatOtherUser, setChatOtherUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isWorker) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [appsRes, assignedRes] = await Promise.all([
          getMyApplications(),
          getMyAssignedTasks(),
        ]);

        setApplications(appsRes.data || []);
        
        const assigned = assignedRes.data || [];
        setAssignedTasks(assigned.filter((t) => t.status !== 'completed'));
        setCompletedTasks(assigned.filter((t) => t.status === 'completed'));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load work history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isWorker, navigate, refreshTrigger]);

  const handleMarkCompleted = async (taskId) => {
    try {
      await markTaskCompleted(taskId);
      const task = assignedTasks.find((t) => t._id === taskId);
      if (task) {
        setAssignedTasks((prev) => prev.filter((t) => t._id !== taskId));
        setCompletedTasks((prev) => [...prev, { ...task, status: 'completed' }]);
        setActionMessage('Task marked as completed');
      }
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleWithdrawApplication = async (taskId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await withdrawApplication(taskId);
      setActionMessage('Application withdrawn successfully');
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to withdraw application');
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
        className="border-b pt-16"
        style={{
          background: 'var(--card-bg)',
          borderColor: '#000000'
        }}
      >
        <div className="section-container py-10">
          <button onClick={() => navigate(-1)} className="text-sm hover:text-gray-600 mb-4" style={{ color: '#000000' }}>
            ← Back
          </button>
          <h1 className="section-title" style={{ color: '#000000' }}>Work History</h1>
          <p className="text-sm mt-2" style={{ color: '#000000' }}>
            Track your applications, assigned jobs, and completed work
          </p>
        </div>
      </div>

      <div className="section-container py-10">
        {actionMessage && (
          <div className="mb-6 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800">
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: '#000000' }}>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-3 text-sm font-semibold transition-colors`}
            style={{
              color: activeTab === 'applications' ? '#ffffff' : '#6b7280',
              borderBottom: activeTab === 'applications' ? '2px solid #ffffff' : 'none'
            }}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-3 text-sm font-semibold transition-colors`}
            style={{
              color: activeTab === 'assigned' ? '#ffffff' : '#6b7280',
              borderBottom: activeTab === 'assigned' ? '2px solid #ffffff' : 'none'
            }}
          >
            Assigned Jobs ({assignedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 text-sm font-semibold transition-colors`}
            style={{
              color: activeTab === 'completed' ? '#ffffff' : '#6b7280',
              borderBottom: activeTab === 'completed' ? '2px solid #ffffff' : 'none'
            }}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className={`${EMPHASIS_CARD} p-8 text-center`} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                <p className="text-gray-700 text-sm">No applications yet</p>
                <p className="text-gray-500 text-xs mt-2">Apply to jobs from the Find Work page</p>
              </div>
            ) : (
              applications.map(({ task, application }) => {
                const statusKey = (application?.status || 'pending').toLowerCase();
                const badgeClass = APPLICATION_STATUS_MAP[statusKey] || 'badge-pending';
                const appliedOn = application?.createdAt
                  ? new Date(application.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <div key={task?._id || application?._id} className={EMPHASIS_CARD} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-base" style={{ color: '#000000' }}>{task?.title || 'Task'}</p>
                            <span className={badgeClass}>{statusKey}</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {task?.postedBy?.name || 'Provider'} • {task?.location?.isRemote ? 'Remote' : task?.location?.city || 'N/A'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">Applied on {appliedOn}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-700 mb-3">
                        <div>
                          <p className="uppercase tracking-widest text-[10px] text-gray-500 mb-1">Availability</p>
                          <p>
                            {application?.availability?.startDate || 'Not specified'}
                            {application?.availability?.hoursPerWeek && ` • ${application.availability.hoursPerWeek} hrs/week`}
                          </p>
                        </div>
                        <div>
                          <p className="uppercase tracking-widest text-[10px] text-gray-500 mb-1">Expected Rate</p>
                          <p>
                            {application?.expectedRate?.amount !== undefined
                              ? `${application.expectedRate.currency || 'INR'} ${application.expectedRate.amount} (${application.expectedRate.type || 'fixed'})`
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {application?.message && (
                        <p className="text-xs text-gray-600 leading-relaxed mb-3">
                          <span className="font-semibold">Message:</span> "{application.message}"
                        </p>
                      )}

                      {application?.portfolioLink && (
                        <a
                          href={application.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex text-xs text-blue-600 underline mb-3"
                        >
                          View portfolio
                        </a>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-300">
                        {statusKey === 'pending' && (
                          <button
                            onClick={() => handleWithdrawApplication(task._id)}
                            className="rounded-lg px-4 py-1.5 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Withdraw
                          </button>
                        )}
                        {statusKey === 'accepted' && (
                          <button
                            onClick={() => handleOpenChat(task, task.postedBy)}
                            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors"
                            style={{ background: 'var(--bg-primary)' }}
                          >
                            Chat with Provider
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {assignedTasks.length === 0 ? (
              <div className={`${EMPHASIS_CARD} p-8 text-center`} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                <p className="text-gray-700 text-sm">No assigned jobs yet</p>
                <p className="text-gray-500 text-xs mt-2">When a provider accepts your application, it will appear here</p>
              </div>
            ) : (
              assignedTasks.map((task) => (
                <div key={task._id} className={EMPHASIS_CARD} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-black text-base">{task.title}</p>
                          <span className="badge-brand">{task.status}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {task.postedBy?.name || 'Provider'} • {task.location?.isRemote ? 'Remote' : task.location?.city || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-700">
                        <p className="font-semibold text-black">
                          {task.budget?.amount ? `₹${task.budget.amount}` : 'Budget not shared'}
                        </p>
                        {task.duration?.value && (
                          <p className="mt-0.5">{task.duration.value} {task.duration.unit}</p>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">{task.description}</p>
                    )}

                    {task.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {task.skillsRequired.map((skill) => (
                          <span key={skill} className="badge-closed text-xs">{skill}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-300">
                      <button
                        onClick={() => handleMarkCompleted(task._id)}
                        className="btn-primary text-xs"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <div className={`${EMPHASIS_CARD} p-8 text-center`} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                <p className="text-gray-700 text-sm">No completed jobs yet</p>
                <p className="text-gray-500 text-xs mt-2">Complete your assigned jobs to build your work history</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <div key={task._id} className={EMPHASIS_CARD} style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-black text-base">{task.title}</p>
                          <span className="badge-active">completed</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {task.postedBy?.name || 'Provider'} • {task.location?.isRemote ? 'Remote' : task.location?.city || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-700">
                        <p className="font-semibold text-black">
                          {task.budget?.amount ? `₹${task.budget.amount}` : 'Budget not shared'}
                        </p>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showChatWindow && chatTask && chatOtherUser && (
        <ChatWindow
          taskId={chatTask}
          otherUser={chatOtherUser}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default WorkHistory;

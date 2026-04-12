import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as adminAPI from '../../api/adminAPI';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState({ role: '', isBlocked: '', search: '' });
  const [transactions, setTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState('');
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState({ status: '', severity: '' });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    loadTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'dashboard':
          await loadDashboardStats();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'transactions':
          await loadTransactions();
          break;
        case 'reports':
          await loadReports();
          break;
        case 'jobs':
          await loadJobs();
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    const response = await adminAPI.getDashboardStats();
    setStats(response.data);
  };

  const loadUsers = async () => {
    const response = await adminAPI.getAllUsers(userFilter);
    setUsers(response.data);
  };

  const handleBlockUser = async (userId) => {
    const reason = prompt('Enter reason for blocking:');
    if (!reason) return;
    try {
      await adminAPI.blockUser(userId, reason);
      alert('User blocked successfully');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    try {
      await adminAPI.unblockUser(userId);
      alert('User unblocked successfully');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      alert('User verified successfully');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      alert('User deleted successfully');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const loadTransactions = async () => {
    const params = transactionFilter ? { status: transactionFilter } : {};
    const response = await adminAPI.getAllTransactions(params);
    setTransactions(response.data);
  };

  const handleReleasePayment = async (transactionId) => {
    const notes = prompt('Enter notes (optional):');
    try {
      await adminAPI.updateTransactionStatus(transactionId, 'released', notes || '');
      alert('Payment released successfully');
      loadTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release payment');
    }
  };

  const loadReports = async () => {
    const response = await adminAPI.getAllReports(reportFilter);
    setReports(response.data);
  };

  const handleResolveReport = async (reportId, action) => {
    const adminNotes = prompt(`Enter notes for ${action}:`);
    try {
      await adminAPI.resolveReport(reportId, action, adminNotes || '');
      alert(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'} successfully`);
      loadReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report');
    }
  };

  const loadJobs = async () => {
    const response = await adminAPI.getAllJobs();
    setJobs(response.data);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await adminAPI.deleteJob(jobId);
      alert('Job deleted successfully');
      loadJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Users' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'reports', label: 'Reports' },
    { key: 'jobs', label: 'Jobs' },
  ];

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex">
        <aside className="w-64 min-h-screen border-r" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h2 className="text-lg font-bold text-black">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">MattersUrSkills</p>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-gray-600">Logged in as:</p>
            <p className="text-sm text-black font-medium truncate">{user?.name}</p>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg border" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-gray-400 mt-2">Loading...</p>
            </div>
          )}

          {activeTab === 'dashboard' && stats && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm text-gray-400 mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-2">Workers: {stats.totalWorkers} | Providers: {stats.totalProviders}</p>
                </div>
                <div className="p-6 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm text-gray-400 mb-2">Total Jobs</p>
                  <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
                  <p className="text-xs text-gray-500 mt-2">Open: {stats.openJobs} | Completed: {stats.completedJobs}</p>
                </div>
                <div className="p-6 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm text-gray-400 mb-2">Total Earnings</p>
                  <p className="text-3xl font-bold text-white">₹{stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2">Transactions: {stats.totalTransactions}</p>
                </div>
                <div className="p-6 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm text-gray-400 mb-2">Pending Reports</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
                  <p className="text-xs text-gray-500 mt-2">Requires attention</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">User Management</h1>
              <div className="mb-6 p-4 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="px-4 py-2 rounded-lg border bg-black text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    value={userFilter.search}
                    onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                  />
                  <select
                    className="px-4 py-2 rounded-lg border bg-black text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    value={userFilter.role}
                    onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    <option value="worker">Worker</option>
                    <option value="provider">Provider</option>
                  </select>
                  <select
                    className="px-4 py-2 rounded-lg border bg-black text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    value={userFilter.isBlocked}
                    onChange={(e) => setUserFilter({ ...userFilter, isBlocked: e.target.value })}
                  >
                    <option value="">All Status</option>
                    <option value="false">Active</option>
                    <option value="true">Blocked</option>
                  </select>
                  <button onClick={loadUsers} className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200">
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <table className="w-full">
                  <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Verified</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4 py-3 text-sm text-white font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.isBlocked ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.isVerified ? (
                            <span className="text-green-400">Verified</span>
                          ) : (
                            <span className="text-gray-500">Not verified</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {!user.isVerified && (
                              <button onClick={() => handleVerifyUser(user._id)} className="px-3 py-1 text-xs font-medium rounded bg-white text-black hover:bg-gray-200">
                                Verify
                              </button>
                            )}
                            {user.isBlocked ? (
                              <button onClick={() => handleUnblockUser(user._id)} className="px-3 py-1 text-xs font-medium rounded border text-white hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                Unblock
                              </button>
                            ) : (
                              <button onClick={() => handleBlockUser(user._id)} className="px-3 py-1 text-xs font-medium rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                Block
                              </button>
                            )}
                            <button onClick={() => handleDeleteUser(user._id)} className="px-3 py-1 text-xs font-medium rounded text-gray-400 hover:text-white">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No users found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Transaction Management</h1>
              <div className="mb-6 p-4 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex gap-4">
                  <select
                    className="px-4 py-2 rounded-lg border bg-black text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    value={transactionFilter}
                    onChange={(e) => setTransactionFilter(e.target.value)}
                  >
                    <option value="">All Transactions</option>
                    <option value="pending">Pending</option>
                    <option value="on-hold">On Hold</option>
                    <option value="released">Released</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button onClick={loadTransactions} className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200">
                    Apply Filter
                  </button>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <table className="w-full">
                  <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Worker</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Job</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {transactions.map((txn) => (
                      <tr key={txn._id}>
                        <td className="px-4 py-3 text-sm text-white font-medium">{txn.provider?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{txn.worker?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-white font-semibold">₹{txn.amount}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{txn.job?.title || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {txn.status === 'on-hold' && (
                            <button onClick={() => handleReleasePayment(txn._id)} className="px-3 py-1 text-xs font-medium rounded bg-white text-black hover:bg-gray-200">
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No transactions found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Reports Management</h1>
              <div className="mb-6 p-4 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    className="px-4 py-2 rounded-lg border bg-black text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    value={reportFilter.status}
                    onChange={(e) => setReportFilter({ ...reportFilter, status: e.target.value })}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under-review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <select
                    className="px-4 py-2 rounded-lg border bg-black text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    value={reportFilter.severity}
                    onChange={(e) => setReportFilter({ ...reportFilter, severity: e.target.value })}
                  >
                    <option value="">All Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button onClick={loadReports} className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200">
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="p-6 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            {report.severity}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                            {report.reportType}
                          </span>
                          <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-white font-medium mb-1">Reporter: {report.reporter?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{report.reason}</p>
                        {report.adminNotes && (
                          <p className="text-xs text-gray-500 mt-2">Admin Notes: {report.adminNotes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {report.status === 'pending' && (
                          <>
                            <button onClick={() => handleResolveReport(report._id, 'resolve')} className="px-3 py-1 text-xs font-medium rounded bg-white text-black hover:bg-gray-200">
                              Resolve
                            </button>
                            <button onClick={() => handleResolveReport(report._id, 'dismiss')} className="px-3 py-1 text-xs font-medium rounded text-gray-400 hover:text-white">
                              Dismiss
                            </button>
                          </>
                        )}
                        {report.status !== 'pending' && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                            {report.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="p-8 rounded-lg border text-center text-gray-500" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    No reports found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h1 className="text-xl font-bold text-white mb-6">Job Management</h1>
              <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <table className="w-full">
                  <thead className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Salary</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Posted</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {jobs.map((job) => (
                      <tr key={job._id}>
                        <td className="px-4 py-3 text-sm text-white font-medium">{job.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{job.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{job.provider?.user?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-white">₹{job.salary}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteJob(job._id)} className="px-3 py-1 text-xs font-medium rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No jobs found</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

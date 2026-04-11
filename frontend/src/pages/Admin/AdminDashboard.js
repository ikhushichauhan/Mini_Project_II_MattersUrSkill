import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as adminAPI from '../../api/adminAPI';
import './Admin.css';

const TH = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
    {children}
  </th>
);

const TD = ({ children, cls = '' }) => (
  <td className={`px-4 py-3 text-sm text-neutral-300 ${cls}`}>{children}</td>
);

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard Stats
  const [stats, setStats] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState({ role: '', isBlocked: '', search: '' });

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState('');

  // Reports
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState({ status: '', severity: '' });

  // Jobs
  const [jobs, setJobs] = useState([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Load data based on active tab
  useEffect(() => {
    loadTabData();
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
        case 'audit':
          await loadAuditLogs();
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

  const loadAuditLogs = async () => {
    const response = await adminAPI.getAuditLogs({ limit: 50 });
    setAuditLogs(response.data);
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'transactions', label: 'Transactions', icon: '💰' },
    { key: 'reports', label: 'Reports', icon: '🚩' },
    { key: 'jobs', label: 'Jobs', icon: '💼' },
    { key: 'audit', label: 'Audit Logs', icon: '📝' },
  ];

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface flex pt-16">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col">
        <div className="px-4 py-4 border-b border-surface-border">
          <p className="text-sm font-bold text-white">Admin Panel</p>
          <p className="text-xs text-neutral-600 mt-0.5">MattersUrSkills</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeTab === key
                  ? 'bg-brand-500/12 text-brand-300 border-l-2 border-brand-500 pl-[10px]'
                  : 'text-neutral-400 hover:text-white hover:bg-surface-hover'
              }`}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-surface-border">
          <div className="px-3 py-2 text-xs text-neutral-500">
            <p>Logged in as:</p>
            <p className="text-white font-medium truncate">{user?.name}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <p className="text-neutral-400 mt-2">Loading...</p>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h1 className="section-title mb-6">Dashboard Overview</h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card p-5">
                  <p className="text-xs text-neutral-500 font-medium mb-2">Total Users</p>
                  <p className="text-2xl font-extrabold text-brand-400">{stats.totalUsers}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Workers: {stats.totalWorkers} | Providers: {stats.totalProviders}
                  </p>
                </div>

                <div className="card p-5">
                  <p className="text-xs text-neutral-500 font-medium mb-2">Total Jobs</p>
                  <p className="text-2xl font-extrabold text-accent">{stats.totalJobs}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Open: {stats.openJobs} | Completed: {stats.completedJobs}
                  </p>
                </div>

                <div className="card p-5">
                  <p className="text-xs text-neutral-500 font-medium mb-2">Total Earnings</p>
                  <p className="text-2xl font-extrabold text-success">₹{stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Transactions: {stats.totalTransactions}
                  </p>
                </div>

                <div className="card p-5">
                  <p className="text-xs text-neutral-500 font-medium mb-2">Pending Reports</p>
                  <p className="text-2xl font-extrabold text-warning">{stats.pendingReports}</p>
                  <p className="text-xs text-neutral-600 mt-1">Requires attention</p>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => setActiveTab('users')} className="btn-outline text-sm py-2">
                    Manage Users
                  </button>
                  <button onClick={() => setActiveTab('transactions')} className="btn-outline text-sm py-2">
                    View Transactions
                  </button>
                  <button onClick={() => setActiveTab('reports')} className="btn-outline text-sm py-2">
                    Review Reports
                  </button>
                  <button onClick={() => setActiveTab('audit')} className="btn-outline text-sm py-2">
                    Audit Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <h1 className="section-title mb-6">User Management</h1>

              {/* Filters */}
              <div className="card p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="input-field"
                    value={userFilter.search}
                    onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                  />
                  <select
                    className="input-field"
                    value={userFilter.role}
                    onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    <option value="worker">Worker</option>
                    <option value="provider">Provider</option>
                  </select>
                  <select
                    className="input-field"
                    value={userFilter.isBlocked}
                    onChange={(e) => setUserFilter({ ...userFilter, isBlocked: e.target.value })}
                  >
                    <option value="">All Status</option>
                    <option value="false">Active</option>
                    <option value="true">Blocked</option>
                  </select>
                  <button onClick={loadUsers} className="btn-primary">
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      <TH>Name</TH>
                      <TH>Email</TH>
                      <TH>Role</TH>
                      <TH>Status</TH>
                      <TH>Verified</TH>
                      <TH>Actions</TH>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <TD cls="font-medium text-white">{user.name}</TD>
                        <TD cls="text-xs">{user.email}</TD>
                        <TD>
                          <span className={user.role === 'worker' ? 'badge-active' : 'badge-brand'}>
                            {user.role}
                          </span>
                        </TD>
                        <TD>
                          {user.isBlocked ? (
                            <span className="badge bg-red-500/15 text-red-400 border border-red-500/25">
                              Blocked
                            </span>
                          ) : (
                            <span className="badge-active">Active</span>
                          )}
                        </TD>
                        <TD>
                          {user.isVerified ? (
                            <span className="text-success">✓ Verified</span>
                          ) : (
                            <span className="text-neutral-500">Not verified</span>
                          )}
                        </TD>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {!user.isVerified && (
                              <button
                                onClick={() => handleVerifyUser(user._id)}
                                className="btn-primary text-xs px-2 py-1"
                              >
                                Verify
                              </button>
                            )}
                            {user.isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(user._id)}
                                className="btn-outline text-xs px-2 py-1"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(user._id)}
                                className="btn-danger text-xs px-2 py-1"
                              >
                                Block
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn-ghost text-xs px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">No users found</div>
                )}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div>
              <h1 className="section-title mb-6">Transaction Management</h1>

              {/* Filter */}
              <div className="card p-4 mb-4">
                <div className="flex gap-3">
                  <select
                    className="input-field"
                    value={transactionFilter}
                    onChange={(e) => setTransactionFilter(e.target.value)}
                  >
                    <option value="">All Transactions</option>
                    <option value="pending">Pending</option>
                    <option value="on-hold">On Hold</option>
                    <option value="released">Released</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button onClick={loadTransactions} className="btn-primary">
                    Apply Filter
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      <TH>Provider</TH>
                      <TH>Worker</TH>
                      <TH>Amount</TH>
                      <TH>Job</TH>
                      <TH>Status</TH>
                      <TH>Date</TH>
                      <TH>Actions</TH>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {transactions.map((txn) => (
                      <tr key={txn._id}>
                        <TD cls="font-medium">{txn.provider?.name || 'N/A'}</TD>
                        <TD>{txn.worker?.name || 'N/A'}</TD>
                        <TD cls="font-semibold text-success">₹{txn.amount}</TD>
                        <TD cls="text-xs">{txn.job?.title || 'N/A'}</TD>
                        <TD>
                          <span
                            className={
                              txn.status === 'released'
                                ? 'badge-active'
                                : txn.status === 'on-hold'
                                ? 'badge-pending'
                                : 'badge-closed'
                            }
                          >
                            {txn.status}
                          </span>
                        </TD>
                        <TD cls="text-xs text-neutral-500">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </TD>
                        <td className="px-4 py-3">
                          {txn.status === 'on-hold' && (
                            <button
                              onClick={() => handleReleasePayment(txn._id)}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">No transactions found</div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div>
              <h1 className="section-title mb-6">Reports Management</h1>

              {/* Filters */}
              <div className="card p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    className="input-field"
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
                    className="input-field"
                    value={reportFilter.severity}
                    onChange={(e) => setReportFilter({ ...reportFilter, severity: e.target.value })}
                  >
                    <option value="">All Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button onClick={loadReports} className="btn-primary">
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="card p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span
                            className={`badge ${
                              report.severity === 'critical'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                                : report.severity === 'high'
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                                : 'badge-pending'
                            }`}
                          >
                            {report.severity}
                          </span>
                          <span className="badge-closed">{report.reportType}</span>
                          <span className="text-xs text-neutral-600">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium mb-1">
                          Reporter: {report.reporter?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-neutral-400">{report.reason}</p>
                        {report.adminNotes && (
                          <p className="text-xs text-neutral-500 mt-2">
                            Admin Notes: {report.adminNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveReport(report._id, 'resolve')}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveReport(report._id, 'dismiss')}
                              className="btn-ghost text-xs px-3 py-1.5"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        {report.status !== 'pending' && (
                          <span className="badge-active">{report.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="card p-8 text-center text-neutral-500">No reports found</div>
                )}
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div>
              <h1 className="section-title mb-6">Job Management</h1>

              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      <TH>Title</TH>
                      <TH>Category</TH>
                      <TH>Provider</TH>
                      <TH>Salary</TH>
                      <TH>Status</TH>
                      <TH>Posted</TH>
                      <TH>Actions</TH>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {jobs.map((job) => (
                      <tr key={job._id}>
                        <TD cls="font-medium text-white">{job.title}</TD>
                        <TD>{job.category}</TD>
                        <TD cls="text-xs">{job.provider?.user?.name || 'N/A'}</TD>
                        <TD cls="text-success">₹{job.salary}</TD>
                        <TD>
                          <span
                            className={
                              job.status === 'open'
                                ? 'badge-active'
                                : job.status === 'in-progress'
                                ? 'badge-pending'
                                : 'badge-closed'
                            }
                          >
                            {job.status}
                          </span>
                        </TD>
                        <TD cls="text-xs text-neutral-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TD>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="btn-danger text-xs px-3 py-1.5"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobs.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">No jobs found</div>
                )}
              </div>
            </div>
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div>
              <h1 className="section-title mb-6">Audit Logs</h1>

              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      <TH>Admin</TH>
                      <TH>Action</TH>
                      <TH>Details</TH>
                      <TH>IP Address</TH>
                      <TH>Timestamp</TH>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <TD cls="font-medium">{log.admin?.name || 'Unknown'}</TD>
                        <TD>
                          <span className="badge-brand text-xs">{log.action}</span>
                        </TD>
                        <TD cls="text-xs">{log.details || '-'}</TD>
                        <TD cls="text-xs font-mono text-neutral-500">{log.ipAddress || '-'}</TD>
                        <TD cls="text-xs text-neutral-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">No audit logs found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

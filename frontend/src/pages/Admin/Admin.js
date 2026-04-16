import React, { useState } from 'react';

const dashboardStats = [
  { label: 'Total Users',            value: '15,842', change: '+12%', up: true,  color: 'text-brand-400' },
  { label: 'Active Jobs',            value: '1,234',  change: '+8%',  up: true,  color: 'text-accent' },
  { label: 'Total Revenue',          value: 'Rs 12.5L', change: '+23%', up: true, color: 'text-success' },
  { label: 'Pending Verifications',  value: '47',     change: '-5%',  up: false, color: 'text-warning' },
];

const pendingVerifications = [
  { id: 1, name: 'Rajesh Kumar',  type: 'Worker',   detail: 'Plumber',           date: '2024-01-15', docs: 'Aadhaar, Certificate' },
  { id: 2, name: 'Priya Sharma',  type: 'Provider', detail: 'Home Services Ltd', date: '2024-01-14', docs: 'GST, PAN' },
  { id: 3, name: 'Amit Singh',    type: 'Worker',   detail: 'Electrician',       date: '2024-01-13', docs: 'Aadhaar, License' },
  { id: 4, name: 'Sunita Devi',   type: 'Worker',   detail: 'Cleaner',           date: '2024-01-12', docs: 'Aadhaar' },
];

const complaints = [
  { id: 1, from: 'Priya Sharma',  against: 'Ravi Kumar',   issue: 'Work not completed',         priority: 'high',   date: '2024-01-15', status: 'Open' },
  { id: 2, from: 'Home Services', against: 'Amit Singh',   issue: 'Unprofessional behavior',    priority: 'medium', date: '2024-01-14', status: 'Under Review' },
  { id: 3, from: 'Sunita Devi',   against: 'XYZ Corp',     issue: 'Payment delayed',            priority: 'high',   date: '2024-01-13', status: 'Open' },
  { id: 4, from: 'Rahul Verma',   against: 'ABC Pvt Ltd',  issue: 'Unsafe working conditions',  priority: 'low',    date: '2024-01-12', status: 'Resolved' },
];

const reports = [
  { id: 1, type: 'Fraud',  reporter: 'System Auto',  target: 'fake_worker@email.com',    description: 'Multiple fake profiles detected',   date: '2024-01-15', severity: 'Critical' },
  { id: 2, type: 'Spam',   reporter: 'User Report',  target: 'spam_provider@email.com',  description: 'Sending unsolicited messages',       date: '2024-01-14', severity: 'Medium' },
  { id: 3, type: 'Abuse',  reporter: 'Moderation',   target: 'abusive_user@email.com',   description: 'Violating community guidelines',     date: '2024-01-13', severity: 'High' },
];

const payments = [
  { id: 'PAY001', from: 'Home Services Ltd', to: 'Rajesh Kumar', amount: 'Rs 2,500', job: 'Pipe Repair',       date: '2024-01-15', status: 'on-hold' },
  { id: 'PAY002', from: 'ABC Corp',          to: 'Amit Singh',   amount: 'Rs 3,200', job: 'Electrical Wiring', date: '2024-01-14', status: 'released' },
  { id: 'PAY003', from: 'XYZ Pvt',           to: 'Sunita Devi',  amount: 'Rs 1,800', job: 'Deep Cleaning',     date: '2024-01-13', status: 'pending' },
  { id: 'PAY004', from: 'PQR Ltd',           to: 'Ravi Kumar',   amount: 'Rs 4,100', job: 'AC Installation',   date: '2024-01-12', status: 'on-hold' },
];

const dbStats = [
  { label: 'Total Records',      value: '89,432' },
  { label: 'DB Size',            value: '2.4 GB' },
  { label: 'Active Connections', value: '23' },
  { label: 'Last Backup',        value: '2h ago' },
];

const recentActivity = [
  { msg: 'New worker registration: Priya Sharma',           time: '2 min ago',  dot: 'bg-brand-500' },
  { msg: 'Job completed: Electrical Repair #J234',          time: '15 min ago', dot: 'bg-success' },
  { msg: 'Payment released: Rs 3,200 to Amit Singh',       time: '1 hr ago',   dot: 'bg-accent' },
  { msg: 'New complaint filed: Fraud Report #C89',          time: '2 hr ago',   dot: 'bg-warning' },
  { msg: 'Account suspended: fake_user@email.com',          time: '3 hr ago',   dot: 'bg-danger' },
];

const navItems = [
  { key: 'dashboard',     label: 'Dashboard' },
  { key: 'verifications', label: 'Verifications' },
  { key: 'complaints',    label: 'Complaints' },
  { key: 'reports',       label: 'Reports' },
  { key: 'payments',      label: 'Payments' },
  { key: 'database',      label: 'Database' },
];

const priorityBadge = (p) => {
  if (p === 'high')   return 'badge bg-red-500/15 text-red-400 border border-red-500/25';
  if (p === 'medium') return 'badge bg-brand-500/15 text-brand-300 border border-brand-500/25';
  return 'badge-closed';
};

const statusBadge = (s) => {
  if (s === 'released') return 'badge-active';
  if (s === 'on-hold')  return 'badge-pending';
  return 'badge-closed';
};

const TH = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
    {children}
  </th>
);
const TD = ({ children, cls = '' }) => (
  <td className={`px-4 py-3 text-sm text-neutral-900 ${cls}`}>{children}</td>
);

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData,  setLoginData]  = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab,  setActiveTab]  = useState('dashboard');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.email === 'admin@mattersurskills.com' && loginData.password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use the demo credentials below.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <img
              src="/images/logo.png"
              alt="MattersUrSkills"
              className="h-12 w-auto object-contain mx-auto mb-2 select-none"
              draggable="false"
            />
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Admin Control Panel</p>
          </div>

          <div className="card">
            <h2 className="font-bold text-white text-base mb-1">Admin Sign In</h2>
            <p className="text-xs text-neutral-500 mb-5">Restricted access  authorised personnel only</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label-text">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@mattersurskills.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label-text">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              {loginError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {loginError}
                </p>
              )}
              <button type="submit" className="btn-primary w-full">
                Sign In
              </button>
            </form>

            <div className="mt-5 p-4 bg-brand-500/5 border border-brand-500/20 rounded-lg">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Demo Credentials</p>
              <p className="text-xs text-neutral-400">Email: <span className="text-white font-mono">admin@mattersurskills.com</span></p>
              <p className="text-xs text-neutral-400 mt-1">Password: <span className="text-white font-mono">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex pt-16">

      <aside className="w-56 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col">
        <div className="px-4 py-4 border-b border-surface-border">
          <p className="text-sm font-bold text-white">Admin Panel</p>
          <p className="text-xs text-neutral-600 mt-0.5">MattersUrSkills</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeTab === key
                  ? 'bg-brand-500/12 text-brand-300 border-l-2 border-brand-500 pl-[10px]'
                  : 'text-neutral-400 hover:text-white hover:bg-surface-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-surface-border">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-white hover:bg-surface-hover transition-colors duration-150"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl">

          {activeTab === 'dashboard' && (
            <div>
              <p className="section-label">Overview</p>
              <h1 className="section-title mb-6">Dashboard</h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {dashboardStats.map((s) => (
                  <div key={s.label} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs text-neutral-500 font-medium leading-snug">{s.label}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.up ? 'bg-success/10 text-success' : 'bg-danger/10 text-red-400'
                      }`}>
                        {s.change}
                      </span>
                    </div>
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <p className="font-semibold text-white text-sm mb-4">Recent Activity</p>
                <div className="space-y-3 divide-y divide-surface-border">
                  {recentActivity.map((a, i) => (
                    <div key={i} className={`flex items-start gap-3 ${i > 0 ? 'pt-3' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <p className="text-sm text-neutral-300">{a.msg}</p>
                        <p className="text-xs text-neutral-600 flex-shrink-0">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div>
              <p className="section-label">KYC</p>
              <h1 className="section-title mb-6">Pending Verifications</h1>
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      {['Name', 'Type', 'Detail', 'Documents', 'Submitted', 'Actions'].map((h) => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {pendingVerifications.map((v) => (
                      <tr key={v.id}>
                        <TD cls="font-medium text-white">{v.name}</TD>
                        <TD>
                          <span className={v.type === 'Worker' ? 'badge-active' : 'badge-brand'}>{v.type}</span>
                        </TD>
                        <TD>{v.detail}</TD>
                        <TD cls="text-xs">{v.docs}</TD>
                        <TD cls="text-neutral-500 text-xs">{v.date}</TD>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="btn-primary text-xs px-3 py-1.5">Approve</button>
                            <button className="btn-danger text-xs px-3 py-1.5">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div>
              <p className="section-label">Disputes</p>
              <h1 className="section-title mb-6">Complaints</h1>
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      {['From', 'Against', 'Issue', 'Priority', 'Date', 'Status', 'Action'].map((h) => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {complaints.map((c) => (
                      <tr key={c.id}>
                        <TD cls="font-medium text-white">{c.from}</TD>
                        <TD>{c.against}</TD>
                        <TD cls="max-w-[160px] truncate">{c.issue}</TD>
                        <td className="px-4 py-3">
                          <span className={priorityBadge(c.priority)}>{c.priority}</span>
                        </td>
                        <TD cls="text-neutral-500 text-xs">{c.date}</TD>
                        <td className="px-4 py-3">
                          <span className={`${c.status === 'Resolved' ? 'badge-active' : c.status === 'Under Review' ? 'badge-pending' : 'badge-closed'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="btn-outline text-xs px-3 py-1.5">Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <p className="section-label">Moderation</p>
              <h1 className="section-title mb-6">System Reports</h1>
              <div className="space-y-4">
                {reports.map((r) => (
                  <div key={r.id} className="card p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`badge ${
                            r.severity === 'Critical' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                            r.severity === 'High'     ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25' :
                            'badge-pending'
                          }`}>{r.severity}</span>
                          <span className="badge-closed">{r.type}</span>
                          <span className="text-xs text-neutral-600">{r.date}</span>
                        </div>
                        <p className="text-sm text-white font-medium mb-0.5">
                          Target: <span className="font-mono text-neutral-300 font-normal">{r.target}</span>
                        </p>
                        <p className="text-xs text-neutral-400">{r.description}</p>
                        <p className="text-xs text-neutral-600 mt-1">Reported by: {r.reporter}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="btn-danger text-xs px-3 py-1.5">Investigate</button>
                        <button className="btn-ghost text-xs px-3 py-1.5">Dismiss</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <p className="section-label">Finance</p>
              <h1 className="section-title mb-6">Payment Management</h1>
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      {['ID', 'From', 'To', 'Amount', 'Job', 'Date', 'Status', 'Actions'].map((h) => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <TD cls="font-mono text-xs text-neutral-500">{p.id}</TD>
                        <TD cls="font-medium text-white">{p.from}</TD>
                        <TD>{p.to}</TD>
                        <TD cls="font-semibold text-success">{p.amount}</TD>
                        <TD>{p.job}</TD>
                        <TD cls="text-neutral-500 text-xs">{p.date}</TD>
                        <td className="px-4 py-3">
                          <span className={statusBadge(p.status)}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {p.status === 'on-hold' && (
                              <button className="btn-primary text-xs px-3 py-1.5">Release</button>
                            )}
                            <button className="btn-ghost text-xs px-3 py-1.5">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div>
              <p className="section-label">Infrastructure</p>
              <h1 className="section-title mb-6">Database Overview</h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {dbStats.map((s) => (
                  <div key={s.label} className="card p-5 text-center">
                    <p className="text-2xl font-extrabold text-white mb-1">{s.value}</p>
                    <p className="text-xs text-neutral-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: 'users',     records: 15842, size: '845 MB' },
                  { name: 'jobs',      records: 8234,  size: '412 MB' },
                  { name: 'workers',   records: 6718,  size: '623 MB' },
                  { name: 'providers', records: 3124,  size: '286 MB' },
                ].map((col) => (
                  <div key={col.name} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm font-mono">{col.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {col.records.toLocaleString()} records &bull; {col.size}
                      </p>
                    </div>
                    <span className="badge-active">healthy</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
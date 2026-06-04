import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // General & Notification Settings State
  const [settings, setSettings] = useState({
    siteName: 'PlaceTrack Portal',
    maintenanceMode: false,
    registrationOpen: true,
    emailNotifications: true,
    adminAlerts: true,
    weeklyReports: true
  });

  // Security State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Logs State
  const [logs, setLogs] = useState([
    { id: 1, event: 'Admin Login', user: 'admin@placetrack.com', time: '2 mins ago', status: 'Success' },
    { id: 2, event: 'Settings Updated', user: 'admin@placetrack.com', time: '1 hour ago', status: 'Success' },
    { id: 3, event: 'Database Backup', user: 'System', time: '4 hours ago', status: 'Success' },
    { id: 4, event: 'Bulk Broadcast', user: 'admin@placetrack.com', time: '1 day ago', status: 'Success' }
  ]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('System settings updated successfully!');
      addLog('System Configuration Updated');
    }, 1000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password changed successfully!');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addLog('Admin Password Changed');
    }, 1500);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated`);
  };

  const addLog = (event) => {
    const newLog = {
      id: Date.now(),
      event,
      user: user?.email || 'Admin',
      time: 'Just now',
      status: 'Success'
    };
    setLogs([newLog, ...logs]);
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success('Audit logs cleared');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'system', label: 'System Logs', icon: 'analytics' }
  ];

  return (
    <div className="bg-[#f8f9f8] min-h-screen flex flex-col font-poppins antialiased">
      <AdminNavbar />

      <main className="max-w-[1200px] mx-auto w-full p-4 md:p-8 animate-fade-in-up">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-[#111827] tracking-tight">System Settings</h1>
          <p className="text-[#6b7280] text-sm font-semibold mt-1">Configure platform-wide preferences and administrative controls.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm tracking-tight ${activeTab === tab.id
                  ? 'bg-[#1a4d2e] text-white shadow-lg translate-x-2'
                  : 'bg-white text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f9fafb]'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-[32px] border border-[#e5e7eb] shadow-sm overflow-hidden">
            {activeTab === 'general' && (
              <div className="p-8 md:p-10 space-y-10">
                <section>
                  <h3 className="text-xl font-semibold text-[#111827] mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[#1a4d2e] rounded-full"></span>
                    Platform Configuration
                  </h3>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest px-1">Platform Display Name</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-5 py-3.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl text-sm font-semibold text-[#111827] outline-none focus:ring-2 focus:ring-[#1a4d2e]/10 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#374151]">Maintenance Mode</p>
                          <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider">Disable access for users</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSetting('maintenanceMode')}
                          className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-[#e5e7eb]'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>

                      <div className="p-5 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#374151]">Public Registration</p>
                          <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider">Allow new signups</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSetting('registrationOpen')}
                          className={`w-12 h-6 rounded-full relative transition-colors ${settings.registrationOpen ? 'bg-[#1a4d2e]' : 'bg-[#e5e7eb]'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.registrationOpen ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#f3f4f6] flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-[#1a4d2e] text-white rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#2d5d41] transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                      >
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                        {loading ? 'Saving...' : 'Apply Changes'}
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-8 md:p-10 space-y-10">
                <section>
                  <h3 className="text-xl font-semibold text-[#111827] mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
                    Security & Access
                  </h3>

                  <form onSubmit={handleUpdatePassword} className="space-y-6 bg-[#f9fafb] p-8 rounded-[32px] border border-[#e5e7eb]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest px-1">Current Password</label>
                        <input
                          type="password"
                          required
                          value={securityForm.currentPassword}
                          onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          className="w-full px-5 py-3 bg-white border border-[#e5e7eb] rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1a4d2e]/10 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest px-1">New Password</label>
                        <input
                          type="password"
                          required
                          value={securityForm.newPassword}
                          onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          className="w-full px-5 py-3 bg-white border border-[#e5e7eb] rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1a4d2e]/10 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest px-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={securityForm.confirmPassword}
                          onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          className="w-full px-5 py-3 bg-white border border-[#e5e7eb] rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1a4d2e]/10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-rose-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-8 md:p-10 space-y-8">
                <h3 className="text-xl font-semibold text-[#111827] mb-2 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  Notification Preferences
                </h3>
                <p className="text-sm font-semibold text-[#6b7280]">Control which alerts you receive as a system administrator.</p>

                <div className="space-y-3">
                  {[
                    { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily platform summaries via email' },
                    { id: 'adminAlerts', label: 'System Alerts', desc: 'Real-time browser alerts for critical failures' },
                    { id: 'weeklyReports', label: 'Weekly Reports', desc: 'Auto-generated placement performance reports' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-6 border border-[#f3f4f6] rounded-[24px] bg-[#f9fafb] transition-all hover:bg-white hover:border-[#1a4d2e]/20 group">
                      <div>
                        <p className="text-sm font-semibold text-[#374151]">{item.label}</p>
                        <p className="text-[11px] text-[#9ca3af] font-semibold uppercase tracking-wider">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(item.id)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings[item.id] ? 'bg-[#1a4d2e]' : 'bg-[#e5e7eb]'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[item.id] ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-semibold text-[#111827] flex items-center gap-2">
                    <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                    Audit Logs
                  </h3>
                  <div className="flex gap-4">
                    <button onClick={clearLogs} className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest hover:underline">Clear History</button>
                    <button className="text-[10px] font-semibold text-[#1a4d2e] uppercase tracking-widest hover:underline">Export CSV</button>
                  </div>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-5 bg-[#f9fafb] rounded-[20px] border border-[#f3f4f6] transition-all hover:border-[#1a4d2e]/10 group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${log.status === 'Success' ? 'bg-[#1a4d2e]' : 'bg-rose-500'}`}></div>
                          <div>
                            <p className="text-sm font-semibold text-[#374151] group-hover:text-[#1a4d2e] transition-colors">{log.event}</p>
                            <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-tight">{log.user} • {log.time}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#1a4d2e] bg-[#f0fdf4] px-3 py-1 rounded-lg border border-[#1a4d2e]/10">{log.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-[#f9fafb] rounded-3xl border border-dashed border-[#e5e7eb]">
                      <span className="material-symbols-outlined text-4xl text-[#9ca3af] mb-2">history</span>
                      <p className="text-sm font-semibold text-[#6b7280]">No recent system activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#f3f4f6] py-8 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">
          <p>© 2024 Admin Portal v2.4.0</p>
          <div className="flex gap-8">
            <button className="hover:text-[#1a4d2e] transition-colors">Documentation</button>
            <button className="hover:text-[#1a4d2e] transition-colors">API Keys</button>
            <button className="hover:text-[#1a4d2e] transition-colors">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminSettings;

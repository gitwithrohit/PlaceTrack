import { useState, useEffect, useRef } from 'react';
import { insforge } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';

const AdminNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'job', recipient: 'student' });
  const [isSending, setIsSending] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(".animate-item",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, activeTab]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await insforge.database.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      setNotifications(data || []);
      setStats({
        total: data?.length || 0,
        unread: data?.filter(n => !n.is_read).length || 0
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error("Failed to sync notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const loadingToast = toast.loading("Broadcasting notification...");
    
    try {
      // 1. Fetch relevant user IDs based on recipient role
      let query = insforge.database.from('profiles').select('id');
      if (newNotification.recipient !== 'all') {
        const targetRole = newNotification.recipient === 'company' ? 'recruiter' : newNotification.recipient;
        query = query.eq('role', targetRole);
      }

      const { data: users, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      if (!users || users.length === 0) {
        throw new Error(`No users found for category: ${newNotification.recipient}`);
      }

      // 2. Prepare bulk insert data
      const notificationsToInsert = users.map(user => ({
        user_id: user.id,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        is_read: false
      }));

      // 3. Bulk insert
      const { error: insertError } = await insforge.database.from('notifications').insert(notificationsToInsert);
      if (insertError) throw insertError;

      toast.success(`Notification sent to ${users.length} users`, { id: loadingToast });
      setShowComposeModal(false);
      setNewNotification({ title: '', message: '', type: 'job', recipient: 'student' });
      fetchNotifications();
    } catch (err) {
      console.error('Error broadcasting:', err);
      toast.error(err.message || 'Failed to broadcast', { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const { error } = await insforge.database.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error('Error marking read:', err);
      toast.error("Status update failed");
    }
  };

  const handleMarkAllRead = async () => {
    const loadingToast = toast.loading("Updating notifications...");
    try {
      const { error } = await insforge.database.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      toast.success("All caught up!", { id: loadingToast });
    } catch (err) {
      console.error('Error marking all read:', err);
      toast.error("Failed to update all", { id: loadingToast });
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const { error } = await insforge.database.from('notifications').delete().eq('id', id);
      if (error) throw error;
      
      const toDelete = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      setStats(prev => ({
        total: prev.total - 1,
        unread: toDelete?.is_read ? prev.unread : Math.max(0, prev.unread - 1)
      }));
      toast.success("Notification removed");
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error("Delete failed");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.is_read;
    return n.type === activeTab;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'application': return 'description';
      case 'interview': return 'event';
      case 'job': return 'work';
      default: return 'notifications';
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-poppins antialiased text-slate-900">
      <Toaster position="top-right" />
      <AdminNavbar />

      <main ref={containerRef} className="max-w-[1400px] mx-auto w-full p-6 lg:p-10 flex flex-col gap-10">
        
        {/* Neat & Fresh Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 ">Notification Center</h1>
            <p className="text-slate-500 font-medium text-lg">Send broadcasts and manage system-wide alerts.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Clear All Unread
            </button>
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[14px] font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Message
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Quick Filter Sidebar */}
          <div className="lg:col-span-3 space-y-4 animate-item">
            <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Quick Filters</h2>
            {[
              { id: 'all', label: 'All Activities', icon: 'list_alt' },
              { id: 'unread', label: 'Unread Only', icon: 'pending_actions' },
              { id: 'job', label: 'Job Alerts', icon: 'campaign' },
              { id: 'application', label: 'Applications', icon: 'description' },
              { id: 'interview', label: 'Interviews', icon: 'event' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all border ${activeTab === cat.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                <span className="text-[14px] font-bold ">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Clean Notification List */}
          <div className="lg:col-span-9 space-y-4 animate-item">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl p-6 border transition-all flex items-start gap-6 group relative ${!n.is_read ? 'border-l-4 border-l-indigo-600 border-slate-200' : 'border-slate-100 opacity-80'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${!n.is_read ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    <span className="material-symbols-outlined text-[24px]">{getIcon(n.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`text-[16px] font-bold transition-colors ${!n.is_read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</h4>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-4">{n.message}</p>
                    
                    <div className="flex items-center gap-6">
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        className="text-slate-400 hover:text-rose-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>

                  {!n.is_read && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-slate-300 text-4xl">notifications_off</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Clear as a sky!</h3>
                <p className="text-slate-500 font-medium max-w-sm">You have no pending notifications in this category. New broadcasts will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modern Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowComposeModal(false)}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-[1000] overflow-hidden animate-scale-in border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">New Broadcast</h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Send a system-wide notification to users.</p>
              </div>
              <button onClick={() => setShowComposeModal(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-rose-500 transition-all shadow-sm bg-white border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Recipient</label>
                  <select
                    value={newNotification.recipient}
                    onChange={(e) => setNewNotification({ ...newNotification, recipient: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="student">All Students</option>
                    <option value="company">All Companies</option>
                    <option value="all">Everyone</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Message Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="job">Job Alert</option>
                    <option value="application">Application</option>
                    <option value="interview">Interview</option>
                    <option value="event">General Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="e.g. Campus Drive 2024"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Message Content</label>
                <textarea
                  required
                  rows="4"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-500 rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  )}
                  {isSending ? 'Sending...' : 'Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;

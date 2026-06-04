import { useState, useEffect, useRef } from 'react';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import {
  Bell,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  Briefcase,
  Calendar,
  Clock,
  User,
  MoreVertical,
  Inbox
} from 'lucide-react';

const CompanyNotifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const containerRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchActivity();
    }
  }, [user]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      // Fetch system notifications, apps, and interviews in parallel
      const [notifyRes, appsRes, intsRes] = await Promise.all([
        insforge.database
          .from('notifications')
          .select('id, title, message, type, created_at, is_read')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        insforge.database
          .from('applications')
          .select(`
            id, status, created_at, student_id,
            profiles:student_id(name),
            jobs:job_id!inner(title, recruiter_id)
          `)
          .eq('jobs.recruiter_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        insforge.database
          .from('interviews')
          .select(`
            id, created_at, schedule_time,
            applications:application_id!inner(
              id, job_id,
              profiles:student_id(name),
              jobs:job_id!inner(title, recruiter_id)
            )
          `)
          .eq('applications.jobs.recruiter_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (notifyRes.error) throw notifyRes.error;

      const notifyData = notifyRes.data || [];
      
      const appActivities = (appsRes.data || []).map(app => ({
        id: `app-${app.id}`,
        title: 'New Application Received',
        message: `${app.profiles?.name || 'A candidate'} applied for ${app.jobs?.title}`,
        type: 'application',
        created_at: app.created_at,
        is_read: true,
        meta: { studentId: app.student_id, jobId: app.job_id }
      }));

      const intActivities = (intsRes.data || []).map(int => ({
        id: `int-${int.id}`,
        title: 'Interview Scheduled',
        message: `A session is set for ${int.applications?.profiles?.name} for the ${int.applications?.jobs?.title} role.`,
        type: 'interview',
        created_at: int.created_at || int.schedule_time,
        is_read: true,
        meta: { interviewId: int.id }
      }));

      // Combine and sort
      const combined = [...notifyData, ...appActivities, ...intActivities].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setNotifications(combined);
      setStats({
        total: combined.length,
        unread: notifyData.filter(n => !n.is_read).length
      });
    } catch (err) {
      console.error('Error fetching activity:', err);
      toast.error("Failed to sync activity feed");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    if (id.startsWith('app-') || id.startsWith('int-')) return; // Mock read for generated activities

    try {
      const { error } = await insforge.database
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      toast.success("Marked as read");
    } catch (err) {
      console.error('Error marking read:', err);
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (id.startsWith('app-') || id.startsWith('int-')) {
      setNotifications(notifications.filter(n => n.id !== id));
      return;
    }

    try {
      const { error } = await insforge.database
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Activity removed");
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error("Delete failed");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || n.type === activeTab;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'application': return <User className="w-5 h-5" />;
      case 'interview': return <Calendar className="w-5 h-5" />;
      case 'job': return <Briefcase className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'application': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-blue-100';
      case 'interview': return 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 border-purple-100';
      case 'job': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-emerald-100';
      default: return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 border-indigo-100';
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f9fafc] dark:bg-[#050505] antialiased text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10">
      <Toaster position="top-right" />
      <RecruiterNavbar />

      <main ref={containerRef} className="max-w-[1400px] mx-auto w-full p-6 lg:p-10 pt-16 flex flex-col gap-10">

        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-up">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Activity Center</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Real-time updates on your hiring campaigns.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Filter activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all w-64 shadow-sm"
              />
            </div>
            <button className="p-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Quick Filters */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Categories</h2>
            {[
              { id: 'all', label: 'Recent Activity', icon: <Inbox size={18} />, count: stats.total },
              { id: 'application', label: 'Applications', icon: <User size={18} /> },
              { id: 'interview', label: 'Interviews', icon: <Calendar size={18} /> },
              { id: 'job', label: 'Job Updates', icon: <Briefcase size={18} /> },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all border font-bold text-sm ${activeTab === cat.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-xl shadow-slate-200 dark:shadow-none'
                  : 'bg-white dark:bg-[#111] text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5 hover:border-indigo-100'}`}
              >
                <div className="flex items-center gap-4">
                  {cat.icon}
                  {cat.label}
                </div>
                {cat.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === cat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-9 space-y-6">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((n, idx) => (
                  <div
                    key={n.id}
                    className={`group bg-white dark:bg-[#111] rounded-[28px] p-6 border transition-all flex items-start gap-6 relative animate-fade-in-up overflow-hidden ${!n.is_read ? 'border-l-4 border-l-indigo-600 border-slate-100 dark:border-white/5' : 'border-slate-100 dark:border-white/5 opacity-80'}`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${getStatusColor(n.type)}`}>
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-lg font-bold transition-colors ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {n.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-full">
                          <Clock size={12} />
                          {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-6">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {!n.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="text-slate-400 hover:text-rose-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {!n.is_read && (
                      <div className="absolute right-0 top-0 w-1.5 h-full bg-indigo-500"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111] rounded-[40px] border border-dashed border-slate-200 dark:border-white/10 py-32 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-8">
                  <Inbox className="text-indigo-300 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No activity yet</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm">Everything is caught up. New applications and system alerts will appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        `}} />
    </div>
  );
};

export default CompanyNotifications;

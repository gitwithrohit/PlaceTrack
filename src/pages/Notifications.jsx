import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { PageSkeleton } from '../components/LoadingSkeleton';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await insforge.database
          .from('notifications')
          .select('id, type, title, message, is_read, created_at')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        setNotifications(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  if (loading) return <PageSkeleton />;

  const placeholderNotifs = [
    { id: 1, type: 'application', icon: 'check_circle', color: 'text-primary bg-primary-fixed', title: 'Application Status Update', desc: 'Your application for Software Engineer at TechNova Solutions has been shortlisted!', time: '2 hours ago', unread: true },
    { id: 2, type: 'interview', icon: 'event', color: 'text-tertiary bg-tertiary-fixed', title: 'Interview Scheduled', desc: 'TechCorp has scheduled a Technical Round for Nov 2, 2:00 PM. Check your calendar.', time: '5 hours ago', unread: true },
    { id: 3, type: 'job', icon: 'work', color: 'text-on-surface-variant bg-surface-container-high', title: 'New Job Match', desc: '3 new jobs match your profile. Frontend Developer, Data Analyst, Product Manager.', time: '1 day ago', unread: false },
    { id: 4, type: 'reminder', icon: 'schedule', color: 'text-error bg-error-container', title: 'Application Deadline Reminder', desc: 'DataCore Systems Frontend Developer Intern closes in 2 days!', time: '2 days ago', unread: false },
    { id: 5, type: 'system', icon: 'info', color: 'text-on-surface-variant bg-surface-container', title: 'Profile Completion', desc: 'Complete your profile to improve your match rate. Add your GPA, skills, and preferred roles.', time: '3 days ago', unread: false },
  ];

  const displayNotifs = notifications.length > 0 ? notifications.map(n => ({
    ...n,
    icon: n.type === 'interview' ? 'event' : n.type === 'application' ? 'check_circle' : 'notifications',
    color: n.type === 'interview' ? 'text-tertiary bg-tertiary-fixed' : 'text-primary bg-primary-fixed',
    title: n.title || 'Notification',
    desc: n.message || '',
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : '',
    unread: !n.is_read,
  })) : placeholderNotifs;

  const filters = ['All', 'Unread', 'Applications', 'Interviews', 'Jobs'];
  const filtered = filter === 'All' ? displayNotifs
    : filter === 'Unread' ? displayNotifs.filter(n => n.unread)
      : displayNotifs.filter(n => n.type?.toLowerCase() === filter.toLowerCase().slice(0, -1));
  const unreadCount = displayNotifs.filter(n => n.unread).length;

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] text-slate-900 dark:text-white min-h-screen flex flex-col transition-colors duration-500 font-poppins">
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-[40px] font-bold text-slate-900 dark:text-white leading-tight">Notifications</h1>
            <p className="text-slate-500 dark:text-gray-400 font-medium mt-2">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-700 dark:text-gray-300 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark All Read
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white dark:bg-[#151715] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm p-6 sticky top-24 transition-colors duration-500">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Filter By</h2>
              <div className="flex flex-col gap-2">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${filter === f ? 'bg-[#325f3f] text-white shadow-lg' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <span>{f}</span>
                    {f === 'Unread' && unreadCount > 0 && (
                      <span className={`${filter === f ? 'bg-white text-[#325f3f]' : 'bg-rose-500 text-white'} text-[10px] px-2 py-0.5 rounded-full font-black`}>{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Notifications List */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-[#151715] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-colors duration-500">
              <div className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.length > 0 ? filtered.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex items-start gap-5 p-7 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${notif.unread ? 'bg-emerald-50/30 dark:bg-emerald-500/[0.02]' : ''} transform-gpu`}
                    style={{ contentVisibility: 'auto', containmentIntrinsicSize: '0 100px' }}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${notif.unread ? 'bg-[#325f3f] text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-gray-500'}`}>
                      <span className="material-symbols-outlined text-[24px]">{notif.icon}</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`text-[15px] ${notif.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-600 dark:text-gray-400'}`}>
                          {notif.title}
                          {notif.unread && <span className="ml-3 inline-block w-2 h-2 bg-[#325f3f] rounded-full align-middle animate-pulse"></span>}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest shrink-0 mt-1">{notif.time}</span>
                      </div>
                      <p className="text-[14px] text-slate-500 dark:text-gray-500 leading-relaxed font-medium">{notif.desc}</p>
                    </div>
                    {/* Action */}
                    <button className="text-slate-300 dark:text-gray-700 hover:text-[#325f3f] opacity-0 group-hover:opacity-100 transition-all p-2 shrink-0">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </div>
                )) : (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-slate-300 dark:text-gray-700 text-[40px]">notifications_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
                    <p className="text-slate-400 dark:text-gray-500 font-medium">No notifications to show for this filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;

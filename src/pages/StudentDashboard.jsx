import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { Briefcase, FileSearch, Calendar, BookOpen } from 'lucide-react';
import { PageSkeleton } from '../components/LoadingSkeleton';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    applications: { total: 0, trend: 0 },
    interviews: { total: 0, trend: 0 },
    selected: { total: 0, trend: 0 },
    pending: { total: 0, trend: 0 },
    rejections: { total: 0, trend: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [campusDrives, setCampusDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readinessBreakdown, setReadinessBreakdown] = useState({ profile: 0, skills: 0, resume: 0, total: 0 });
  const [smartContext, setSmartContext] = useState({ newThisWeek: 0, nextInterviewDays: null });
  const [pulseInterview, setPulseInterview] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [unifiedActivity, setUnifiedActivity] = useState([]);
  const [userApps, setUserApps] = useState([]);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  useEffect(() => {
    // Instant Load from Cache
    const cachedData = localStorage.getItem(`cp_dashboard_cache_${user?.id}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setProfile(parsed.profile);
        setStats(parsed.stats);
        setRecentActivity(parsed.recentActivity);
        setNotifications(parsed.notifications);
        setCampusDrives(parsed.campusDrives);
        setSavedCount(parsed.savedCount);
        setUnifiedActivity(parsed.unifiedActivity);
        setReadinessBreakdown(parsed.readinessBreakdown);
        setSmartContext(parsed.smartContext);
        setLoading(false); // Hide skeleton if cache exists
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }

    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const [
          { data: profileData },
          { data: apps },
          { data: notifs },
          { data: latestJobs },
          { count: sCount }
        ] = await Promise.all([
          insforge.database.from('profiles').select('id, name, university, bio, location, skills, resume_url, role').eq('id', user.id).single(),
          insforge.database.from('applications').select('id, status, created_at, student_id, job_id, jobs:job_id(title, company, logo_url, location, job_type)').eq('student_id', user.id).order('created_at', { ascending: false }),
          insforge.database.from('notifications').select('id, title, message, type, created_at, is_read').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
          insforge.database.from('jobs').select('id, title, company, logo_url, location, status, job_type, created_at').eq('status', 'open').order('created_at', { ascending: false }).limit(4),
          insforge.database.from('saved_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        if (profileData) {
          setProfile(profileData);
          let profileComp = (profileData.name ? 25 : 0) + (profileData.university ? 25 : 0) + (profileData.bio ? 25 : 0) + (profileData.location ? 25 : 0);
          let skillsDepth = Math.min((profileData.skills?.length || 0) * 20, 100);
          let resumeQuality = profileData.resume_url ? 100 : 0;
          setReadinessBreakdown({
            profile: profileComp,
            skills: skillsDepth,
            resume: resumeQuality,
            total: Math.round((profileComp * 0.3) + (skillsDepth * 0.3) + (resumeQuality * 0.4))
          });
        }

        if (apps && apps.length > 0) {
          setUserApps(apps);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const newApps = apps.filter(a => new Date(a.created_at) >= sevenDaysAgo);
          const statsCalc = {
            applications: apps.length,
            interviews: apps.filter(a => ['interview', 'assessment', 'shortlisted'].some(s => a.status?.toLowerCase().includes(s))).length,
            selected: apps.filter(a => ['offer', 'accepted', 'selected', 'hired'].some(s => a.status?.toLowerCase().includes(s))).length,
            pending: apps.filter(a => ['applied', 'pending', 'review'].some(s => a.status?.toLowerCase() === s || a.status?.toLowerCase().includes(s))).length,
            rejections: apps.filter(a => ['rejected', 'declined'].some(s => a.status?.toLowerCase().includes(s))).length
          };

          setStats({
            applications: { total: statsCalc.applications, trend: newApps.length },
            interviews: { total: statsCalc.interviews, trend: 0 }, // Simplified trend for speed
            selected: { total: statsCalc.selected, trend: 0 },
            pending: { total: statsCalc.pending, trend: 0 },
            rejections: { total: statsCalc.rejections, trend: 0 }
          });

          setRecentActivity(apps.slice(0, 4));

          // Fetch interviews and saved lists in secondary parallel block
          const [ { data: interviewData }, { data: savedList } ] = await Promise.all([
            insforge.database.from('interviews').select('*, applications(jobs(*))').in('application_id', apps.map(a => a.id)).order('created_at', { ascending: false }).limit(3),
            insforge.database.from('saved_jobs').select('*, jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
          ]);

          const combined = [
            ...apps.slice(0, 3).map(a => ({ type: 'application', title: `Applied to ${a.jobs?.company}`, time: a.created_at, icon: 'description', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' })),
            ...(interviewData || []).map(i => ({ type: 'interview', title: `Interview with ${i.applications?.jobs?.company}`, time: i.created_at, icon: 'calendar_today', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' })),
            ...(savedList || []).map(s => ({ type: 'saved', title: `Saved ${s.jobs?.company}`, time: s.created_at, icon: 'bookmark', color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' }))
          ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 3);

          setUnifiedActivity(combined);
          
          if (interviewData?.[0]?.schedule_time) {
            const diff = new Date(interviewData[0].schedule_time) - new Date();
            setSmartContext(prev => ({ ...prev, nextInterviewDays: Math.ceil(diff / (1000 * 60 * 60 * 24)) }));
            setPulseInterview(interviewData[0].schedule_time);
          }
        }

        if (notifs) setNotifications(notifs);
        if (latestJobs) setCampusDrives(latestJobs);
        setSavedCount(sCount || 0);

        // Update Cache
        const finalStats = {
          applications: { total: statsCalc.applications, trend: newApps.length },
          interviews: { total: statsCalc.interviews, trend: 0 },
          selected: { total: statsCalc.selected, trend: 0 },
          pending: { total: statsCalc.pending, trend: 0 },
          rejections: { total: statsCalc.rejections, trend: 0 }
        };

        localStorage.setItem(`cp_dashboard_cache_${user?.id}`, JSON.stringify({
          profile: profileData,
          stats: finalStats,
          recentActivity: apps.slice(0, 4),
          notifications: notifs,
          campusDrives: latestJobs,
          savedCount: sCount || 0,
          unifiedActivity: combined,
          readinessBreakdown: {
            profile: profileComp,
            skills: skillsDepth,
            resume: resumeQuality,
            total: Math.round((profileComp * 0.3) + (skillsDepth * 0.3) + (resumeQuality * 0.4))
          },
          smartContext: { newThisWeek: newApps.length, nextInterviewDays: 0 }
        }));

        setStats(finalStats);

      } catch (error) {
        console.error('Speed-optimized sync error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <PageSkeleton />;

  const displayName = profile?.name || user?.user_metadata?.name || 'Student';
  const latestApp = recentActivity[0];

  // Chart Logic
  // True Distribution Chart
  const chartData = [
    { label: 'Selected', value: stats.selected.total, color: '#1a4d2e' },
    { label: 'Interviewing', value: stats.interviews.total, color: '#64a1ff' },
    { label: 'Pending', value: stats.pending.total, color: '#f59e0b' },
    { label: 'Rejected', value: stats.rejections.total, color: '#f43f5e' },
    { label: 'Saved', value: savedCount, color: '#ffab5e' }
  ];
  const totalActions = Math.max(stats.applications.total + savedCount, 1);

  const radius = 70;
  const strokeWidth = 25;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="bg-[#fcfdfe] dark:bg-[#0f110f] min-h-screen transition-colors duration-500 font-poppins">
      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">

        {/* Header */}
        <header className="mb-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
                Welcome back, <span className="text-[#1a4d2e]">{displayName}</span>.
              </h1>
              <p className="text-slate-800 dark:text-gray-300 font-medium">
                You have <span className="text-[#1a4d2e]">{stats.applications.total}</span> active applications
                {smartContext.newThisWeek > 0 && <span className="text-slate-500 text-sm"> ({smartContext.newThisWeek} new this week)</span>}
                {smartContext.nextInterviewDays !== null && (
                  <>
                    <span className="mx-2 text-slate-400">|</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Next interview in {smartContext.nextInterviewDays} {smartContext.nextInterviewDays === 1 ? 'day' : 'days'}</span>
                  </>
                )}
              </p>
            </div>
            <Link to="/jobs" className="bg-[#1a4d2e] text-white px-8 py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-xl shadow-[#1a4d2e]/20 hover:scale-105 transition-all">
              Explore New Roles
            </Link>
          </div>
        </header>

        {/* Profile Completion Banner - Only shows if < 100% */}
        <section className="relative overflow-hidden bg-emerald-50 dark:bg-emerald-500/5 p-10 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-sm animate-in fade-in slide-in-from-top-8 duration-700 mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-white/5" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - readinessBreakdown.total / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="text-[#1a4d2e] transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{readinessBreakdown.total}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1">Profile Completion: {readinessBreakdown.total}%</h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm font-medium">
                  Complete profile to apply for more jobs and unlock premium opportunities.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <Link to="/profile" className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1a4d2e] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#1a4d2e]/20">
                <span className="material-symbols-outlined text-lg">edit_note</span>
                Complete Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid - Now with 5 boxes for complete visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {[
            { label: 'Applied', value: stats.applications.total, trend: stats.applications.trend, icon: 'analytics', color: 'bg-blue-600', path: '/applications' },
            { label: 'Pending', value: stats.pending.total, trend: stats.pending.trend, icon: 'hourglass_empty', color: 'bg-amber-500', path: '/applications' },
            { label: 'Interviews', value: stats.interviews.total, trend: stats.interviews.trend, icon: 'psychology', color: 'bg-purple-600', path: '/interviews' },
            { label: 'Selected', value: stats.selected.total, trend: stats.selected.trend, icon: 'military_tech', color: 'bg-[#1a4d2e]', path: '/applications' },
            { label: 'Rejected', value: stats.rejections.total, trend: stats.rejections.trend, icon: 'cancel', color: 'bg-rose-600', path: '/applications' }
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.path}
              className="bg-white dark:bg-[#151715] py-6 px-7 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/5 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-black/5 group-hover:scale-110 transition-all duration-500`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl font-bold text-slate-950 dark:text-white tracking-tight">{stat.value}</div>
                {stat.trend > 0 && (
                  <div className="text-xs font-bold text-[#1a4d2e] dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                    <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                    {stat.trend}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Redesigned Active Drives - Perfectly Spaced & Light Borders */}
        <section className="bg-white dark:bg-[#151715] p-10 rounded-[48px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-white/5 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Active Drives</h2>
            <Link to="/jobs" className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest hover:underline group">
              View all
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-6">
            {campusDrives.length > 0 ? campusDrives.map((job) => (
              <div key={job.id} className="group relative bg-slate-50/50 dark:bg-white/5 p-6 rounded-[32px] border border-slate-100/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 flex flex-col lg:flex-row items-center gap-8">

                {/* Company Logo/Icon */}
                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-[#1a4d2e]/20 flex items-center justify-center shrink-0 shadow-sm border border-slate-50 dark:border-white/5 overflow-hidden">
                  {job.logo_url ? (
                    <img src={job.logo_url} alt={job.company} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {job.company.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Company & Role */}
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-1 group-hover:text-emerald-600 transition-colors leading-tight">
                    {job.company}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                    {job.title}
                  </p>
                </div>

                {/* Salary & Deadline */}
                <div className="flex items-center gap-12 px-12 border-x border-slate-200/50 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Package</p>
                      <span className="text-sm font-bold text-slate-700 dark:text-gray-300">
                        {job.salary || '₹8-18 LPA'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <span className="material-symbols-outlined text-xl">calendar_today</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Ends In</p>
                      <span className="text-sm font-bold text-slate-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(new Date(job.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  {userApps.some(a => a.job_id === job.id) ? (
                    <div className="px-10 py-4 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-2xl uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Applied
                    </div>
                  ) : (
                    <Link
                      to={`/apply/${job.id}`}
                      className="px-10 py-4 bg-[#1a4d2e] hover:bg-[#153a23] text-white text-[11px] font-bold rounded-2xl uppercase tracking-widest shadow-xl shadow-[#1a4d2e]/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Apply Now
                    </Link>
                  )}
                  <Link
                    to={`/jobs`}
                    className="px-10 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-[11px] font-bold rounded-2xl uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                  >
                    Details
                  </Link>
                </div>

              </div>
            )) : (
              <div className="py-16 text-center bg-slate-50 dark:bg-white/5 rounded-[40px] border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-slate-500 dark:text-gray-500 text-sm font-bold uppercase tracking-widest italic">No active campus drives at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Main 8/4 Grid - Now immediately below Active Drives */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-8 space-y-12">
            {/* Live Application Pulse */}
            <section className="bg-white dark:bg-[#151715] p-10 rounded-[48px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Active Applications</h2>
                {latestApp && (
                  <span className="px-5 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-[#1a4d2e] dark:text-emerald-400 text-[11px] font-bold rounded-xl uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-500/20">
                    {latestApp.status}
                  </span>
                )}
              </div>

              <div className="mb-12 p-8 bg-slate-50/50 dark:bg-white/5 rounded-[40px] border border-slate-100/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a4d2e]/20 flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="material-symbols-outlined text-3xl text-[#1a4d2e]">business</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1">{latestApp?.jobs?.company || 'N/A'}</h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{latestApp?.jobs?.title || 'Job Title'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a4d2e] animate-pulse"></div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-widest">Active Application</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-10 relative px-6">
                <div className="absolute top-8 left-16 right-16 h-1 bg-slate-100 dark:bg-white/5 hidden md:block"></div>
                {[
                  {
                    label: "Applied",
                    active: !!latestApp,
                    current: latestApp?.status?.toLowerCase() === 'applied',
                    date: latestApp ? new Date(latestApp.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null
                  },
                  {
                    label: "Assessment",
                    active: latestApp?.status?.toLowerCase().includes('assessment') || latestApp?.status?.toLowerCase().includes('interview') || latestApp?.status?.toLowerCase().includes('offer'),
                    current: latestApp?.status?.toLowerCase().includes('assessment'),
                    date: (latestApp?.status?.toLowerCase().includes('assessment') || latestApp?.status?.toLowerCase().includes('interview') || latestApp?.status?.toLowerCase().includes('offer')) ? "Completed" : "Pending"
                  },
                  {
                    label: "Interview",
                    active: latestApp?.status?.toLowerCase().includes('interview') || latestApp?.status?.toLowerCase().includes('offer'),
                    current: latestApp?.status?.toLowerCase().includes('interview'),
                    date: pulseInterview ? new Date(pulseInterview).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : (latestApp?.status?.toLowerCase().includes('interview') ? "Scheduled" : "Waiting")
                  },
                  {
                    label: "Decision",
                    active: ['offer', 'selected', 'hired', 'rejected'].some(s => latestApp?.status?.toLowerCase().includes(s)),
                    current: ['offer', 'selected', 'hired', 'rejected'].some(s => latestApp?.status?.toLowerCase().includes(s)),
                    date: ['offer', 'selected', 'hired'].some(s => latestApp?.status?.toLowerCase().includes(s)) ? "Selected" : (latestApp?.status?.toLowerCase().includes('rejected') ? "Closed" : "TBD")
                  }
                ].map((step, i) => (
                  <div key={i} className={`flex md:flex-col items-center gap-5 relative z-10 transition-all duration-500 ${step.active ? 'opacity-100' : 'opacity-20'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-[6px] border-white dark:border-[#151715] shadow-2xl transition-all duration-500 ${step.current ? 'bg-[#1a4d2e] scale-110 ring-[12px] ring-[#1a4d2e]/10' : (step.active ? 'bg-[#1a4d2e]/80' : 'bg-slate-300 dark:bg-white/10')} text-white`}>
                      <span className="material-symbols-outlined text-2xl font-bold">
                        {step.current ? 'radio_button_checked' : (step.active ? 'check' : 'circle')}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className={`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${step.current ? 'text-[#1a4d2e]' : 'text-slate-900 dark:text-white'}`}>
                        {step.label}
                      </span>
                      {step.date && (
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-tighter bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                          {step.date}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-12">
            <section className="bg-white dark:bg-[#151715] p-10 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-slate-950 dark:text-white tracking-tight">Recent Activity</h2>
                <Link to="/applications" className="text-[11px] font-bold text-[#1a4d2e] uppercase tracking-widest hover:underline">View All</Link>
              </div>
              <div className="space-y-6">
                {unifiedActivity.length > 0 ? unifiedActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-5 group cursor-pointer border-b border-slate-100 dark:border-white/5 pb-6 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all p-3 rounded-3xl">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${activity.color}`}>
                      <span className="material-symbols-outlined text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1 group-hover:text-[#1a4d2e] transition-colors uppercase tracking-tight">{activity.title}</p>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{getTimeAgo(activity.time)}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-600 text-xs font-semibold italic text-center py-4">No recent activity.</p>
                )}
              </div>
            </section>
          </aside>
        </div>

        {/* Balanced Dashboard Grid - Full Width 50/50 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          {/* Skill Cloud - Full Width Card */}
          <section className="bg-white dark:bg-[#151715] p-8 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Skills</h3>
              <Link to="/profile" className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest hover:underline group">
                VIEW ALL
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {profile?.skills?.length > 0 ? profile.skills.map((skill) => (
                <div
                  key={skill}
                  className="px-5 py-2 bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 rounded-2xl font-bold text-[11px] tracking-tight border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm"
                >
                  {skill}
                </div>
              )) : (
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic py-4">Awaiting skill sync...</p>
              )}
            </div>

            <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-8 rounded-[40px] border border-emerald-100/50 dark:border-emerald-500/10 mt-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <span className="material-symbols-outlined font-bold">auto_awesome</span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-gray-200">
                  Profile Score
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex-1 h-3 bg-slate-200/70 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a4d2e] rounded-full transition-all duration-1000"
                    style={{ width: `${readinessBreakdown.total}%` }}
                  ></div>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{readinessBreakdown.total}%</span>
              </div>
            </div>
          </section>

          {/* Jobs by Status - Full Width Card */}
          <div className="bg-white dark:bg-[#151715] p-8 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Jobs by Status</h3>
            <div className="flex items-center gap-10 flex-1">
              <div className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {chartData.map((segment, index) => {
                    const percentage = (segment.value / totalActions) * 100;
                    const dashArray = `${(percentage / 100) * circumference} ${circumference}`;
                    const dashOffset = -currentOffset;
                    currentOffset += (percentage / 100) * circumference;

                    return (
                      <circle
                        key={index}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-1000 ease-in-out"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="flex-1 space-y-4">
                {chartData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-bold text-slate-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {item.value} <span className="text-slate-400 dark:text-gray-500 font-medium ml-1">({Math.round((item.value / totalActions) * 100)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Full Width */}
        <div className="bg-white dark:bg-[#151715] p-8 rounded-[48px] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-12">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Find Jobs', icon: <Briefcase className="w-6 h-6" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', path: '/jobs' },
              { label: 'Track Application', icon: <FileSearch className="w-6 h-6" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10', path: '/applications' },
              { label: 'Interview Prep', icon: <Calendar className="w-6 h-6" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10', path: '/resources/interview-prep' },
              { label: 'Explore Resources', icon: <BookOpen className="w-6 h-6" />, color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10', path: '/resources' }
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-white/10 transition-all group"
              >
                <div className={`p-4 ${action.color} rounded-2xl mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
                  {action.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 text-center leading-tight uppercase tracking-widest">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

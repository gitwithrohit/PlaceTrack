import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { PageSkeleton } from '../components/LoadingSkeleton';
import RecruiterNavbar from '../components/RecruiterNavbar';
import {
   Users,
   Briefcase,
   Calendar,
   CheckCircle,
   TrendingUp,
   Search,
   ChevronRight,
   MoreHorizontal,
   MapPin,
   Bell
} from 'lucide-react';

const RecruiterDashboard = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   const [talentSearchQuery, setTalentSearchQuery] = useState('');
   const [stats, setStats] = useState({ newApps: 0, shortlisted: 0, interviews: 0, offers: 0, totalApps: 0 });
   const [activeJobs, setActiveJobs] = useState([]);
   const [profile, setProfile] = useState(null);
   const [upcomingInterviews, setUpcomingInterviews] = useState([]);
   const [recentActivity, setRecentActivity] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         if (!user?.id) {
            setLoading(false);
            return;
         }

         try {
            const [profRes, jobsRes] = await Promise.all([
               insforge.database.from('profiles').select('id, university, name, avatar_url').eq('id', user.id).single(),
               insforge.database.from('jobs').select('id, title, created_at, status').eq('recruiter_id', user.id).order('created_at', { ascending: false })
            ]);

            if (profRes.data) setProfile(profRes.data);

            if (jobsRes.data && jobsRes.data.length > 0) {
               const jobIds = jobsRes.data.map(j => j.id);

               // Fetch applications and interviews in parallel with selective columns
               const [appsRes, intsRes] = await Promise.all([
                  insforge.database
                     .from('applications')
                     .select('id, job_id, status, created_at, student_id, profiles:student_id(name, avatar_url)')
                     .in('job_id', jobIds),
                  insforge.database
                     .from('interviews')
                     .select('id, application_id, schedule_time, created_at, applications:application_id(job_id, profiles:student_id(name, avatar_url), jobs:job_id(title))')
                     .order('schedule_time', { ascending: true })
               ]);

               const appsData = appsRes.data || [];
               // Precise filtering for interviews related to this recruiter's jobs
               const interviewsData = (intsRes.data || []).filter(i => i.applications && jobIds.includes(i.applications.job_id));

               const getStatus = (s) => (s || 'Applied').toLowerCase().trim();

               // Count distinct applications that have interviews
               const scheduledAppIds = new Set(interviewsData.map(i => i.application_id));

               const unscheduledCount = appsData.filter(a => ['shortlisted', 'interview'].includes(getStatus(a.status)) && !scheduledAppIds.has(a.id)).length;

               const newStats = {
                  newApps: appsData.filter(a => ['applied', 'pending', 'new', 'reviewing'].includes(getStatus(a.status))).length,
                  shortlisted: appsData.filter(a => ['shortlisted', 'screening'].includes(getStatus(a.status))).length,
                  interviews: interviewsData.length,
                  offers: appsData.filter(a => ['offered', 'hired', 'selected', 'accepted', 'placed'].includes(getStatus(a.status))).length,
                  totalApps: appsData.length,
                  unscheduled: unscheduledCount
               };
               setStats(newStats);

               setActiveJobs(jobsRes.data.map(job => ({
                  ...job,
                  applicantCount: appsData.filter(a => a.job_id === job.id).length
               })));

               setUpcomingInterviews(interviewsData.slice(0, 4).map(i => ({
                  id: i.id,
                  name: i.applications?.profiles?.name || 'Candidate',
                  role: i.applications?.jobs?.title || 'Role',
                  avatar: i.applications?.profiles?.avatar_url,
                  initials: (i.applications?.profiles?.name || 'C').substring(0, 2).toUpperCase(),
                  date: new Date(i.schedule_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  time: new Date(i.schedule_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
               })));

               // Combine and sort activities
               const appActivities = appsData.map(a => ({
                  id: `app-${a.id}`,
                  label: 'Application Update',
                  sub: `${a.profiles?.name || 'A candidate'} - ${getStatus(a.status).toUpperCase()}`,
                  time: new Date(a.created_at || Date.now()),
                  icon: <Briefcase size={18} />,
                  color: '#3b82f6',
                  bg: 'bg-blue-50 dark:bg-blue-500/10'
               }));

               const intActivities = interviewsData.map(i => ({
                  id: `int-${i.id}`,
                  label: 'Interview Scheduled',
                  sub: `${i.applications?.profiles?.name || 'Candidate'} - ${i.applications?.jobs?.title || 'Role'}`,
                  time: new Date(i.created_at || i.schedule_time),
                  icon: <Calendar size={18} />,
                  color: '#7c3aed',
                  bg: 'bg-indigo-50 dark:bg-indigo-500/10'
               }));

               const allActivities = [...appActivities, ...intActivities]
                  .sort((a, b) => b.time - a.time)
                  .slice(0, 4)
                  .map(act => ({
                     ...act,
                     time: act.time.toLocaleDateString()
                  }));

               setRecentActivity(allActivities);

            } else {
               setActiveJobs([]);
               setStats({ newApps: 0, shortlisted: 0, interviews: 0, offers: 0, totalApps: 0 });
            }
         } catch (e) {
            console.error("Dashboard Error:", e);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [user]);

   const handleTalentSearch = (e) => {
      e?.preventDefault();
      if (talentSearchQuery.trim()) {
         navigate(`/company/TalentSearch?skills=${encodeURIComponent(talentSearchQuery.trim())}`);
      } else {
         navigate('/company/TalentSearch');
      }
   };

   if (loading) return <PageSkeleton />;

   return (
      <div className="min-h-screen bg-[#f9fafc] dark:bg-[#050505] antialiased text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10">
         <RecruiterNavbar />

         <main className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-20 fade-in-up">

            <div className="mb-10">
               <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
                  Welcome back, {profile?.name || user?.user_metadata?.name || 'Recruiter'}! 👋
               </h1>
               <p className="text-slate-500 dark:text-slate-400 font-semibold text-base">Here is what's happening with your job campaigns today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
               {[
                  { label: 'Active Jobs', count: activeJobs.length || 0, sub: 'Live positions', icon: <Briefcase size={22} />, color: '#7c3aed', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                  { label: 'Applications', count: stats.totalApps || 0, sub: 'Total received', icon: <Users size={22} />, color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                  { label: 'Interviews', count: stats.interviews || 0, sub: 'Scheduled', icon: <Calendar size={22} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                  { label: 'Placed', count: stats.offers || 0, sub: 'Completed', icon: <CheckCircle size={22} />, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
               ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-[#111] p-8 rounded-[24px] shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                     <div className="flex items-start gap-5 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`} style={{ color: item.color }}>
                           {item.icon}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                           <h3 className="text-3xl font-bold">{item.count}</h3>
                           <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.sub}</p>
                        </div>
                     </div>
                     <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: item.color }}></div>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white dark:bg-[#111] p-10 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm">
                     <div className="flex items-center justify-between mb-10 px-2">
                        <h2 className="text-2xl font-bold">Active Job Campaigns</h2>
                        <Link to="/company/Posting" className="text-indigo-600 font-bold text-sm flex items-center gap-2 hover:translate-x-1 transition-all">
                           View all jobs <ChevronRight size={16} />
                        </Link>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {activeJobs.length > 0 ? (
                           activeJobs.map((job) => (
                              <div key={job.id} className="group p-8 rounded-[32px] border border-slate-50 dark:border-white/5 hover:border-indigo-100 transition-all bg-[#fcfdfe] dark:bg-black/20">
                                 <div className="flex justify-between items-start mb-10">
                                    <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-emerald-100">Live</div>
                                    <button className="text-slate-300 hover:text-indigo-600 transition-colors"><MoreHorizontal size={20} /></button>
                                 </div>
                                 <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                 <div className="flex items-center gap-2 text-slate-500 text-sm mb-4 font-bold">
                                    <MapPin size={16} className="text-indigo-500" /> Remote / Flexible
                                 </div>
                                 <p className="text-xs text-slate-400 font-bold uppercase mb-10">
                                    Posted on {new Date(job.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                 </p>
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">{job.applicantCount || 0}</div>
                                       <span className="text-sm font-bold text-slate-400">Applications</span>
                                    </div>
                                    <Link to="/company/Applicants" className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                       <ChevronRight size={20} />
                                    </Link>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="col-span-1 md:col-span-2 py-16 text-center bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                              <Briefcase size={40} className="mx-auto text-slate-300 mb-4" />
                              <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">No active campaigns</h3>
                              <p className="text-slate-400 font-bold text-sm mb-6">You haven't posted any jobs yet.</p>
                              <Link to="/company/Posting/new" className="inline-flex bg-indigo-600 text-white px-6 py-3 rounded-xl font-extrabold text-sm shadow-md">Create Job Posting</Link>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#f5f3ff] via-[#f0f9ff] to-[#f5f3ff] dark:from-[#1a1a2e] dark:to-[#0f0f1a] p-8 md:py-10 md:px-14 rounded-[40px] relative overflow-hidden border border-[#e0e7ff] dark:border-white/5 shadow-2xl shadow-indigo-500/5 group">
                     {/* Decorative blur blobs */}
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                     <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Illustration Side */}
                        <div className="hidden lg:flex justify-center relative scale-100">
                           <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                              {/* Background Cards */}
                              <div className="absolute top-10 left-0 w-44 h-56 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl rotate-[-8deg] border border-slate-100 dark:border-white/5 p-4 transform transition-transform group-hover:rotate-[-12deg] duration-700">
                                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 mb-4 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                                 </div>
                                 <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2"></div>
                                 <div className="h-2 w-1/2 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                              </div>
                              <div className="absolute top-4 left-16 w-44 h-56 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl z-10 border border-slate-100 dark:border-white/5 p-5 transform transition-transform group-hover:translate-y-[-8px] duration-700">
                                 <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/30 mb-5 flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=transparent`} alt="" className="w-10 h-10" />
                                 </div>
                                 <div className="h-2.5 w-3/4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full mb-3"></div>
                                 <div className="h-2 w-1/2 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                              </div>
                              <div className="absolute top-12 right-0 w-44 h-56 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl rotate-[12deg] border border-slate-100 dark:border-white/5 p-4 transform transition-transform group-hover:rotate-[16deg] duration-700">
                                 <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/20 mb-4 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                                 </div>
                                 <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2"></div>
                                 <div className="h-2 w-1/2 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                              </div>

                              {/* Magnifying Glass */}
                              <div className="absolute z-20 bottom-[-10px] right-[40px] transform transition-all group-hover:scale-110 group-hover:rotate-[-5deg] duration-500">
                                 <div className="relative w-36 h-36">
                                    <div className="absolute inset-0 rounded-full border-[10px] border-[#6366f1] bg-white/10 backdrop-blur-sm shadow-2xl">
                                       <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
                                    </div>
                                    <div className="absolute bottom-[-15px] left-[-15px] w-14 h-[50px] bg-[#6366f1] rounded-full rotate-45 shadow-xl"></div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Content Side */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                           <h2 className="text-4xl md:text-5xl font-bold mb-2 text-[#1e1b4b] dark:text-white leading-tight">
                              Find The Right <span className="text-[#6366f1]">Talent</span>
                           </h2>
                           <p className="text-slate-600 dark:text-gray-400 font-bold text-lg mb-6 max-w-md">
                              Search and connect with the best candidates matching your job requirements.
                           </p>

                           <div className="w-full max-w-md space-y-4">
                              <div className="relative group/input">
                                 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#6366f1] transition-colors">
                                    <Search size={22} />
                                 </div>
                                 <input
                                    type="text"
                                    placeholder="Search skills (e.g. React, Python, UX)"
                                    value={talentSearchQuery}
                                    onChange={(e) => setTalentSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTalentSearch()}
                                    className="w-full pl-16 pr-6 py-5 bg-white dark:bg-[#0f0f1a] border border-[#e0e7ff] dark:border-white/10 rounded-[24px] shadow-sm outline-none font-bold text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-[#6366f1] transition-all"
                                 />
                              </div>

                              <button
                                 onClick={handleTalentSearch}
                                 className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-5 rounded-[24px] font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
                              >
                                 Search Candidates <ChevronRight size={20} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <aside className="lg:col-span-4 space-y-8">
                  <div className="bg-white dark:bg-[#111] p-8 rounded-[32px] border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Calendar size={20} /></div>
                           <h3 className="text-lg font-bold">Interview Hub</h3>
                        </div>
                        <button className="p-2 text-slate-300 border border-slate-100 rounded-full"><ChevronRight size={18} /></button>
                     </div>
                     <div className="flex flex-col items-center text-center py-6">
                        <div className="w-24 h-24 bg-indigo-50 rounded-[28px] flex items-center justify-center mb-6 relative">
                           <CheckCircle size={40} className="text-indigo-600" />
                           {stats.unscheduled > 0 && (
                              <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-pulse">
                                 {stats.unscheduled}
                              </div>
                           )}
                        </div>
                        <p className="text-slate-400 font-bold text-sm mb-10 italic">
                           {upcomingInterviews.length > 0 ? `${upcomingInterviews.length} interviews pending action.` : 'No interviews scheduled today.'}
                        </p>
                        <Link to="/company/Interviews" className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-extrabold text-sm text-center shadow-lg block">View All Interviews</Link>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-[#111] p-8 rounded-[32px] border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                           <h3 className="text-lg font-bold">Hiring Analytics</h3>
                        </div>
                     </div>
                     <div className="space-y-8">
                        {[
                           { label: 'Profile Completion', value: profile?.company_name ? '100%' : '60%' },
                           { label: 'Active Pipeline', value: stats.totalApps > 0 ? '100%' : '0%', sub: 'Candidates', icon: <Users size={16} className="text-blue-600" /> },
                           { label: 'Interview Rate', value: stats.totalApps > 0 ? `${Math.round((stats.interviews / stats.totalApps) * 100)}%` : '0%' }
                        ].map((stat, i) => (
                           <div key={i} className="space-y-3">
                              <div className="flex justify-between items-center text-xs font-bold">
                                 <div className="flex items-center gap-2">
                                    <span className="text-slate-500">{stat.label}</span>
                                    {stat.icon}
                                    {stat.sub && <span className="text-slate-800 dark:text-white font-extrabold">{stat.sub}</span>}
                                 </div>
                                 <span className="font-bold text-sm">{stat.value}</span>
                              </div>
                              <div className="h-2 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-600 rounded-full" style={{ width: stat.value }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white dark:bg-[#111] p-8 rounded-[32px] border border-slate-100 shadow-sm">
                     <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Calendar size={20} /></div>
                        <h3 className="text-xl font-bold">Upcoming Interviews</h3>
                     </div>
                     <div className="space-y-6 mb-10">
                        {upcomingInterviews.length > 0 ? (
                           upcomingInterviews.map((mock) => (
                              <div key={mock.id} className="flex items-center gap-4 group cursor-pointer">
                                 <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 font-extrabold">
                                    {mock.avatar ? <img src={mock.avatar} alt="" className="w-full h-full object-cover" /> : mock.initials}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{mock.name}</h4>
                                    <p className="text-xs text-slate-400 font-bold truncate mt-1">{mock.role}</p>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <p className="text-[10px] font-extrabold text-slate-400 mb-1">{mock.date}</p>
                                    <p className="text-[10px] font-extrabold text-indigo-600 uppercase">{mock.time}</p>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl">
                              <p className="text-slate-400 font-bold text-xs">No upcoming interviews</p>
                           </div>
                        )}
                     </div>
                  </div>
               </aside>
            </div>

            <div className="mt-12 bg-white dark:bg-[#111] p-10 rounded-[40px] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                  <Link to="/company/Notifications" className="text-indigo-600 font-bold text-xs">View all activity <ChevronRight size={14} className="inline ml-1" /></Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {recentActivity.length > 0 ? (
                     recentActivity.map((act) => (
                        <div key={act.id} className="flex gap-4 group">
                           <div className={`w-12 h-12 shrink-0 rounded-2xl ${act.bg} flex items-center justify-center`} style={{ color: act.color }}>{act.icon}</div>
                           <div className="flex-1 min-w-0">
                              <h5 className="text-[14px] font-extrabold text-slate-800 dark:text-white mb-2 truncate group-hover:text-indigo-600">{act.label}</h5>
                              <p className="text-[12px] text-slate-400 font-bold mb-3 truncate">{act.sub}</p>
                              <span className="text-[10px] font-extrabold text-slate-300 uppercase">{act.time}</span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="col-span-full text-center py-10 text-slate-400 font-bold text-sm">
                        No recent activity found. Applications will appear here.
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
            .fade-in-up {
               animation: fadeInUp 0.5s ease-out forwards;
            }
            `}} />
      </div>
   );
};

export default RecruiterDashboard;

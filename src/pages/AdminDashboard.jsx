import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { PageSkeleton } from '../components/LoadingSkeleton';
import AdminNavbar from '../components/AdminNavbar';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [rawData, setRawData] = useState({ students: [], jobs: [], apps: [], companies: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, jobsRes, appsRes, companiesRes] = await Promise.all([
          insforge.database.from('profiles').select('id').eq('role', 'student'),
          insforge.database.from('jobs').select('id, title, company, status, job_type, location'),
          insforge.database.from('applications').select('id, status, created_at, profiles:student_id(name), jobs:job_id(title, company, category)'),
          insforge.database.from('companies').select('id'),
        ]);

        setRawData({
          students: studentsRes.data || [],
          jobs: jobsRes.data || [],
          apps: appsRes.data || [],
          companies: companiesRes.data || []
        });
      } catch (e) {
        console.error("AdminDashboard Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const memoizedData = useMemo(() => {
    const { students, jobs: jobsData, apps, companies } = rawData;
    const successStatuses = ['offer', 'accepted', 'selected', 'hired'];

    // Stats
    const placedCount = apps.filter(a => successStatuses.some(s => a.status?.toLowerCase().includes(s))).length;
    const placedPercent = students.length > 0 ? Math.round((placedCount / students.length) * 100) : 0;

    // Industry Mix
    const jobTitles = jobsData.map(j => (j.title || '').toLowerCase());
    let software = 0; let finance = 0; let consulting = 0; let others = 0;
    jobTitles.forEach(t => {
      if (t.includes('software') || t.includes('develop') || t.includes('engineer') || t.includes('tech') || t.includes('it')) software++;
      else if (t.includes('finance') || t.includes('bank') || t.includes('account') || t.includes('invest')) finance++;
      else if (t.includes('consult') || t.includes('strategy') || t.includes('advisor')) consulting++;
      else others++;
    });
    const totalCategorized = software + finance + consulting + others || 1;

    // Recent Activity
    const sortedApps = [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    const recentActivity = sortedApps.map(a => ({
      id: a.id,
      student: a.profiles?.name || 'Student',
      company: a.jobs?.company || 'Company',
      role: a.jobs?.title || 'Role',
      date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      status: a.status,
      type: successStatuses.some(s => a.status?.toLowerCase().includes(s)) ? 'success' : a.status?.toLowerCase().includes('reject') ? 'danger' : 'info'
    }));

    // Top Recruiting Partners
    const offerApps = apps.filter(a => successStatuses.some(s => a.status?.toLowerCase().includes(s)));
    const companyOffers = {};
    offerApps.forEach(a => {
      const cName = a.jobs?.company || 'Unknown';
      companyOffers[cName] = (companyOffers[cName] || 0) + 1;
    });
    let topRec = Object.entries(companyOffers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, offers: count, growth: '+12%' }));

    if (topRec.length === 0) {
      const jobCounts = {};
      jobsData.forEach(j => { jobCounts[j.company] = (jobCounts[j.company] || 0) + 1; });
      topRec = Object.entries(jobCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, count]) => ({ name, offers: 0, growth: 'Active' }));
    }

    // Upcoming Drives
    const upcomingDrives = jobsData
      .filter(j => j.status?.toLowerCase() === 'open')
      .slice(0, 3)
      .map(j => ({ company: j.company, date: 'Jun 30', type: j.job_type || 'Full-time', venue: j.location || 'Online' }));

    // Dept Hiring
    const categories = {};
    apps.forEach(a => {
      if (successStatuses.some(s => a.status?.toLowerCase().includes(s))) {
        const cat = a.jobs?.category || 'General';
        categories[cat] = (categories[cat] || 0) + 1;
      }
    });
    const deptHiring = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], i) => ({
        name,
        rate: Math.min(Math.round((count / (apps.length || 1)) * 500), 100),
        color: ['blue', 'indigo', 'emerald', 'amber'][i % 4]
      }));

    // Trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyData[months[d.getMonth()]] = { apps: 0, placed: 0 };
    }
    apps.forEach(app => {
      const mLabel = months[new Date(app.created_at).getMonth()];
      if (monthlyData[mLabel]) {
        monthlyData[mLabel].apps++;
        if (successStatuses.some(s => app.status?.toLowerCase().includes(s))) monthlyData[mLabel].placed++;
      }
    });

    return {
      stats: { students: students.length, companies: companies.length, jobs: jobsData.length, placed: placedCount, placedPercent },
      roleDist: [
        { label: 'Software & IT', value: Math.round((software / totalCategorized) * 100), color: '#1a4d2e', bg: 'bg-[#1a4d2e]' },
        { label: 'Finance', value: Math.round((finance / totalCategorized) * 100), color: '#325f3f', bg: 'bg-[#325f3f]' },
        { label: 'Consulting', value: Math.round((consulting / totalCategorized) * 100), color: '#67a070', bg: 'bg-[#67a070]' },
        { label: 'Others', value: Math.round((others / totalCategorized) * 100), color: '#a3c9a8', bg: 'bg-[#a3c9a8]' },
      ],
      recentActivity,
      topRecruiters: topRec.length > 0 ? topRec : [{ name: 'N/A', offers: 0, growth: '0%' }],
      upcomingDrives,
      deptHiring: deptHiring.length > 0 ? deptHiring : [
        { name: 'Software Engineering', rate: 45, color: 'blue' },
        { name: 'Data Science', rate: 30, color: 'indigo' },
        { name: 'Marketing', rate: 15, color: 'emerald' },
        { name: 'Core Eng', rate: 10, color: 'amber' }
      ],
      trends: Object.keys(monthlyData).map(month => ({ month, apps: monthlyData[month].apps, placed: monthlyData[month].placed }))
    };
  }, [rawData]);

  const { stats, roleDist, recentActivity, topRecruiters, upcomingDrives, deptHiring, trends } = memoizedData;

  useEffect(() => {
    if (!loading && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.animate-card');
      gsap.fromTo(cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading]);

  const handleBroadcast = async () => {
    setActionLoading('broadcast');
    try {
      const { data: students, error: fetchError } = await insforge.database
        .from('profiles').select('id').eq('role', 'student');
      if (fetchError) throw fetchError;

      if (students && students.length > 0) {
        const notifications = students.map(s => ({
          user_id: s.id,
          title: 'Admin Broadcast',
          message: 'Attention required: New update from Placement Cell.',
          type: 'alert',
          is_read: false
        }));
        await insforge.database.from('notifications').insert(notifications);
        toast.success(`Broadcast sent to ${students.length} students!`);
      }
    } catch (e) {
      toast.error('Failed to broadcast alert');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    setActionLoading('export');
    try {
      const { data: apps, error } = await insforge.database
        .from('applications').select('*, profiles(name, email), jobs(title, company)');
      if (error) throw error;

      if (apps && apps.length > 0) {
        const csv = [['Student', 'Email', 'Role', 'Company', 'Status', 'Date']]
          .concat(apps.map(a => [
            a.profiles?.name, a.profiles?.email, a.jobs?.title, a.jobs?.company, a.status, new Date(a.created_at).toLocaleDateString()
          ])).map(e => e.join(",")).join("\n");

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Report_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        toast.success('Report downloaded!');
      }
    } catch (e) {
      toast.error('Export failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-poppins antialiased pb-20 text-[1.04em]">
      <AdminNavbar />

      <main ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-card">
          <div>
            <h1 className="text-3xl font-bold  text-slate-900">Admin Center</h1>
            <p className="text-slate-500 mt-1 font-medium">System overview and platform management.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Live System</span>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button
              onClick={handleExport}
              disabled={actionLoading === 'export'}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">download</span>
              {actionLoading === 'export' ? 'Generating...' : 'Export Logs'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Students', value: stats.students, icon: 'diversity_3', color: 'blue' },
            { label: 'Active Companies', value: stats.companies, icon: 'hub', color: 'indigo' },
            { label: 'Job Openings', value: stats.jobs, icon: 'work', color: 'violet' },
            { label: 'Total Placed', value: stats.placed, icon: 'stars', color: 'emerald' }
          ].map((stat, i) => (
            <div key={i} className="animate-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                {stat.label === 'Total Placed' ? (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-sm">percent</span>
                    {stats.placedPercent}% Rate
                  </span>
                ) : (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    +12%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">

            {/* Placement Trends Chart */}
            <div className="animate-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 ">Monthly Applications</h2>
                  <p className="text-sm text-slate-500 font-medium">Monthly applications vs successful offers</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a4d2e]"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Applied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#67a070]"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Placed</span>
                  </div>
                </div>
              </div>

              {/* SVG Smooth Area Chart */}
              <div className="relative h-72 w-full mt-4">
                {(() => {
                  const maxApps = Math.max(...trends.map(t => t.apps), 5) || 5;
                  const maxVal = Math.ceil(maxApps / 4) * 4;
                  const labels = [maxVal, (maxVal * 3) / 4, maxVal / 2, maxVal / 4, 0];

                  return (
                    <>
                      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-bold text-slate-400 py-1 pr-4">
                        {labels.map((l, i) => <span key={i}>{l}</span>)}
                      </div>

                      <div className="ml-8 sm:ml-10 h-full relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                          {labels.map((_, i) => (
                            <div key={i} className="w-full border-t border-slate-100 border-dashed"></div>
                          ))}
                        </div>

                        <div className="absolute inset-0 pb-8">
                          <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {(() => {
                              if (!trends || trends.length === 0) return null;

                              const pointsApps = trends.map((t, i) => ({
                                x: (i / (trends.length - 1)) * 1000,
                                y: 300 - (t.apps / maxVal) * 300
                              }));
                              const pointsPlaced = trends.map((t, i) => ({
                                x: (i / (trends.length - 1)) * 1000,
                                y: 300 - (t.placed / maxVal) * 300
                              }));

                              const getCurvePath = (pts) => {
                                if (pts.length < 2) return "";
                                let d = `M ${pts[0].x} ${pts[0].y}`;
                                for (let i = 0; i < pts.length - 1; i++) {
                                  const curr = pts[i];
                                  const next = pts[i + 1];
                                  const cp1x = curr.x + (next.x - curr.x) / 2;
                                  const cp2x = curr.x + (next.x - curr.x) / 2;
                                  d += ` C ${cp1x} ${curr.y} ${cp2x} ${next.y} ${next.x} ${next.y}`;
                                }
                                return d;
                              };

                              const appsPath = getCurvePath(pointsApps);
                              const placedPath = getCurvePath(pointsPlaced);

                              return (
                                <>
                                  <path d={`${appsPath} L 1000 300 L 0 300 Z`} fill="url(#gradientApps)" className="opacity-20" />
                                  <path d={`${placedPath} L 1000 300 L 0 300 Z`} fill="url(#gradientPlaced)" className="opacity-30" />
                                  <defs>
                                    <linearGradient id="gradientApps" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#1a4d2e" />
                                      <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                    <linearGradient id="gradientPlaced" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#67a070" />
                                      <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                  </defs>
                                  <path d={appsPath} fill="none" stroke="#1a4d2e" strokeWidth="3" />
                                  <path d={placedPath} fill="none" stroke="#67a070" strokeWidth="3" />
                                  {pointsApps.map((p, i) => (
                                    <circle key={`app-${i}`} cx={p.x} cy={p.y} r="6" fill="#1a4d2e" stroke="white" strokeWidth="2" />
                                  ))}
                                  {pointsPlaced.map((p, i) => (
                                    <circle key={`place-${i}`} cx={p.x} cy={p.y} r="6" fill="#67a070" stroke="white" strokeWidth="2" />
                                  ))}
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        <div className="absolute left-0 right-0 bottom-0 flex justify-between">
                          {trends.map((item, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.month}</span>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="animate-card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Recent Platform Activity</h2>
                <Link to="/admin/alerts" className="text-xs font-bold text-blue-600 hover:text-blue-700">View Logs</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentActivity.map((item, i) => (
                  <div key={i} className="px-8 py-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      item.type === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                      <span className="material-symbols-outlined text-xl">
                        {item.type === 'success' ? 'check_circle' : item.type === 'danger' ? 'cancel' : 'info'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.student}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        Applied to <span className="text-slate-700 font-semibold">{item.company}</span> • {item.role}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      item.type === 'danger' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recruiting Partners */}
            <div className="animate-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 ">Top Recruiting Partners</h2>
                  <p className="text-sm text-slate-500 font-medium">Companies with highest student intake</p>
                </div>
                <Link to="/admin/companies" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topRecruiters.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <span className="material-symbols-outlined">corporate_fare</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{rec.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rec.offers} Offers Made</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{rec.growth}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring by Department */}
            <div className="animate-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900  mb-8">Placement by Stream</h2>
              <div className="space-y-6">
                {deptHiring.map((dept, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-700">{dept.name}</span>
                      <span className="text-slate-900">{dept.rate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${dept.color}-500 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${dept.rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">

            {/* Upcoming Drives */}
            <div className="animate-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900  mb-6 text-center">Upcoming Drives</h2>
              <div className="space-y-4">
                {upcomingDrives.map((drive, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-slate-100 pb-2 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900">{drive.company}</p>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{drive.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">event</span>
                        {drive.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {drive.venue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/companies" className="block w-full mt-6">
                <button className="w-full py-3 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  + Schedule New Drive
                </button>
              </Link>
            </div>

            {/* Industry Donut Chart */}
            <div className="animate-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-8">Industry Mix</h2>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let cumulativePercent = 0;
                      const r = 38;
                      const c = 2 * Math.PI * r;
                      return roleDist.map((item, i) => {
                        const startPercent = cumulativePercent;
                        cumulativePercent += item.value;
                        return (
                          <circle
                            key={i}
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="10"
                            strokeDasharray={`${(item.value / 100) * c} ${c}`}
                            strokeDashoffset={`${-(startPercent / 100) * c}`}
                            className="transition-all duration-700 ease-out"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-slate-900">100%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jobs</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {roleDist.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.bg}`}></div>
                        <span className="text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="animate-card bg-slate-900 p-8 rounded-2xl shadow-xl shadow-slate-900/10 text-white">
              <h2 className="text-lg font-bold mb-6">Quick Controls</h2>
              <div className="space-y-4">
                <button
                  onClick={handleBroadcast}
                  disabled={actionLoading === 'broadcast'}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-xl">campaign</span>
                  {actionLoading === 'broadcast' ? 'Sending...' : 'Broadcast Alert'}
                </button>
                <Link
                  to="/admin/students"
                  className="w-full py-3.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-xl">person_search</span>
                  Review Students
                </Link>
              </div>
            </div>

            {/* Pending Actions Queue */}
            <div className="animate-card bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-md font-bold text-slate-800 uppercase ">Queue</h3>
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Company Verify', count: 4, path: '/admin/companies' },
                  { label: 'Job Approval', count: 3, path: '/admin/alerts' },
                  { label: 'Student KYC', count: 12, path: '/admin/students' }
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.path}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <span className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-700">{item.label}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500">{item.count}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

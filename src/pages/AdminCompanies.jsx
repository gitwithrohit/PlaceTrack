import { useState, useEffect, useRef, useMemo } from 'react';
import { insforge } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';

const AdminCompanies = () => {
  const [rawData, setRawData] = useState({ companies: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const containerRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, jobRes] = await Promise.all([
        insforge.database.from('companies').select('*').order('name'),
        insforge.database.from('jobs').select('*').order('created_at', { ascending: false })
      ]);

      const compData = compRes.data || [];
      const jobData = jobRes.data || [];
      setRawData({ companies: compData, jobs: jobData });
    } catch (e) {
      console.error("AdminCompanies: Failed to fetch", e);
      toast.error("Network communication disrupted");
    } finally {
      setLoading(false);
    }
  };

  const { companies, jobs } = rawData;

  const memoizedData = useMemo(() => {
    const industryCounts = companies.reduce((acc, c) => {
      const ind = c.industry || 'Other';
      acc[ind] = (acc[ind] || 0) + 1;
      return acc;
    }, {});
    const topIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const filtered = companies.filter(c => {
      const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = industryFilter === 'All Industries' || c.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });

    const industriesList = ['All Industries', ...new Set(companies.map(c => c.industry).filter(Boolean))];

    return {
      stats: {
        total: companies.length,
        activeJobs: jobs.length,
        avgJobs: companies.length > 0 ? (jobs.length / companies.length).toFixed(1) : 0,
        topIndustry
      },
      filteredCompanies: filtered,
      industries: industriesList
    };
  }, [companies, jobs, searchQuery, industryFilter]);

  const { stats, filteredCompanies, industries } = memoizedData;

  useEffect(() => {
    fetchData();
  }, []);

  // Fixed Animation Trigger - Moved below data derivation
  useEffect(() => {
    if (!loading && companies && companies.length >= 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".animate-card",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.out"
          }
        );

        gsap.fromTo(".animate-header",
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.2 }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, companies]);

  // Robust Job Matching Logic (Memoized count access)
  const getJobCount = (companyName) => {
    return jobs.filter(j => j.company?.toLowerCase().trim() === companyName?.toLowerCase().trim()).length;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently revoke partner access? This cannot be reversed.")) return;
    try {
      const { error } = await insforge.database.from('companies').delete().eq('id', id);
      if (error) throw error;
      toast.success("Identity purged from network");
      fetchData();
    } catch (e) {
      toast.error("Operation failed: Security constraint");
    }
  };

  if (loading && companies.length === 0) return <PageSkeleton />;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-poppins antialiased text-slate-700 text-base overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" />

      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
      </div>

      <div className="relative z-50">
        <AdminNavbar />
      </div>

      <main ref={containerRef} className="max-w-7xl mx-auto w-full p-6 lg:p-10 relative z-10">

        {/* Dynamic Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-header">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md border border-indigo-100/50 rounded-2xl shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </span>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.2em]">Active System</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-slate-800 tracking-tighter leading-none">
              Partner <span className="text-slate-800 bg-clip-text ">Companies</span>
            </h1>
            <p className="text-slate-500 font-semibold text-lg tracking-tight max-w-2xl leading-relaxed">
              Manage and monitor your company partners and their active job postings in real-time.
            </p>
          </div>

          <button
            onClick={() => toast.success("Opening onboarding form...")}
            className="group relative flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-3xl font-bold shadow-2xl shadow-slate-900/20 hover:-translate-y-2 hover:shadow-indigo-500/20 transition-all duration-500 uppercase tracking-widest text-[11px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10"></div>
            <span className="material-symbols-outlined text-[22px] group-hover:rotate-180 transition-transform duration-700">add</span>
            Add Company
          </button>
        </header>

        {/* Dynamic Analytics Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Total Companies', value: stats.total, icon: 'hub', color: 'indigo', trend: 'Network size' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: 'sensors', color: 'emerald', trend: 'Live listings' },
            { label: 'Avg Jobs/Co', value: stats.avgJobs, icon: 'analytics', color: 'amber', trend: 'Hiring density' },
            { label: 'Top Industry', value: stats.topIndustry, icon: 'monitoring', color: 'blue', trend: 'Market lead' }
          ].map((item, i) => (
            <div key={i} className="animate-card bg-white/80 backdrop-blur-lg p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-50 rounded-full blur-xl group-hover:bg-indigo-50 transition-colors"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600 group-hover:scale-105 transition-all duration-500 shadow-inner`}>
                  <span className="material-symbols-outlined text-xl font-semibold">{item.icon}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
              </div>
              <p className={`text-2xl font-bold text-slate-900 tracking-tighter relative z-10 ${item.label === 'Primary Sector' ? 'text-lg truncate' : ''}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Global Control Terminal */}
        <div className="animate-card bg-slate-900/5 backdrop-blur-lg p-3 rounded-[2rem] border border-white shadow-sm mb-16 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full flex-1 group">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">manage_search</span>
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              className="w-full pl-16 pr-8 py-4 bg-white/80 focus:bg-white border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/5 text-base font-semibold transition-all placeholder:text-slate-400 tracking-tight text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <select
                className="w-full pl-8 pr-12 py-4 bg-white/80 hover:bg-white border-none rounded-2xl text-slate-700 text-sm font-bold appearance-none cursor-pointer outline-none transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/5 uppercase tracking-widest"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
            </div>
          </div>
        </div>

        {/* Entity Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCompanies.length > 0 && filteredCompanies.map((company) => {
            const jobCount = getJobCount(company.name);
            return (
              <div
                key={company.id}
                className="animate-card group relative bg-white rounded-[2rem] p-8 border border-white shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-50/50 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-50 group-hover:scale-100"></div>

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 p-3 shadow-md transition-all duration-500 group-hover:scale-105 relative">
                      <img
                        src={company.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${company.name}&backgroundColor=f1f5f9&textColor=475569&fontWeight=bold`}
                        alt={company.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${company.name}&backgroundColor=f1f5f9&textColor=475569&fontWeight=bold`;
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 translate-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700 ease-out">
                    <button onClick={() => toast.success(`Viewing ${company.name} Settings`)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl transition-all shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">settings</span>
                    </button>
                    <button onClick={() => handleDelete(company.id)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-2xl transition-all shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative z-10 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1 bg-indigo-500/5 text-indigo-700 text-[9px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/10 backdrop-blur-sm">
                      {company.industry || 'Technology'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3  group-hover:text-indigo-600 transition-colors duration-500 leading-tight">{company.name}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-8 italic opacity-80 group-hover:opacity-100 group-hover:text-slate-700 transition-all duration-500">
                    "{company.description || "Partnering for a brighter future through innovation and strategic recruitment excellence."}"
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 overflow-hidden shadow-sm transition-transform group-hover:scale-105">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${company.name + n}`} alt="" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Talent Acquisition</span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1 group-hover:scale-110 transition-transform duration-500 origin-right">
                      <span className="text-3xl font-bold text-slate-900 tracking-tighter group-hover:text-indigo-600">{jobCount}</span>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Jobs</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCompanies.length === 0 && (
            <div className="col-span-full py-48 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[4rem] border border-white border-dashed shadow-inner">
              <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <span className="material-symbols-outlined text-7xl text-slate-300">search_off</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tighter uppercase mb-2">No Companies Found</h3>
              <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Intelligence Overview Matrix */}
        <div className="mt-20 animate-card">
          <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]"></div>
            <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
              <span className="material-symbols-outlined text-[15rem]">analytics</span>
            </div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Statistics Dashboard</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[0.9]">RECRUITMENT<br />OVERVIEW<br /><span className="text-indigo-400">REPORT</span></h2>
                <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">View detailed reports and analytics of all company activities and hiring trends.</p>
                <div className="flex flex-wrap gap-5">
                  <button onClick={() => window.print()} className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]">Print Full Report</button>
                  <button onClick={() => toast.info("Viewing historical trends...")} className="px-8 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10 uppercase tracking-widest text-[10px]">View History</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market Coverage</p>
                  <p className="text-2xl font-bold text-white tracking-tighter">100%</p>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase mt-2">All sectors active</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">work</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Job Pool</p>
                  <p className="text-2xl font-bold text-white tracking-tighter">{stats.activeJobs}</p>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase mt-2">Real-time listings</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Partner Count</p>
                  <p className="text-2xl font-bold text-white tracking-tighter">{stats.total}</p>
                  <p className="text-[9px] text-amber-400 font-bold uppercase mt-2">Onboarded entities</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Density Index</p>
                  <p className="text-2xl font-bold text-white tracking-tighter">{stats.avgJobs}</p>
                  <p className="text-[9px] text-blue-400 font-bold uppercase mt-2">Jobs per partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCompanies;

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageSkeleton } from '../components/LoadingSkeleton';

const LOCATIONS = ['Bangalore', 'Hyderabad', 'Remote', 'Mumbai', 'Chennai', 'Pune', 'Gurgaon', 'Noida'];
const CATEGORIES = ['Software Engineering', 'Data Science', 'Design', 'Marketing'];

// Precise colors from design
const THEME_PALETTE = [
  { primary: '#7c3aed', bg: 'bg-[#7c3aed]/5', border: 'border-[#7c3aed]', text: 'text-[#7c3aed]', icon: 'code_blocks' },
  { primary: '#166534', bg: 'bg-[#166534]/5', border: 'border-[#166534]', text: 'text-[#166534]', icon: 'security' },
  { primary: '#2563eb', bg: 'bg-[#2563eb]/5', border: 'border-[#2563eb]', text: 'text-[#2563eb]', icon: 'cloud' },
  { primary: '#ea580c', bg: 'bg-[#ea580c]/5', border: 'border-[#ea580c]', text: 'text-[#ea580c]', icon: 'analytics' }
];

const Jobs = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const fetchJobs = async () => {
    try {
      const cacheKey = `cp_jobs_cache_${user?.id || 'guest'}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setJobs(parsed.jobs || []);
          setMyApplications(parsed.myApplications || []);
          setSavedJobs(parsed.savedJobs || []);
          setLoading(false);
        } catch(e) {}
      }

      const queries = [
        insforge.database.from('jobs').select('id, title, company, category, location, job_type, salary, description, created_at, apply_by').order('created_at', { ascending: false })
      ];
      
      if (user) {
        queries.push(insforge.database.from('applications').select('job_id, created_at').eq('student_id', user.id));
        queries.push(insforge.database.from('saved_jobs').select('job_id').eq('student_id', user.id));
      }

      const results = await Promise.all(queries);
      const newJobs = results[0]?.data || [];
      const newMyApps = user ? (results[1]?.data || []) : [];
      const newSaved = user ? (results[2]?.data?.map(s => s.job_id) || []) : [];

      setJobs(newJobs);
      setMyApplications(newMyApps);
      setSavedJobs(newSaved);
      
      localStorage.setItem(cacheKey, JSON.stringify({
        jobs: newJobs,
        myApplications: newMyApps,
        savedJobs: newSaved
      }));
    } catch (e) {
      console.error('Parallel fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleToggleSave = async (jobId) => {
    const isSaved = savedJobs.includes(jobId);
    try {
      if (isSaved) {
        await insforge.database.from('saved_jobs').delete().eq('student_id', user.id).eq('job_id', jobId);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        toast.success('Removed from saved');
      } else {
        await insforge.database.from('saved_jobs').insert([{ student_id: user.id, job_id: jobId }]);
        setSavedJobs([...savedJobs, jobId]);
        toast.success('Saved to profile');
      }
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = search.toLowerCase();
      const matchesSearch = !q || (j.title?.toLowerCase().includes(q)) || (j.company?.toLowerCase().includes(q));
      const matchesLocation = !locationFilter || (j.location && j.location.toLowerCase() === locationFilter.toLowerCase());
      const matchesCategory = !categoryFilter || (j.category && j.category.toLowerCase() === categoryFilter.toLowerCase());
      return matchesSearch && matchesLocation && matchesCategory;
    }).sort((a, b) => {
      if (sortOrder === 'latest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === 'last') return new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });
  }, [jobs, search, locationFilter, categoryFilter, sortOrder]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#fcfdfe] dark:bg-[#0f110f] min-h-screen transition-colors duration-500 font-poppins">

      <main className="max-w-[1500px] mx-auto p-6 lg:p-12">

        {/* Expanded Header */}
        <header className="mb-14 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Student Jobs</h1>
            <p className="text-slate-400 dark:text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Premium opportunities for your career path</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="relative group w-full lg:w-[350px]">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#325f3f] transition-colors">search</span>
              <input
                type="text"
                placeholder="Search role or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[12px] font-black uppercase tracking-widest focus:border-[#325f3f] transition-all outline-none shadow-sm dark:text-white"
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-8 py-3.5 bg-white dark:bg-[#151715] border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-[#325f3f] transition-all shadow-sm outline-none cursor-pointer dark:text-white"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#151715] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
                <button
                  onClick={() => setSortOrder('latest')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortOrder === 'latest' ? 'bg-[#325f3f] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortOrder('last')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortOrder === 'last' ? 'bg-[#325f3f] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Reverted Category Background & Size */}
        <div className="flex gap-4 overflow-x-auto pb-12 no-scrollbar">
          {['', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-9 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 whitespace-nowrap ${categoryFilter === cat
                ? 'bg-[#325f3f] text-white border-[#325f3f] shadow-2xl shadow-[#325f3f]/20'
                : 'bg-white dark:bg-[#151715] text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-white/10'
                }`}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>

        {/* Job Stack with Increased Visibility */}
        <div key={`${categoryFilter}-${locationFilter}-${search}`} className="flex flex-col gap-6">
          {filtered.length > 0 ? filtered.map((job, idx) => {
            const style = THEME_PALETTE[idx % THEME_PALETTE.length];
            const myApp = myApplications.find(a => a.job_id === job.id);
            const isSaved = savedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both transform-gpu"
                style={{ contentVisibility: 'auto', containmentIntrinsicSize: '0 250px' }}
              >
                <article className="bg-white dark:bg-[#151715] border border-slate-100 dark:border-white/5 rounded-[32px] shadow-sm hover:shadow-2xl hover:translate-y-[-2px] transition-all duration-300 flex flex-col lg:flex-row items-stretch overflow-hidden group">

                  {/* Left Accent Border */}
                  <div className="w-[6px] shrink-0" style={{ backgroundColor: style.primary }}></div>

                  {/* 1. Brand Section */}
                  <div className="p-6 lg:p-8 flex items-center justify-center shrink-0">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[32px] flex items-center justify-center border-2 transition-transform duration-500" style={{ backgroundColor: `${style.primary}10`, borderColor: `${style.primary}20` }}>
                      <span className="material-symbols-outlined text-4xl lg:text-5xl" style={{ color: style.primary }}>{style.icon}</span>
                    </div>
                  </div>

                  {/* 2. Content Section */}
                  <div className="flex-1 p-6 lg:p-8 lg:pl-2 flex flex-col justify-center min-w-0">
                    <div className="mb-4">
                      <h2 className="text-[26px] font-black text-slate-900 dark:text-white tracking-tight mb-2 truncate">{job.title}</h2>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-[13px] uppercase tracking-widest" style={{ color: style.primary }}>{job.company}</span>
                          <span className="material-symbols-outlined text-[18px] fill-1" style={{ color: style.primary }}>verified</span>
                        </div>
                        <span className="text-slate-200 dark:text-white/10 font-light text-xl">•</span>
                        <span className="text-[13px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{job.category || 'Product Engineering'}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px] leading-relaxed line-clamp-1 max-w-2xl">
                      {job.description || "Join our high-performance team to architect scalable solutions and drive technical innovation."}
                    </p>
                  </div>

                  {/* 3. Metadata Section */}
                  <div className="px-8 flex flex-col justify-center gap-4 shrink-0 border-l border-slate-50 dark:border-white/5 min-w-[200px]">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[20px] opacity-40">location_on</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">{job.location || 'Bangalore, India'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[20px] opacity-40">work</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">{job.job_type || 'Full Time'}</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent" style={{ backgroundColor: `${style.primary}10` }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: style.primary }}>payments</span>
                      <span className="text-[13px] font-black uppercase tracking-widest" style={{ color: style.primary }}>{job.salary || '₹12 - 20 LPA'}</span>
                    </div>
                  </div>

                  {/* 4. Interaction Center */}
                  <div className="px-10 flex flex-col justify-center items-center gap-4 shrink-0 bg-slate-50/30 dark:bg-black/20 min-w-[300px]">
                    {myApp ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Applied On</p>
                          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            {new Date(myApp.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <button
                          disabled
                          className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 rounded-[20px] font-black text-[12px] uppercase tracking-[0.2em] shadow-sm"
                        >
                          Applied
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6 w-full">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Posted</p>
                              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                {new Date(job.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Apply By</p>
                              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: style.primary }}>
                                {job.apply_by 
                                  ? new Date(job.apply_by).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                                  : new Date(new Date(job.created_at).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                                }
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleSave(job.id)}
                            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all ${isSaved ? 'shadow-xl border-transparent' : 'border-slate-100 dark:border-white/10'}`}
                            style={{ backgroundColor: isSaved ? style.primary : undefined }}
                          >
                            <span className={`material-symbols-outlined text-xl transition-all ${isSaved ? 'text-white' : 'text-slate-200 dark:text-gray-700'}`}>bookmark</span>
                          </button>
                        </div>
                        <button
                          onClick={() => navigate(`/apply/${job.id}`)}
                          className={`w-full flex items-center justify-center gap-6 py-4 text-white rounded-[20px] font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 group/btn`}
                          style={{ backgroundColor: style.primary }}
                        >
                          Apply Now
                          <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1.5 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            );
          }) : (
            <div className="py-24 text-center bg-white dark:bg-[#151715] rounded-[48px] border-2 border-dashed border-slate-100 dark:border-white/10">
              <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">No positions found matching your search</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;

import { useState, useEffect, useMemo } from 'react';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { Link } from 'react-router-dom';
import {
   Plus,
   Search,
   Filter,
   MoreVertical,
   Briefcase,
   Users,
   Clock,
   ChevronRight,
   LayoutGrid,
   List,
   Edit2,
   Trash2,
   ArrowUpRight,
   Sparkles,
   Zap,
   DollarSign
} from 'lucide-react';

const CompanyJobPosting = () => {
   const { user } = useAuth();
   const [jobs, setJobs] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({ active: 0, applicants: 0, drafts: 0 });
   const [currentPage, setCurrentPage] = useState(1);
   const [activeMenu, setActiveMenu] = useState(null);
   const [sortBy, setSortBy] = useState('newest');
   const [filterStatus, setFilterStatus] = useState('all');
   const [viewMode, setViewMode] = useState('grid');

   const itemsPerPage = 9;

   useEffect(() => {
      const fetchJobs = async () => {
         if (!user?.id) return;
         try {
            const { data, error } = await insforge.database
               .from('jobs')
               .select('id, title, company, status, created_at, location, salary, job_type, category, description, applications(id)')
               .eq('recruiter_id', user.id);

            if (error) throw error;

            if (data) {
               const processedJobs = data.map(job => ({
                  ...job,
                  applicantCount: job.applications?.length || 0,
                  formattedDate: new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  postedAt: new Date(job.created_at).getTime()
               }));
               setJobs(processedJobs);

               setStats({
                  active: processedJobs.filter(j => j.status?.toLowerCase() === 'active' || j.status?.toLowerCase() === 'open').length,
                  applicants: processedJobs.reduce((acc, j) => acc + j.applicantCount, 0),
                  drafts: processedJobs.filter(j => j.status?.toLowerCase() === 'draft').length
               });
            }
         } catch (e) {
            console.error("CompanyJobPosting: Failed to fetch", e);
         } finally {
            setLoading(false);
         }
      };
      fetchJobs();
   }, [user]);

   const filteredAndSortedJobs = useMemo(() => {
      let result = jobs.filter(job =>
         (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
         (filterStatus === 'all' || job.status?.toLowerCase() === filterStatus)
      );

      if (sortBy === 'title') {
         result.sort((a, b) => a.title.localeCompare(b.title));
      } else {
         result.sort((a, b) => b.postedAt - a.postedAt);
      }
      return result;
   }, [searchTerm, jobs, sortBy, filterStatus]);

   const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
   const currentJobs = filteredAndSortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

   if (loading) return <PageSkeleton />;

   return (
      <div className="min-h-screen bg-[#f9fafc] dark:bg-[#050505] antialiased text-slate-900 dark:text-slate-100 selection:bg-[#6366f1]/10">
         <RecruiterNavbar />

         <main className="max-w-[1400px] mx-auto w-full p-6 lg:p-10 pt-16 flex flex-col gap-10">

            {/* Find the right talent styled header */}
            <div className="bg-gradient-to-br from-[#f5f3ff] via-[#f0f9ff] to-[#f5f3ff] dark:from-[#1a1a2e] dark:to-[#0f0f1a] p-8 md:py-10 md:px-14 rounded-[40px] relative overflow-hidden border border-[#e0e7ff] dark:border-white/5 shadow-2xl shadow-indigo-500/5 group animate-fade-in-up">
               {/* Decorative blur blobs */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                     <h2 className="text-4xl md:text-5xl font-bold mb-2 text-[#1e1b4b] dark:text-white leading-tight">
                        Manage Your <span className="text-[#6366f1]">Postings</span>
                     </h2>
                     <p className="text-slate-600 dark:text-gray-400 font-bold text-lg mb-8 max-w-md">
                        Track and manage your active recruitment campaigns with precision and ease.
                     </p>

                     <div className="flex flex-wrap gap-4 w-full max-w-md">
                        <Link
                           to="/company/Posting/new"
                           className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white py-5 px-8 rounded-[24px] font-[900] text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#6366f1]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
                        >
                           <Plus size={20} /> Create New Job
                        </Link>
                     </div>

                     {/* The 3 sections from the image integrated here */}
                     <div className="grid grid-cols-3 gap-4 w-full mt-10">
                        {[
                           { label: 'Active Roles', value: stats.active, icon: <Briefcase size={20} /> },
                           { label: 'Total Applicants', value: stats.applicants, icon: <Users size={20} /> },
                           { label: 'Drafts', value: stats.drafts, icon: <Clock size={20} /> }
                        ].map((stat, i) => (
                           <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-[32px] border border-[#e0e7ff] dark:border-white/5 shadow-sm flex flex-col items-center text-center group/stat hover:shadow-lg transition-all duration-300">
                              <div className="w-10 h-10 rounded-xl bg-[#eef2ff] dark:bg-indigo-500/10 text-[#6366f1] flex items-center justify-center mb-4 transition-transform group-hover/stat:scale-110">
                                 {stat.icon}
                              </div>
                              <h3 className="text-3xl font-bold text-[#1e1b4b] dark:text-white leading-none mb-1">{stat.value}</h3>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="hidden lg:flex justify-center relative scale-100">
                     <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                        <div className="absolute top-10 left-0 w-44 h-56 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl rotate-[-8deg] border border-[#e0e7ff] dark:border-white/5 p-4 transform transition-transform group-hover:rotate-[-12deg] duration-700">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 mb-4 flex items-center justify-center">
                              <Briefcase className="text-[#6366f1]" size={24} />
                           </div>
                           <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2"></div>
                           <div className="h-2 w-1/2 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                        </div>
                        <div className="absolute top-4 left-16 w-44 h-56 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl z-10 border border-[#e0e7ff] dark:border-white/5 p-5 transform transition-transform group-hover:translate-y-[-8px] duration-700">
                           <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/30 mb-5 flex items-center justify-center text-[#6366f1]">
                              <Zap size={24} />
                           </div>
                           <div className="h-2.5 w-3/4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full mb-3"></div>
                           <div className="h-2 w-1/2 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                        </div>
                        <div className="absolute top-12 right-0 w-44 h-56 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-xl rotate-[12deg] border border-[#e0e7ff] dark:border-white/5 p-4 transform transition-transform group-hover:rotate-[16deg] duration-700">
                           <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/20 mb-4 flex items-center justify-center">
                              <Users className="text-purple-500" size={24} />
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
               </div>
            </div>

            {/* Removed the extra stats row below as it's now inside the banner */}

            {/* Control Bar - Matching the Dashboard Search Style */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
               <div className="flex-1 relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#6366f1] transition-colors">
                     <Search size={22} />
                  </div>
                  <input
                     type="text"
                     placeholder="Search roles or companies..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-16 pr-6 py-5 bg-white dark:bg-[#0f0f1a] border border-[#e0e7ff] dark:border-white/10 rounded-[24px] shadow-sm outline-none font-bold text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-[#6366f1] transition-all"
                  />
               </div>

               <div className="flex flex-wrap items-center gap-3">
                  <div className="flex bg-white dark:bg-[#111] p-1.5 rounded-[24px] border border-[#e0e7ff] dark:border-white/10 shadow-sm">
                     <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20' : 'text-slate-400 hover:text-[#6366f1]'}`}
                     >
                        <LayoutGrid size={20} />
                     </button>
                     <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20' : 'text-slate-400 hover:text-[#6366f1]'}`}
                     >
                        <List size={20} />
                     </button>
                  </div>

                  <select
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                     className="px-8 py-5 bg-white dark:bg-[#111] border border-[#e0e7ff] dark:border-white/10 rounded-[24px] text-sm font-bold text-slate-500 appearance-none cursor-pointer outline-none hover:border-[#6366f1]/30 transition-all shadow-sm"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.25rem` }}
                  >
                     <option value="all">All Status</option>
                     <option value="active">Active</option>
                     <option value="draft">Drafts</option>
                  </select>
               </div>
            </div>

            {/* Jobs Display - Cards styled like the illustration cards */}
            {viewMode === 'grid' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  {currentJobs.length > 0 ? currentJobs.map((job, idx) => (
                     <div
                        key={job.id}
                        className="group bg-white dark:bg-[#111] rounded-[40px] p-8 border border-[#e0e7ff] dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-[#6366f1]/5 hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden"
                     >
                        <div className="flex justify-between items-start mb-8">
                           <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${(job.status?.toLowerCase() === 'active' || job.status?.toLowerCase() === 'open')
                                 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'
                                 : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/10'
                              }`}>
                              {job.status}
                           </div>
                           <button
                              onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                              className="p-2 text-slate-300 hover:text-[#6366f1] transition-colors"
                           >
                              <MoreVertical size={20} />
                           </button>
                           {activeMenu === job.id && (
                              <div className="absolute right-12 top-16 w-44 bg-white dark:bg-[#1a1a1a] border border-[#e0e7ff] dark:border-white/10 rounded-[24px] shadow-2xl z-20 py-3 animate-in fade-in zoom-in-95 duration-200">
                                 <button className="w-full text-left px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-4 transition-colors">
                                    <Edit2 size={14} /> Edit Campaign
                                 </button>
                                 <button className="w-full text-left px-6 py-4 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/5 flex items-center gap-4 transition-colors border-t dark:border-white/5">
                                    <Trash2 size={14} /> Delete
                                 </button>
                              </div>
                           )}
                        </div>

                        <div className="mb-8">
                           <h3 className="text-2xl font-bold text-[#1e1b4b] dark:text-white mb-2 line-clamp-2 group-hover:text-[#6366f1] transition-colors">{job.title}</h3>
                           <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-4">
                              <Sparkles size={14} className="text-[#6366f1]" />
                              {job.company} • {job.location || 'Hybrid'}
                           </div>

                           {/* Added content from the job posting */}
                           <div className="flex flex-wrap gap-2">
                              <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                 <DollarSign size={10} className="text-emerald-500" /> {job.salary}
                              </div>
                              <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                 <Clock size={10} className="text-blue-500" /> {job.job_type}
                              </div>
                              <div className="px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10 text-[10px] font-black text-[#6366f1] uppercase tracking-wider">
                                 {job.category}
                              </div>
                           </div>

                           {/* Added description snippet */}
                           <p className="mt-6 text-xs font-bold text-slate-400 dark:text-slate-500 line-clamp-3 leading-relaxed">
                              {job.description || "No description provided for this role."}
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="p-6 bg-slate-50 dark:bg-[#0a0a0a] rounded-[28px] border border-[#e0e7ff] dark:border-white/5 relative overflow-hidden group/stat">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Applicants</p>
                              <div className="flex items-end gap-2 relative z-10">
                                 <p className="text-3xl font-bold text-[#1e1b4b] dark:text-white leading-none">{job.applicantCount}</p>
                                 <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mb-1">
                                    <ArrowUpRight size={10} /> +{Math.floor(Math.random() * 5)}
                                 </p>
                              </div>
                              <Users className="absolute -right-4 -bottom-4 text-indigo-500/5 w-20 h-20 transition-transform group-hover/stat:scale-110" />
                           </div>
                           <div className="p-6 bg-slate-50 dark:bg-[#0a0a0a] rounded-[28px] border border-[#e0e7ff] dark:border-white/5 text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Posted On</p>
                              <p className="text-lg font-bold text-[#1e1b4b] dark:text-white">{job.formattedDate}</p>
                              <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Current Batch</p>
                           </div>
                        </div>

                        <div className="mt-auto flex justify-center">
                           <Link
                              to={`/company/Applicants?jobId=${job.id}`}
                              className="flex items-center justify-between gap-6 px-10 py-4 bg-[#1e1b4b] dark:bg-white text-white dark:text-[#1e1b4b] rounded-full text-[10px] font-[900] uppercase tracking-[0.2em] hover:bg-[#6366f1] hover:text-white dark:hover:bg-[#6366f1] dark:hover:text-white transition-all shadow-xl hover:shadow-[#6366f1]/20 active:scale-95"
                           >
                              Manage Candidates
                              <ChevronRight size={16} />
                           </Link>
                        </div>
                     </div>
                  )) : (
                     <EmptyState />
                  )}
               </div>
            ) : (
               <div className="bg-white dark:bg-[#111] rounded-[40px] border border-[#e0e7ff] dark:border-white/10 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-white/5 border-b border-[#e0e7ff] dark:border-white/5">
                              <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Role Title</th>
                              <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Applicants</th>
                              <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                              <th className="p-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Launch Date</th>
                              <th className="p-8 text-right"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y border-[#e0e7ff] dark:divide-white/5">
                           {currentJobs.map((job) => (
                              <tr key={job.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                 <td className="p-8 max-w-[400px]">
                                    <p className="text-lg font-[900] text-[#1e1b4b] dark:text-white mb-1 group-hover:text-[#6366f1] transition-colors">{job.title}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{job.company} • {job.location}</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 line-clamp-1 italic">
                                       {job.description || "No description provided."}
                                    </p>
                                 </td>
                                 <td className="p-8">
                                    <div className="flex items-center gap-3">
                                       <span className="text-2xl font-[900] text-[#1e1b4b] dark:text-white">{job.applicantCount}</span>
                                       <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-lg uppercase">Active</span>
                                    </div>
                                 </td>
                                 <td className="p-8">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${(job.status?.toLowerCase() === 'active' || job.status?.toLowerCase() === 'open')
                                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'
                                          : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/10'
                                       }`}>
                                       {job.status}
                                    </span>
                                 </td>
                                 <td className="p-8 text-sm font-bold text-slate-500 dark:text-slate-400">{job.formattedDate}</td>
                                 <td className="p-8 text-right">
                                    <Link
                                       to={`/company/Applicants?jobId=${job.id}`}
                                       className="inline-flex items-center gap-2 p-4 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-[#6366f1] hover:text-white transition-all shadow-sm"
                                    >
                                       <ChevronRight size={20} />
                                    </Link>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* Pagination styled like the dashboard cards */}
            {totalPages > 1 && (
               <footer className="flex justify-between items-center bg-white dark:bg-[#111] p-8 rounded-[40px] border border-[#e0e7ff] dark:border-white/10 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Showing {currentJobs.length} of {filteredAndSortedJobs.length} results
                  </p>
                  <div className="flex gap-3">
                     <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-14 h-14 flex items-center justify-center rounded-[20px] border border-[#e0e7ff] dark:border-white/10 bg-white dark:bg-transparent text-slate-600 dark:text-white disabled:opacity-30 hover:border-[#6366f1] hover:text-[#6366f1] transition-all shadow-sm"
                     >
                        <ChevronRight className="rotate-180" size={24} />
                     </button>
                     <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-14 h-14 flex items-center justify-center rounded-[20px] border border-[#e0e7ff] dark:border-white/10 bg-white dark:bg-transparent text-slate-600 dark:text-white disabled:opacity-30 hover:border-[#6366f1] hover:text-[#6366f1] transition-all shadow-sm"
                     >
                        <ChevronRight size={24} />
                     </button>
                  </div>
               </footer>
            )}
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

const EmptyState = () => (
   <div className="col-span-full py-40 flex flex-col items-center justify-center text-center bg-white dark:bg-[#111] rounded-[40px] border border-dashed border-[#e0e7ff] dark:border-white/10">
      <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-[32px] flex items-center justify-center mb-8">
         <Briefcase className="text-[#6366f1] w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-[#1e1b4b] dark:text-white mb-2">No active campaigns</h3>
      <p className="text-slate-400 font-bold text-lg max-w-sm">Launch your first recruitment campaign today to start finding top talent.</p>
   </div>
);

export default CompanyJobPosting;

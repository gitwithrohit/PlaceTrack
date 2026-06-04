import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import Sidebar from '../components/Sidebar';

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      // Fetch job IDs from saved_jobs table
      const { data: savedIds } = await insforge.database
        .from('saved_jobs')
        .select('job_id')
        .eq('student_id', user.id);
      
      if (!savedIds || savedIds.length === 0) {
        setSavedJobs([]);
        return;
      }

      const ids = savedIds.map(s => s.job_id);

      // Fetch full job details for those IDs
      const { data: jobsData } = await insforge.database
        .from('jobs')
        .select('*')
        .in('id', ids);
      
      setSavedJobs(jobsData || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const handleUnsave = async (jobId) => {
    try {
      await insforge.database
        .from('saved_jobs')
        .delete()
        .eq('student_id', user.id)
        .eq('job_id', jobId);
      
      setSavedJobs(savedJobs.filter(j => j.id !== jobId));
      toast.success("Job removed from bookmarks");
    } catch (e) {
      toast.error("Action failed");
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#f2f4f7] dark:bg-[#000000] min-h-screen flex transition-colors duration-500">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-3">
             <div className="w-1.5 h-10 bg-[#325f3f] rounded-full"></div>
             <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tighter leading-none">Your <span className="text-[#325f3f]">Bookmarks</span></h1>
          </div>
          <p className="text-slate-500 font-semibold text-lg ml-6">Roles you've saved for later review</p>
        </div>

        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {savedJobs.map((job, idx) => (
              <div 
                key={job.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <article className="bg-white dark:bg-[#111111] border-2 border-white dark:border-white/5 rounded-[40px] p-9 lg:p-11 shadow-lg hover:shadow-2xl transition-all flex flex-col h-full group">
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#325f3f]/10 rounded-3xl flex items-center justify-center font-bold text-[#325f3f] text-2xl border-2 border-[#325f3f]/20 group-hover:scale-105 transition-transform">
                        {job.company?.[0] || 'J'}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-black dark:text-white tracking-tighter leading-tight mb-1.5 group-hover:text-[#325f3f] transition-colors">{job.title}</h2>
                        <p className="text-[#325f3f] font-bold text-sm uppercase tracking-wide">{job.company}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleUnsave(job.id)}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#325f3f] text-white shadow-lg shadow-[#325f3f]/20 hover:bg-red-500 transition-all group/btn"
                    >
                      <span className="material-symbols-outlined text-xl group-hover/btn:hidden" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                      <span className="material-symbols-outlined text-xl hidden group-hover/btn:block">bookmark_remove</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5 mb-8">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 text-black dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-100 dark:border-white/10 uppercase tracking-widest">{job.location}</div>
                    <div className="px-4 py-2 bg-[#325f3f]/5 text-[#325f3f] text-xs font-semibold rounded-xl border border-[#325f3f]/20 uppercase tracking-widest">{job.salary}</div>
                  </div>

                  <p className="text-slate-600 dark:text-gray-400 font-semibold text-[14.5px] leading-relaxed mb-10 line-clamp-3 flex-grow">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/5 mt-auto">
                    <button 
                      onClick={() => navigate(`/apply/${job.id}`)}
                      className="w-full px-10 py-4 bg-[#325f3f] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#2a4f35] transition-all shadow-xl shadow-[#325f3f]/20 active:scale-95"
                    >
                      Apply Now
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center animate-in fade-in zoom-in duration-1000">
            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-5xl text-slate-300">bookmark_add</span>
            </div>
            <h2 className="text-3xl font-bold text-black dark:text-white mb-3">No saved jobs yet</h2>
            <p className="text-slate-400 font-semibold text-lg max-w-md mx-auto">Explore opportunities and save the ones that catch your eye to view them here later.</p>
            <button 
              onClick={() => navigate('/jobs')}
              className="mt-10 px-10 py-4 bg-[#325f3f] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[#325f3f]/20 hover:scale-105 transition-all"
            >
              Explore Openings
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedJobs;

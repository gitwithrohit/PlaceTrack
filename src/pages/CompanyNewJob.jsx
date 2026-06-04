import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Send, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Layers, 
  FileText,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

const CompanyNewJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Bangalore',
    job_type: 'Full Time',
    category: 'Software Engineering',
    salary: '12-18 LPA',
    description: '',
    status: 'open'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setLoading(true);
    const toastId = toast.loading("Launching campaign...");
    
    try {
      const { error } = await insforge.database
        .from('jobs')
        .insert([{
          ...formData,
          recruiter_id: user.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      toast.success("Job published successfully!", { id: toastId });
      setTimeout(() => navigate('/company/Posting'), 1500);
    } catch (e) {
      console.error("Failed to post job:", e);
      toast.error("Failed to publish. Please check your data.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const InputWrapper = ({ label, icon, children }) => (
    <div className="space-y-3 group">
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-4 group-focus-within:text-indigo-600 transition-colors">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9fafc] dark:bg-[#050505] antialiased text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10">
      <Toaster position="top-right" />
      <RecruiterNavbar />

      <main className="max-w-[900px] mx-auto w-full p-6 lg:p-10 pt-16 flex flex-col gap-10">
        
        {/* Navigation & Header */}
        <header className="animate-fade-in-up">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-400 font-bold text-sm mb-8 hover:text-indigo-600 transition-all"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">
               <ArrowLeft size={16} />
            </div>
            Back to Campaigns
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
                   <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white leading-none">New Posting</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Define the role and find the next generation of top talent.</p>
             </div>
             
             <div className="hidden md:flex items-center gap-4 p-4 bg-white dark:bg-[#111] rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                   <Sparkles size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</p>
                   <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter">Instant & Global</p>
                </div>
             </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Section: Basic Details */}
          <div className="bg-white dark:bg-[#111] rounded-[40px] p-8 lg:p-12 border border-slate-100 dark:border-white/5 shadow-sm space-y-10 relative overflow-hidden">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                   <Info size={18} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Core Information</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputWrapper label="Job Title" icon={<Briefcase size={12} />}>
                   <input
                     required
                     type="text"
                     placeholder="e.g. Senior Frontend Engineer"
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                   />
                </InputWrapper>
                <InputWrapper label="Company Name" icon={<Briefcase size={12} />}>
                   <input
                     required
                     type="text"
                     placeholder="e.g. TechCorp"
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
                     value={formData.company}
                     onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                   />
                </InputWrapper>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputWrapper label="Location" icon={<MapPin size={12} />}>
                   <select
                     required
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-500 appearance-none cursor-pointer"
                     value={formData.location}
                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                   >
                     <option>Bangalore</option>
                     <option>Hyderabad</option>
                     <option>Mumbai</option>
                     <option>Chennai</option>
                     <option>Pune</option>
                     <option>Gurgaon</option>
                     <option>Remote</option>
                   </select>
                </InputWrapper>
                <InputWrapper label="Employment Type" icon={<Layers size={12} />}>
                   <select
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-500 appearance-none cursor-pointer"
                     value={formData.job_type}
                     onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                   >
                     <option>Full Time</option>
                     <option>Internship</option>
                     <option>Contract</option>
                   </select>
                </InputWrapper>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <InputWrapper label="Category" icon={<Layers size={12} />}>
                   <select
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-500 appearance-none cursor-pointer"
                     value={formData.category}
                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                   >
                     <option>Software Engineering</option>
                     <option>Data Science</option>
                     <option>Design</option>
                     <option>Marketing</option>
                     <option>Product Management</option>
                   </select>
                </InputWrapper>
                <InputWrapper label="Expected Salary" icon={<DollarSign size={12} />}>
                   <input
                     required
                     type="text"
                     placeholder="e.g. 12-18 LPA"
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
                     value={formData.salary}
                     onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                   />
                </InputWrapper>
             </div>

             <InputWrapper label="Job Description" icon={<FileText size={12} />}>
                <textarea
                  required
                  rows="8"
                  placeholder="Clearly outline the responsibilities, requirements, and what makes this role unique..."
                  className="w-full px-8 py-6 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/5 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 resize-none leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
             </InputWrapper>

             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pb-20">
             <button
               type="button"
               onClick={() => navigate(-1)}
               className="px-10 py-5 text-slate-400 font-bold uppercase tracking-widest hover:text-rose-600 transition-all text-sm"
             >
               Discard Draft
             </button>
             <button
               disabled={loading}
               type="submit"
               className="group relative flex items-center justify-center gap-3 px-14 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] font-bold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 dark:hover:shadow-white/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 overflow-hidden"
             >
               <div className="absolute inset-0 bg-indigo-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
               <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                  {loading ? 'Publishing...' : 'Launch Campaign'}
                  {!loading && <Send size={18} />}
               </span>
             </button>
          </div>
        </form>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 1.5rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem;
        }
        `}} />
    </div>
  );
};

export default CompanyNewJob;

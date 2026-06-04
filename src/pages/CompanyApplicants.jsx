import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import {
  Search,
  Briefcase,
  ChevronDown,
  Users,
  Zap,
  Star,
  MapPin,
  GraduationCap,
  Award,
  Target,
  Sparkles,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Download
} from 'lucide-react';
import gsap from 'gsap';
import illustration from '../assets/candidate_intelligence_illustration.png';

const CompanyApplicants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState(initialJobId || 'all');
  const [stats, setStats] = useState({ total: 0, reviewing: 0, shortlisted: 0, interviewed: 0 });

  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      try {
        // Fetch applications with joined jobs to filter by recruiter_id in one go
        const { data: appsData, error: appsError } = await insforge.database
          .from('applications')
          .select(`
            id, job_id, status, created_at,
            profiles:student_id(name, avatar_url, university, gpa, skills, email, resume_url, graduation_year),
            jobs:job_id!inner(title, recruiter_id, description)
          `)
          .eq('jobs.recruiter_id', user.id)
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;

        if (appsData && appsData.length > 0) {
          // Fetch interviews to get accurate interviewed count
          const { data: intsData } = await insforge.database
            .from('interviews')
            .select('application_id')
            .in('application_id', appsData.map(a => a.id));

          const scheduledAppIds = new Set(intsData?.map(i => i.application_id) || []);

          setApplications(appsData);
          setStats({
            total: appsData.length,
            reviewing: appsData.filter(a => !a.status || ['applied', 'pending', 'new', 'reviewing'].includes(a.status.toLowerCase())).length,
            shortlisted: appsData.filter(a => a.status?.toLowerCase() === 'shortlisted').length,
            interviewed: appsData.filter(a => ['interview', 'interviewing', 'interviewed'].includes(a.status?.toLowerCase()) || scheduledAppIds.has(a.id)).length
          });
        } else {
          setApplications([]);
          setStats({ total: 0, reviewing: 0, shortlisted: 0, interviewed: 0 });
        }
      } catch (e) {
        console.error(e);
        toast.error("Pipeline sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (!loading && filteredApplicants.length > 0) {
      const targets = cardsRef.current.filter(el => el !== null);
      if (targets.length > 0) {
        // Use gsap.set for initial state to avoid flicker and force GPU acceleration
        gsap.set(targets, { willChange: 'transform, opacity' });
        gsap.fromTo(targets,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.03,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => {
              // Remove will-change after animation to free up GPU memory
              gsap.set(targets, { clearProps: 'willChange' });
            }
          }
        );
      }
    }
  }, [loading, jobFilter, statusFilter, searchTerm]);

  const filteredApplicants = useMemo(() => {
    return applications.filter(app => {
      const name = app.profiles?.name?.toLowerCase() || '';
      const title = app.jobs?.title?.toLowerCase() || '';
      const q = searchTerm.toLowerCase();
      const matchesSearch = name.includes(q) || title.includes(q);
      const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter;
      const matchesJob = jobFilter === 'all' || app.job_id === jobFilter;
      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applications, searchTerm, statusFilter, jobFilter]);

  const uniqueJobs = useMemo(() => {
    const jobsMap = new Map();
    applications.forEach(app => {
      if (app.jobs) jobsMap.set(app.job_id, app.jobs.title);
    });
    return Array.from(jobsMap.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await insforge.database
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => {
        const updated = prev.map(a => a.id === id ? { ...a, status: newStatus } : a);
        setStats({
          total: updated.length,
          reviewing: updated.filter(a => !a.status || a.status.toLowerCase() === 'applied' || a.status.toLowerCase() === 'reviewing').length,
          shortlisted: updated.filter(a => a.status?.toLowerCase() === 'shortlisted').length,
          interviewed: updated.filter(a => ['interview', 'interviewing', 'interviewed'].includes(a.status?.toLowerCase())).length
        });
        return updated;
      });
      toast.success(`Candidate status: ${newStatus}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDownloadResume = (e, url, name) => {
    e.stopPropagation();
    if (!url) {
      toast.error("Resume not available");
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading resume...");
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#fdfdff] min-h-screen flex flex-col antialiased text-slate-900 overflow-x-hidden">
      <Toaster position="top-right" />
      <RecruiterNavbar />

      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-12 relative z-10">

        {/* Banner */}
        <section className="relative w-full bg-[#f0f3ff] rounded-[60px] p-6 mb-12 overflow-hidden">
          <div className="bg-white/40 backdrop-blur-md rounded-[50px] border border-white/60 p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-8 shadow-inner">
            {/* Content side */}
            <div className="flex-1 z-10 text-center lg:text-left min-w-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 rounded-full mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Candidate Intelligence</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Application <span className="text-indigo-600">Management</span>
              </h1>
              <p className="text-lg font-medium text-slate-500 max-w-lg mb-10 leading-relaxed">
                Monitor and advance candidates through your recruitment funnel with precision and ease.
              </p>

              {/* Metrics Row */}
              <div className="flex flex-row flex-nowrap justify-center lg:justify-start gap-4 mt-8 overflow-hidden no-scrollbar">
                {[
                  { label: 'Total', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50/60' },
                  { label: 'Review', value: stats.reviewing, icon: Eye, color: 'text-amber-500', bg: 'bg-amber-50/60' },
                  { label: 'Shortlist', value: stats.shortlisted, icon: Star, color: 'text-purple-500', bg: 'bg-purple-50/60' },
                  { label: 'Interview', value: stats.interviewed, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50/60' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center lg:items-start p-3 hover:bg-white/50 rounded-[24px] transition-all hover:scale-105 min-w-[95px] group/stat">
                    <div className={`w-10 h-10 ${stat.bg} rounded-[14px] flex items-center justify-center mb-2.5 shadow-sm group-hover/stat:shadow-md transition-all`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="flex flex-col items-center lg:items-start">
                      <p className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</p>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1 whitespace-nowrap">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side Illustration */}
            <div className="flex-1 flex justify-center lg:justify-end relative">
              <div className="bg-white/60 p-6 rounded-[60px] border border-white shadow-xl shadow-indigo-100/20">
                <img
                  src={illustration}
                  alt="Pipeline Illustration"
                  className="w-full max-w-[620px] h-auto object-contain relative z-10 rounded-[48px]"
                  loading="lazy"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-200/10 blur-[80px] rounded-full -z-0 pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Filter Console */}
        <div className="bg-white rounded-full p-2.5 border border-slate-100 shadow-2xl shadow-indigo-100/40 mb-12 flex items-center gap-4 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text" placeholder="Search profiles or roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-4 bg-slate-50/50 border border-transparent rounded-full focus:bg-white focus:border-indigo-100 outline-none text-xs font-semibold text-slate-600 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="flex gap-2 pr-2">
            <div className="relative group">
              <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="pl-8 pr-12 py-4 bg-white border border-slate-100 rounded-full text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none min-w-[200px] shadow-sm hover:border-indigo-200 transition-all text-slate-800">
                <option value="all">All Jobs</option>
                {uniqueJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-400 transition-colors" />
            </div>

            <div className="relative group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`pl-8 pr-12 py-4 bg-white border ${statusFilter !== 'all' ? 'border-indigo-600 ring-2 ring-indigo-600/5' : 'border-slate-100'} rounded-full text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none min-w-[180px] shadow-sm hover:border-indigo-400 transition-all text-slate-800`}
              >
                <option value="all">All Phases</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
              </select>
              <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredApplicants.length > 0 ? filteredApplicants.map((app, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="bg-white rounded-[50px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col relative overflow-hidden group transform-gpu"
              style={{ contentVisibility: 'auto', containmentIntrinsicSize: '0 500px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-50/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              {/* Header Section */}
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500 bg-slate-100">
                    <img
                      src={app.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.profiles?.name || 'User'}&backgroundColor=transparent`}
                      alt="Candidate"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-2xl font-bold text-slate-900 truncate mb-1">{app.profiles?.name || 'Candidate'}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">
                      <Target size={14} /> {app.jobs?.title || 'Job Role'}
                    </div>
                  </div>
                </div>
                <div className={`px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-colors ${app.status?.toLowerCase() === 'shortlisted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                  (['interview', 'interviewing', 'interviewed'].includes(app.status?.toLowerCase()) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    (app.status?.toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'))
                  }`}>
                  {app.status || 'Applied'}
                </div>
              </div>

              {/* Role Info */}
              <div className="mb-8 p-6 bg-slate-50/30 border border-slate-100 rounded-[30px] shadow-sm relative z-10 group-hover:border-indigo-100 transition-colors duration-500">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Briefcase size={14} /> Role Information
                </p>
                <p className="text-[13px] font-semibold text-slate-500 italic leading-relaxed">
                  {app.jobs?.description || "Monitor systems and prevent security breaches."}
                </p>
              </div>

              {/* Skills Area */}
              <div className="flex flex-wrap gap-2 mb-10 relative z-10">
                {Array.isArray(app.profiles?.skills) && app.profiles.skills.length > 0 ? app.profiles.skills.slice(0, 2).map((skill, si) => (
                  <span key={si} className="px-5 py-2.5 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-indigo-200 transition-all">
                    {skill}
                  </span>
                )) : (
                  <span className="px-5 py-2.5 bg-slate-50/50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                    Professional Expertise
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                <div className="p-6 bg-indigo-50/30 rounded-[35px] border border-transparent group-hover:bg-indigo-50/50 transition-colors duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPA</p>
                  </div>
                  <p className="text-xl font-bold text-slate-900 tracking-tighter">
                    {app.profiles?.gpa ? parseFloat(app.profiles.gpa).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-[35px] border border-transparent group-hover:bg-indigo-50/50 transition-colors duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cycle</p>
                  </div>
                  <p className="text-xl font-bold text-slate-900 tracking-tighter">
                    {app.profiles?.graduation_year || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Suite */}
              <div className="flex gap-4 mt-auto relative z-10">
                <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-full overflow-hidden shadow-sm hover:border-indigo-100 transition-all">
                  <button
                    onClick={() => navigate(`/company/resume/${app.student_id}`)}
                    className="flex-1 flex items-center justify-center gap-2 pl-6 pr-4 py-4 font-bold text-[11px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors group/view"
                  >
                    <Eye size={16} className="text-slate-400 group-hover/view:text-indigo-500" /> Preview resume
                  </button>
                  <div className="w-[1px] h-6 bg-slate-100"></div>
                  <button
                    onClick={(e) => handleDownloadResume(e, app.profiles?.resume_url, app.profiles?.name)}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors group/down"
                    title="Download PDF"
                  >
                    <Download size={16} className="text-slate-400 group-hover/down:text-indigo-500" />
                  </button>
                </div>

                <div className="relative group/status flex-1">
                  <button className="w-full h-full flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                    Status <ChevronDown size={16} />
                  </button>
                  {/* LIGHT DROPDOWN: replaced backdrop-blur with semi-solid bg for performance */}
                  <div className="absolute bottom-full left-0 w-full mb-4 bg-white/95 border border-slate-200 rounded-[35px] shadow-2xl opacity-0 translate-y-1 pointer-events-none group-hover/status:opacity-100 group-hover/status:translate-y-0 group-hover/status:pointer-events-auto transition-all duration-200 z-50 p-2 overflow-hidden">
                    <button onClick={() => handleUpdateStatus(app.id, 'Shortlisted')} className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-[25px] transition-all">
                      <Star size={14} className="text-purple-500" /> Shortlist
                    </button>
                    <button onClick={() => handleUpdateStatus(app.id, 'Interviewed')} className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-[25px] transition-all">
                      <Clock size={14} className="text-emerald-500" /> Interview
                    </button>
                    <button onClick={() => handleUpdateStatus(app.id, 'Rejected')} className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-[25px] transition-all">
                      <XCircle size={14} className="text-rose-500" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-40 flex flex-col items-center justify-center bg-white rounded-[60px] border border-slate-100 shadow-sm animate-fade-in">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <Users size={48} className="text-slate-200" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tightest">Pipeline Idle</h3>
              <p className="text-base font-semibold text-slate-400 max-w-sm text-center leading-relaxed italic">Expand your search criteria to discover emerging talent.</p>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default CompanyApplicants;

import { useState, useEffect, useMemo, useRef } from 'react';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Video, 
  Plus, 
  Search, 
  MoreVertical, 
  CalendarPlus, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  User,
  LayoutGrid
} from 'lucide-react';
import gsap from 'gsap';

const CompanyInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef(null);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    application_id: '',
    schedule_time: '',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    status: 'Scheduled'
  });

  const fetchData = async () => {
    try {
      // Fetch both interviews and potentially pending applications in parallel
      // using joined queries to filter by recruiter_id at the database level
      const [interviewsRes, appsRes] = await Promise.all([
        insforge.database
          .from('interviews')
          .select(`
            id, application_id, schedule_time, meeting_link, status, created_at,
            applications:application_id!inner(
              id, job_id, status,
              profiles:student_id(name, avatar_url),
              jobs:job_id!inner(title, recruiter_id)
            )
          `)
          .eq('applications.jobs.recruiter_id', user.id)
          .order('schedule_time', { ascending: true }),
        insforge.database
          .from('applications')
          .select(`
            id, job_id, status,
            profiles:student_id(name, avatar_url),
            jobs:job_id!inner(title, recruiter_id)
          `)
          .eq('jobs.recruiter_id', user.id)
          .in('status', ['shortlisted', 'interview', 'Shortlisted', 'Interview'])
      ]);

      if (interviewsRes.error) throw interviewsRes.error;
      if (appsRes.error) throw appsRes.error;

      const interviewData = interviewsRes.data || [];
      const allApps = appsRes.data || [];
      
      setInterviews(interviewData);

      const scheduledAppIds = new Set(interviewData.map(i => i.application_id));
      const unscheduled = allApps.filter(a => !scheduledAppIds.has(a.id));
      setPendingApplications(unscheduled);

    } catch (e) {
      console.error("CompanyInterviews: Fetch failed", e);
      toast.error("Failed to load interview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  useEffect(() => {
    if (!loading && gridRef.current) {
      gsap.fromTo(".interview-card", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [loading, interviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => 
      i.applications?.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.applications?.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [interviews, searchTerm]);

  const stats = useMemo(() => ({
    total: interviews.length,
    today: interviews.filter(i => new Date(i.schedule_time).toDateString() === new Date().toDateString()).length,
    pending: pendingApplications.length
  }), [interviews, pendingApplications]);

  const generateGoogleCalendarLink = (interview) => {
    const title = encodeURIComponent(`Interview: ${interview.applications?.profiles?.name} - ${interview.applications?.jobs?.title}`);
    const details = encodeURIComponent(`Interview scheduled via PlaceTrack.\n\nMeeting Link: ${interview.meeting_link}`);
    const location = encodeURIComponent(interview.meeting_link);
    const startTime = new Date(interview.schedule_time);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${formatDate(startTime)}/${formatDate(endTime)}`;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!formData.application_id || !formData.schedule_time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error: interviewError } = await insforge.database
        .from('interviews')
        .insert([{
          application_id: formData.application_id,
          schedule_time: new Date(formData.schedule_time).toISOString(),
          meeting_link: formData.meeting_link,
          status: 'Scheduled'
        }]);
      
      if (interviewError) throw interviewError;

      // Update application status to 'Interview'
      const { error: appError } = await insforge.database
        .from('applications')
        .update({ status: 'Interview' })
        .eq('id', formData.application_id);

      if (appError) throw appError;
      
      toast.success("Interview scheduled successfully!");
      setIsModalOpen(false);
      setFormData({ application_id: '', schedule_time: '', meeting_link: 'https://meet.google.com/abc-defg-hij', status: 'Scheduled' });
      fetchData();
    } catch (e) {
      toast.error("Failed to schedule interview");
      console.error(e);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col antialiased text-slate-900">
      <RecruiterNavbar />
      
      <main className="max-w-[1440px] mx-auto w-full px-6 lg:px-10 pt-10 pb-20">
        
        {/* Executive Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Assessment Pipeline</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Interview Hub</h1>
              <p className="text-slate-500 font-medium mt-3 max-w-2xl">Coordinate technical assessments and track candidate performance in real-time.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
              {[
                { label: "Today's Sessions", value: stats.today, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: "Total Active", value: stats.total, color: 'text-slate-600', bg: 'bg-slate-50' }
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl ${i === 0 ? s.bg : ''}`}>
                  <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} /> Schedule Session
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main List Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <LayoutGrid size={18} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Upcoming Interviews</h2>
              </div>
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by name or role..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 w-full md:w-[320px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all shadow-sm"
                />
              </div>
            </div>

            <div ref={gridRef} className="space-y-4">
              {filteredInterviews.length > 0 ? filteredInterviews.map((interview, i) => (
                <div key={i} className="interview-card bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={interview.applications?.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${interview.applications?.profiles?.name || 'User'}&backgroundColor=transparent`} 
                        alt="Candidate" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-slate-900 truncate leading-tight">{interview.applications?.profiles?.name}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                       {interview.applications?.jobs?.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 px-6 py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Date</p>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={14} className="text-indigo-500" />
                        <span className="text-sm font-bold">{new Date(interview.schedule_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Time</p>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={14} className="text-indigo-500" />
                        <span className="text-sm font-bold">{new Date(interview.schedule_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(interview.meeting_link, '_blank')}
                      className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                    >
                      <Video size={16} /> Join
                    </button>
                    <button 
                      onClick={() => window.open(generateGoogleCalendarLink(interview), '_blank')}
                      className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-500 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
                      title="Add to Calendar"
                    >
                      <CalendarPlus size={18} />
                    </button>
                    <button className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-all active:scale-95 shadow-sm">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-24 bg-white border border-dashed border-slate-300 rounded-[40px] flex flex-col items-center justify-center text-center px-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Calendar size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">No Sessions Found</h3>
                  <p className="text-slate-500 font-medium mt-2 max-w-xs">Your interview pipeline is clear. Start scheduling candidates from your applicants list.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Clock size={18} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Needs Schedule</h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">{pendingApplications.length}</span>
              </div>

              <div className="space-y-2">
                {pendingApplications.length > 0 ? pendingApplications.map((app, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{app.profiles?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate mt-0.5">{app.jobs?.title}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setFormData({ ...formData, application_id: app.id });
                        setIsModalOpen(true);
                      }}
                      className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm group-hover:scale-105 active:scale-95"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={24} className="text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queue Clear</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">All candidates are scheduled.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10">
                 <h4 className="text-xl font-bold leading-tight">Sync your workflow</h4>
                 <p className="text-indigo-100 text-sm mt-2 font-medium opacity-80">Connect your Google Calendar to manage interview slots effortlessly.</p>
                 <button className="mt-8 w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group/btn">
                    Sync Calendar <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule Assessment</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">Coordinate time slots for technical interviews.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50">
                    <MoreVertical size={20} className="rotate-90" />
                 </button>
              </div>
              <form onSubmit={handleSchedule} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Select Candidate</label>
                    <div className="relative">
                       <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <select 
                        required
                        value={formData.application_id}
                        onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
                       >
                          <option value="">Choose a student...</option>
                          {pendingApplications.map(app => (
                             <option key={app.id} value={app.id}>{app.profiles?.name} — {app.jobs?.title}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Schedule Time</label>
                       <div className="relative">
                          <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            required
                            type="datetime-local" 
                            value={formData.schedule_time}
                            onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Meeting Format</label>
                       <div className="relative">
                          <Video size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <div className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700">Virtual Link</div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Virtual Link</label>
                    <div className="relative">
                       <ExternalLink size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="url" 
                         placeholder="https://meet.google.com/..." 
                         value={formData.meeting_link}
                         onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                         className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                  type="submit" 
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 mt-6"
                 >
                    Confirm Session
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInterviews;

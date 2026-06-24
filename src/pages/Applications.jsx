import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { insforge } from "../services/api";
import { toast } from "react-hot-toast";
import { PageSkeleton } from "../components/LoadingSkeleton";

const getStatusStyles = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("interview")) return "bg-[#fff7e4] text-[#c2410c] border-[#ffedd5]"; // Amber
  if (s.includes("shortlist")) return "bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]"; // Blue
  if (s.includes("offer") || s.includes("select")) return "bg-[#f0fdf4] text-[#15803d] border-[#dcfce7]"; // Green
  if (s.includes("reject")) return "bg-[#fef2f2] text-[#b91c1c] border-[#fee2e2]"; // Red
  if (s.includes("applied")) return "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"; // Slate
  return "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"; // Default
};

const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchApplications = async () => {
    try {
      const { data } = await insforge.database
        .from("applications")
        .select(`
          id, status, created_at, cover_letter, job_id,
          jobs:job_id(title, company, location)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setApplications(data || []);
      if (data && data.length > 0) {
        setExpandedId(data[0].id); // First one open by default
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#fcfdfe] dark:bg-[#0f110f] min-h-screen transition-colors duration-500 font-poppins">

      <main className="max-w-[1300px] mx-auto p-4 md:p-8 lg:p-14">

        {/* Navigation Link */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-[#325f3f] dark:text-[#4ade80] font-bold text-sm mb-6 md:mb-12 hover:opacity-80 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">arrow_back_ios</span>
          Back to Applications
        </button>

        <div className="space-y-6 md:space-y-8">
          {applications.length > 0 ? (
            applications.map((app, idx) => {
              const isExpanded = expandedId === app.id;
              const status = (app.status || "Applied").toLowerCase();

              return (
                <div key={app.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={`bg-white dark:bg-[#151715] border border-slate-100 dark:border-white/5 rounded-3xl md:rounded-[40px] overflow-hidden transition-all duration-500 ${isExpanded ? 'shadow-2xl shadow-slate-200/50 dark:shadow-none' : 'shadow-sm hover:shadow-lg'}`}>

                    {/* Card Header (Profile & Status) */}
                    <div className="p-5 md:p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                        <div className="w-14 h-14 md:w-24 md:h-24 bg-[#f0fdf4] dark:bg-[#1a4d2e]/20 rounded-2xl md:rounded-[32px] flex items-center justify-center font-bold text-[#166534] dark:text-[#4ade80] text-xl md:text-[40px] shrink-0 border border-[#dcfce7] dark:border-[#1a4d2e]/30">
                          {app.jobs?.company?.[0] || 'T'}
                        </div>
                        <div>
                          <h2 className="text-xl md:text-[32px] font-bold text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tight">{app.jobs?.company || 'TestWorks'}</h2>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-400 dark:text-gray-500 font-semibold text-xs md:text-[15px]">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base md:text-xl">work</span>
                              <span>{app.jobs?.title || 'QA Engineer'}</span>
                            </div>
                            <span className="opacity-40 hidden sm:inline">•</span>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base md:text-xl">location_on</span>
                              <span>{app.jobs?.location || 'Remote'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:gap-10 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-bold text-slate-300 dark:text-gray-600 uppercase tracking-[0.3em] mb-1.5 md:mb-2.5">Current Status</p>
                          <div className={`px-4 py-2 md:px-9 md:py-3 border rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-center shadow-sm ${getStatusStyles(app.status)}`}>
                            {app.status || 'Interview'}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleExpand(app.id)}
                          className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isExpanded ? 'bg-[#166534] text-white rotate-180 shadow-[#166534]/40' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:bg-[#166534] hover:text-white'}`}
                        >
                          <span className="material-symbols-outlined text-xl md:text-2xl font-bold">keyboard_arrow_down</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content View */}
                    <div className={`grid transition-[grid-template-rows] duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden border-t border-slate-50 dark:border-white/5">
                        <div className="p-5 md:p-8 lg:p-12 pt-6 md:pt-10">

                          {/* Recruitment Pipeline Tracker */}
                          <div className="mb-8 md:mb-16">
                            <h4 className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-6 md:mb-12">Recruitment Pipeline</h4>

                            <div className="relative max-w-5xl mx-auto px-2 md:px-10">
                              {/* The Connecting Line Base */}
                              <div className="absolute top-[20px] md:top-[28px] left-[36px] right-[36px] md:left-[68px] md:right-[68px] h-[4px] bg-slate-100 dark:bg-white/5 rounded-full"></div>

                              {/* The Active Connection Line */}
                              <div className="absolute top-[20px] md:top-[28px] left-[36px] right-[36px] md:left-[68px] md:right-[68px] h-[4px] flex items-center">
                                <div className={`h-full transition-all duration-1000 delay-500 rounded-full ${['shortlisted', 'interview', 'interviewing', 'interviewed', 'offer', 'selected'].includes(status) ? 'bg-[#166534] w-[33.33%]' : 'w-0'}`}></div>
                                <div className={`h-full transition-all duration-1000 delay-700 rounded-full ${['interview', 'interviewing', 'interviewed', 'offer', 'selected'].includes(status) ? 'bg-[#166534] w-[33.33%]' : 'w-0'}`}></div>
                                <div className={`h-full transition-all duration-1000 delay-1000 rounded-full ${['offer', 'selected'].includes(status) ? 'bg-[#166534] w-[33.34%]' : 'w-0'}`}></div>
                              </div>

                              <div className="flex justify-between relative z-10">
                                {['Applied', 'Shortlisted', 'Interview', 'Decision'].map((step, sIdx) => {
                                  const isDone = (sIdx === 0) ||
                                    (sIdx === 1 && ['shortlisted', 'interview', 'interviewing', 'interviewed', 'offer', 'selected'].includes(status)) ||
                                    (sIdx === 2 && ['interview', 'interviewing', 'interviewed', 'offer', 'selected'].includes(status)) ||
                                    (sIdx === 3 && ['offer', 'selected'].includes(status));
                                  const isCurrent = (sIdx === 0 && status === 'applied') ||
                                    (sIdx === 1 && status === 'shortlisted') ||
                                    (sIdx === 2 && ['interview', 'interviewing', 'interviewed'].includes(status)) ||
                                    (sIdx === 3 && ['offer', 'selected'].includes(status));
                                  const isRejected = status === 'rejected';

                                  return (
                                    <div key={step} className="flex flex-col items-center">
                                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-700 ${isDone ? "bg-[#166534] text-white shadow-2xl shadow-[#166534]/30" :
                                        isRejected ? "bg-rose-50 dark:bg-rose-900/20 text-rose-500 border-2 border-rose-100" :
                                          isCurrent ? "bg-white dark:bg-[#151715] border-2 border-[#166534] text-[#166534] shadow-lg shadow-[#166534]/10" :
                                            "bg-slate-50 dark:bg-white/5 text-slate-200 dark:text-gray-800"
                                        }`}>
                                        {isDone ? (
                                          <span className="material-symbols-outlined text-base md:text-[20px] font-bold">check</span>
                                        ) : isRejected ? (
                                          <span className="material-symbols-outlined text-base md:text-[20px] font-bold">close</span>
                                        ) : (
                                          <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${isCurrent ? 'bg-[#166534] animate-pulse' : 'bg-slate-200 dark:bg-white/10'}`}></div>
                                        )}
                                      </div>
                                      <div className="mt-3 md:mt-6 text-center">
                                        <p className={`text-[9px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDone ? 'text-[#166534] dark:text-[#4ade80]' : isRejected ? 'text-rose-500' : 'text-slate-400 dark:text-gray-600'}`}>{step}</p>
                                        <p className="text-[8px] md:text-[10px] font-semibold text-slate-400 dark:text-gray-600">
                                          {isRejected ? 'Declined' : isDone ? (sIdx === 0 ? new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Completed') : isCurrent ? 'In Progress' : 'Pending'}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Detailed Information Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                            {/* Narrative Block */}
                            <div className="lg:col-span-2 bg-[#f9fafb] dark:bg-white/5 rounded-3xl md:rounded-[40px] p-5 md:p-10 border border-slate-50 dark:border-white/5 relative group/notes">
                              <div className="flex items-center gap-3 mb-4 md:mb-8 text-[#166534] dark:text-[#4ade80]">
                                <span className="material-symbols-outlined text-xl">description</span>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.3em]">Statement of Purpose / Notes</h4>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 font-medium text-sm md:text-lg leading-relaxed italic relative z-10">
                                "{app.cover_letter || "No additional notes provided."}"
                              </p>
                              <div className="absolute bottom-4 right-5 md:bottom-8 md:right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-7xl md:text-9xl text-[#166534] dark:text-[#4ade80]">format_quote</span>
                              </div>
                            </div>

                            {/* Snapshot Column */}
                            <div className="space-y-4 md:space-y-6">
                              <div className="bg-[#f9fafb] dark:bg-white/5 border border-slate-50 dark:border-white/5 rounded-2xl md:rounded-[32px] p-4 md:p-8 shadow-sm">
                                <div className="flex items-center gap-4 md:gap-6">
                                  <div className="w-10 h-10 md:w-14 md:h-14 bg-[#f0fdf4] dark:bg-[#1a4d2e]/20 rounded-xl md:rounded-2xl flex items-center justify-center text-[#166534] dark:text-[#4ade80] border border-[#dcfce7] dark:border-[#1a4d2e]/30">
                                    <span className="material-symbols-outlined text-lg md:text-2xl">calendar_today</span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1 md:mb-1.5">Application Date</p>
                                    <p className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                      {new Date(app.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-[#f9fafb] dark:bg-white/5 border border-slate-50 dark:border-white/5 rounded-2xl md:rounded-[32px] p-4 md:p-8 shadow-sm">
                                <div className="flex items-center gap-4 md:gap-6">
                                  <div className="w-10 h-10 md:w-14 md:h-14 bg-[#f0fdf4] dark:bg-[#1a4d2e]/20 rounded-xl md:rounded-2xl flex items-center justify-center text-[#166534] dark:text-[#4ade80] border border-[#dcfce7] dark:border-[#1a4d2e]/30">
                                    <span className="material-symbols-outlined text-lg md:text-2xl">corporate_fare</span>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1 md:mb-1.5">Company Info</p>
                                    <p className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{app.jobs?.location?.split(',')[0] || 'N/A'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{app.jobs?.location?.split(',')[1]?.trim() || ''}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 md:py-32 text-center bg-white dark:bg-[#151715] rounded-3xl md:rounded-[40px] border border-dashed border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-700">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#f0fdf4] dark:bg-[#1a4d2e]/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8 border border-[#dcfce7] dark:border-[#1a4d2e]/30">
                <span className="material-symbols-outlined text-3xl md:text-5xl text-[#166534] dark:text-[#4ade80]">assignment_late</span>
              </div>
              <h3 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">No Applications Yet</h3>
              <p className="text-slate-500 dark:text-gray-400 font-medium text-sm md:text-lg max-w-md mx-auto mb-6 md:mb-10">
                You haven't submitted any applications. Start exploring opportunities and kickstart your career!
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="bg-[#166534] text-white px-6 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#166534]/20"
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Applications;

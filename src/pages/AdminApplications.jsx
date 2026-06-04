import { useState, useEffect, useRef, useMemo } from 'react';
import { insforge } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import gsap from 'gsap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, partnerCompanies: 0, shortlisted: 0, successRate: '0%' });

  const mainRef = useRef(null);
  const tableRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await insforge.database
        .from('applications')
        .select(`
          id, status, created_at, student_id, job_id,
          profiles:student_id(name, email, university, avatar_url),
          jobs:job_id(title, company)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const apps = data || [];
      setApplications(apps);

      const total = apps.length;
      const partnerCompanies = new Set(apps.map(a => a.jobs?.company).filter(Boolean)).size;
      const shortlisted = apps.filter(a => a.status === 'Shortlisted').length;
      const selected = apps.filter(a => a.status === 'Selected').length;
      const successRate = total > 0 ? ((selected / total) * 100).toFixed(1) + '%' : '0%';

      setStats({ total, partnerCompanies, shortlisted, successRate });
    } catch (e) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && applications.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".animate-fade",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" }
        );
      }, mainRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleUpdateStatus = async (id, newStatus) => {
    const loadingToast = toast.loading(`Updating status...`);
    try {
      const { error } = await insforge.database
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Updated to ${newStatus}`, { id: loadingToast });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      fetchData();
    } catch (e) {
      toast.error("Update failed", { id: loadingToast });
    }
  };

  const handleExport = async () => {
    const element = tableRef.current;
    if (!element) return;
    const loadingToast = toast.loading("Generating report...");
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`applications-report.pdf`);
      toast.success("PDF Downloaded", { id: loadingToast });
    } catch (e) {
      toast.error("Export failed", { id: loadingToast });
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobs?.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesCompany = companyFilter === 'All' || app.jobs?.company === companyFilter;
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [applications, searchQuery, statusFilter, companyFilter]);

  const companies = useMemo(() => ['All', ...new Set(applications.map(a => a.jobs?.company).filter(Boolean))], [applications]);

  if (loading && applications.length === 0) return <PageSkeleton />;

  return (
    <div ref={mainRef} className="bg-[#f8fafc] min-h-screen flex flex-col font-poppins antialiased text-slate-800">
      <Toaster position="top-center" />
      <AdminNavbar />

      <main className="max-w-[1400px] mx-auto w-full p-6 lg:p-10 flex flex-col gap-10">

        {/* Enhanced Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-700 ">Applications</h1>
            <p className="text-slate-500 font-medium text-lg">Manage and track candidate progress across recruitment phases.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              Export PDF
            </button>
            <div className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[13px] font-bold text-indigo-600 uppercase ">{applications.length} Live Positions</span>
            </div>
          </div>
        </header>

        {/* Updated Stats with Partner Companies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade">
          {[
            { label: 'Total Applications', value: stats.total, icon: 'analytics', color: 'indigo' },
            { label: 'Hiring Partners', value: stats.partnerCompanies, icon: 'business_center', color: 'amber' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: 'stars', color: 'blue' },
            { label: 'Hire Rate', value: stats.successRate, icon: 'trending_up', color: 'emerald' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
              <div className={`w-16 h-16 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-500 transition-transform group-hover:scale-105`}>
                <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{item.label}</span>
                <span className="text-3xl font-bold text-slate-900 ">{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Large Scale-up Filter Bar */}
        <div className="flex flex-col space-y-8 animate-fade">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-200">
            <div className="flex-1 w-full relative group">
              <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-[24px] transition-colors group-focus-within:text-indigo-500">search</span>
              <input
                type="text"
                placeholder="Search by candidate, role or company..."
                className="w-full pl-10 pr-6 py-4 bg-transparent border-none focus:outline-none text-[18px] text-slate-900 font-semibold placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-8 w-full lg:w-auto">
              <div className="flex items-center gap-4">
                <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest">Partner:</span>
                <select
                  className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-[15px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer min-w-[200px]"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCompanyFilter('All'); }}
                className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-rose-600 font-bold text-sm transition-colors group"
                title="Clear all filters"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">filter_alt_off</span>
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest mr-2">Phase:</span>
              <div className="flex gap-2">
                {['All', 'Pending', 'Reviewing', 'Shortlisted', 'Selected', 'Rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all whitespace-nowrap ${statusFilter === s
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-900'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                Showing <span className="text-slate-900">{filteredApps.length}</span> of {applications.length} Results
              </span>
            </div>
          </div>
        </div>

        {/* Stable Data Table */}
        <div ref={tableRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col animate-fade">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Job Details</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length > 0 ? filteredApps.map((app) => {
                  const statusInfo = {
                    Pending: { color: 'amber', icon: 'schedule', pct: 20 },
                    Reviewing: { color: 'indigo', icon: 'visibility', pct: 40 },
                    Shortlisted: { color: 'blue', icon: 'verified', pct: 60 },
                    Selected: { color: 'emerald', icon: 'check_circle', pct: 100 },
                    Rejected: { color: 'rose', icon: 'block', pct: 100 }
                  }[app.status] || { color: 'slate', icon: 'help', pct: 0 };

                  return (
                    <tr key={app.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 transition-transform group-hover:scale-105`}>
                            <img
                              src={app.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.profiles?.name}`}
                              alt=""
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[16px] font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{app.profiles?.name || 'Anonymous'}</p>
                            <p className="text-[13px] text-slate-500 truncate font-medium">{app.profiles?.university || 'University Not Listed'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <p className="text-[15px] font-bold text-slate-800">{app.jobs?.company || 'N/A'}</p>
                          <p className="text-[13px] font-semibold text-slate-500">{app.jobs?.title || 'Open Role'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[14px] font-semibold text-slate-600">
                          {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                          <span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-${statusInfo.color}-600`}>
                            <span className="material-symbols-outlined text-[16px]">{statusInfo.icon}</span>
                            {app.status || 'Pending'}
                          </span>
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-${statusInfo.color}-500 transition-all duration-1000`} style={{ width: `${statusInfo.pct}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {['Shortlisted', 'Selected', 'Rejected'].map(newS => (
                            <button
                              key={newS}
                              onClick={() => handleUpdateStatus(app.id, newS)}
                              className={`p-2 rounded-lg transition-all active:scale-95 ${newS === 'Shortlisted' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' :
                                newS === 'Selected' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                                  'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                }`}
                              title={`Move to ${newS}`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {newS === 'Shortlisted' ? 'verified' : newS === 'Selected' ? 'check_circle' : 'block'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold text-sm uppercase tracking-widest opacity-50">No applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminApplications;

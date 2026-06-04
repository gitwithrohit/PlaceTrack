import { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';

const AdminAlerts = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PageSkeleton />;

  const alerts = [
    { icon: 'business', title: 'New Company Registration', desc: 'TechFlow Innovations requested access to the placement portal.', time: '2h ago', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 border-amber-100', category: 'Companies' },
    { icon: 'person_search', title: 'Student Verification', desc: '15 students from CS branch are pending transcript review.', time: '5h ago', status: 'Action', statusColor: 'bg-rose-50 text-rose-700 border-rose-100', category: 'Students' },
    { icon: 'description', title: 'Application Update', desc: 'GlobalFinance Inc. has shortlisted 20 more candidates.', time: '1d ago', status: 'Info', statusColor: 'bg-blue-50 text-blue-700 border-blue-100', category: 'Applications' },
    { icon: 'campaign', title: 'System Announcement', desc: 'Scheduled maintenance this Sunday from 2 AM to 4 AM.', time: '2d ago', status: 'System', statusColor: 'bg-gray-50 text-gray-700 border-gray-100', category: 'System' },
    { icon: 'work_alert', title: 'Job Expiry', desc: 'The posting for "Product Designer" at CreativeStudio expires today.', time: '3d ago', status: 'Urgent', statusColor: 'bg-orange-50 text-orange-700 border-orange-100', category: 'Jobs' },
  ];

  return (
    <div className="bg-[#f8f9f8] min-h-screen flex flex-col font-poppins antialiased">
      <AdminNavbar />

      <main className="max-w-[1440px] mx-auto w-full p-4 md:p-6 animate-fade-in-up">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#374151] tracking-tight">Recent Alerts</h1>
            <p className="text-[#6b7280] text-xs font-medium mt-1">Review and manage recent system activities and alerts.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-lg text-xs font-semibold text-[#374151] hover:bg-[#f9fafb] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            Clear All
          </button>
        </header>

        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#f3f4f6]">
            {alerts.map((alert, i) => (
              <div key={i} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#f9fafb] transition-colors cursor-pointer group">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[#1a4d2e] text-[22px]">{alert.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-[#111827] group-hover:text-[#1a4d2e] transition-colors">{alert.title}</h4>
                      <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">• {alert.category}</span>
                    </div>
                    <p className="text-xs text-[#4b5563] font-medium leading-relaxed">{alert.desc}</p>
                    <p className="text-[10px] font-medium text-[#9ca3af] mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {alert.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md border ${alert.statusColor}`}>
                    {alert.status}
                  </div>
                  <button className="w-8 h-8 rounded-lg text-[#9ca3af] hover:text-[#1a1c1a] hover:bg-[#f3f4f6] transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#f3f4f6] bg-[#f9fafb] flex justify-center">
            <button className="text-xs font-semibold text-[#1a4d2e] hover:underline uppercase tracking-widest">
              Load Older Activities
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAlerts;

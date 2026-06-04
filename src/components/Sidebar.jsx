import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const { role } = useAuth();
  const [showSupport, setShowSupport] = useState(false);

  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', icon: 'grid_view', to: '/dashboard' },
        { label: 'Manage Jobs', icon: 'work', to: '/admin/jobs' },
        { label: 'Student Database', icon: 'group', to: '/admin/students' },
        { label: 'Companies', icon: 'business', to: '/admin/companies' },
        { label: 'Reports', icon: 'analytics', to: '/admin/reports' },
      ];
    }
    if (role === 'recruiter') {
      return [
        { label: 'Overview', icon: 'grid_view', to: '/dashboard' },
        { label: 'My Postings', icon: 'work', to: '/jobs' },
        { label: 'Applicants', icon: 'description', to: '/applications' },
        { label: 'Interviews', icon: 'event', to: '/interviews' },
        { label: 'Settings', icon: 'settings', to: '/settings' },
      ];
    }
    return [
      { label: 'Opportunities', icon: 'work', to: '/jobs' },
      { label: 'Saved Jobs', icon: 'bookmark', to: '/jobs/saved' },
      { label: 'Resume Builder', icon: 'edit_note', to: '/resume' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-72 bg-white dark:bg-[#0a0a0a] border-r border-slate-100 dark:border-white/5 min-h-[calc(100vh-64px)] hidden lg:flex flex-col flex-shrink-0 transition-all duration-500 relative">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-40 bg-[#325f3f]/5 blur-3xl rounded-full -mt-20 pointer-events-none"></div>

      <nav className="flex-1 px-4 py-8 space-y-2 relative z-10">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`group flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-left-4 fill-mode-both ${
                isActive
                  ? 'bg-[#325f3f] text-white shadow-lg shadow-[#325f3f]/20'
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-[#325f3f]'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Hover Glow */}
              {!isActive && (
                <div className="absolute inset-0 bg-[#325f3f]/0 group-hover:bg-[#325f3f]/5 transition-colors duration-300"></div>
              )}

              <span className={`material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[13px] font-bold uppercase tracking-widest transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                {item.label}
              </span>

              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Support Section */}
      <div className="p-6 mt-auto border-t border-slate-50 dark:border-white/5 relative z-10">
        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-5 border border-slate-100 dark:border-white/5 group cursor-pointer hover:border-[#325f3f]/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#325f3f]/10 flex items-center justify-center text-[#325f3f]">
              <span className="material-symbols-outlined text-xl">headset_mic</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">Need Help?</p>
              <p className="text-[9px] font-semibold text-slate-400 uppercase">24/7 Support</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSupport(!showSupport)}
            className="w-full py-3 bg-[#325f3f] text-white text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#2a4f35] transition-all shadow-md active:scale-95"
          >
            {showSupport ? 'Close Support' : 'Contact Us'}
          </button>
        </div>
      </div>

      {showSupport && (
        <div className="absolute bottom-32 left-6 right-6 p-8 bg-white dark:bg-[#1a1c1e] rounded-[40px] border-2 border-[#325f3f]/20 shadow-2xl animate-in zoom-in-95 fade-in duration-300 z-50 overflow-hidden">
          {/* Top Close X */}
          <div className="absolute top-4 right-4">
            <button onClick={() => setShowSupport(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#325f3f]/10 rounded-full flex items-center justify-center text-[#325f3f] mb-6">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            
            <div className="mb-8">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white">Student Support</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">How can we help you today?</p>
            </div>

            <div className="w-full space-y-4 mb-8">
              <a 
                href="mailto:support@placetrack.edu" 
                onClick={() => toast.success('Opening your email client...')}
                className="flex items-center justify-center gap-4 w-full py-5 bg-white dark:bg-white/5 rounded-[24px] text-[11px] font-black text-black dark:text-white border-2 border-slate-50 dark:border-white/5 hover:border-[#325f3f]/30 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">mail</span>
                Email Support
              </a>
              <button 
                onClick={() => toast.success('Connecting to a live agent...')}
                className="flex items-center justify-center gap-4 w-full py-5 bg-white dark:bg-white/5 rounded-[24px] text-[11px] font-black text-[#325f3f] border-2 border-[#325f3f]/10 hover:bg-[#325f3f] hover:text-white transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                Live Chat
              </button>
            </div>

            <button 
              onClick={() => setShowSupport(false)}
              className="w-full py-5 bg-[#325f3f] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[24px] hover:bg-[#2a4f35] transition-all shadow-xl shadow-[#325f3f]/20 active:scale-95"
            >
              Close Support
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

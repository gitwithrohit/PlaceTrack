import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    legal: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Cookie Settings', to: '#' }
    ],
    social: [
      { icon: 'share', label: 'LinkedIn', to: '#', color: 'hover:bg-[#0077b5]' },
      { icon: 'public', label: 'Website', to: '#', color: 'hover:bg-blue-600' },
      { icon: 'alternate_email', label: 'Email', to: '#', color: 'hover:bg-rose-500' }
    ]
  };

  return (
    <footer className="bg-[#0f172a] text-slate-400 py-8 w-full border-t border-slate-800/50 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded-full transition-transform group-hover:rotate-6 duration-500" />
            <span className="text-2xl font-bold tracking-tight text-white">
              <span className="text-[#67a070]">Place</span>
              <span className="text-white ml-0.5">Track</span>
            </span>
          </Link>
          <p className="text-sm font-medium text-slate-500 max-w-xs text-center lg:text-left">
            Empowering talent with intelligent placement management and career-defining opportunities.
          </p>
        </div>

        {/* Support Section */}
        <div className="flex-1 max-w-sm">
          <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-center gap-5 group hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
              <span className="material-symbols-outlined text-xl">support_agent</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Need Assistance?</p>
              <p className="text-xs text-slate-400 font-medium leading-tight mb-2">Our support team is available 24/7 for you.</p>
              <Link to="#" className="text-[10px] font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                Contact Support <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Social & Legal Section */}
        <div className="flex flex-col items-center lg:items-end gap-6">
          <div className="flex gap-4">
            {footerLinks.social.map((item) => (
              <a 
                key={item.label} 
                href={item.to} 
                aria-label={item.label}
                className={`w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 ${item.color} hover:text-white hover:border-transparent transition-all duration-300 group`}
              >
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              </a>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-2 text-xs font-bold tracking-widest uppercase">
            {footerLinks.legal.map(link => (
              <Link key={link.label} to={link.to} className="text-slate-500 hover:text-blue-500 transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-10 pt-6 border-t border-slate-800/50 flex justify-center relative z-10">
        <p className="text-xs font-medium tracking-wide text-slate-600">
          © {currentYear} PlaceTrack Placement Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

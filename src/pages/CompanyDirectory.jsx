import { useEffect, useState } from 'react';
import { insforge } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import Sidebar from '../components/Sidebar';

const CompanyDirectory = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await insforge.database
          .from('companies')
          .select('*')
          .order('name', { ascending: true });
        
        if (!error) {
          setCompanies(data || []);
        }
      } catch (error) {
        console.error("CompanyDirectory: Exception", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      c.name?.toLowerCase().includes(q) || 
      c.description?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q);
    
    const matchesIndustry = !industryFilter || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const [imgErrors, setImgErrors] = useState({});

  if (loading) return <PageSkeleton />;

  const handleImgError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const getCompanyIcon = (name) => {
    const icons = {
      'Amazon': 'shopping_cart',
      'Netflix': 'movie',
      'Adobe': 'draw',
      'Tesla': 'electric_car',
      'Spotify': 'music_note'
    };
    return icons[name] || 'business';
  };

  return (
    <div className="bg-[#f2f4f7] dark:bg-[#000000] min-h-screen flex transition-colors duration-500">
      <Sidebar />
      
      <main className="flex-1 min-w-0 p-6 lg:p-12 overflow-x-hidden relative">
        
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-1.5 h-10 bg-[#325f3f] rounded-full"></div>
             <h1 className="text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tighter leading-none">
               Company <span className="text-[#325f3f]">Directory</span>.
             </h1>
          </div>
          <p className="text-slate-500 font-bold text-lg ml-6 max-w-2xl">Discover top employers and explore their unique company cultures.</p>
        </header>

        {/* Filters Section */}
        <div className="bg-white dark:bg-[#111111] p-3 rounded-[32px] shadow-2xl shadow-[#325f3f]/5 border-2 border-white dark:border-white/5 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#325f3f] transition-colors">search</span>
            <input
              type="text"
              placeholder="Search by company or industry..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none text-[15px] font-bold text-black dark:text-white border-2 border-transparent focus:border-[#325f3f]/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
              className="flex-1 lg:w-48 px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none text-[14px] font-black text-slate-500 cursor-pointer border-2 border-transparent focus:border-[#325f3f]/20 transition-all appearance-none"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="">All Industries</option>
              {[...new Set(companies.map(c => c.industry).filter(Boolean))].sort().map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <button className="bg-[#325f3f] text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black text-[12px] uppercase tracking-widest shadow-xl shadow-[#325f3f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-[20px]">tune</span>
              Filter
            </button>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
          {filtered.map((company, idx) => (
            <div 
              key={company.id} 
              className="bg-white dark:bg-[#111111] border-2 border-white dark:border-white/5 rounded-[40px] p-8 lg:p-10 shadow-sm hover:shadow-2xl hover:shadow-[#325f3f]/5 hover:border-[#325f3f]/20 transition-all duration-500 group flex flex-col relative h-full animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Bookmark Button */}
              <button 
                onClick={() => toast.success(`${company.name} added to interests`)}
                className="absolute top-8 right-8 text-slate-300 hover:text-[#325f3f] transition-all p-3 bg-slate-50 dark:bg-white/5 hover:bg-[#325f3f]/10 rounded-2xl border-2 border-slate-100 dark:border-white/5 hover:border-[#325f3f]/20"
              >
                <span className="material-symbols-outlined text-2xl">stars</span>
              </button>

              <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                {/* Logo Box */}
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 flex items-center justify-center p-5 flex-shrink-0 group-hover:scale-105 group-hover:border-[#325f3f]/30 transition-all duration-500 shadow-sm">
                  {company.logo_url && !imgErrors[company.id] ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name} 
                      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" 
                      onError={() => handleImgError(company.id)}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[#325f3f] text-4xl font-black">
                      {getCompanyIcon(company.name)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none group-hover:text-[#325f3f] transition-colors">{company.name}</h2>
                    {company.status === 'actively hiring' && (
                      <span className="bg-[#325f3f]/10 text-[#325f3f] text-[9px] font-black px-3 py-1.5 rounded-full border border-[#325f3f]/20 flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#325f3f] animate-pulse"></div>
                        Hiring Now
                      </span>
                    )}
                  </div>
                  <p className="text-[#325f3f] text-[12px] font-black uppercase tracking-widest opacity-80">{company.industry}</p>
                </div>
              </div>

              <p className="text-slate-500 font-bold text-base leading-relaxed mb-10 line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                {company.description || "Leading innovation and excellence in their field, this company offers transformative career paths for ambitious students."}
              </p>

              {/* Footer Stats & Actions */}
              <div className="mt-auto pt-8 border-t-2 border-slate-50 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Active Roles</span>
                    <span className="text-lg font-black text-black dark:text-white leading-none">{company.open_roles || 0}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Scale</span>
                    <span className="text-lg font-black text-black dark:text-white leading-none">Global</span>
                  </div>
                </div>

                <button 
                  onClick={() => toast(`Exploring ${company.name}`)}
                  className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#325f3f] hover:text-white dark:hover:bg-[#325f3f] dark:hover:text-white transition-all shadow-xl shadow-black/5 hover:shadow-[#325f3f]/20"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default CompanyDirectory;

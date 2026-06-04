import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const CareerGuides = () => {
  const [activeTab, setActiveTab] = useState('All Topics');
  
  const tabs = ['All Topics', 'Interview Prep', 'Resume Tips', 'Industry Insights', 'Networking'];

  const guides = [
    {
      id: 1,
      title: 'The Ultimate Guide to Behavioral Interviews in 2024',
      category: 'Interview Prep',
      description: 'Master the STAR method and learn how to articulate your experiences effectively. Discover the top 10 behavioral questions recruiters are asking this year...',
      author: 'Sarah Jenkins',
      readTime: '5 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      featured: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 2,
      title: 'Mastering the Technical Coding Round',
      category: 'Interview Prep',
      description: 'A comprehensive deep dive into data structures and algorithms patterns that frequently appear in top-tier tech interviews.',
      author: 'David Chen',
      readTime: '8 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      featured: false,
    },
    {
      id: 3,
      title: 'How to Build an ATS-Friendly Resume',
      category: 'Resume Tips',
      description: 'Learn the secrets of passing automated screening systems and getting your resume in front of actual human recruiters.',
      author: 'Emma Wilson',
      readTime: '4 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      featured: false,
    },
    {
      id: 4,
      title: 'AI in Recruitment: How Companies Filter Candidates',
      category: 'Industry Insights',
      description: 'Understand how modern AI tools analyze your application and what keywords you need to stand out in a machine-first world.',
      author: 'Marcus Thorne',
      readTime: '6 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      featured: false,
    },
    {
      id: 5,
      title: 'The Rise of Hybrid Work: 2024 Market Trends',
      category: 'Industry Insights',
      description: 'Recent data shows a massive shift in corporate location policies. Here is how to negotiate your work model during the offer stage.',
      author: 'Elena Rodriguez',
      readTime: '7 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      featured: false,
    },
    {
      id: 6,
      title: 'LinkedIn Networking: Beyond the Connection Request',
      category: 'Networking',
      description: 'Transform your LinkedIn profile into a lead magnet. Learn how to reach out to senior leaders without sounding desperate.',
      author: 'Jameson Blake',
      readTime: '5 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jameson',
      featured: false,
    },
    {
      id: 7,
      title: 'The Art of the Coffee Chat: 15 Minutes to a Job',
      category: 'Networking',
      description: 'Informational interviews are the hidden backdoor to placements. Here is the exact script to get a referral in 15 minutes.',
      author: 'Sophia Lim',
      readTime: '4 min read',
      authorImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
      featured: false,
    }
  ];

  const filteredGuides = activeTab === 'All Topics' 
    ? guides 
    : guides.filter(g => g.category === activeTab);

  return (
    <div className="bg-[#f2f4f7] dark:bg-[#000000] min-h-screen flex transition-colors duration-500">
      <Sidebar />
      
      <main className="flex-1 min-w-0 p-6 lg:p-12 overflow-x-hidden relative">
        
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-1.5 h-10 bg-[#325f3f] rounded-full"></div>
             <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tighter leading-none">
               Career <span className="text-[#325f3f]">Guides</span>.
             </h1>
          </div>
          <p className="text-slate-500 font-semibold text-lg ml-6 max-w-2xl">Expert strategies and deep industry insights to accelerate your career growth.</p>
        </header>

        {/* Tabs / Filter Navigation */}
        <div className="flex flex-wrap gap-3 mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all border-2 ${
                activeTab === tab 
                  ? 'bg-[#325f3f] text-white border-[#325f3f] shadow-xl shadow-[#325f3f]/20' 
                  : 'bg-white dark:bg-[#111111] text-slate-400 border-white dark:border-white/5 hover:border-[#325f3f]/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Featured Guide - High-End Large Card */}
        {activeTab === 'All Topics' && (
          <div className="bg-white dark:bg-[#111111] rounded-[40px] border-2 border-white dark:border-white/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row mb-16 group cursor-pointer animate-in zoom-in-95 duration-1000">
            <div className="lg:w-3/5 h-[300px] lg:h-auto overflow-hidden relative">
              <img 
                src={guides[0].image} 
                alt="Interview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            </div>
            <div className="lg:w-2/5 p-12 lg:p-16 flex flex-col justify-between bg-white dark:bg-[#111111] relative">
              <div>
                <span className="bg-[#325f3f]/10 text-[#325f3f] text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em] border-2 border-[#325f3f]/10 inline-block mb-8">
                  Featured Article
                </span>
                <h2 className="text-[40px] font-bold text-black dark:text-white leading-[1.1] mb-8 group-hover:text-[#325f3f] transition-colors tracking-tighter">
                  {guides[0].title}
                </h2>
                <p className="text-slate-500 font-semibold text-lg leading-relaxed mb-10">
                  {guides[0].description}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-10 border-t-2 border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 overflow-hidden border-2 border-white dark:border-white/10">
                    <img src={guides[0].authorImg} alt={guides[0].author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-black dark:text-white uppercase tracking-wider">{guides[0].author}</p>
                    <p className="text-[12px] text-[#325f3f] font-bold uppercase tracking-widest">{guides[0].readTime}</p>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-[#325f3f] group-hover:bg-[#325f3f] group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guides Grid - Premium Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
          {filteredGuides.filter(g => !g.featured || activeTab !== 'All Topics').map((guide, idx) => (
            <div 
              key={guide.id} 
              className="bg-white dark:bg-[#111111] rounded-[32px] border-2 border-white dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-[#325f3f]/5 hover:border-[#325f3f]/20 transition-all duration-500 p-10 flex flex-col group cursor-pointer animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-bold text-[#325f3f] uppercase tracking-[0.2em] bg-[#325f3f]/5 px-4 py-2 rounded-xl border border-[#325f3f]/10">
                  {guide.category}
                </span>
                <span className="material-symbols-outlined text-slate-200 group-hover:text-[#325f3f] transition-colors">auto_stories</span>
              </div>
              
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6 group-hover:text-[#325f3f] transition-colors leading-[1.2] tracking-tight">
                {guide.title}
              </h3>
              
              <p className="text-slate-500 font-semibold text-base leading-relaxed mb-10 flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {guide.description}
              </p>
              
              <div className="flex items-center justify-between pt-8 border-t-2 border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/10 overflow-hidden border-2 border-white dark:border-white/10">
                    <img src={guide.authorImg} alt={guide.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-black dark:text-white uppercase tracking-tight block">{guide.author}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{guide.readTime}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-[#325f3f]/10 group-hover:text-[#325f3f] transition-all">
                  <span className="material-symbols-outlined text-xl">open_in_new</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CareerGuides;

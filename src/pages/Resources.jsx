import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { insforge } from '../services/api';
import Sidebar from '../components/Sidebar';

const Resources = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mockTests, setMockTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);

  const categories = [
    { name: 'Interview Prep', icon: 'forum', count: 15, to: '/resources/interview-prep' },
    { name: 'Resume Builder', icon: 'edit_note', count: 'Dynamic', to: '/resume' },
    { name: 'Coding Challenges', icon: 'code', count: 30, to: '/resources/coding-challenges' },
    { name: 'Mock Tests', icon: 'quiz', count: 15, to: '/resources/mock-test' },
    { name: 'Company Directory', icon: 'business', count: '50+', to: '/resources/companies' },
    { name: 'Career Guides', icon: 'auto_stories', count: 'Pro', to: '/career-guides' },
  ];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await insforge.database
          .from('resources')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setResources(data || []);
      } catch (e) {
        console.error('Error fetching resources:', e);
      } finally {
        setLoading(false);
      }
    };

    const fetchMockTests = async () => {
      try {
        const { data, error } = await insforge.database
          .from('mock_tests')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMockTests(data || []);
      } catch (e) {
        console.error('Error fetching mock tests:', e);
      } finally {
        setTestsLoading(false);
      }
    };

    fetchResources();
    fetchMockTests();
  }, []);

  const handleDownload = (res) => {
    if (res.content) {
      const blob = new Blob([res.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if (res.file_url) {
      window.open(res.file_url, '_blank');
    } else {
      if (res.category === 'Mock Tests') navigate('/resources/mock-test');
      if (res.category === 'Tools') navigate('/resume');
      if (res.category === 'Coding Challenges') navigate('/resources/coding-challenges');
    }
  };

  const filteredResources = resources
    .filter(res => {
      const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] min-h-screen flex transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h1 className="text-[40px] font-semibold text-[#1a1c1a] dark:text-white leading-tight mb-3">Career Resources</h1>
            <p className="text-[#5f6368] dark:text-gray-400 text-lg max-w-2xl leading-relaxed">Everything you need to boost your placement preparation.</p>
          </header>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.to || '#'}
                className="bg-white dark:bg-[#1a1c19] p-6 rounded-[24px] border border-[#e0e0e0] dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#325f3f]/10 flex items-center justify-center text-[#325f3f] mb-4 group-hover:bg-[#325f3f] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                </div>
                <h3 className="font-semibold text-[#1a1c1a] dark:text-white mb-1">{cat.name}</h3>
                <p className="text-[12px] text-[#5f6368] dark:text-gray-400 font-medium">{cat.count} {typeof cat.count === 'number' ? 'items available' : ''}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Resources List */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white dark:bg-[#1a1c19] rounded-[24px] border border-[#e0e0e0] dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-[#f0f0f0] dark:border-white/5 bg-[#f8f9f8] dark:bg-white/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-[#1a1c1a] dark:text-white">Recent Materials</h2>
                      <p className="text-[#5f6368] dark:text-gray-400 text-sm font-medium mt-1">
                        {loading ? 'Loading materials...' : `Showing ${filteredResources.length} items`}
                      </p>
                    </div>
                    <div className="relative w-full md:w-64">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-gray-400 text-xl">search</span>
                      <input 
                        type="text" 
                        placeholder="Search materials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#325f3f] dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {['All', 'Mock Tests', 'Interview Prep', 'Coding Challenges', 'Tools'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          activeCategory === cat 
                            ? 'bg-[#325f3f] text-white border-[#325f3f]' 
                            : 'bg-white dark:bg-[#2a2c29] text-[#5f6368] dark:text-gray-400 border-[#e0e0e0] dark:border-white/10 hover:border-[#325f3f] hover:text-[#325f3f]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <div className="flex-1"></div>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-white/10 rounded-xl px-4 py-2 text-xs font-semibold outline-none cursor-pointer hover:border-[#325f3f] dark:text-white transition-all"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Sort by Name</option>
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-[#f0f0f0] dark:divide-white/5">
                  {loading ? (
                    <div className="p-20 text-center text-[#5f6368]">
                      <div className="w-8 h-8 border-4 border-[#325f3f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="font-medium">Fetching materials...</p>
                    </div>
                  ) : filteredResources.length > 0 ? filteredResources.map((res) => (
                    <div key={res.id} className="p-6 hover:bg-[#f8f9f8] dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#f0f0f0] dark:bg-[#2a2c29] flex items-center justify-center text-[#5f6368] dark:text-gray-400 group-hover:bg-[#325f3f]/10 group-hover:text-[#325f3f] transition-all duration-300">
                          <span className="material-symbols-outlined text-2xl">
                            {res.category === 'Mock Tests' ? 'quiz' :
                              res.category === 'Tools' ? 'edit_note' :
                                res.type === 'PDF' ? 'picture_as_pdf' :
                                  res.type === 'Video' ? 'play_circle' : 'article'}
                          </span>
                        </div>
                        <div>
                          <p className="text-[17px] font-semibold text-[#1a1c1a] dark:text-white group-hover:text-[#325f3f] transition-colors">{res.title}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="px-2 py-0.5 bg-[#f0f0f0] dark:bg-[#2a2c29] rounded-md text-[10px] font-semibold text-[#5f6368] dark:text-gray-400 uppercase tracking-wider">
                              {res.type}
                            </span>
                            <p className="text-[13px] text-[#5f6368] dark:text-gray-400 font-medium">{res.category} • {res.size}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xs text-[#5f6368] dark:text-gray-400 font-semibold hidden md:block">
                          {new Date(res.date).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                        </span>
                        <button 
                          onClick={() => handleDownload(res)}
                          className="w-12 h-12 flex items-center justify-center text-[#325f3f] bg-[#325f3f]/5 hover:bg-[#325f3f] hover:text-white rounded-full transition-all duration-300"
                        >
                          <span className="material-symbols-outlined">
                            {res.category === 'Mock Tests' || res.category === 'Tools' || res.category === 'Coding Challenges' ? 'arrow_forward' : 'download'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center text-[#5f6368] dark:text-gray-400">
                      <span className="material-symbols-outlined text-5xl opacity-20 mb-4">search_off</span>
                      <p className="font-medium">No materials found matching your criteria.</p>
                      <button onClick={() => { setActiveCategory('All'); setSearchQuery(''); }} className="mt-4 text-[#325f3f] font-semibold text-sm hover:underline">Clear all filters</button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar: Resume Builder & Mock Test Promo */}
            <div className="space-y-8">
              {/* Resume Builder Box */}
              <div className="bg-[#325f3f] text-white p-8 rounded-[28px] shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-semibold mb-3">Resume Builder</h3>
                  <p className="text-white/80 text-[15px] mb-8 leading-relaxed">
                    Create a professional, ATS-friendly resume in minutes with our dynamic builder tool.
                  </p>
                  <Link
                    to="/resume"
                    className="bg-white text-[#325f3f] px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#f8f9f8] transition-all shadow-md inline-block"
                  >
                    Create Resume
                  </Link>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[160px] opacity-10 rotate-12 group-hover:scale-110 transition-transform">edit_note</span>
              </div>

              {/* Mock Test Box */}
              <div className="bg-white dark:bg-[#1a1c19] p-8 rounded-[28px] border border-[#e0e0e0] dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-semibold text-[#1a1c1a] dark:text-white mb-2">Live Mock Tests</h3>
                <p className="text-[#5f6368] dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">
                  Compete with other students in real-time placement scenarios.
                </p>
                <div className="space-y-4">
                  {testsLoading ? (
                    <div className="py-4 text-center text-xs text-[#5f6368] font-medium">Loading tests...</div>
                  ) : mockTests.length > 0 ? mockTests.map(test => (
                    <div key={test.id} className={`flex items-center justify-between p-4 bg-[#f8f9f8] dark:bg-[#2a2c29] rounded-2xl border border-[#f0f0f0] dark:border-white/5 ${test.status === 'upcoming' ? 'opacity-70' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${test.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-[#5f6368]'}`}></div>
                        <span className="text-sm font-semibold text-[#1a1c1a] dark:text-white">{test.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#5f6368] dark:text-gray-400 uppercase tracking-wider">{test.scheduled_time}</span>
                    </div>
                  )) : (
                    <div className="py-4 text-center text-xs text-[#5f6368] dark:text-gray-400 font-medium">No live tests scheduled</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resources;

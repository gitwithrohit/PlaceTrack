import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { insforge } from '../services/api';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  User, 
  ExternalLink,
  Star,
  Zap,
  Briefcase
} from 'lucide-react';

const CompanyTalentSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('skills') || '');
  const [filters, setFilters] = useState({
    graduationYear: '',
    location: '',
    role: ''
  });

  useEffect(() => {
    fetchCandidates();
  }, [searchParams]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      let query = insforge.database
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      // Apply initial skill filter if present in URL
      const skillParam = searchParams.get('skills');
      if (skillParam) {
        query = query.filter('skills', 'cs', `{${skillParam}}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setCandidates(data || []);
    } catch (err) {
      console.error('Error searching talent:', err);
      toast.error("Failed to load talent pool");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ skills: searchTerm });
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchTerm || 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.university?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = !filters.graduationYear || c.graduation_year?.toString() === filters.graduationYear;
    const matchesLocation = !filters.location || c.location?.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesYear && matchesLocation;
  });

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-[#f9fafc] dark:bg-[#050505] antialiased text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10">
      <Toaster position="top-right" />
      <RecruiterNavbar />

      <main className="max-w-[1400px] mx-auto w-full p-6 lg:p-10 pt-16 flex flex-col gap-10">
        
        {/* Modern Search Header */}
        <header className="animate-fade-in-up">
          <div className="max-w-4xl space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Talent <span className="text-indigo-600">Discovery</span>.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-2xl">
              Find and connect with top students based on skills, experience, and academic excellence.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 p-3 bg-white dark:bg-[#111] border border-slate-100 dark:border-white/5 rounded-[32px] shadow-2xl shadow-indigo-500/5">
            <div className="flex-1 flex items-center px-6 gap-4 border-r dark:border-white/5 lg:mb-0 mb-4">
              <Search className="text-indigo-500 shrink-0" size={24} />
              <input 
                type="text" 
                placeholder="Search by skills, name or university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-4 bg-transparent outline-none font-bold text-slate-700 dark:text-slate-200 text-lg placeholder:text-slate-300"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 px-2 lg:border-none border-t dark:border-white/5 pt-4 lg:pt-0">
               <select 
                 value={filters.graduationYear}
                 onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
                 className="px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl outline-none text-sm font-extrabold text-slate-500 appearance-none cursor-pointer border border-transparent focus:border-indigo-500/20"
               >
                 <option value="">Graduation Year</option>
                 <option value="2024">2024</option>
                 <option value="2025">2025</option>
                 <option value="2026">2026</option>
               </select>

               <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95">
                  Discovery Candidates
               </button>
            </div>
          </form>
        </header>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((student, idx) => (
              <div 
                key={student.id} 
                className="group bg-white dark:bg-[#111] rounded-[40px] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-500/20 transition-all duration-500 animate-fade-in-up flex flex-col"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[32px] overflow-hidden border-2 border-white dark:border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=b6e3f4`} 
                        alt={student.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-[#111] rounded-full"></div>
                  </div>
                  <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-300 hover:text-amber-500 transition-colors border border-slate-100 dark:border-white/5">
                    <Star size={20} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <GraduationCap size={16} className="text-indigo-500" />
                    {student.university || 'Prestigious University'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {(student.skills || ['React', 'Node.js', 'Python']).slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-500/10">
                      {skill}
                    </span>
                  ))}
                  {(student.skills?.length > 4) && (
                    <span className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider border border-slate-100 dark:border-white/10">
                      +{student.skills.length - 4} More
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPA</p>
                      <p className="text-base font-black text-slate-800 dark:text-white">{student.gpa || '3.8'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                      <p className="text-base font-black text-slate-800 dark:text-white">{student.graduation_year || '2024'}</p>
                   </div>
                </div>

                <div className="mt-auto pt-6 border-t dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[12px]">
                    <MapPin size={14} className="text-indigo-500" />
                    {student.location || 'Remote'}
                  </div>
                  <Link 
                    to={`/company/resume/${student.id}`} 
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-lg"
                  >
                    View Profile <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
               <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Zap size={40} className="text-slate-300" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No matching talent found</h3>
               <p className="text-slate-500 font-bold text-lg">Try broadening your search criteria or adjusting your skill filters.</p>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        `}} />
    </div>
  );
};

export default CompanyTalentSearch;

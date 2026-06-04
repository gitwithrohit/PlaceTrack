import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageSkeleton } from '../components/LoadingSkeleton';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: jobData } = await insforge.database
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!jobData) throw new Error("Job not found");
        setJob(jobData);

        const { data: profileData } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Check if already applied
        const { data: appData } = await insforge.database
          .from('applications')
          .select('id')
          .eq('job_id', id)
          .eq('student_id', user.id);
        
        if (appData && appData.length > 0) {
          toast.error("You have already applied for this job");
          navigate('/jobs');
        }

      } catch (e) {
        console.error(e);
        toast.error(e.message);
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.resume_url) {
      return toast.error("Please upload your resume in your profile before applying");
    }

    setSubmitting(true);
    try {
      const { error } = await insforge.database.from('applications').insert([{
        job_id: id,
        student_id: user.id,
        status: 'Applied',
        cover_letter: coverLetter,
        resume_url: profile?.resume_url
      }]);

      if (error) throw error;
      
      toast.success("Application submitted successfully!");
      navigate('/applications');
    } catch (e) {
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#f2f4f7] min-h-screen py-12 px-6 lg:px-12 transition-colors duration-500 dark:bg-[#000000]">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-slate-500 hover:text-black font-bold uppercase text-[10px] tracking-widest mb-8 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Openings
        </button>

        <div className="bg-white dark:bg-[#111111] rounded-[40px] p-10 lg:p-14 shadow-2xl border-2 border-white dark:border-white/5 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#325f3f]/10 rounded-3xl flex items-center justify-center font-bold text-[#325f3f] text-3xl border-2 border-[#325f3f]/20">
                {job.company?.[0] || 'J'}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white tracking-tighter leading-none mb-2">{job.title}</h1>
                <p className="text-[#325f3f] font-bold text-lg uppercase tracking-wider">{job.company}</p>
              </div>
            </div>
            <div className="px-6 py-2 bg-slate-50 dark:bg-white/5 text-black dark:text-slate-300 text-[10px] font-bold rounded-xl border border-slate-100 dark:border-white/10 uppercase tracking-widest">
              ID: {id.slice(0, 8)}
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 gap-10">
              
              {/* Profile Verification */}
              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Candidate Verification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <p className="text-lg font-bold text-black dark:text-white">{profile?.name || 'Loading...'}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Email</label>
                    <p className="text-lg font-bold text-black dark:text-white">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resume Status</label>
                    {profile?.resume_url ? (
                      <div className="flex items-center gap-2 text-[#325f3f] font-bold">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Document Ready
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500 font-bold">
                        <span className="material-symbols-outlined text-sm">error</span>
                        Missing Resume
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-[11px] font-bold text-black dark:text-white uppercase tracking-[0.2em] mb-4">Statement of Purpose / Cover Letter</label>
                <textarea
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-8 bg-white dark:bg-[#1a1c1e] border-2 border-slate-100 dark:border-white/10 rounded-3xl outline-none focus:border-[#325f3f] transition-all text-black dark:text-white font-semibold text-lg min-h-[250px] shadow-inner placeholder:text-slate-200"
                  placeholder="Tell the recruiter why you are the best fit for this role..."
                />
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-4 p-6 bg-[#325f3f]/5 rounded-2xl border border-[#325f3f]/10">
                <span className="material-symbols-outlined text-[#325f3f]">info</span>
                <p className="text-xs font-semibold text-[#325f3f] leading-relaxed">
                  By clicking "Launch Application", you agree to share your verified profile data, resume, and academic history with {job.company}. Ensure your profile information is up to date before proceeding.
                </p>
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t-2 border-slate-50 dark:border-white/5 gap-8">
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="material-symbols-outlined text-2xl">security</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">Secure Application<br/>End-to-End Encrypted</p>
                </div>
                
                <button 
                  type="submit"
                  disabled={submitting || !profile?.resume_url}
                  className={`w-full sm:w-auto px-16 py-5 rounded-[24px] font-bold text-xs uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-95 ${
                    submitting || !profile?.resume_url 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-[#325f3f] text-white hover:bg-[#2a4f35] shadow-[#325f3f]/40 hover:scale-105'
                  }`}
                >
                  {submitting ? 'Transmitting...' : 'Launch Application'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { insforge } from '../services/api';
import RecruiterNavbar from '../components/RecruiterNavbar';

const ResumeViewer = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;
      try {
        const { data, error } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();

        if (error) throw error;
        if (data) setStudent(data);
      } catch (e) {
        console.error("ResumeViewer: Failed to fetch student profile", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-10 h-10 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!student) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9f8]">
      <div className="bg-white p-12 rounded-[40px] shadow-sm border border-[#e0e0e0] text-center max-w-md">
        <span className="material-symbols-outlined text-6xl text-[#d1d5db] mb-4">person_off</span>
        <h2 className="text-2xl font-bold text-[#1a1c1a] mb-2">Student Not Found</h2>
        <p className="text-[#5f6368] mb-8">We couldn't retrieve the profile for this candidate.</p>
        <button onClick={() => navigate(-1)} className="w-full py-4 bg-[#1a4d2e] text-white rounded-2xl font-bold hover:bg-[#2d5d41] transition-all">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9f8] min-h-screen flex flex-col font-poppins antialiased text-[#1a1c1a]">
      <RecruiterNavbar />

      <main className="max-w-[1200px] mx-auto w-full p-6 flex-1 flex flex-col pt-28">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#5f6368] font-bold text-sm mb-2 hover:text-[#1a1c1a] group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Talent Hub
            </button>
            <h1 className="text-4xl font-bold tracking-tight">{student.name}'s Resume</h1>
            <p className="text-[#5f6368] text-sm font-medium">{student.university || 'Verified Candidate'}</p>
          </div>
          <div className="flex gap-3">
            {student.resume_url && (
              <a
                href={student.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white border border-[#e0e0e0] rounded-xl font-bold shadow-sm hover:bg-[#f8f9f8] transition-all"
              >
                <span className="material-symbols-outlined">open_in_new</span> External View
              </a>
            )}
            <a
              href={student.resume_url || '#'}
              download
              className={`flex items-center gap-2 px-6 py-3 bg-[#1a4d2e] text-white rounded-xl font-bold shadow-md hover:bg-[#2d5d41] transition-all ${!student.resume_url ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="material-symbols-outlined">download</span> Download PDF
            </a>
          </div>
        </header>

        <div className="bg-white rounded-[32px] border border-[#e0e0e0] shadow-xl flex-1 overflow-hidden relative min-h-[700px] mb-6">
          {student.resume_url ? (
            <iframe
              src={`${student.resume_url}#toolbar=0`}
              className="w-full h-full border-none"
              title={`${student.name} Resume`}
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-20 text-center">
              <div className="w-24 h-24 bg-[#f8f9f8] rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-[#d1d5db]">description</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1a1c1a] mb-2">No Resume Document Uploaded</h3>
              <p className="text-[#5f6368] max-w-sm mx-auto leading-relaxed">
                This student has not yet uploaded a PDF version of their resume.
                You can still review their profile details on the main tracking page.
              </p>
              <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 border-2 border-[#e0e0e0] rounded-xl font-bold hover:bg-[#f8f9f8] transition-all">
                Return to Applicants
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResumeViewer;

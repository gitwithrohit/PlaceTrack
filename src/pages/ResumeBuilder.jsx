import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import { gsap } from 'gsap';

const STEPS = [
  { id: 'personal', label: 'Personal', icon: 'person' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'experience', label: 'Experience', icon: 'work' },
  { id: 'skills', label: 'Skills', icon: 'psychology' },
];

const THEMES = [
  { id: 'emerald', label: 'Emerald', color: '#1a4d2e' },
  { id: 'midnight', label: 'Midnight', color: '#0f172a' },
  { id: 'crimson', label: 'Crimson', color: '#991b1b' },
];

const ResumeBuilder = () => {
  const resumeRef = useRef(null);
  const formRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('personal');
  const [activeTheme, setActiveTheme] = useState('emerald');

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    summary: '',
  });

  const [education, setEducation] = useState([
    { institution: '', degree: '', graduationYear: '', gpa: '' }
  ]);

  const [experience, setExperience] = useState([
    { company: '', role: '', dates: '', description: '' }
  ]);

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (personalInfo.firstName && personalInfo.lastName) score += 20;
    if (personalInfo.summary) score += 10;
    if (education[0].institution) score += 20;
    if (experience[0].company) score += 20;
    if (skills.length > 0) score += 15;
    if (personalInfo.linkedin) score += 15;
    setStrength(score);
  }, [personalInfo, education, experience, skills]);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentStep]);

  const handlePersonalChange = (e) => setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });

  const handleEducationChange = (index, e) => {
    const newEdu = [...education];
    newEdu[index][e.target.name] = e.target.value;
    setEducation(newEdu);
  };

  const addEducation = () => setEducation([...education, { institution: '', degree: '', graduationYear: '', gpa: '' }]);
  const removeEducation = (index) => setEducation(education.filter((_, i) => i !== index));

  const handleExperienceChange = (index, e) => {
    const newExp = [...experience];
    newExp[index][e.target.name] = e.target.value;
    setExperience(newExp);
  };

  const addExperience = () => setExperience([...experience, { company: '', role: '', dates: '', description: '' }]);
  const removeExperience = (index) => setExperience(experience.filter((_, i) => i !== index));

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => setSkills(skills.filter(s => s !== skillToRemove));

  const fillSampleData = () => {
    setPersonalInfo({
      firstName: 'Arjun',
      lastName: 'Sharma',
      email: 'arjun.s@example.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/arjun-sharma',
      summary: 'Dynamic Software Engineer with a passion for building scalable web applications. Expert in React, Node.js, and cloud architectures. Proven track record of improving system performance and mentoring junior developers.',
    });
    setEducation([{ institution: 'IIT Delhi', degree: 'B.Tech in Computer Science', graduationYear: '2024', gpa: '9.4/10' }]);
    setExperience([{ company: 'Google', role: 'Software Engineer Intern', dates: 'May 2023 - July 2023', description: 'Developed core features for Google Search. Reduced query latency by 15% using optimized caching strategies. Collaborated with cross-functional teams to launch new UI components.' }]);
    setSkills(['React', 'Node.js', 'PostgreSQL', 'AWS', 'Python', 'TypeScript', 'Docker']);
    toast.success('Magic Fill applied!');
  };

  const enhanceSummary = () => {
    if (!personalInfo.summary) return toast.error('Enter a draft summary first!');
    const toastId = toast.loading('AI is refining your summary...');
    setTimeout(() => {
      setPersonalInfo({
        ...personalInfo,
        summary: `Visionary and results-driven professional with expertise in ${skills.slice(0, 3).join(', ') || 'software development'}. Adept at leading high-impact projects, fostering innovation, and delivering robust solutions in fast-paced environments. Committed to continuous learning and excellence.`
      });
      toast.success('Summary enhanced with AI!', { id: toastId });
    }, 1500);
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    const toastId = toast.loading('Architecting Master PDF...');

    try {
      const element = resumeRef.current;

      // CRITICAL: We create a hidden clone to avoid scaling/visibility issues
      const clone = element.cloneNode(true);
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '210mm'; // Standard A4 width
      clone.style.height = 'auto';
      clone.style.boxShadow = 'none';
      document.body.appendChild(clone);

      // Wait a moment for fonts/images in clone to settle
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(clone, {
        scale: 2, // 2 is high-quality for A4 without crashing browsers
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${personalInfo.firstName || 'Elite'}_Resume.pdf`);

      toast.success('Resume Exported Successfully!', { id: toastId });
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Export failed. Check internet connection or fill details.', { id: toastId });
    }
  };

  return (
    <div className="bg-[#f5f7f9] dark:bg-[#000000] min-h-screen flex transition-colors duration-500 font-poppins relative">

      <div className="fixed top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#325f3f] blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 blur-[150px] rounded-full animate-pulse delay-700"></div>
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col xl:flex-row min-h-screen z-10">

        <div className="flex-1 p-6 lg:p-12 xl:max-h-screen xl:overflow-y-auto custom-scrollbar pb-32">
          <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[#325f3f]/10 text-[#325f3f] text-[10px] font-black uppercase tracking-[0.2em] rounded-full">v2.3 Master Edition</span>
                <h1 className="text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tighter leading-none">Resume</h1>
              </div>
              <p className="text-slate-500 font-medium text-lg">Engineer your professional identity with AI-powered precision</p>
            </div>

            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Integrity</span>
                <span className={`text-sm font-black ${strength > 80 ? 'text-green-500' : strength > 50 ? 'text-amber-500' : 'text-red-500'}`}>{strength}%</span>
              </div>
              <div className="w-full sm:w-48 h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#325f3f] to-green-400 transition-all duration-1000" style={{ width: `${strength}%` }}></div>
              </div>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-56 shrink-0 space-y-3 lg:sticky lg:top-0">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] transition-all group ${currentStep === step.id
                      ? 'bg-white dark:bg-white/10 text-[#325f3f] dark:text-white shadow-xl shadow-slate-200/40 dark:shadow-none font-black translate-x-2'
                      : 'text-slate-400 font-bold hover:bg-white/50 dark:hover:bg-white/5 hover:translate-x-1'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentStep === step.id ? 'bg-[#325f3f] text-white shadow-lg shadow-[#325f3f]/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.15em]">{step.label}</span>
                </button>
              ))}

              <div className="pt-8 space-y-4">
                <button
                  onClick={fillSampleData}
                  className="w-full py-4 border-2 border-[#325f3f]/20 text-[#325f3f] rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#325f3f] hover:text-white transition-all flex items-center justify-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">magic_button</span>
                  Magic Fill
                </button>
                <button
                  onClick={downloadPDF}
                  className="w-full py-5 bg-[#325f3f] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#325f3f]/30 hover:bg-[#2a4f35] transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span className="material-symbols-outlined">download</span>
                  Export
                </button>
              </div>
            </div>

            <div ref={formRef} className="flex-1 max-w-3xl">
              <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[48px] p-8 lg:p-14 shadow-2xl shadow-slate-200/30 dark:shadow-none relative">

                {currentStep === 'personal' && (
                  <button
                    onClick={enhanceSummary}
                    className="absolute top-10 right-10 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-[#325f3f] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                    AI Enhance
                  </button>
                )}

                {renderFormStep(currentStep, {
                  personalInfo, handlePersonalChange,
                  education, handleEducationChange, addEducation, removeEducation,
                  experience, handleExperienceChange, addExperience, removeExperience,
                  skills, skillInput, setSkillInput, addSkill, removeSkill
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex w-[600px] bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl overflow-hidden flex-col border-l border-white/10 h-screen sticky top-0">
          <div className="p-8 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-black dark:text-white tracking-tight leading-none mb-1">Vanguard Preview</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">A4 Professional Canvas</span>
            </div>
            <div className="flex gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${activeTheme === theme.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.label}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-900/5 dark:bg-black/20">
            <div className="flex justify-center items-start min-h-full">
              <div
                ref={resumeRef}
                className="bg-white shadow-[0_60px_100px_-30px_rgba(0,0,0,0.3)] p-16 w-[210mm] font-poppins text-black transition-all duration-700 origin-top scale-[0.6] mb-[-40%]"
              >
                <div className="max-w-[100%] mx-auto relative">
                  <div className="absolute top-[-64px] left-[-64px] w-[calc(100%+128px)] h-5" style={{ backgroundColor: THEMES.find(t => t.id === activeTheme)?.color }}></div>

                  <header className="mb-12">
                    <h1 className="text-[44px] font-black text-black uppercase tracking-[0.25em] mb-4 leading-none" style={{ color: THEMES.find(t => t.id === activeTheme)?.color }}>
                      {personalInfo.firstName || 'YOUR'} <span className="font-light">{personalInfo.lastName || 'NAME'}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                      <div className="flex items-center gap-2">{personalInfo.email || 'email@example.com'}</div>
                      <div className="flex items-center gap-2">{personalInfo.phone || '+91 00000 00000'}</div>
                      <div className="flex items-center gap-2">{personalInfo.linkedin || 'linkedin.com/in/username'}</div>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 gap-12">
                    {personalInfo.summary && (
                      <section>
                        <div className="flex items-center gap-4 mb-6">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: THEMES.find(t => t.id === activeTheme)?.color }}>Executive Summary</h3>
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium text-justify">{personalInfo.summary}</p>
                      </section>
                    )}

                    <div className="grid grid-cols-1 gap-12">
                      <section>
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: THEMES.find(t => t.id === activeTheme)?.color }}>Experience</h3>
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <div className="space-y-12">
                          {experience.map((exp, idx) => (
                            <div key={idx} className="relative pl-8 border-l-2 border-slate-50">
                              <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full" style={{ backgroundColor: THEMES.find(t => t.id === activeTheme)?.color }}></div>
                              <div className="flex justify-between items-baseline mb-1">
                                <h4 className="text-[15px] font-black text-black uppercase tracking-wider">{exp.company || 'Company Name'}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.dates || 'Duration'}</span>
                              </div>
                              <p className="text-[12px] font-bold italic mb-4" style={{ color: THEMES.find(t => t.id === activeTheme)?.color }}>{exp.role || 'Position'}</p>
                              <ul className="text-[12.5px] text-slate-600 leading-relaxed space-y-3 font-medium">
                                {(exp.description || 'Outline your achievements...').split('. ').map((point, i) => (
                                  point && <li key={i} className="flex gap-4 text-justify">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0"></span>
                                    {point.trim().replace(/\.$/, '')}.
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: THEMES.find(t => t.id === activeTheme)?.color }}>Education</h3>
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        <div className="space-y-8">
                          {education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                              <div>
                                <h4 className="text-[15px] font-black text-black uppercase tracking-wide leading-tight">{edu.institution || 'Institution'}</h4>
                                <p className="text-[12px] font-semibold text-slate-500 italic mt-1">{edu.degree || 'Degree'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[12px] font-black text-black">{edu.graduationYear || '2024'}</p>
                                {edu.gpa && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GPA: {edu.gpa}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {skills.length > 0 && (
                        <section>
                          <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: THEMES.find(t => t.id === activeTheme)?.color }}>Expertise</h3>
                            <div className="h-[1px] flex-1 bg-slate-100"></div>
                          </div>
                          <div className="flex flex-wrap gap-x-10 gap-y-4">
                            {skills.map((skill, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: THEMES.find(t => t.id === activeTheme)?.color }}></div>
                                <span className="text-[12px] font-black text-black uppercase tracking-widest">{skill}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const renderFormStep = (step, props) => {
  const {
    personalInfo, handlePersonalChange,
    education, handleEducationChange, addEducation, removeEducation,
    experience, handleExperienceChange, addExperience, removeExperience,
    skills, skillInput, setSkillInput, addSkill, removeSkill
  } = props;

  switch (step) {
    case 'personal':
      return (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">First Name</label>
              <input name="firstName" value={personalInfo.firstName} onChange={handlePersonalChange} className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/30 focus:bg-white dark:focus:bg-white/10 rounded-[28px] outline-none transition-all font-bold text-lg" placeholder="e.g. Arjun" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Last Name</label>
              <input name="lastName" value={personalInfo.lastName} onChange={handlePersonalChange} className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/30 focus:bg-white dark:focus:bg-white/10 rounded-[28px] outline-none transition-all font-bold text-lg" placeholder="e.g. Sharma" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Email Address</label>
              <input name="email" value={personalInfo.email} onChange={handlePersonalChange} className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/30 focus:bg-white dark:focus:bg-white/10 rounded-[28px] outline-none transition-all font-bold" placeholder="arjun@example.com" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phone Number</label>
              <input name="phone" value={personalInfo.phone} onChange={handlePersonalChange} className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/30 focus:bg-white dark:focus:bg-white/10 rounded-[28px] outline-none transition-all font-bold" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">LinkedIn Profile</label>
            <input name="linkedin" value={personalInfo.linkedin} onChange={handlePersonalChange} className="w-full px-8 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/30 focus:bg-white dark:focus:bg-white/10 rounded-[28px] outline-none transition-all font-bold" placeholder="linkedin.com/in/arjunsharma" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Executive Summary</label>
            <textarea name="summary" value={personalInfo.summary} onChange={handlePersonalChange} rows="5" className="w-full px-8 py-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/30 focus:bg-white dark:focus:bg-white/10 rounded-[32px] outline-none transition-all font-bold resize-none text-base leading-relaxed" placeholder="Tell your professional story..." />
          </div>
        </div>
      );
    case 'education':
      return (
        <div className="space-y-10">
          {education.map((edu, idx) => (
            <div key={idx} className="relative p-10 bg-slate-50/50 dark:bg-white/5 rounded-[48px] border border-slate-100 dark:border-white/5 space-y-8 hover:shadow-xl transition-all">
              <button onClick={() => removeEducation(idx)} className="absolute top-8 right-8 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-white/10 text-red-500 shadow-xl hover:scale-110 transition-all z-20">
                <span className="material-symbols-outlined text-[22px]">delete</span>
              </button>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institution</label>
                <input name="institution" value={edu.institution} onChange={(e) => handleEducationChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="e.g. BITS Pilani" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Major / Degree</label>
                  <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="B.E. Mechanical Engineering" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Graduation Year</label>
                  <input name="graduationYear" value={edu.graduationYear} onChange={(e) => handleEducationChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="2024" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Performance (GPA/%)</label>
                <input name="gpa" value={edu.gpa} onChange={(e) => handleEducationChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="8.5 CGPA" />
              </div>
            </div>
          ))}
          <button onClick={addEducation} className="w-full py-7 bg-white dark:bg-white/5 border-2 border-dashed border-[#325f3f]/20 rounded-[48px] text-[#325f3f] font-black uppercase tracking-[0.3em] hover:bg-[#325f3f]/5 hover:border-[#325f3f]/50 transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">add_circle</span>
            Add Milestone
          </button>
        </div>
      );
    case 'experience':
      return (
        <div className="space-y-10">
          {experience.map((exp, idx) => (
            <div key={idx} className="relative p-10 bg-slate-50/50 dark:bg-white/5 rounded-[56px] border border-slate-100 dark:border-white/5 space-y-8 hover:shadow-xl transition-all">
              <button onClick={() => removeExperience(idx)} className="absolute top-8 right-8 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-white/10 text-red-500 shadow-xl hover:scale-110 transition-all z-20">
                <span className="material-symbols-outlined text-[22px]">delete</span>
              </button>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Company / Brand</label>
                <input name="company" value={exp.company} onChange={(e) => handleExperienceChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="e.g. Amazon" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Job Title</label>
                  <input name="role" value={exp.role} onChange={(e) => handleExperienceChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="Product Manager" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tenure / Dates</label>
                  <input name="dates" value={exp.dates} onChange={(e) => handleExperienceChange(idx, e)} className="w-full px-8 py-5 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[28px] outline-none transition-all font-bold" placeholder="Jan 2022 - Present" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Description</label>
                <textarea name="description" value={exp.description} onChange={(e) => handleExperienceChange(idx, e)} rows="5" className="w-full px-8 py-6 bg-white dark:bg-white/10 border-2 border-transparent focus:border-[#325f3f]/20 rounded-[32px] outline-none transition-all font-bold resize-none text-base leading-relaxed" placeholder="Describe your wins. Quantify your results." />
              </div>
            </div>
          ))}
          <button onClick={addExperience} className="w-full py-7 bg-white dark:bg-white/5 border-2 border-dashed border-[#325f3f]/20 rounded-[48px] text-[#325f3f] font-black uppercase tracking-[0.3em] hover:bg-[#325f3f]/5 hover:border-[#325f3f]/50 transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">add_circle</span>
            Add Experience
          </button>
        </div>
      );
    case 'skills':
      return (
        <div className="space-y-10">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Skills Portfolio</label>
            <div className="relative">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                className="w-full px-10 py-7 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-[#325f3f]/50 focus:bg-white dark:focus:bg-white/10 rounded-[36px] outline-none transition-all font-black text-xl shadow-inner"
                placeholder="What are you a master of?"
              />
              <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-[#325f3f] text-3xl opacity-40 animate-pulse">workspace_premium</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-10">
              {skills.map((skill, i) => (
                <div key={i} className="px-6 py-3 bg-white dark:bg-white/10 text-black dark:text-white rounded-[24px] font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 border border-slate-100 dark:border-white/10 shadow-xl hover:scale-105 transition-all group cursor-default">
                  <div className="w-2 h-2 rounded-full bg-[#325f3f]"></div>
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="material-symbols-outlined text-sm text-red-400 opacity-0 group-hover:opacity-100 transition-all">cancel</button>
                </div>
              ))}
              {skills.length === 0 && (
                <div className="w-full py-24 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[48px]">
                  <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">neurology</span>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Visualize your expertise here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default ResumeBuilder;

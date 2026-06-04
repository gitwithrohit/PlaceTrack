import Sidebar from '../components/Sidebar';

const InterviewPrep = () => {
  const checklist = [
    { title: "Resume Preparation", desc: "Keep your resume updated, concise, and tailored to the specific role. Highlight relevant skills, projects, and achievements." },
    { title: "Understand Job Description", desc: "Carefully read the job posting and identify required skills, tools, and responsibilities. Align your preparation accordingly." },
    { title: "Company Research", desc: "Learn about the company’s mission, products, services, and recent updates. This helps you answer “Why this company?” confidently." },
    { title: "Practice Common HR Questions", desc: "Prepare answers for questions like “Tell me about yourself,” “Strengths and weaknesses,” and “Where do you see yourself in 5 years?”" },
    { title: "Technical Concepts Revision", desc: "Review core subjects related to your domain such as programming, databases, networking, or system design." },
    { title: "Project Explanation", desc: "Be ready to explain your projects in simple terms. Focus on your role, technologies used, challenges faced, and outcomes." },
    { title: "Coding Practice", desc: "Solve problems on platforms like LeetCode or HackerRank to improve logic, speed, and accuracy." },
    { title: "Mock Interviews", desc: "Simulate real interviews with friends or online tools to build confidence and identify weak areas." },
    { title: "Communication Skills", desc: "Practice speaking clearly and confidently. Avoid filler words and keep your answers structured." },
    { title: "Prepare Questions for Interviewer", desc: "Have thoughtful questions ready, such as team structure, growth opportunities, or technologies used." },
    { title: "Time Management", desc: "Practice answering within time limits, especially for coding or technical rounds." },
    { title: "Dress Professionally", desc: "Wear appropriate attire for the interview, even for virtual meetings, to create a good first impression." },
    { title: "Body Language and Confidence", desc: "Maintain eye contact, sit straight, and show positive energy during the interview." },
    { title: "Review Fundamentals", desc: "Brush up on basics like OOP concepts, DBMS, operating systems, or core subjects related to your field." },
    { title: "Post-Interview Follow-Up", desc: "Send a polite thank-you email after the interview, showing appreciation and continued interest in the role." }
  ];

  return (
    <div className="bg-[#f2f4f7] dark:bg-[#0f110f] min-h-screen flex transition-colors duration-500 font-poppins">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-12 overflow-x-hidden relative">
        
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4 mb-4">
             <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tighter leading-none">
               Interview <span className="text-[#325f3f] dark:text-[#4ade80]">Prep</span>.
             </h1>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-semibold text-lg ml-6 max-w-2xl">Master your placement journey with our comprehensive preparation framework.</p>
        </header>

        {/* Checklist Container */}
        <div className="bg-white dark:bg-[#151715] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden relative">
          
          {/* Section Header */}
          <div className="p-10 border-b border-slate-50 dark:border-white/5 bg-[#325f3f]/5">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-[#325f3f] flex items-center justify-center text-white shadow-xl shadow-[#325f3f]/30">
                <span className="material-symbols-outlined text-3xl font-bold">verified_user</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight">The Success Framework</h2>
                <p className="text-slate-500 dark:text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">15 Essential Steps to Career Readiness</p>
              </div>
            </div>
          </div>
          
          {/* Grid of Steps */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {checklist.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative p-8 rounded-[32px] bg-slate-50 dark:bg-white/[0.02] border border-transparent hover:border-[#325f3f]/20 hover:bg-white dark:hover:bg-[#1a1c1e] transition-all duration-300 hover:shadow-2xl hover:shadow-[#325f3f]/5 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Number Badge */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center font-bold text-[#325f3f] dark:text-[#4ade80] text-sm border border-slate-100 dark:border-white/5 group-hover:bg-[#325f3f] group-hover:text-white group-hover:border-[#325f3f] transition-all">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-black dark:text-white text-lg tracking-tight group-hover:text-[#325f3f] dark:group-hover:text-[#4ade80] transition-colors">{item.title}</h4>
                </div>

                <p className="text-[14px] text-slate-500 dark:text-gray-400 font-semibold leading-relaxed">
                  {item.desc}
                </p>

                {/* Status Indicator Dot */}
                <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-[#325f3f] dark:group-hover:bg-[#4ade80] group-hover:animate-pulse transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPrep;

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const MockTest = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const questions = [
    { id: 1, q: "What does UUID stand for?", options: ["Universal User ID", "Unique Universal Identifier", "Universally Unique Identifier", "Uniform User Identity"], ans: "C" },
    { id: 2, q: "Which HTTP method is used to create new data?", options: ["GET", "POST", "PUT", "DELETE"], ans: "B" },
    { id: 3, q: "In a job portal, which database relation is correct?", options: ["One job → Many companies", "One company → Many jobs", "Many jobs → One user", "One user → One job only"], ans: "B" },
    { id: 4, q: "Which database is best for structured job data?", options: ["MongoDB", "MySQL", "Redis", "Firebase"], ans: "B" },
    { id: 5, q: "What does status: \"open\" mean in your job table?", options: ["Job is deleted", "Job is filled", "Job is available for applications", "Job is archived"], ans: "C" },
    { id: 6, q: "Which frontend library is commonly used for UI?", options: ["Django", "React", "Node.js", "Express"], ans: "B" },
    { id: 7, q: "What is the purpose of recruiter_id?", options: ["Identify users", "Link job to recruiter", "Store job status", "Store company name"], ans: "B" },
    { id: 8, q: "Which query fetches all jobs?", options: ["DELETE * FROM jobs", "SELECT * FROM jobs", "GET jobs", "FETCH jobs"], ans: "B" },
    { id: 9, q: "What does API stand for?", options: ["Application Programming Interface", "Advanced Program Integration", "Applied Programming Input", "Application Process Interface"], ans: "A" },
    { id: 10, q: "Which status shows company is hiring?", options: ["closed", "inactive", "actively hiring", "pending"], ans: "C" },
    { id: 11, q: "What is normalization in databases?", options: ["Adding more tables randomly", "Reducing redundancy and improving structure", "Deleting data", "Speeding up UI"], ans: "B" },
    { id: 12, q: "Which field stores company logo?", options: ["description", "logo_url", "status", "location"], ans: "B" },
    { id: 13, q: "Which is a backend framework?", options: ["React", "Angular", "Express", "Bootstrap"], ans: "C" },
    { id: 14, q: "What does open_roles: 0 indicate?", options: ["Company closed", "No job openings currently", "Error in data", "Unlimited jobs"], ans: "B" },
    { id: 15, q: "Which format is commonly used for APIs?", options: ["XML only", "JSON", "HTML", "TXT"], ans: "B" }
  ];

  const handleSelect = (questionId, optionIndex) => {
    if (selectedAnswers[questionId]) return; // Prevent re-selection
    
    const optionLetter = String.fromCharCode(65 + optionIndex);
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] min-h-screen flex transition-colors duration-500">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">refresh</span>
              Questions refresh daily
            </span>
          </div>
          <h1 className="text-[40px] font-semibold text-[#1a1c1a] dark:text-white leading-tight mb-3">Daily Mock Test</h1>
          <p className="text-[#5f6368] dark:text-gray-400 text-lg max-w-2xl leading-relaxed">Test your knowledge on placement essentials and industry standards.</p>
        </header>

        <div className="max-w-4xl space-y-8 pb-20">
          {questions.map((q, idx) => (
            <div 
              key={q.id} 
              className="bg-white dark:bg-[#151715] p-8 rounded-[32px] border border-[#e0e0e0] dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-8 fill-mode-both transition-colors duration-500"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex items-start gap-4 mb-6">
                <span className="w-10 h-10 rounded-xl bg-[#325f3f]/10 dark:bg-[#325f3f]/20 text-[#325f3f] dark:text-[#4ade80] flex items-center justify-center font-semibold text-sm">
                   {idx + 1}
                </span>
                <h3 className="text-xl font-semibold text-[#1a1c1a] dark:text-white pt-1">{q.q}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = selectedAnswers[q.id] === letter;
                  const isCorrect = q.ans === letter;
                  const showResult = !!selectedAnswers[q.id];

                  let bgColor = "bg-[#f8f9f8] dark:bg-white/5 hover:bg-[#f0f0f0] dark:hover:bg-white/10";
                  let borderColor = "border-[#f0f0f0] dark:border-white/5";
                  let textColor = "text-[#1a1c1a] dark:text-gray-300";
                  let icon = null;

                  if (showResult) {
                    if (isCorrect) {
                      bgColor = "bg-green-50 dark:bg-green-900/20";
                      borderColor = "border-green-500 dark:border-green-500/50";
                      textColor = "text-green-700 dark:text-green-400";
                      icon = "check_circle";
                    } else if (isSelected) {
                      bgColor = "bg-red-50 dark:bg-red-900/20";
                      borderColor = "border-red-500 dark:border-red-500/50";
                      textColor = "text-red-700 dark:text-red-400";
                      icon = "cancel";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={showResult}
                      onClick={() => handleSelect(q.id, i)}
                      className={`p-5 rounded-2xl border ${borderColor} ${bgColor} ${textColor} text-left transition-all duration-300 flex items-center justify-between group relative overflow-hidden active:scale-[0.98] hover:shadow-md`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${isSelected ? 'bg-current text-white dark:text-black' : 'bg-white dark:bg-white/10 text-[#5f6368] dark:text-gray-400'}`}>
                          {letter}
                        </span>
                        <span className="font-semibold text-[15px]">{opt}</span>
                      </div>
                      {icon && (
                        <span className={`material-symbols-outlined text-[20px] relative z-10`}>{icon}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MockTest;

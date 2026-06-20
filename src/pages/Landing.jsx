import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TextType from "../components/TextType";
import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { insforge } from "../services/api";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Import assets
import heroImage from "../assets/hero-hd.png";
import testimonialImage from "../assets/testimonial-sarah.jpg";
import campusDriveImg from "../assets/campus-drive.png";
import upskillImg from "../assets/career-upskill.png";
import aboutPlatformImg from "../assets/dashboard-ui.png";
import student1 from "../assets/student1.png";
import student2 from "../assets/student2.png";
import student3 from "../assets/student3.png";

/* ── Content Data ────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "Smart Pipeline",
    desc: "Keep all your job applications in one place. Track each step from applying to getting selected.",
    icon: "account_tree",
    accent: "text-blue-600 bg-blue-50",
  },
  {
    title: "Interview Sync",
    desc: "Check your progress throughout the placement process. Understand where you can improve and do better.",
    icon: "event_available",
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Insights",
    desc: "Visualize your progress with data-driven conversion rate insights.",
    icon: "insights",
    accent: "text-indigo-600 bg-indigo-50",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Create Profile",
    desc: "Build your identity with academic records.",
  },
  {
    step: "02",
    title: "Apply Jobs",
    desc: "Browse curated job opportunities.",
  },
  { step: "03", title: "Interview", desc: "Track and prepare effectively." },
  {
    step: "04",
    title: "Get Placed",
    desc: "Receive offers and launch career.",
  },
];

const PARTNERS = [
  "TechCorp",
  "InnoSoft",
  "CloudGen",
  "DataStream",
  "GlobalLink",
];

const Landing = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, students: 0, companies: 0 });

  useEffect(() => {
    // Instant stats from cache
    const cachedStats = localStorage.getItem("pt_landing_stats");
    if (cachedStats) {
      try {
        setStats(JSON.parse(cachedStats));
      } catch (e) {
        console.error("Stats cache error:", e);
      }
    }

    const fetchStats = async () => {
      try {
        const [jobsRes, studentsRes, companiesRes] = await Promise.all([
          insforge.database
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "open"),
          insforge.database
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "student"),
          insforge.database
            .from("companies")
            .select("*", { count: "exact", head: true }),
        ]);

        const newStats = {
          jobs: jobsRes.count || 0,
          students: studentsRes.count || 0,
          companies: companiesRes.count || 0,
        };
        setStats(newStats);
        localStorage.setItem("pt_landing_stats", JSON.stringify(newStats));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // 1. Refresh ScrollTrigger on content load
  useEffect(() => {
    ScrollTrigger.refresh();

    // Individual entrance animations
    const triggers = document.querySelectorAll(".in-view-trigger");

    triggers.forEach((el) => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          delay: parseFloat(el.dataset.delay) || 0,
        },
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="bg-[#fcfdfc] text-slate-900 font-poppins antialiased min-h-screen flex flex-col overflow-x-hidden">
      {/* Background Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse bg-blob-1"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse delay-1000 bg-blob-2"></div>
      </div>

      <main className="flex-grow w-full relative z-10">
        {/* 1. Hero Section */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-[10px] font-semibold uppercase tracking-widest in-view-trigger shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Hiring Season 2026 is LIVE
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-5xl font-semibold  text-slate-900">
              <div className="block">
                Track Your{" "}
                <span className="text-[#67a070]">
                  <TextType
                    text="Placements"
                    typingSpeed={70}
                    pauseDuration={3000}
                  />
                </span>
              </div>
              <div className="block ">
                Master Every{" "}
                <span className="text-[#67a070]">
                  <TextType
                    text=" Interviews"
                    typingSpeed={60}
                    delay={800}
                    pauseDuration={3000}
                  />
                </span>
              </div>
            </h1>

            {/* Dynamic Stats Bar */}
            <div
              className="flex items-center gap-8 py-4 in-view-trigger"
              data-delay="0.2"
            >
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-semibold text-slate-700">
                  {stats.jobs}+
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Active Jobs
                </span>
              </div>
              <div className="w-px h-10 bg-slate-300"></div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-semibold text-slate-700">
                  {stats.students}+
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Students
                </span>
              </div>
              <div className="w-px h-10 bg-slate-300"></div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-semibold text-slate-700">
                  {stats.companies}+
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Companies
                </span>
              </div>
            </div>

            <p
              className="text-base md:text-lg text-slate-500 font-medium max-w-lg leading-relaxed in-view-trigger"
              data-delay="0.3"
            >
              Manage your entire placement journey in one place. From job
              applications to final offers, stay organized, prepared, and ahead.
            </p>

            <div
              className="flex flex-wrap gap-4 pt-2 in-view-trigger"
              data-delay="0.4"
            >
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm animate-glow"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm animate-glow"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3.5 bg-white border-2 border-slate-400 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl animate-float group">
            <div className="absolute inset-0 bg-blue-600/5 mix-blend-multiply z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
            <img
              alt="Students collaborating"
              className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
              src={heroImage}
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
          </div>
        </section>

        {/* 3. Features Section */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-32 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4 in-view-trigger">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 ">
              Everything You Need
            </h2>
            <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed">
              A powerful toolkit designed to streamline your entire recruitment
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-300 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-500 in-view-trigger group overflow-hidden relative"
                data-delay={i * 0.1}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${f.accent} shadow-sm`}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. About PlaceTrack Section - Replaces Spotlight per user request */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-8 in-view-trigger">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-[0.2em] rounded-md">
                About PlaceTrack
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight ">
                One Platform for Complete Placement Management
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed text-base md:text-lg">
                PlaceTrack connects students, placement officers, and recruiters
                on a single platform. It simplifies the entire placement process
                by bringing job opportunities, applications, and interview
                tracking together in one place.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  t: "Triple Connectivity",
                  d: "Students, Officers & Recruiters.",
                  i: "group",
                },
                {
                  t: "Efficient Workflows",
                  d: "Accelerated hiring cycles.",
                  i: "speed",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="material-symbols-outlined text-blue-600 bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-2xl">
                    {item.i}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">
                      {item.t}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[2rem] blur-3xl group-hover:bg-blue-600/10 transition-colors duration-1000"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-300 max-h-[420px]">
              <img
                src={aboutPlatformImg}
                alt="About PlaceTrack"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </section>

        {/* 5. Mission Section - New */}
        <section className="bg-white py-24 md:py-32 relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-20 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6 in-view-trigger">
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-[0.2em] rounded-md">
                Our Mission
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900  leading-tight">
                Defining the Future of Campus Placements
              </h2>
              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed">
                We are building the bridge between academic excellence and
                professional success through three core pillars.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  t: "Empower Students",
                  d: "Help students stay organized, track progress, and prepare better for placements.",
                  i: "auto_awesome",
                  c: "bg-blue-50 text-blue-600",
                },
                {
                  t: "Support ",
                  d: "Provide tools to manage students, companies, and placement drives efficiently.",
                  i: "admin_panel_settings",
                  c: "bg-indigo-50 text-indigo-600",
                },
                {
                  t: "Connect Recruiters",
                  d: "Enable companies to find the right candidates quickly and manage hiring seamlessly.",
                  i: "handshake",
                  c: "bg-emerald-50 text-emerald-600",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 in-view-trigger border border-slate-300 hover:border-slate-400"
                  data-delay={i * 0.15}
                >
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center ${m.c} shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <span className="material-symbols-outlined text-4xl">
                      {m.i}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                      {m.t}
                    </h3>
                    <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed">
                      {m.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Process Section */}
        <section className="bg-slate-50 py-24 md:py-32 w-full border-y border-slate-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-20 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-4 in-view-trigger">
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 ">
                Your Path to Placement
              </h2>
              <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed">
                A clear, automated journey designed to take the stress out of
                your career launch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROCESS.map((step, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-[2.5rem] border border-slate-300 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 group relative overflow-hidden in-view-trigger"
                  data-delay={i * 0.15}
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/10 group-hover:bg-blue-600 transition-colors duration-500"></div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center text-xl mb-8 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>
                  <h4 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                    {step.title}
                  </h4>
                  <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Redesigned Testimonials Section - Enhanced with Glow & Unique Images */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-12 in-view-trigger">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 ">
              Success Stories
            </h2>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Join the ranks of successful students who launched their careers
              here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote:
                  "PlaceTrack helped me stay focused throughout my placement season. Tracking applications was a breeze.",
                author: "Sarah Jenkins",
                role: "Software Engineer @ Google",
                dept: "Computer Science",
                img: student2,
                color: "rose",
                accent: "bg-rose-600/5",
                iconBg: "bg-rose-50",
                iconText: "text-rose-600",
                glow: "group-hover:shadow-[0_0_30px_-5px_rgba(225,29,72,0.3)]",
                border: "group-hover:border-rose-200",
                nameColor: "text-rose-600",
                gradient: "from-rose-600",
              },
              {
                quote:
                  "The interview tracking tools are top-notch. I felt much more confident going into my technical rounds.",
                author: "Arjun Mehta",
                role: "Product Analyst @ Microsoft",
                dept: "Information Technology",
                img: student3,
                color: "cyan",
                accent: "bg-cyan-600/5",
                iconBg: "bg-cyan-50",
                iconText: "text-cyan-600",
                glow: "group-hover:shadow-[0_0_30px_-5px_rgba(8,145,178,0.3)]",
                border: "group-hover:border-cyan-200",
                nameColor: "text-cyan-600",
                gradient: "from-cyan-600",
              },
              {
                quote:
                  "Managing 20+ applications was a nightmare until I found PlaceTrack. It's an essential tool for every student.",
                author: "Priya Sharma",
                role: "Data Scientist @ Meta",
                dept: "Data Science",
                img: student1,
                color: "amber",
                accent: "bg-amber-600/5",
                iconBg: "bg-amber-50",
                iconText: "text-amber-600",
                glow: "group-hover:shadow-[0_0_30px_-5px_rgba(217,119,6,0.3)]",
                border: "group-hover:border-amber-200",
                nameColor: "text-amber-600",
                gradient: "from-amber-600",
              },
            ].map((q, i) => (
              <div
                key={i}
                className={`group relative bg-white rounded-[2rem] p-8 border border-slate-300 shadow-sm transition-all duration-500 in-view-trigger overflow-hidden ${q.border} ${q.glow} hover:-translate-y-2`}
                data-delay={i * 0.2}
              >
                {/* Background Accent */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 ${q.accent} rounded-full -mr-12 -mt-12 blur-xl group-hover:scale-150 transition-transform duration-700`}
                ></div>

                <div className="relative z-10 space-y-6">
                  <div
                    className={`w-10 h-10 rounded-xl ${q.iconBg} ${q.iconText} flex items-center justify-center transition-transform group-hover:rotate-12 duration-500`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      format_quote
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium leading-relaxed italic text-base transition-colors group-hover:text-slate-900">
                    “{q.quote}”
                  </p>

                  <div className="flex items-center gap-4 pt-5 border-t border-slate-200 group-hover:border-slate-300 transition-colors">
                    <div className="relative shrink-0">
                      <div
                        className={`absolute -inset-1 bg-gradient-to-tr ${q.gradient} to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm`}
                      ></div>
                      <img
                        alt={q.author}
                        className="w-12 h-12 rounded-full object-cover relative z-10 border-2 border-white shadow-sm"
                        src={q.img}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold transition-colors ${q.nameColor}`}
                      >
                        {q.author}
                      </div>
                      <div className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider mb-0.5 truncate">
                        {q.role}
                      </div>
                      <div className="text-slate-400 font-semibold text-[8px] uppercase tracking-widest truncate">
                        {q.dept}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-24 text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 ">
            Ready to Launch Your Career?
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
            Join thousands of students who have streamlined their recruitment
            journey.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex px-10 py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all text-sm animate-glow"
            >
              Join the Portal Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;

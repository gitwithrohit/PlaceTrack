import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { insforge } from "../services/api";
import logo from "../assets/logo.png";

/* Build role-aware nav links for authenticated users */
const buildAuthLinks = (role) => [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  ...(role === "student"
    ? [
        { to: "/applications", label: "Applications" },
        { to: "/interviews", label: "Interviews" },
        { to: "/resources", label: "Resources" },
      ]
    : []),
  ...(role === "recruiter" ? [{ to: "/interviews", label: "Interviews" }] : []),
];

const Navbar = () => {
  const { user, role, logout, loading } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);

  const navLinks = user ? buildAuthLinks(role) : [];

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const { data } = await insforge.database
          .from("notifications")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_read", false);
        setUnreadCount(data?.length || 0);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Sync theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < 10) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = (user?.user_metadata?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 px-4 md:px-8 py-4 pointer-events-none transition-transform duration-500 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="max-w-[1440px] mx-auto pointer-events-auto">
        <div className="bg-white/80 dark:bg-[#1a1c1a]/80 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-[28px] shadow-sm h-16 px-6 flex items-center justify-between transition-all duration-300">
          {/* Left: Branding */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="group flex items-center gap-3 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out will-change-transform"
            >
              <div className="relative">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain rounded-full transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-110 relative z-10 will-change-transform"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center tracking-tighter">
                <span className="text-2xl font-bold text-[#67a070] transition-all duration-500 group-hover:tracking-widest">
                  Place
                </span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white sm:ml-0.5 transition-all duration-500 group-hover:opacity-100 opacity-80 group-hover:translate-x-1">
                  Track
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Clean Nav Links */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            {navLinks.map((link) => {
              const isActive =
                link.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-white bg-[#325f3f] shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Notification & Profile */}
          <div className="flex items-center gap-3" ref={profileRef}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-400 group-hover:text-[#325f3f]">
                {isDarkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Notification Bell */}
            {user && (
              <Link
                to="/notifications"
                className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-400 group-hover:text-[#325f3f]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#1a1c1a]"></span>
                )}
              </Link>
            )}

            {!loading && user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 p-1 pr-3 rounded-2xl border transition-all duration-200 ${
                    isProfileOpen
                      ? "bg-[#325f3f] border-[#325f3f] text-white"
                      : "bg-slate-100 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/50">
                    <img
                      src={`https://ui-avatars.com/api/?name=${initials}&background=67a070&color=fff&bold=true`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  >
                    keyboard_arrow_down
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-[#1a1c1a]/95 backdrop-blur-2xl rounded-[28px] shadow-modal border border-white/40 dark:border-white/10 py-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-6 py-4 border-b border-slate-500/10 mb-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-base">
                        {user?.user_metadata?.name || "User"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate tracking-wider uppercase opacity-60">
                        {user?.email}
                      </p>
                    </div>

                    <div className="px-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#325f3f] hover:text-white rounded-2xl transition-all group/item"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-500/5 group-hover/item:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[20px]">
                            person
                          </span>
                        </div>
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-[#325f3f] hover:text-white rounded-2xl transition-all group/item"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-500/5 group-hover/item:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[20px]">
                            settings
                          </span>
                        </div>
                        Settings
                      </Link>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-500/10 px-2">
                      <button
                        onClick={logout}
                        className="flex items-center gap-4 w-full px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all group/logout"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-500/5 group-hover/logout:bg-white/10 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[20px]">
                            logout
                          </span>
                        </div>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

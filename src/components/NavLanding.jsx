import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const NavLanding = () => {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Background change
      setIsScrolled(currentScrollY > 20);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12 py-4 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-glass border-b border-slate-100'
        : 'bg-transparent'
        } ${isVisible ? 'translate-y-0' : '-translate-y-full opacity-0'}`}
    >
      <div className="max-w-[1400px] mx-auto flex justify-between items-center h-16 bg-white/40 backdrop-blur-md rounded-2xl px-6 border border-white/30 shadow-sm transition-all duration-500 hover:shadow-md">

        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-4 group transition-transform hover:scale-105 active:scale-95">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain rounded-full transition-transform group-hover:rotate-6 duration-500" />
            <span className="text-xl md:text-3xl font-semibold flex items-center">
              <span className="text-[#67a070]">Place</span>
              <span className="text-[#000000] ml-0.5">Track</span>
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <Link to="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all text-sm">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3 md:gap-6">
                <Link to="/login" className="text-sm font-semibold px-6 py-2.5 bg-white border-2 border-slate-400 rounded-xl text-slate-700 hover:text-[#67a070] transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                >
                  Sign up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavLanding;

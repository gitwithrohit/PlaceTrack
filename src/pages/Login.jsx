import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error, role: fetchedRole } = await login(email, password);
      if (error) {
        if (error.message?.includes("Email not confirmed") || error.status === 403) {
          toast.error("Account not verified. Please check your email or verify your OTP.");
          return;
        }
        throw error;
      }
      
      const roleLabel = fetchedRole === 'recruiter' ? 'Company' : (fetchedRole ? fetchedRole.charAt(0).toUpperCase() + fetchedRole.slice(1) : 'User');
      toast.success(`Successfully logged in as ${roleLabel}!`, { duration: 3000 });
      
      // Small delay to ensure toast shows but doesn't get stuck on next page
      setTimeout(() => {
        toast.dismiss();
        if (fetchedRole === 'admin') {
          navigate("/admin/dashboard");
        } else if (fetchedRole === 'recruiter') {
          navigate("/company/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const { error } = await loginWithOAuth(provider);
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || "Failed to initialize OAuth");
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6 font-body-md text-body-md antialiased relative overflow-hidden transition-colors duration-700 bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up relative z-10">
        <div className="p-8 pt-6 flex flex-col items-center">
          <div className="w-20 h-20 mb-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group hover:scale-110 transition-transform duration-500 overflow-hidden">
            <img 
              alt="PlaceTrack Logo" 
              className="w-full h-full object-contain scale-[1.3] group-hover:scale-[1.4] transition-transform duration-500" 
              src={logo} 
            />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 text-center mb-1 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-base text-center font-medium">
            Log in to your account
          </p>
        </div>

        <div className="p-8 pt-0">
          <div className="space-y-3 mb-6">
            {["google", "github"].map((provider, i) => (
              <button
                key={provider}
                onClick={() => handleOAuth(provider)}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-300 font-semibold text-slate-700 capitalize animate-fade-in-up text-sm"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                {provider === "google" ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.69-2.28 1.1-3.71 1.1-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.14c-.22-.69-.35-1.43-.35-2.14s.13-1.45.35-2.14V7.02H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.98l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.02l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#181717"></path>
                  </svg>
                )}
                Continue with {provider}
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-4 bg-white text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
              OR
            </span>
          </div>

          <form className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }} onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-2xl">
                  mail
                </span>
                <input
                  className="w-full py-3 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-300 text-base"
                  id="email"
                  placeholder="name@university.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link 
                  to="/reset-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-2xl">
                  lock
                </span>
                <input
                  className="w-full py-3 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-300 text-base"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                id="remember"
                type="checkbox"
              />
              <label className="text-sm font-medium text-slate-500 cursor-pointer" htmlFor="remember">
                Keep me logged in
              </label>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group mt-2 text-base"
              type="submit"
            >
              {loading ? "Logging in..." : "Sign In"}
              {!loading && <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-50 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?
              <Link className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all ml-1" to="/signup">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

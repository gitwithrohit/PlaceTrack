import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, sendResetPasswordEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const status = searchParams.get("insforge_status");
  const errorParam = searchParams.get("insforge_error");

  useEffect(() => {
    if (status === "error") {
      toast.error(errorParam || "Invalid or expired reset link.");
    }
  }, [status, errorParam]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await sendResetPasswordEmail(email);
      if (error) throw error;
      toast.success("Reset link sent! Please check your email.");
    } catch (error) {
      console.error("Request reset error:", error);
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(newPassword, token);
      if (error) throw error;
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h2>
          <p className="text-slate-600 mb-8">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate("/reset-password")}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6 font-body-md text-body-md antialiased relative overflow-hidden transition-colors duration-700 bg-slate-50">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 p-8 animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group hover:scale-110 transition-transform duration-500 overflow-hidden">
            <img alt="Logo" className="w-full h-full object-contain scale-[1.3]" src={logo} />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 text-center mb-1 tracking-tight">
            {token ? "New Password" : "Forgot Password"}
          </h1>
          <p className="text-slate-500 text-center font-medium">
            {token ? "Set your new account password" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {token ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 ml-1">New Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-2xl">
                  lock
                </span>
                <input
                  className="w-full py-3 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-300 text-base"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-2xl">
                  lock_reset
                </span>
                <input
                  className="w-full py-3 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-300 text-base"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group mt-2 text-base disabled:opacity-50"
              type="submit"
            >
              {loading ? "Resetting..." : "Update Password"}
              {!loading && <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-2xl">
                  mail
                </span>
                <input
                  className="w-full py-3 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-300 text-base"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group mt-2 text-base disabled:opacity-50"
              type="submit"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

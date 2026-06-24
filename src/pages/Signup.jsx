import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, verifyOTP, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (role === 'admin') {
      toast.error('Admin registration is closed.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await signup(email, password, role, name);
      if (data?.requireEmailVerification) {
        setShowOtp(true);
        toast.success('Please check your email for the OTP!');
      } else {
        toast.success('Account created successfully!');
        const target = role === 'admin' ? '/admin/dashboard' : role === 'recruiter' ? '/company/dashboard' : '/dashboard';
        navigate(target);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await verifyOTP(email, otp);
      if (error) throw error;
      toast.success('Email verified successfully!');
      const pendingRole = localStorage.getItem('cp_pending_role');
      if (pendingRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (pendingRole === 'recruiter') {
        navigate('/company/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const { error } = await loginWithOAuth(provider);
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || 'Failed to initialize OAuth');
    }
  };

  if (showOtp) {
    return (
      <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-gutter pt-16">
        <main className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-sand shadow-ambient-sm p-lg">
          <div className="flex flex-col items-center mb-lg">
            <h1 className="font-h2 text-h2 text-on-surface mb-xs">Verify your email</h1>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">We sent a 6-digit code to {email}</p>
          </div>
          <form className="space-y-md" onSubmit={handleOtpSubmit}>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface mb-sm" htmlFor="otp">Verification Code</label>
              <input
                type="text"
                required
                className="form-input text-center tracking-widest text-lg h-14"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="000000"
              />
            </div>
            <button disabled={loading || otp.length < 6} className="btn-primary w-full mt-4" type="submit">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  const getRoleTheme = () => {
    switch (role) {
      case 'admin': return { bg: 'bg-indigo-50', glow: 'bg-indigo-600/10', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'recruiter': return { bg: 'bg-emerald-50', glow: 'bg-emerald-600/10', text: 'text-emerald-600', border: 'border-emerald-100' };
      default: return { bg: 'bg-blue-50', glow: 'bg-blue-600/10', text: 'text-blue-600', border: 'border-blue-100' };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 font-body-md text-body-md antialiased relative overflow-hidden transition-colors duration-700 ${theme.bg}`}>
      {/* Dynamic Background Decor */}
      <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse transition-colors duration-700 ${theme.glow}`}></div>
      <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse transition-colors duration-700 ${theme.glow}`} style={{ animationDelay: '2s' }}></div>

      <main className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 overflow-hidden animate-fade-in-up relative z-10 my-4">
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 mb-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group hover:scale-110 transition-transform duration-500 overflow-hidden">
            <img
              alt="PlaceTrack Logo"
              className="w-full h-full object-contain scale-[1.3] group-hover:scale-[1.4] transition-transform duration-500"
              src={logo}
            />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 text-center mb-1 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-base text-center font-medium">Join as a <span className={`font-semibold transition-colors duration-300 ${theme.text}`}>{role === 'recruiter' ? 'Company' : role}</span></p>
        </div>

        <div className="flex p-1 bg-slate-50 rounded-xl mb-6 border border-slate-100 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {['student', 'recruiter'].map((r) => (
            <button
              key={r}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 capitalize ${role === r ? `bg-white shadow-sm ${theme.text}` : 'text-slate-500 hover:text-slate-700'}`}
              type="button"
              onClick={() => setRole(r)}
            >
              {r === 'recruiter' ? 'Company' : r}
            </button>
          ))}
        </div>

        <form className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }} onSubmit={handleSignupSubmit}>
          {[
            { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Jane Doe', val: name, set: setName, icon: 'person' },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com', val: email, set: setEmail, icon: 'mail' },
            { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', val: password, set: setPassword, min: 6, icon: 'lock' }
          ].map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700 ml-1" htmlFor={field.id}>{field.label}</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${theme.text} transition-colors text-2xl`}>
                  {field.icon}
                </span>
                <input
                  className="w-full py-3 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all duration-300 text-base"
                  id={field.id}
                  placeholder={field.placeholder}
                  type={field.type}
                  value={field.val}
                  onChange={(e) => field.set(e.target.value)}
                  minLength={field.min}
                  required
                />
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 ml-1 pt-1">
            <input className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 cursor-pointer mt-0.5" id="terms" type="checkbox" required />
            <label className="text-sm font-medium text-slate-500 cursor-pointer leading-tight" htmlFor="terms">
              I agree to the <Link className="text-blue-600 font-semibold hover:underline" to="#">Terms</Link> and <Link className="text-blue-600 font-semibold hover:underline" to="#">Privacy</Link>
            </label>
          </div>

          <button
            disabled={loading}
            className={`w-full text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-2 text-base ${role === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : role === 'recruiter' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
            type="submit"
          >
            {loading ? 'Creating...' : 'Create Account'}
            {!loading && <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-50 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-slate-500 font-medium">
            Already have an account? <Link className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all ml-1" to="/login">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;

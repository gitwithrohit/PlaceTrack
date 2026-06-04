import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';

const CompleteProfile = () => {
  const { user, role, setRole } = useAuth();
  const [roleInput, setRoleInput] = useState(role || null);
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [university, setUniversity] = useState('');
  const [gpa, setGpa] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keep roleInput in sync with the role from context if it changes
  useEffect(() => {
    if (role) {
      setRoleInput(role);
      // If they are not a student, they shouldn't even be on this page filling out uni info
      if (role !== 'student') {
        navigate('/dashboard');
      }
    } else if (user) {
      insforge.database.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role) {
            setRoleInput(data.role);
            if (data.role !== 'student') navigate('/dashboard');
          }
        });
    }
  }, [role, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await insforge.database.from('profiles').upsert([
        { 
          id: user.id, 
          role: roleInput || role, // Ensure we use a role
          email: user.email, 
          name: name,
          university,
          gpa,
          graduation_year: parseInt(gradYear) || null
        }
      ]);
      
      if (error) throw error;
      
      setRole(roleInput || role);
      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null; // Let AppRoutes handle loading

  // If we know the role and it's not student, we are already redirecting in useEffect
  // but just in case:
  if (roleInput && roleInput !== 'student') return null;

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-gutter font-body-md text-body-md antialiased">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-ambient-sm border border-sand overflow-hidden">
        
        {/* Header Section */}
        <div className="p-lg pt-xl flex flex-col items-center border-b border-sand text-center">
          <img alt="Logo" className="w-20 h-20 mb-md" src={logo} />
          <h1 className="font-h2 text-h2 text-on-surface mb-sm">Almost There!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px]">
            Please provide your academic details to complete your student profile.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-lg">
          <form className="space-y-md" onSubmit={handleSubmit}>
            
            {/* Full Name Input */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface mb-sm" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="form-input-icon-left"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-md">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface mb-sm" htmlFor="university">
                  University / College
                </label>
                <input
                  id="university"
                  type="text"
                  required
                  placeholder="State University"
                  className="form-input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface mb-sm" htmlFor="gpa">
                    Current GPA
                  </label>
                  <input
                    id="gpa"
                    type="text"
                    required
                    placeholder="3.8/4.0"
                    className="form-input"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface mb-sm" htmlFor="gradYear">
                    Graduation Year
                  </label>
                  <input
                    id="gradYear"
                    type="number"
                    required
                    placeholder="2025"
                    className="form-input"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-sm">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
                <span className="material-symbols-outlined icon-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CompleteProfile;

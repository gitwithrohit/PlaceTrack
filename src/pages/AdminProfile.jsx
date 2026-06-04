import React, { useEffect, useState, useRef } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import gsap from 'gsap';

const AdminProfile = () => {
  const { user, userData, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    avatar_url: ''
  });

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(".animate-item", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const loadingToast = toast.loading('Saving changes...');
    try {
      const updateData = {
        name: form.name,
        location: form.location,
        bio: form.bio,
        avatar_url: form.avatar_url
      };

      const { error } = await insforge.database
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully!', { id: loadingToast });
      setProfile({ ...profile, ...updateData });
      setEditing(false);
    } catch (err) {
      console.error('Admin save error:', err);
      toast.error('Failed to update profile', { id: loadingToast });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading('Updating photo...');
    try {
      const bucket = 'avatars';
      const fileName = `admin-${user.id}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

      const { error: uploadError } = await insforge.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const fileUrl = `${insforge.config.baseUrl}/api/storage/buckets/${bucket}/objects/${fileName}`;

      setForm(prev => ({ ...prev, avatar_url: fileUrl }));

      await insforge.database.from('profiles').update({ avatar_url: fileUrl }).eq('id', user.id);
      await refreshProfile();

      toast.success('Photo updated!', { id: loadingToast });
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed: ' + err.message, { id: loadingToast });
    }
  };

  if (loading) return <PageSkeleton />;

  const displayName = form.name || userData?.name || 'Administrator';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-poppins antialiased text-slate-900">
      <Toaster position="top-right" />
      <AdminNavbar />

      <main ref={containerRef} className="max-w-[1400px] mx-auto w-full p-6 lg:p-10 flex flex-col gap-10">
        
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-item">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 ">Admin Profile</h1>
            <p className="text-slate-500 font-medium text-lg">Manage your identity and system preferences.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => setEditing(!editing)}
              className={`px-6 py-3 rounded-xl text-[14px] font-bold transition-all shadow-sm flex items-center gap-2 ${
                editing 
                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{editing ? 'close' : 'edit'}</span>
              {editing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Premium Profile Summary */}
          <div className="lg:col-span-4 space-y-8 animate-item">
            <div className="bg-white rounded-3xl p-10 border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="relative group mb-8">
                <div className="w-40 h-40 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-5xl font-bold border-8 border-white shadow-xl overflow-hidden transition-transform group-hover:scale-[1.02]">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-300">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-12 h-12 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all text-indigo-600 hover:bg-indigo-50"
                >
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="space-y-1 mb-8">
                <h2 className="text-3xl font-bold text-slate-900 ">{displayName}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  System Administrator
                </div>
              </div>

              <div className="w-full space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 text-left p-4 bg-slate-50/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                    <span className="material-symbols-outlined text-xl">alternate_email</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{form.email || user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left p-4 bg-slate-50/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office Base</p>
                    <p className="text-sm font-bold text-slate-700">{form.location || 'Not Set'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                <span className="material-symbols-outlined text-9xl">security</span>
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-400 text-2xl">verified_user</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Elevated Access</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">Your account has full read/write permissions for all system modules including User Management and Global Configuration.</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Root', 'Config', 'Audit'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-white/5">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Refined Form */}
          <div className="lg:col-span-8 space-y-10 animate-item">
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Account Details</h3>
                  {editing && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-amber-100 animate-pulse">Unsaved Changes</span>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                      <input
                        disabled={!editing}
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-60 disabled:bg-slate-50/50"
                        placeholder="Administrator Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Location</label>
                      <input
                        disabled={!editing}
                        type="text"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-60 disabled:bg-slate-50/50"
                        placeholder="e.g. Headquarters, Block A"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-1">Administrative Bio</label>
                    <textarea
                      disabled={!editing}
                      rows="5"
                      value={form.bio}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none disabled:opacity-60 disabled:bg-slate-50/50"
                      placeholder="Describe your responsibilities..."
                    ></textarea>
                  </div>

                  {editing && (
                    <div className="pt-6 flex justify-end">
                      <button
                        type="submit"
                        className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        Push Changes
                      </button>
                    </div>
                  )}
                </form>

                {!editing && (
                  <div className="mt-20 pt-10 border-t border-slate-100">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Security & Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button
                        onClick={() => navigate('/admin/settings', { state: { tab: 'security' } })}
                        className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-200/60 rounded-3xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group w-full"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-indigo-600 transition-colors">
                            <span className="material-symbols-outlined text-2xl">lock</span>
                          </div>
                          <div className="text-left">
                            <p className="text-[16px] font-bold text-slate-900">Change Password</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Update security keys</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                      </button>

                      <button
                        onClick={() => navigate('/admin/settings', { state: { tab: 'notifications' } })}
                        className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-200/60 rounded-3xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group w-full"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-indigo-600 transition-colors">
                            <span className="material-symbols-outlined text-2xl">notifications_active</span>
                          </div>
                          <div className="text-left">
                            <p className="text-[16px] font-bold text-slate-900">Alert Center</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Manage system signals</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-100 py-10 px-8 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <p>© 2024 PlaceTrack Unified Admin</p>
          <div className="flex gap-10">
            <button className="hover:text-indigo-600 transition-colors">Compliance</button>
            <button className="hover:text-indigo-600 transition-colors">Audit Logs</button>
            <button className="hover:text-indigo-600 transition-colors">System Health</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminProfile;

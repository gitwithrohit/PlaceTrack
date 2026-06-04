import { useState, useEffect, useRef } from 'react';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';

const CompanySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const blobsRef = useRef([]);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    university: '', 
    bio: '',
    location: '',
    avatar_url: ''
  });

  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

  const [notifs, setNotifs] = useState({
    email: true,
    visibility: true
  });

  useEffect(() => {
    // Parallax effect for background blobs
    const handleMouseMove = (e) => {
       const { clientX, clientY } = e;
       const x = (clientX / window.innerWidth - 0.5) * 20;
       const y = (clientY / window.innerHeight - 0.5) * 20;

       if (blobsRef.current[0]) blobsRef.current[0].style.transform = `translate(${x * -2}px, ${y * -2}px)`;
       if (blobsRef.current[1]) blobsRef.current[1].style.transform = `translate(${x * 1.5}px, ${y * 1.5}px)`;
       if (blobsRef.current[2]) blobsRef.current[2].style.transform = `translate(${x * -1}px, ${y * -1}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await insforge.database
          .from('profiles')
          .select('id, name, email, university, bio, location, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (data) setProfile(data);
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await insforge.database
        .from('profiles')
        .update({
          name: profile.name,
          university: profile.university,
          bio: profile.bio,
          location: profile.location,
          avatar_url: profile.avatar_url
        })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success("Settings updated successfully!");
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading("Updating brand assets...");
    try {
      const fileName = `${user.id}-${Date.now()}`;
      const { error } = await insforge.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = insforge.storage.from('avatars').getPublicUrl(fileName);
      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Logo updated!", { id: toastId });
    } catch (e) {
      toast.error("Upload failed", { id: toastId });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords don't match");
    }
    setChangingPassword(true);
    try {
      const { error } = await insforge.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      toast.success("Security credentials updated!");
      setPasswords({ new: '', confirm: '' });
    } catch (e) {
      toast.error("Security update failed");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0a0a0a] min-h-screen flex flex-col antialiased text-[#111827] dark:text-gray-100 transition-colors duration-500 overflow-hidden relative">
      <Toaster position="top-right" 
         toastOptions={{
            style: {
               background: '#333',
               color: '#fff',
               borderRadius: '16px',
               fontSize: '12px',
               fontWeight: 'bold',
               zIndex: 10001
            }
         }}
      />

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div ref={el => blobsRef.current[0] = el} className="absolute -top-[10%] -left-[5%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen transition-transform duration-1000 ease-out"></div>
         <div ref={el => blobsRef.current[1] = el} className="absolute top-[20%] -right-[10%] w-[35vw] h-[35vw] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen transition-transform duration-1000 ease-out"></div>
         <div ref={el => blobsRef.current[2] = el} className="absolute -bottom-[10%] left-[20%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen transition-transform duration-1000 ease-out"></div>
      </div>

      <RecruiterNavbar />
      
      <main className="relative z-10 max-w-[1200px] mx-auto w-full px-6 lg:px-12 pt-36 pb-24">
        
        {/* Premium Header */}
        <header className="mb-12 animate-fade-in-up">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/20 rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-sm text-blue-500">settings</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-gray-300 uppercase tracking-widest">Configuration Console</span>
                 </div>
                 <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tightest leading-tight">Control Center</h1>
                    <p className="text-lg font-bold text-slate-600 dark:text-gray-400 mt-2 max-w-xl">Manage your organization's presence and security credentials.</p>
                 </div>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Left Side: Main Settings */}
           <div className="lg:col-span-8 space-y-8 animate-fade-in-up delay-100">
              
              {/* Identity Section */}
              <section className="bg-white dark:bg-[#151515] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-700">
                 <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <span className="material-symbols-outlined">business</span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Organization Profile</h3>
                    </div>
                 </div>
                 
                 <div className="p-10">
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-12 pb-12 border-b border-slate-100 dark:border-white/5">
                       <div className="relative group/avatar">
                          <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white dark:border-[#0a0a0a] shadow-2xl bg-slate-50 dark:bg-white/5 group-hover/avatar:scale-110 group-hover/avatar:rotate-6 transition-all duration-700">
                             <img 
                                src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.university || profile.name || 'C'}`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                             />
                          </div>
                          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-all duration-300 z-10">
                             <span className="material-symbols-outlined text-lg">edit</span>
                             <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                          </label>
                          <div className="absolute inset-0 bg-blue-600/20 rounded-[32px] opacity-0 group-hover/avatar:opacity-100 blur transition-opacity duration-500"></div>
                       </div>
                       <div className="text-center md:text-left space-y-1">
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{profile.university || 'Company Name'}</h4>
                          <p className="text-sm font-bold text-slate-500 dark:text-gray-400">Verified Recruitment Partner</p>
                          <div className="flex gap-2 mt-4 justify-center md:justify-start">
                             <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
                             <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Verified</span>
                          </div>
                       </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">Lead Administrator</label>
                             <input 
                               type="text" 
                               value={profile.name}
                               onChange={(e) => setProfile({...profile, name: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                               placeholder="Admin Name"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">Account Email</label>
                             <input 
                               type="email" 
                               readOnly
                               value={profile.email}
                               className="w-full px-6 py-4 bg-slate-100 dark:bg-[#050505] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed opacity-60" 
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">Company Name</label>
                             <input 
                               type="text" 
                               value={profile.university}
                               onChange={(e) => setProfile({...profile, university: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                               placeholder="e.g. Acme Corp"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">Office Headquarters</label>
                             <input 
                               type="text" 
                               value={profile.location}
                               onChange={(e) => setProfile({...profile, location: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                               placeholder="e.g. London, UK"
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">Professional Bio</label>
                          <textarea 
                            rows="4"
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-[24px] text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all resize-none shadow-inner"
                            placeholder="Share your company's mission and vision..."
                          ></textarea>
                       </div>

                       <div className="flex justify-end pt-4">
                          <button 
                            type="submit" 
                            disabled={saving}
                            className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20 dark:hover:shadow-white/10 active:scale-95 disabled:opacity-50"
                          >
                             {saving ? 'Syncing...' : 'Update Identity'}
                          </button>
                       </div>
                    </form>
                 </div>
              </section>

              {/* Security Section */}
              <section className="bg-white dark:bg-[#151515] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700 animate-fade-in-up delay-200">
                 <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white/10 flex items-center justify-center text-white dark:text-white">
                       <span className="material-symbols-outlined">security</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Security Credentials</h3>
                 </div>
                 <div className="p-10">
                    <form onSubmit={handlePasswordChange} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">New Access Code</label>
                             <input 
                               type="password" 
                               value={passwords.new}
                               onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                               placeholder="••••••••"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-4">Re-confirm Code</label>
                             <input 
                               type="password" 
                               value={passwords.confirm}
                               onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                               className="w-full px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
                               placeholder="••••••••"
                             />
                          </div>
                       </div>
                       <div className="flex justify-end pt-4">
                          <button 
                            type="submit" 
                            disabled={changingPassword}
                            className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                             {changingPassword ? 'Securing...' : 'Rotate Password'}
                          </button>
                       </div>
                    </form>
                 </div>
              </section>
           </div>

           {/* Right Side: Configuration Sidebar */}
           <div className="lg:col-span-4 space-y-8 animate-fade-in-up delay-300">
              
              {/* Preferences Section */}
              <section className="bg-white dark:bg-[#151515] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm p-10 transition-all hover:shadow-2xl group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
                 <h3 className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Communication Prefs
                 </h3>
                 <div className="space-y-8">
                    {[
                      { key: 'email', label: 'Email Dispatch', desc: 'Real-time candidate alerts', icon: 'alternate_email' },
                      { key: 'visibility', label: 'Market Visibility', desc: 'Show profile to talent pool', icon: 'hub' }
                    ].map((item) => (
                       <div key={item.key} className="flex items-center justify-between group/item">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/item:text-blue-500 transition-all shadow-inner">
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.label}</p>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold mt-1 tracking-tight">{item.desc}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => setNotifs(prev => ({...prev, [item.key]: !prev[item.key]}))}
                            className={`w-12 h-7 rounded-full relative transition-all duration-500 ${notifs[item.key] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'}`}
                          >
                             <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-sm ${notifs[item.key] ? 'left-[26px]' : 'left-1.5'}`}></div>
                          </button>
                       </div>
                    ))}
                 </div>
              </section>

              {/* Status Banner */}
              <div className="bg-slate-900 dark:bg-white rounded-[40px] p-10 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-slate-900/10 flex items-center justify-center mb-6">
                       <span className="material-symbols-outlined text-white dark:text-slate-900">verified_user</span>
                    </div>
                    <h4 className="text-xl font-black tracking-tight mb-2">Verified Partner</h4>
                    <p className="text-[11px] font-bold opacity-70 leading-relaxed mb-10">
                       Your organization has established trust status. Your job postings will prioritize in talent searches.
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-black bg-white/10 dark:bg-slate-900/5 w-fit px-5 py-2.5 rounded-2xl border border-white/10 dark:border-slate-900/10 uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                       Global Trusted
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
              </div>

              {/* Termination Zone */}
              <section className="bg-rose-500/5 dark:bg-rose-500/5 rounded-[40px] p-10 border border-rose-500/20 group hover:bg-rose-500/10 transition-all duration-500">
                 <h4 className="text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest mb-2">Sensitive Operations</h4>
                 <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold mb-8 leading-relaxed">Deactivating your account will scrub all recruitment data from our servers. This is irreversible.</p>
                 <button className="w-full py-4 bg-white dark:bg-[#0a0a0a] border border-rose-500/30 text-rose-600 text-[11px] font-black rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest">
                    Deactivate Org
                 </button>
              </section>
           </div>

        </div>
      </main>
    </div>
  );
};

export default CompanySettings;

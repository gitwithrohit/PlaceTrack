import { useState, useEffect } from 'react';
import { insforge } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';

const CompanyProfile = () => {
   const { user } = useAuth();
   const [profile, setProfile] = useState({
      name: '',
      email: '',
      university: '',
      bio: '',
      location: '',
      avatar_url: '',
      role: 'recruiter'
   });
   const [loading, setLoading] = useState(true);
   const [isEditing, setIsEditing] = useState(false);
   const [saving, setSaving] = useState(false);

   const fetchCompanyProfile = async () => {
      if (!user?.id) return;
      try {
         const { data, error } = await insforge.database
            .from('profiles')
            .select('id, name, email, university, bio, location, avatar_url, role')
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

   useEffect(() => {
      fetchCompanyProfile();
   }, [user]);

   const handleSave = async () => {
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
         toast.success("Profile saved");
         setIsEditing(false);
         fetchCompanyProfile();
      } catch (e) {
         toast.error("Error saving");
      } finally {
         setSaving(false);
      }
   };

   const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const toastId = toast.loading("Processing...");
      try {
         const fileName = `${user.id}-${Date.now()}`;
         const { error } = await insforge.storage.from('avatars').upload(fileName, file);
         if (error) throw error;
         const { data: { publicUrl } } = insforge.storage.from('avatars').getPublicUrl(fileName);
         setProfile({ ...profile, avatar_url: publicUrl });
         toast.success("Branding updated!", { id: toastId });
      } catch (e) {
         toast.error("Upload error", { id: toastId });
      }
   };

   if (loading) return <PageSkeleton />;

   const companyName = profile.university || 'Organization Name';

   return (
      <div className="bg-[#fcfdfc] min-h-screen flex flex-col antialiased text-[#0f172a] overflow-x-hidden pt-28">
         <Toaster position="top-right" />
         <RecruiterNavbar />

         {/* Banner */}
         <div className="w-full bg-[#f1f5f9] h-32 md:h-40 relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm"></div>
         </div>

         {/* Identity Container */}
         <div className="max-w-[1200px] mx-auto w-full px-6 -mt-12 md:-mt-16 relative z-10 animate-fade-in-up">
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white p-8 md:p-10 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)]">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10">

                  {/* Logo Section */}
                  <div className="relative group shrink-0 animate-scale-in">
                     <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center animate-float">
                        <img
                           src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`}
                           alt="Logo"
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                     </div>
                     {isEditing && (
                        <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300">
                           <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                           <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                     )}
                  </div>

                  {/* Brand Identity - Semi Bold Style */}
                  <div className="flex-1 text-center md:text-left min-w-0 pb-2">
                     {isEditing ? (
                        <div className="animate-fade-in">
                           <input
                              type="text"
                              value={profile.university}
                              onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                              className="text-2xl md:text-4xl font-semibold text-slate-900 border-b-4 border-blue-500 bg-slate-50 w-full max-w-2xl mb-4 px-3 py-2 outline-none rounded-t-2xl shadow-inner"
                           />
                        </div>
                     ) : (
                        <h1 className="text-3xl md:text-5xl font-semibold text-slate-900 leading-[1.1] mb-5 tracking-tight hover:text-blue-600 transition-colors duration-300">
                           {companyName}
                        </h1>
                     )}

                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 animate-fade-in delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
                        <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-[11px] uppercase tracking-[0.2em] bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                           <span className="material-symbols-outlined text-base">location_on</span>
                           {isEditing ? (
                              <input
                                 type="text"
                                 value={profile.location}
                                 onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                 className="bg-transparent border-none outline-none w-32"
                              />
                           ) : (profile.location || 'Global Offices')}
                        </div>
                        <div className="flex items-center gap-2.5 text-blue-600 font-semibold text-[11px] uppercase tracking-[0.2em] bg-blue-50 px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
                           <span className="material-symbols-outlined text-base animate-pulse">verified</span>
                           Elite Partner
                        </div>
                     </div>
                  </div>

                  {/* Action Corner */}
                  <div className="md:self-start pt-4 animate-fade-in delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                     {isEditing ? (
                        <div className="flex gap-3 animate-scale-in">
                           <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                           <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-semibold hover:bg-blue-700 shadow-xl transition-all active:scale-95">
                              {saving ? '...' : 'Save'}
                           </button>
                        </div>
                     ) : (
                        <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-semibold hover:bg-slate-800 transition-all flex items-center gap-3 shadow-2xl active:scale-95 group">
                           <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">edit_note</span>
                           Manage Profile
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Main Grid */}
         <main className="max-w-[1200px] mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left Side */}
            <div className="lg:col-span-8 space-y-10">
               <section className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm animate-fade-in-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
                  <h2 className="text-xl font-semibold mb-8 flex items-center gap-5 text-slate-900">
                     <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                        <span className="material-symbols-outlined text-xl">description</span>
                     </div>
                     About our Vision
                  </h2>
                  {isEditing ? (
                     <textarea
                        rows="4"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] text-lg font-medium outline-none focus:ring-1 focus:ring-blue-500/20 shadow-inner resize-none transition-all"
                     ></textarea>
                  ) : (
                     <p className="text-slate-600 leading-[1.8] font-medium text-lg italic opacity-90">
                        {profile.bio || "Craft a compelling vision to attract top-tier student talent."}
                     </p>
                  )}
               </section>


            </div>

            {/* Right Side */}
            <div className="lg:col-span-4 space-y-8">
               <section className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm animate-slide-in-right delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
                  <h3 className="font-semibold mb-8 text-[11px] uppercase tracking-[0.2em] text-slate-400">Recruiter Profile</h3>
                  <div className="space-y-6">
                     {[
                        { label: 'Strategic Contact', value: profile.name, icon: 'person' },
                        { label: 'Work Email', value: profile.email, icon: 'mail' },
                        { label: 'Office Hub', value: profile.location || 'Global', icon: 'hub' }
                     ].map((item, i) => (
                        <div key={i} className="flex gap-5 group">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                              <span className="material-symbols-outlined text-xl">{item.icon}</span>
                           </div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group animate-slide-in-right delay-400 opacity-0" style={{ animationFillMode: 'forwards' }}>
                  <div className="relative z-10">
                     <h4 className="font-semibold text-2xl mb-4">Verified Partner</h4>
                     <p className="text-xs opacity-70 leading-relaxed mb-10 font-medium">
                        Your brand is showcased as a premier destination for top student talent.
                     </p>
                     <div className="flex items-center gap-3 text-[10px] font-semibold bg-white/10 w-fit px-5 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                        PREMIUM ACTIVE
                     </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
               </div>
            </div>
         </main>
      </div>
   );
};

export default CompanyProfile;

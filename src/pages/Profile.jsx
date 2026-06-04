import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageSkeleton } from '../components/LoadingSkeleton';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState([]);
  const [targetRoles, setTargetRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await insforge.database
          .from('profiles')
          .select('id, name, university, bio, location, graduation_year, gpa, skills, experience, target_roles, preferred_locations, avatar_url, resume_url')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
          setForm(data);
          setSkills(data.skills || []);
          setExperience(data.experience || []);
          setTargetRoles(data.target_roles || []);
          setLocations(data.preferred_locations || []);
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      const gradYear = parseInt(form.graduation_year) || null;

      const updateData = {
        name: form.name,
        university: form.university,
        bio: form.bio,
        location: form.location,
        graduation_year: gradYear,
        gpa: form.gpa,
        skills,
        experience,
        target_roles: targetRoles,
        preferred_locations: locations,
        avatar_url: form.avatar_url,
        resume_url: form.resume_url
      };

      const { error } = await insforge.database
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setProfile({ ...profile, ...updateData });
      setEditing(false);
    } catch (e) {
      console.error('Save error:', e);
      toast.error(e.message || 'Update failed');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading(`Uploading ${type}...`);

    try {
      const bucket = type === 'avatar' ? 'avatars' : 'resumes';
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await insforge.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      if (!uploadData?.url) throw new Error('No URL returned from storage');

      const fileUrl = uploadData.url;

      if (type === 'avatar') {
        setForm(prev => ({ ...prev, avatar_url: fileUrl }));
        setProfile(prev => ({ ...prev, avatar_url: fileUrl }));
        toast.dismiss(loadingToast);
        toast.success('Photo updated!');
        await insforge.database.from('profiles').update({ avatar_url: fileUrl }).eq('id', user.id);
      } else {
        setForm(prev => ({ ...prev, resume_url: fileUrl }));
        setProfile(prev => ({ ...prev, resume_url: fileUrl }));
        toast.dismiss(loadingToast);
        toast.success('Resume uploaded!');
        await insforge.database.from('profiles').update({ resume_url: fileUrl }).eq('id', user.id);
      }
    } catch (e) {
      console.error('Upload Error:', e);
      toast.dismiss(loadingToast);
      toast.error('Upload failed: ' + (e.message || 'Server error'));
    }
  };

  const addExperience = () => {
    const newExp = {
      role: '',
      company: '',
      duration: '',
      description: ''
    };
    setExperience([newExp, ...experience]);
    setEditing(true);
  };

  const updateExp = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const removeExp = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const addRole = () => {
    if (newRole.trim() && !targetRoles.includes(newRole.trim())) {
      setTargetRoles([...targetRoles, newRole.trim()]);
      setNewRole('');
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  if (loading) return <PageSkeleton />;

  const displayName = form?.name || user?.user_metadata?.name || 'Student';

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] min-h-screen transition-colors duration-300 flex font-poppins">
      <Sidebar />

      <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1400px] mx-auto overflow-y-auto">
        <div className="space-y-12">

          {/* Header Card - Reverted to Image Style */}
          <section className="bg-white dark:bg-[#151715] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden relative">
            <div className="h-40 bg-[#325f3f]/10 dark:bg-[#325f3f]/5"></div>
            <div className="px-10 pb-10 -mt-20">
              <div className="flex flex-col md:flex-row items-end gap-8">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[48px] border-[6px] border-white dark:border-[#151715] bg-white flex items-center justify-center text-[#325f3f] text-5xl font-semibold shadow-xl overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      displayName[0]?.toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-[#325f3f] text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-4 border-white dark:border-[#151715]"
                  >
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                </div>

                <div className="flex-1 mb-4">
                  {editing ? (
                    <input
                      className="text-4xl font-semibold text-slate-900 dark:text-white bg-transparent border-b-2 border-[#325f3f] outline-none mb-2 w-full max-w-md"
                      placeholder="Enter your name"
                      value={form.name || ''}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  ) : (
                    <h1 className="text-4xl font-semibold text-slate-900 dark:text-white mb-2 break-words leading-tight">{displayName}</h1>
                  )}
                  <div className="flex items-center gap-6 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">school</span>
                      <span>Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span>Class of {profile?.graduation_year || '2026'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  {editing ? (
                    <div className="flex gap-3">
                      <button onClick={handleSave} className="px-8 py-3 bg-[#325f3f] text-white rounded-2xl font-semibold text-sm shadow-lg shadow-[#325f3f]/20 hover:scale-105 transition-transform">Save Changes</button>
                      <button onClick={() => setEditing(false)} className="px-8 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-semibold text-sm border border-slate-200 dark:border-white/10">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} className="px-8 py-3 bg-[#325f3f] text-white rounded-2xl font-semibold text-[11px] uppercase tracking-widest shadow-lg shadow-[#325f3f]/20 hover:scale-105 transition-transform flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">edit</span> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-10">

              {/* Experience */}
              <section className="bg-white dark:bg-[#151715] p-10 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Experience</h2>
                  <button onClick={addExperience} className="w-10 h-10 bg-[#325f3f]/10 text-[#325f3f] rounded-full flex items-center justify-center hover:bg-[#325f3f] hover:text-white transition-all">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>

                <div className="space-y-8">
                  {experience.length === 0 ? (
                    <p className="text-slate-500 dark:text-gray-500 text-center py-10 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl font-bold text-[11px] uppercase tracking-widest">No experience added yet.</p>
                  ) : (
                    experience.map((exp, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/10 shrink-0">
                          <span className="material-symbols-outlined text-[#325f3f] text-3xl">business</span>
                        </div>
                        <div className="flex-1">
                          {editing ? (
                            <div className="space-y-2">
                              <input
                                className="font-semibold text-lg text-slate-900 dark:text-white bg-transparent border-b border-[#325f3f] outline-none w-full"
                                placeholder="Enter Role (e.g. Software Engineer)"
                                value={exp.role}
                                onChange={e => updateExp(i, 'role', e.target.value)}
                              />
                              <div className="flex gap-4">
                                <input
                                  className="text-slate-500 dark:text-gray-400 bg-transparent border-b border-slate-200 dark:border-white/10 outline-none flex-1"
                                  placeholder="Company Name"
                                  value={exp.company}
                                  onChange={e => updateExp(i, 'company', e.target.value)}
                                />
                                <input
                                  className="text-slate-500 dark:text-gray-400 bg-transparent border-b border-slate-200 dark:border-white/10 outline-none w-32"
                                  placeholder="Duration"
                                  value={exp.duration}
                                  onChange={e => updateExp(i, 'duration', e.target.value)}
                                />
                              </div>
                              <textarea
                                className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-sm text-slate-700 dark:text-gray-300 mt-2 outline-none focus:border-[#325f3f] border border-transparent placeholder:text-slate-400"
                                placeholder="Describe your responsibilities..."
                                value={exp.description}
                                onChange={e => updateExp(i, 'description', e.target.value)}
                                rows="3"
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{exp.role}</h3>
                              <p className="text-[#325f3f] dark:text-[#4ade80] font-semibold text-sm mb-2">{exp.company} • {exp.duration}</p>
                              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed break-words">{exp.description}</p>
                            </>
                          )}
                        </div>
                        {editing && (
                          <button onClick={() => removeExp(i)} className="absolute -right-2 top-0 text-rose-500 hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">cancel</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Skills & Target Roles - SIDE BY SIDE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Skills */}
                <section className="bg-white dark:bg-[#151715] p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-[0.2em] opacity-60">Skills</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {skills.length === 0 ? (
                      <p className="text-[10px] text-slate-300 dark:text-gray-700 font-bold uppercase tracking-widest">No Skills</p>
                    ) : (
                      skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-[#325f3f] dark:text-[#4ade80] rounded-lg border border-slate-100 dark:border-white/10 flex items-center gap-2 group/skill hover:bg-[#325f3f] hover:text-white dark:hover:text-[#0f110f] transition-all uppercase tracking-widest break-all">
                          <div className="w-1 h-1 bg-[#325f3f] dark:bg-[#4ade80] rounded-full group-hover/skill:bg-white"></div>
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="material-symbols-outlined text-[12px] font-bold opacity-20 group-hover/skill:opacity-100 transition-opacity">close</button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="relative group/input">
                    <input
                      className="w-full bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-xl text-[11px] font-semibold outline-none border border-transparent focus:border-[#325f3f]/20 text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700"
                      placeholder="Add skill..."
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                    />
                    <button onClick={addSkill} className="absolute right-1.5 top-1.5 w-7 h-7 bg-[#325f3f] text-white rounded-lg flex items-center justify-center shadow-lg shadow-[#325f3f]/10 hover:scale-105 active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                  </div>
                </section>

                {/* Target Roles */}
                <section className="bg-white dark:bg-[#151715] p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-[0.2em] opacity-60">Target Roles</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {targetRoles.length === 0 ? (
                      <p className="text-[10px] text-slate-300 dark:text-gray-700 font-bold uppercase tracking-widest">No Roles</p>
                    ) : (
                      targetRoles.map(role => (
                        <span key={role} className="px-3 py-1.5 bg-[#325f3f]/5 dark:bg-[#4ade80]/5 text-[10px] font-bold text-[#325f3f] dark:text-[#4ade80] rounded-lg border border-[#325f3f]/10 dark:border-[#4ade80]/10 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#325f3f] dark:bg-[#4ade80] rounded-full"></span>
                          {role}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="relative group/input">
                    <input
                      className="w-full bg-slate-50 dark:bg-white/5 px-4 py-2.5 rounded-xl text-[11px] font-semibold outline-none border border-transparent focus:border-[#325f3f]/20 text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700"
                      placeholder="New role..."
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addRole()}
                    />
                    <button onClick={addRole} className="absolute right-1.5 top-1.5 w-7 h-7 bg-[#325f3f] text-white rounded-lg flex items-center justify-center shadow-lg shadow-[#325f3f]/10 hover:scale-105 active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-10">

              {/* Resume Box - FIXED & IMPROVED */}
              <section className="bg-white dark:bg-[#151715] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Resume</h2>

                {form.resume_url ? (
                  <div className="flex flex-col items-center gap-6 py-2">
                    <div className="w-20 h-20 bg-[#325f3f]/5 dark:bg-[#325f3f]/10 rounded-3xl flex items-center justify-center text-[#325f3f] dark:text-[#4ade80] shadow-inner">
                      <span className="material-symbols-outlined text-4xl font-bold">description</span>
                    </div>

                    <div className="text-center w-full min-w-0">
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate px-4">
                        {form.resume_url?.split('/').pop()?.split('_')?.slice(1)?.join('_') || 'My_Resume.pdf'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 w-full">
                      <a href={form.resume_url} target="_blank" rel="noreferrer" className="w-full py-3 bg-slate-50 dark:bg-white/5 text-[#325f3f] dark:text-[#4ade80] rounded-xl flex items-center justify-center gap-2 hover:bg-[#325f3f] hover:text-white dark:hover:bg-[#1a4d2e] dark:hover:text-white transition-all font-bold text-[11px] uppercase tracking-widest shadow-sm">
                        <span className="material-symbols-outlined text-lg">visibility</span> View Document
                      </a>
                      <button onClick={() => resumeInputRef.current?.click()} className="w-full py-3 bg-[#325f3f] text-white rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-[#325f3f]/20 font-bold text-[11px] uppercase tracking-widest">
                        <span className="material-symbols-outlined text-lg">sync</span> Update File
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[32px] flex flex-col items-center gap-4 hover:bg-[#325f3f]/5 transition-all group/upload bg-slate-50/50 dark:bg-white/5"
                  >
                    <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-slate-300 dark:text-gray-700 group-hover/upload:text-[#325f3f] dark:group-hover/upload:text-[#4ade80] group-hover/upload:scale-110 transition-all shadow-sm">
                      <span className="material-symbols-outlined text-3xl font-bold">upload_file</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-600 group-hover/upload:text-[#325f3f] dark:group-hover/upload:text-[#4ade80] uppercase tracking-widest">Upload CV / Resume</span>
                  </button>
                )}
                <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'resume')} />
              </section>
            </div>
          </div>

          {/* About Me Section - FULL WIDTH AT BOTTOM */}
          <section className="bg-white dark:bg-[#151715] p-10 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">About Me</h2>
            <div className="relative z-10">
              {editing ? (
                <textarea
                  className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none border border-transparent focus:border-[#325f3f]/20 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700"
                  rows="4"
                  placeholder="Brief professional intro..."
                  value={form.bio || ''}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                />
              ) : (
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-lg break-words">
                  {profile?.bio || 'Introduce yourself...'}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;

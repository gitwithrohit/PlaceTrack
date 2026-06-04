import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Security');
  
  // Platform Preferences State
  const [prefs, setPrefs] = useState({
    darkMode: document.documentElement.classList.contains('dark'),
    jobRecs: true,
    publicProfile: true
  });



  const tabs = ['Security', 'Preferences'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Security':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-[#1a1c19] p-8 rounded-[32px] border border-[#e0e0e0] dark:border-[#2a2c29] shadow-sm">
              <h2 className="text-2xl font-semibold text-[#1a1c1a] dark:text-white mb-8">Password Settings</h2>
              <div className="space-y-6 max-w-md">
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-[#5f6368] dark:text-gray-400 ml-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-[#f8f9f8] dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-[#3a3c39] rounded-2xl outline-none focus:border-[#325f3f] dark:text-white transition-all" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-[#5f6368] dark:text-gray-400 ml-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-[#f8f9f8] dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-[#3a3c39] rounded-2xl outline-none focus:border-[#325f3f] dark:text-white transition-all" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-[#5f6368] dark:text-gray-400 ml-1">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-[#f8f9f8] dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-[#3a3c39] rounded-2xl outline-none focus:border-[#325f3f] dark:text-white transition-all" />
                </div>
              </div>
              <div className="mt-10 flex justify-end">
                <button className="px-10 py-4 bg-[#325f3f] text-white rounded-2xl font-semibold text-sm hover:bg-[#2a4f35] transition-all shadow-lg shadow-[#325f3f]/20">
                  Update Password
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1c19] p-8 rounded-[32px] border border-[#e0e0e0] dark:border-[#2a2c29] shadow-sm">
              <h2 className="text-2xl font-semibold text-[#1a1c1a] dark:text-white mb-4">Two-Factor Authentication</h2>
              <p className="text-[#5f6368] dark:text-gray-400 mb-8 text-[15px] font-medium leading-relaxed max-w-xl">
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </p>
              <button className="flex items-center gap-3 px-8 py-4 bg-[#325f3f]/10 text-[#325f3f] rounded-2xl font-semibold text-sm hover:bg-[#325f3f] hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                Enable 2FA
              </button>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[32px] border border-red-100 dark:border-red-900/30">
              <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
              <p className="text-[#5f6368] dark:text-gray-400 mb-8 text-[15px] font-medium">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-8 py-4 border-2 border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 font-semibold rounded-2xl hover:bg-red-600 dark:hover:bg-red-400 hover:text-white dark:hover:text-[#0f110f] transition-all text-sm">
                Delete Account
              </button>
            </div>
          </div>
        );
      case 'Preferences':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-[#1a1c19] p-10 rounded-[32px] border border-[#e0e0e0] dark:border-[#2a2c29] shadow-sm">
              <h2 className="text-[28px] font-semibold text-[#1a1c1a] dark:text-white mb-10">Platform Preferences</h2>
              <div className="space-y-10">


                {/* Job Recommendations */}
                <div className="flex items-center justify-between group">
                  <div>
                    <h3 className="text-[19px] font-semibold text-[#1a1c1a] dark:text-white mb-1.5 transition-colors group-hover:text-[#325f3f]">Job Recommendations</h3>
                    <p className="text-[#5f6368] dark:text-gray-400 text-[15px] font-medium">Receive personalized job matches via email</p>
                  </div>
                  <button 
                    onClick={() => setPrefs(p => ({ ...p, jobRecs: !p.jobRecs }))}
                    className={`w-[68px] h-[38px] rounded-full relative transition-all duration-300 p-1.5 ${prefs.jobRecs ? 'bg-[#325f3f]' : 'bg-[#e0e0e0] dark:bg-[#3a3c39]'}`}
                  >
                    <div className={`w-[26px] h-[26px] bg-white rounded-full shadow-md transition-transform duration-300 ${prefs.jobRecs ? 'translate-x-[30px]' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Public Profile */}
                <div className="flex items-center justify-between group">
                  <div>
                    <h3 className="text-[19px] font-semibold text-[#1a1c1a] dark:text-white mb-1.5 transition-colors group-hover:text-[#325f3f]">Public Profile</h3>
                    <p className="text-[#5f6368] dark:text-gray-400 text-[15px] font-medium">Allow recruiters to find your profile in searches</p>
                  </div>
                  <button 
                    onClick={() => setPrefs(p => ({ ...p, publicProfile: !p.publicProfile }))}
                    className={`w-[68px] h-[38px] rounded-full relative transition-all duration-300 p-1.5 ${prefs.publicProfile ? 'bg-[#325f3f]' : 'bg-[#e0e0e0] dark:bg-[#3a3c39]'}`}
                  >
                    <div className={`w-[26px] h-[26px] bg-white rounded-full shadow-md transition-transform duration-300 ${prefs.publicProfile ? 'translate-x-[30px]' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1c19] p-10 rounded-[32px] border border-[#e0e0e0] dark:border-[#2a2c29] shadow-sm">
              <h2 className="text-[22px] font-semibold text-[#1a1c1a] dark:text-white mb-8">Language & Region</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#5f6368] dark:text-gray-400 ml-1">Language</label>
                  <div className="relative">
                    <select className="w-full px-6 py-4.5 bg-[#f8f9f8] dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-[#3a3c39] rounded-2xl text-[15px] font-semibold text-[#1a1c1a] dark:text-white outline-none cursor-pointer focus:border-[#325f3f] transition-all appearance-none pr-12">
                      <option>English (United States)</option>
                      <option>Hindi (India)</option>
                      <option>Spanish (Mexico)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#5f6368] dark:text-gray-400 ml-1">Timezone</label>
                  <div className="relative">
                    <select className="w-full px-6 py-4.5 bg-[#f8f9f8] dark:bg-[#2a2c29] border border-[#e0e0e0] dark:border-[#3a3c39] rounded-2xl text-[15px] font-semibold text-[#1a1c1a] dark:text-white outline-none cursor-pointer focus:border-[#325f3f] transition-all appearance-none pr-12">
                      <option>(GMT+05:30) Mumbai, India</option>
                      <option>(GMT-08:00) Pacific Time</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] dark:text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] min-h-screen transition-colors duration-300">
      <main className="p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-[40px] font-semibold text-[#1a1c1a] dark:text-white leading-tight mb-3">Account Settings</h1>
          <p className="text-[#5f6368] dark:text-gray-400 text-lg max-w-2xl leading-relaxed">Manage your personal information, security protocols, and platform preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Navigation Sidebar (Local to page) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1a1c19] p-6 rounded-[24px] border border-[#e0e0e0] dark:border-[#2a2c29] shadow-sm space-y-2 sticky top-10">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab 
                      ? 'bg-[#325f3f] text-white shadow-lg shadow-[#325f3f]/20' 
                      : 'text-[#5f6368] dark:text-gray-400 hover:bg-[#f8f9f8] dark:hover:bg-[#2a2c29] hover:text-[#325f3f]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

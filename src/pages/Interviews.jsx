import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insforge } from '../services/api';
import { PageSkeleton } from '../components/LoadingSkeleton';
import Sidebar from '../components/Sidebar';

const Interviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const today = new Date();

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const { data, error } = await insforge.database
          .from('interviews')
          .select(`
            id, schedule_time, meeting_link,
            applications!inner(
              id, student_id,
              jobs:job_id(title, company)
            )
          `)
          .eq('applications.student_id', user.id)
          .order('schedule_time', { ascending: true });

        if (error) throw error;
        setInterviews(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const prevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() - 1);
    setViewDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + 1);
    setViewDate(newDate);
  };

  if (loading) return <PageSkeleton />;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate days for Month view
  const monthDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  // Calculate days for Week view (7 days starting from viewDate or nearest Sunday)
  const startOfWeek = new Date(viewDate);
  startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekRange = `${weekDays[0].toLocaleDateString('default', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('default', { day: 'numeric', month: 'short' })}`;

  const getInterviewsForDate = (date) => {
    if (!date) return [];
    return interviews.filter(iv => {
      const d = new Date(iv.schedule_time);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
  };

  const getInterviewsForDay = (day) => {
    if (!day) return [];
    return interviews.filter(iv => {
      const d = new Date(iv.schedule_time);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const upcoming = interviews.filter(iv => new Date(iv.schedule_time) >= today);

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] min-h-screen flex transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-[#1a1c1a] dark:text-white mb-2">Interview Tracker</h1>
            <p className="text-on-surface-variant dark:text-gray-400 font-medium text-lg">Manage and prepare for your upcoming technical and HR rounds.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Calendar */}
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-white dark:bg-[#1a1c19] rounded-3xl border border-surface-variant dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-surface-variant dark:border-white/5 flex justify-between items-center bg-[#f0f4f0]/30 dark:bg-white/5">
                  <h2 className="text-lg font-semibold text-[#1a1c1a] dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#325f3f]">calendar_month</span>
                    {monthName}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={prevMonth}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#2a2c29] border border-surface-variant dark:border-white/10 text-[#1a1c1a] dark:text-white hover:bg-[#f0f4f0] dark:hover:bg-[#325f3f]/20 transition-all"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                      onClick={nextMonth}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#2a2c29] border border-surface-variant dark:border-white/10 text-[#1a1c1a] dark:text-white hover:bg-[#f0f4f0] dark:hover:bg-[#325f3f]/20 transition-all"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 border-b border-surface-variant dark:border-white/5 bg-[#f8f9f8] dark:bg-[#0f110f]">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-4 text-center text-[10px] font-semibold text-on-surface-variant dark:text-gray-400 uppercase tracking-widest">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 border-collapse">
                  {monthDays.map((day, i) => {
                    const dayInterviews = getInterviewsForDay(day);
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                    return (
                      <div key={i} className={`h-12 md:h-14 border-r border-b border-surface-variant dark:border-white/5 p-1 transition-colors flex flex-col items-center justify-center ${day ? 'bg-white dark:bg-[#1a1c19] hover:bg-[#f8f9f8] dark:hover:bg-white/5' : 'bg-[#f0f4f0]/10 dark:bg-black/20'}`}>
                        {day && (
                          <>
                            <span className={`text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#325f3f] text-white shadow-sm' : 'text-[#1a1c1a] dark:text-white'}`}>
                              {day}
                            </span>
                            {dayInterviews.length > 0 && (
                              <div className="mt-0.5 flex justify-center gap-0.5">
                                {dayInterviews.slice(0, 3).map(iv => (
                                  <div key={iv.id} className="w-1 h-1 rounded-full bg-[#325f3f]" />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Upcoming List */}
            <div className="lg:col-span-4 space-y-8">
              <h2 className="text-xl font-semibold text-[#1a1c1a] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#325f3f]">list_alt</span>
                Upcoming Rounds
              </h2>

              {upcoming.length > 0 ? upcoming.map((iv) => (
                <div key={iv.id} className="bg-white dark:bg-[#1a1c19] rounded-3xl border border-surface-variant dark:border-white/5 shadow-sm p-6 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#f0f4f0] dark:bg-[#2a2c29] rounded-2xl flex items-center justify-center border border-surface-variant dark:border-white/10 group-hover:border-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[#325f3f] text-3xl">business</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1a1c1a] dark:text-white leading-tight">
                          {iv.applications?.jobs?.company || 'Company'}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                          <p className="text-[10px] font-semibold text-on-surface-variant dark:text-gray-400 uppercase tracking-widest">
                            {new Date(iv.schedule_time).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <h5 className="text-sm font-semibold text-[#1a1c1a] dark:text-white">
                      {iv.applications?.jobs?.title || 'Technical Interview'}
                    </h5>
                    <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant dark:text-gray-400">
                      <span className="material-symbols-outlined text-sm text-[#325f3f]">schedule</span> 
                      {new Date(iv.schedule_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {iv.meeting_link ? (
                    <a href={iv.meeting_link} target="_blank" rel="noreferrer" className="w-full bg-[#325f3f] text-white text-[10px] font-semibold py-4 rounded-2xl hover:bg-[#2a4f35] transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[18px]">videocam</span> Join Call
                    </a>
                  ) : (
                    <div className="w-full bg-[#f8f9f8] dark:bg-white/5 border border-surface-variant dark:border-white/5 text-on-surface-variant dark:text-gray-400 text-[10px] font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest opacity-60">
                      <span className="material-symbols-outlined text-[18px]">link</span> Link Pending
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-10 text-center bg-white dark:bg-[#1a1c19] rounded-3xl border border-dashed border-surface-variant dark:border-white/5 text-on-surface-variant dark:text-gray-400 font-medium">
                  No upcoming interviews.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Interviews;

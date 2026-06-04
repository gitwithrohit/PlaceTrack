import { useState, useEffect, useRef } from 'react';
import { insforge } from '../services/api';
import AdminNavbar from '../components/AdminNavbar';
import { PageSkeleton } from '../components/LoadingSkeleton';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, placed: 0, verified: 0, avgGpa: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('Department');
  const [placementFilter, setPlacementFilter] = useState('All Status');
  const [gpaFilter, setGpaFilter] = useState('CGPA Range');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const containerRef = useRef(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [profilesRes, appsRes] = await Promise.all([
        insforge.database.from('profiles').select('id, name, email, university, gpa, is_verified, created_at').eq('role', 'student').order('created_at', { ascending: false }),
        insforge.database.from('applications').select('student_id, status')
      ]);

      const profileData = profilesRes.data || [];
      const appsData = appsRes.data || [];

      // Map placement status
      const studentPlacementMap = {};
      appsData.forEach(app => {
        if (['offer', 'Offer', 'accepted', 'Accepted', 'Selected', 'selected', 'Hired', 'hired'].includes(app.status)) {
          studentPlacementMap[app.student_id] = true;
        }
      });

      const enrichedStudents = profileData.map(s => ({
        ...s,
        isPlaced: !!studentPlacementMap[s.id]
      }));

      setStudents(enrichedStudents);

      // Calculate Stats
      const total = enrichedStudents.length;
      const placed = enrichedStudents.filter(s => s.isPlaced).length;
      const verified = enrichedStudents.filter(s => s.is_verified).length;

      const studentsWithGpa = enrichedStudents.filter(s => {
        const val = parseFloat(s.gpa);
        return !isNaN(val) && val > 0;
      });

      const avgGpa = studentsWithGpa.length > 0
        ? (studentsWithGpa.reduce((acc, s) => acc + parseFloat(s.gpa), 0) / studentsWithGpa.length).toFixed(2)
        : "0.00";

      setStats({ total, placed, verified, avgGpa });
    } catch (e) {
      console.error("AdminStudents: Failed to fetch", e);
      toast.error("Failed to load students data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(".animate-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filtering Logic
  const filteredStudents = students.filter(s => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (s.name || '').toLowerCase().includes(searchLower) ||
      (s.email || '').toLowerCase().includes(searchLower);

    const matchesDept = deptFilter === 'Department' || s.university === deptFilter;

    const matchesPlacement = placementFilter === 'All Status' ||
      (placementFilter === 'Placed' && s.isPlaced) ||
      (placementFilter === 'Unplaced' && !s.isPlaced);

    const gpaNum = parseFloat(s.gpa) || 0;
    let matchesGpa = true;
    if (gpaFilter === '9.0+') matchesGpa = gpaNum >= 9.0;
    else if (gpaFilter === '8.0 - 9.0') matchesGpa = gpaNum >= 8.0 && gpaNum < 9.0;
    else if (gpaFilter === '7.0 - 8.0') matchesGpa = gpaNum >= 7.0 && gpaNum < 8.0;

    return matchesSearch && matchesDept && matchesGpa && matchesPlacement;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedStudents.map(s => s.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleVerifySelected = async () => {
    if (selectedIds.size === 0) return toast.error("No students selected");

    const loadingToast = toast.loading("Verifying students...");
    try {
      const { error } = await insforge.database.from('profiles')
        .update({ is_verified: true })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`Successfully verified ${selectedIds.size} students`, { id: loadingToast });
      setSelectedIds(new Set());
      fetchStudents();
    } catch (e) {
      console.error("Verification error:", e);
      toast.error("Verification failed: " + (e.message || "Unknown error"), { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record? All associated data will be removed.")) return;

    try {
      const { error } = await insforge.database.from('profiles').delete().eq('id', id);
      if (error) throw error;

      toast.success("Student record removed");
      // Remove from selection if deleted
      if (selectedIds.has(id)) {
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      }
      fetchStudents();
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("Failed to delete: " + (e.message || "Constraint violation"));
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Department', 'CGPA'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(s => [s.name, s.email, s.university, s.gpa].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toLocaleDateString()}.csv`;
    a.click();
    toast.success("CSV export triggered");
  };

  if (loading && students.length === 0) return <PageSkeleton />;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-poppins antialiased text-slate-700 text-[1.04em]">
      <Toaster position="top-right" />
      <AdminNavbar />

      <main ref={containerRef} className="max-w-7xl mx-auto w-full p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-card">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Data</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Real-time monitoring and placement lifecycle management.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
            >
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">download</span>
              Export CSV
            </button>
            <button
              onClick={handleVerifySelected}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              disabled={selectedIds.size === 0}
            >
              <span className="material-symbols-outlined text-xl">verified_user</span>
              Verify {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </div>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Enrolled', value: stats.total, icon: 'school', color: 'blue' },
            { label: 'Placed Students', value: stats.placed, icon: 'stars', color: 'emerald' },
            { label: 'Verified Profiles', value: stats.verified, icon: 'how_to_reg', color: 'indigo' },
            { label: 'Avg. CGPA', value: stats.avgGpa, icon: 'analytics', color: 'amber' }
          ].map((item, i) => (
            <div key={i} className="animate-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{item.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="animate-card bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap lg:flex-nowrap gap-4 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search students by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 lg:w-48 bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>Department</option>
              {[...new Set(students.map(s => s.university))].filter(Boolean).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={placementFilter}
              onChange={(e) => { setPlacementFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 lg:w-40 bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>All Status</option>
              <option>Placed</option>
              <option>Unplaced</option>
            </select>
            <select
              value={gpaFilter}
              onChange={(e) => { setGpaFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 lg:w-40 bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option>CGPA Range</option>
              <option>9.0+</option>
              <option>8.0 - 9.0</option>
              <option>7.0 - 8.0</option>
            </select>
            <button
              onClick={() => { setSearchQuery(''); setDeptFilter('Department'); setGpaFilter('CGPA Range'); setPlacementFilter('All Status'); setCurrentPage(1); }}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined">filter_alt_off</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="animate-card bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer w-4 h-4"
                      checked={selectedIds.size === paginatedStudents.length && paginatedStudents.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student Identity</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Academic</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Placement</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedStudents.length > 0 ? paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer w-4 h-4"
                        checked={selectedIds.has(student.id)}
                        onChange={() => toggleSelect(student.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600`}>
                          {student.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm truncate tracking-tight">{student.name || 'Anonymous'}</p>
                            {student.is_verified && (
                              <span className="material-symbols-outlined text-blue-500 text-[16px] font-bold" title="Verified Profile">verified</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 truncate uppercase tracking-tight">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{student.university || 'General'}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Campus</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-bold ${parseFloat(student.gpa) >= 8.5 ? 'text-emerald-600' : 'text-slate-900'}`}>{student.gpa || '0.00'}</span>
                        <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, (parseFloat(student.gpa) || 0) / 10 * 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest ${student.isPlaced ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {student.isPlaced ? 'Placed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => toast("Profile details view coming soon")}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <span className="material-symbols-outlined text-xl">account_circle</span>
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest opacity-50">No students found in the current directory.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Record {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} Students
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all bg-white disabled:opacity-20"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border border-slate-200 text-slate-500 hover:bg-white'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white transition-all bg-white disabled:opacity-20"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminStudents;

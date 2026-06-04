import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSkeleton } from '../components/LoadingSkeleton';

// Lazy load all pages
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminStudents = lazy(() => import('../pages/AdminStudents'));
const AdminCompanies = lazy(() => import('../pages/AdminCompanies'));
const AdminApplications = lazy(() => import('../pages/AdminApplications'));
const AdminNotifications = lazy(() => import('../pages/AdminNotifications'));
const AdminAlerts = lazy(() => import('../pages/AdminAlerts'));
const AdminProfile = lazy(() => import('../pages/AdminProfile'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const RecruiterDashboard = lazy(() => import('../pages/RecruiterDashboard'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const Jobs = lazy(() => import('../pages/Jobs'));
const Applications = lazy(() => import('../pages/Applications'));
const Interviews = lazy(() => import('../pages/Interviews'));
const ResumeBuilder = lazy(() => import('../pages/ResumeBuilder'));
const Profile = lazy(() => import('../pages/Profile'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Resources = lazy(() => import('../pages/Resources'));
const Settings = lazy(() => import('../pages/Settings'));
const CompanyDirectory = lazy(() => import('../pages/CompanyDirectory'));
const CareerGuides = lazy(() => import('../pages/CareerGuides'));
const CompanyJobPosting = lazy(() => import('../pages/CompanyJobPosting'));
const CompanyApplicants = lazy(() => import('../pages/CompanyApplicants'));
const CompanyInterviews = lazy(() => import('../pages/CompanyInterviews'));
const CompanyNewJob = lazy(() => import('../pages/CompanyNewJob'));
const ResumeViewer = lazy(() => import('../pages/ResumeViewer'));
const CompanySettings = lazy(() => import('../pages/CompanySettings'));
const CompanyNotifications = lazy(() => import('../pages/CompanyNotifications'));
const CompanyTalentSearch = lazy(() => import('../pages/CompanyTalentSearch'));
const CompanyProfile = lazy(() => import('../pages/CompanyProfile'));
const CompleteProfile = lazy(() => import('../pages/CompleteProfile'));
const InterviewPrep = lazy(() => import('../pages/InterviewPrep'));
const CodingChallenges = lazy(() => import('../pages/CodingChallenges'));
const MockTest = lazy(() => import('../pages/MockTest'));
const ApplyJob = lazy(() => import('../pages/ApplyJob'));
const SavedJobs = lazy(() => import('../pages/SavedJobs'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  if (loading || (user && !role)) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(`Access denied. Role: ${role}, Allowed: ${allowedRoles}`);
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();
  if (loading || (user && !role)) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" />;
  if (role !== allowedRole) return <Navigate to="/dashboard" />;
  return children;
};

const DashboardRouter = () => {
  const { user, role, loading } = useAuth();

  if (loading || (user && !role)) {
    return <PageSkeleton />;
  }

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'recruiter') return <Navigate to="/company/dashboard" replace />;
  if (role === 'student') return <StudentDashboard />;

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <PageSkeleton />;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          user ? <DashboardRouter /> : <Navigate to="/login" />
        } />

        {/* Admin Specific Routes */}
        <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRole="admin"><AdminDashboard /></RoleProtectedRoute>} />
        <Route path="/admin/students" element={<RoleProtectedRoute allowedRole="admin"><AdminStudents /></RoleProtectedRoute>} />
        <Route path="/admin/companies" element={<RoleProtectedRoute allowedRole="admin"><AdminCompanies /></RoleProtectedRoute>} />
        <Route path="/admin/applications" element={<RoleProtectedRoute allowedRole="admin"><AdminApplications /></RoleProtectedRoute>} />
        <Route path="/admin/notifications" element={<RoleProtectedRoute allowedRole="admin"><AdminNotifications /></RoleProtectedRoute>} />
        <Route path="/admin/alerts" element={<RoleProtectedRoute allowedRole="admin"><AdminAlerts /></RoleProtectedRoute>} />
        <Route path="/admin/profile" element={<RoleProtectedRoute allowedRole="admin"><AdminProfile /></RoleProtectedRoute>} />
        <Route path="/admin/settings" element={<RoleProtectedRoute allowedRole="admin"><AdminSettings /></RoleProtectedRoute>} />

        {/* Company Specific Routes */}
        <Route path="/company/dashboard" element={<RoleProtectedRoute allowedRole="recruiter"><RecruiterDashboard /></RoleProtectedRoute>} />
        <Route path="/company/Posting" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyJobPosting /></RoleProtectedRoute>} />
        <Route path="/company/Posting/new" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyNewJob /></RoleProtectedRoute>} />
        <Route path="/company/Applicants" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyApplicants /></RoleProtectedRoute>} />
        <Route path="/company/Interviews" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyInterviews /></RoleProtectedRoute>} />
        <Route path="/company/resume/:studentId" element={<RoleProtectedRoute allowedRole="recruiter"><ResumeViewer /></RoleProtectedRoute>} />
        <Route path="/company/settings" element={<RoleProtectedRoute allowedRole="recruiter"><CompanySettings /></RoleProtectedRoute>} />
        <Route path="/company/profile" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyProfile /></RoleProtectedRoute>} />
        <Route path="/company/Notifications" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyNotifications /></RoleProtectedRoute>} />
        <Route path="/company/TalentSearch" element={<RoleProtectedRoute allowedRole="recruiter"><CompanyTalentSearch /></RoleProtectedRoute>} />

        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
        <Route path="/apply/:id" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />

        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/career-guides" element={<ProtectedRoute><CareerGuides /></ProtectedRoute>} />
        <Route path="/resources/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/resources/coding-challenges" element={<ProtectedRoute><CodingChallenges /></ProtectedRoute>} />
        <Route path="/resources/mock-test" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
        <Route path="/resources/companies" element={<ProtectedRoute><CompanyDirectory /></ProtectedRoute>} />
        <Route path="/profile" element={
          <ProtectedRoute>
            {/* role check inside ProtectedRoute is handled by Navigate but here we need role for conditional */}
            <ProfileRedirect />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsRedirect />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};

// Helper components for complex routing logic to keep main Routes clean
const ProfileRedirect = () => {
  const { role } = useAuth();
  return role === 'admin' ? <Navigate to="/admin/profile" replace /> : <Profile />;
};

const SettingsRedirect = () => {
  const { role } = useAuth();
  return role === 'admin' ? <Navigate to="/admin/settings" replace /> : <Settings />;
};

export default AppRoutes;

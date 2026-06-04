import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import NavLanding from './components/NavLanding';
import Footer from './components/Footer';
import { useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';

const AppContent = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const isDashboardPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/company') || location.pathname.startsWith('/recruiter');
  const isDashboard = (user && (role === 'admin' || role === 'recruiter')) || isDashboardPath;
  const isLanding = location.pathname === '/';
  const showFooter = !loading && ['/', '/dashboard', '/admin/dashboard', '/company/dashboard'].includes(location.pathname);

  return (
    <div className={`flex flex-col min-h-screen ${isDashboard ? 'bg-[#f8f9f8]' : 'bg-light'}`}>
      {!isDashboard && (isLanding ? <NavLanding /> : <Navbar />)}
      <main className="flex-grow pt-16">
        <AppRoutes />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <SmoothScroll>
          <AppContent />
        </SmoothScroll>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              borderRadius: '16px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
            },
            success: {
              iconTheme: {
                primary: '#1a4d2e',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, PlusSquare, Building2, Search, User, LayoutGrid } from 'lucide-react';
import Home from './pages/Home';
import Properties from './pages/Properties';
import ListingDetails from './pages/ListingDetails';
import AddListing from './pages/AddListing';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AdminEntry from './pages/AdminEntry';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';

import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';

function App() {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authConfig, setAuthConfig] = useState({ view: 'login', role: 'buyer' });
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        const storedAdmin = localStorage.getItem('adminUser');
        if (storedAdmin) {
          setAdminUser(JSON.parse(storedAdmin));
        }
      } catch (err) {
        console.error("Auth Error:", err);
        localStorage.removeItem('user'); // Clear invalid data
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div style={{ height: '100vh', background: '#000' }}></div>;

  const openAuth = (view = 'login', role = 'buyer') => {
    setAuthConfig({ view, role });
    setShowAuthModal(true);
  };

  const handleLogin = (userData) => {
    if (userData.role === 'admin') {
      // Admin logged in via regular modal — treat as admin
      localStorage.removeItem('user');
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(null);
      setAdminUser(userData);
      setShowAuthModal(false);
      window.location.href = '/admin'; // Hard redirect to admin dashboard
    } else {
      setUser(userData);
      setShowAuthModal(false);
    }
  };

  const handleAdminLogin = (adminData) => {
    setAdminUser(adminData);
    // Do NOT set regular user
  };

  // Determine if we are in the Admin Portal "Context" (visual theme)
  const isAdminView = location.pathname === '/bvy-estate' || location.pathname.startsWith('/admin');

  const checkAuth = () => {
    // ... existing checkAuth logic ...
  };

  // ... (hooks are fine)

  const handleLogout = () => {
    // Check if we are logging out of admin or main
    if (isAdminView) {
      localStorage.removeItem('adminUser');
      setAdminUser(null);
    } else {
      localStorage.removeItem('user');
      setUser(null);
      // Only show auth modal if it was a user logout
      setShowAuthModal(true);
    }
  };

  return (
    // Router removed here as it is now in main.jsx
    <div className="app">
      <header className="navbar-wrapper">
        <nav className="navbar container">
          <Link to="/" className="logo">Urbanova.</Link>
          <div className="nav-links">
            {isAdminView ? (
              <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer' }}>
                <HomeIcon size={18} /> Admin Portal
              </a>
            ) : (
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                <HomeIcon size={18} /> Home
              </Link>
            )}

            {/* Standard Navigation (Hidden in Admin Portal View) */}
            {!isAdminView && (
              <>
                <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={18} /> Properties
                </Link>
                {user && (user.role === 'seller' || user.role === 'agent') && (
                  <>
                    <Link to="/add" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlusSquare size={18} /> List Property
                    </Link>
                    <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                      <LayoutGrid size={18} /> {user.role === 'agent' ? 'Agent Dashboard' : 'Dashboard'}
                    </Link>
                  </>
                )}
              </>
            )}



            {/* Auth Buttons Logic */}
            {isAdminView ? (
              /* Admin Portal Logic */
              adminUser ? (
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: '#ff6b6b', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Admin (Logout)
                </button>
              ) : (
                // In Admin Portal but not logged in? (e.g. on login page)
                null
              )
            ) : (
              /* Main Site Logic */
              user ? (
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  {user.username} (Logout)
                </button>
              ) : (
                <button onClick={() => setShowAuthModal(true)} style={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', boxShadow: 'none' }}>
                  LOGIN
                </button>
              )
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home openAuth={openAuth} user={user} />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<ListingDetails user={user} adminUser={adminUser} />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/add" element={user && (user.role === 'seller' || user.role === 'agent') ? <AddListing /> : <Navigate to="/" />} />
        <Route path="/seller" element={user && (user.role === 'seller' || user.role === 'agent') ? <SellerDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={adminUser && adminUser.role === 'admin' ? <AdminDashboard /> : <Navigate to="/bvy-estate" />} />

        {/* Secret Admin Route */}
        <Route path="/bvy-estate" element={<AdminEntry onAdminLogin={handleAdminLogin} />} />
      </Routes>
      <Footer />

      {showAuthModal && !user && !loading && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          initialView={authConfig.view}
          defaultRole={authConfig.role}
        />
      )}
    </div>
  );
}

export default App;

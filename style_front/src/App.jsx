import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import AuthFlow from './pages/AuthFlow';
import DashboardView from './pages/DashboardView';
import WardrobeView from './pages/WardrobeView';
import GeneratorView from './pages/GeneratorView';
import TravelView from './pages/TravelView';
import ProfileView from './pages/ProfileView';
import ShoppingView from './pages/ShoppingView';
import AppShell from './components/AppShell';
import { ClosetFilterProvider } from './context/ClosetFilterContext';

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, isAuthenticated }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const DARK_KEY = 'style-dark-mode';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return Boolean(localStorage.getItem('auth_token')); } catch { return false; }
  });
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem(DARK_KEY) === '1'; } catch { return false; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem(DARK_KEY, darkMode ? '1' : '0'); } catch (_) {}
  }, [darkMode]);

  // Sync Sidebar with URL
  useEffect(() => {
    if (location.pathname.includes('dashboard')) setActiveTab('dashboard');
    else if (location.pathname.includes('wardrobe')) setActiveTab('wardrobe');
    else if (location.pathname.includes('generator')) setActiveTab('generator');
    else if (location.pathname.includes('travel')) setActiveTab('travel');
    else if (location.pathname.includes('shopping')) setActiveTab('shopping');
    else if (location.pathname.includes('profile')) setActiveTab('profile');
  }, [location]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/app/wardrobe');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try { localStorage.removeItem('auth_token'); localStorage.removeItem('user_city'); localStorage.removeItem('user_name'); } catch {}
    navigate('/');
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    navigate(`/app/${id}`);
  };

  return (
    // FIX: Removed the <button> that was here. 
    // <Routes> can ONLY contain <Route> elements.
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<AuthFlow initialView="login" onComplete={handleLogin} />} />
      <Route path="/register" element={<AuthFlow initialView="signup" onComplete={handleLogin} />} />

      {/* PROTECTED APP ROUTES */}
      <Route path="/app" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <ClosetFilterProvider>
            <AppShell activeTab={activeTab} setActiveTab={handleNavClick} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
          </ClosetFilterProvider>
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardView setView={handleNavClick} />} />
        <Route path="wardrobe" element={<WardrobeView />} />
        <Route path="generator" element={<GeneratorView />} />
        <Route path="travel" element={<TravelView />} />
        <Route path="shopping" element={<ShoppingView />} />
        <Route path="profile" element={<ProfileView onLogout={handleLogout} />} />
        <Route path="analytics" element={<DashboardView setView={handleNavClick} />} />

        {/* Default redirect when visiting /app */}
        <Route index element={<Navigate to="wardrobe" replace />} />
      </Route>

      {/* Catch all 404 - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
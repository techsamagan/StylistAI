import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import AuthFlow from './pages/AuthFlow';
import DashboardView from './pages/DashboardView';
import WardrobeView from './pages/WardrobeView';
import GeneratorView from './pages/GeneratorView';
import AppShell from './components/AppShell';

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, isAuthenticated }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync Sidebar with URL
  useEffect(() => {
    if (location.pathname.includes('dashboard')) setActiveTab('dashboard');
    else if (location.pathname.includes('wardrobe')) setActiveTab('wardrobe');
    else if (location.pathname.includes('generator')) setActiveTab('generator');
  }, [location]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/app/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
          <AppShell activeTab={activeTab} setActiveTab={handleNavClick} onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardView setView={handleNavClick} />} />
        <Route path="wardrobe" element={<WardrobeView />} />
        <Route path="generator" element={<GeneratorView />} />
        
        {/* Default redirect to dashboard if just /app is visited */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch all 404 - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
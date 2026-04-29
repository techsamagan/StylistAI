import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, isApiConfigured } from '../api/client';

/* ── Auth Form ──────────────────────────────── */
const AuthForm = ({ mode, setMode, onSuccess }) => {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [city,     setCity]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isApiConfigured()) { onSuccess(); return; }
    try {
      setLoading(true);
      const payload = mode === 'signup'
        ? { name, email, password, city }
        : { email, password };
      const res = mode === 'signup'
        ? await api.register(payload)
        : await api.login(payload);
      if (res?.access_token) localStorage.setItem('auth_token', res.access_token);
      onSuccess();
    } catch (e) {
      setError(e.body?.detail || e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-fade-up">
      {/* Title */}
      <div className="mb-7">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {mode === 'login' ? 'Welcome back.' : 'Create your closet.'}
        </h2>
        <p className="text-slate-500 text-sm mt-1.5">
          {mode === 'login'
            ? 'Sign in to access your wardrobe and outfit suggestions.'
            : 'Start building your AI-powered wardrobe today.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[18px]">person</span>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-[#1a2a1e] border border-[#1e2f22] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        )}

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[18px]">mail</span>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-[#1a2a1e] border border-[#1e2f22] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[18px]">lock</span>
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-[#1a2a1e] border border-[#1e2f22] rounded-xl py-3 pl-10 pr-10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>

        {mode === 'signup' && (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[18px]">location_on</span>
            <input
              type="text"
              placeholder="Your city (for weather, optional)"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full bg-[#1a2a1e] border border-[#1e2f22] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-[#0d1a12] py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-60 mt-1"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm">
        <span className="text-slate-600">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        </span>
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </div>
  );
};

/* ── Showcase panel (desktop left side) ──── */
const ShowcasePanel = () => (
  <div className="hidden lg:flex flex-col justify-between h-full p-10">
    {/* Brand */}
    <div className="flex items-center gap-2.5">
      <div className="size-9 bg-primary rounded-xl flex items-center justify-center text-[#0d1a12]">
        <span className="material-symbols-outlined icon-filled text-[20px]">checkroom</span>
      </div>
      <span className="text-base font-extrabold tracking-tight">Digital Closet</span>
    </div>

    {/* Feature cards */}
    <div className="space-y-4 my-auto">
      <h2 className="text-3xl font-extrabold leading-tight text-white mb-6">
        Your wardrobe,<br />
        <span className="gradient-text">organised by AI.</span>
      </h2>
      {[
        { icon: 'wb_sunny',      title: 'Weather-aware outfits',    desc: 'Suggests what to wear based on today\'s forecast.' },
        { icon: 'calendar_today',title: 'Calendar integration',      desc: 'Knows your meetings. Dresses you accordingly.'     },
        { icon: 'auto_awesome',  title: 'Style AI Generator',        desc: 'Build any look from your own clothes in seconds.'  },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/6 rounded-xl">
          <div className="size-8 bg-primary/15 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[17px]">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>

    <p className="text-xs text-slate-600">© 2026 Digital Closet</p>
  </div>
);

/* ── Main AuthFlow Component ─────────────── */
const AuthFlow = ({ onComplete, initialView = 'login' }) => {
  const [mode, setMode] = useState(initialView === 'signup' ? 'signup' : 'login');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1a12] flex font-display">

      {/* Left: Showcase */}
      <div className="hidden lg:block lg:w-1/2 bg-[#0a1610] border-r border-[#1e2f22] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <ShowcasePanel />
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 text-white no-underline">
            <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-[#0d1a12]">
              <span className="material-symbols-outlined icon-filled text-[17px]">checkroom</span>
            </div>
            <span className="text-sm font-extrabold tracking-tight">Digital Closet</span>
          </a>
        </div>

        {/* Back to home */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-6 right-6 flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          Home
        </button>

        <AuthForm mode={mode} setMode={setMode} onSuccess={onComplete} />

        <p className="mt-8 text-[11px] text-slate-700 text-center max-w-xs">
          By continuing, you agree to Digital Closet's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthFlow;

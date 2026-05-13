import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useClosetFilters } from '../context/ClosetFilterContext';
import { api, isApiConfigured } from '../api/client';
import ItemModal from './ItemModal';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home'          },
  { id: 'wardrobe',  label: 'My Closet',  icon: 'checkroom'     },
  { id: 'generator', label: 'Style AI',   icon: 'auto_awesome'  },
  { id: 'travel',    label: 'Travel',     icon: 'flight_takeoff'},
  { id: 'shopping',  label: 'Shop',       icon: 'shopping_bag'  },
];

const BASE = process.env.REACT_APP_API_URL || '';

function resolveAvatar(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

const AppShell = ({ activeTab, setActiveTab, onLogout, darkMode, setDarkMode }) => {
  const { triggerRefresh } = useClosetFilters();
  const [showAddModal, setShowAddModal] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const userName = (() => { try { return localStorage.getItem('user_name') || ''; } catch { return ''; } })();
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try { return resolveAvatar(localStorage.getItem('user_avatar')); } catch { return null; }
  });

  useEffect(() => {
    if (isApiConfigured()) {
      api.getSuggestionsToday().then(setSuggestion).catch(() => {});
      // Keep avatar in sync with profile
      api.getProfile().then(res => {
        if (res?.avatar_url) {
          const resolved = resolveAvatar(res.avatar_url);
          setAvatarUrl(resolved);
          try { localStorage.setItem('user_avatar', res.avatar_url); } catch {}
        }
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-[#0d1a12] text-white font-display">

      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-[#1e2f22] sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1e2f22]">
          <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-[#0d1a12]">
            <span className="material-symbols-outlined icon-filled text-[18px]">checkroom</span>
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight leading-none">Digital Closet</span>
            <span className="block text-[10px] text-slate-500 mt-0.5">AI Wardrobe</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-0.5 mt-1">
          {NAV.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] transition-all ${active ? 'icon-filled' : 'group-hover:scale-110'}`}>{icon}</span>
                {label}
                {active && <span className="ml-auto w-1 h-4 rounded-full bg-primary opacity-80" />}
              </button>
            );
          })}
        </nav>

        {/* Add Item */}
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-[#0d1a12] py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[.98] transition-all shadow-lg shadow-primary/15"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            Add Item
          </button>
        </div>

        {/* AI suggestion strip */}
        {suggestion?.reason && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">AI Pick</p>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{suggestion.reason}</p>
          </div>
        )}

        {/* Profile / Footer */}
        <div className="p-4 border-t border-[#1e2f22]">
          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full px-3 py-2 flex items-center justify-between rounded-xl transition-all ${
              activeTab === 'profile' ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-8 rounded-full flex-shrink-0 overflow-hidden border-2 border-[#1e2f22] bg-primary/20">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-primary">
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-semibold truncate leading-none ${activeTab === 'profile' ? 'text-primary' : 'text-white'}`}>
                  {userName || 'My Account'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">View profile</p>
              </div>
            </div>
          </button>
          
        </div>
      </aside>

      {/* ── Content area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0d1a12]/90 backdrop-blur-md border-b border-[#1e2f22]">
          <div className="flex items-center gap-2">
            <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-[#0d1a12]">
              <span className="material-symbols-outlined icon-filled text-[15px]">checkroom</span>
            </div>
            <span className="text-sm font-extrabold tracking-tight">Digital Closet</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 bg-primary text-[#0d1a12] px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Add
            </button>
            <button type="button" onClick={() => setActiveTab('profile')} className="p-0.5 rounded-full border border-[#1e2f22] overflow-hidden size-8 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" onError={() => setAvatarUrl(null)} />
              ) : (
                <span className="material-symbols-outlined text-[20px] text-slate-500 w-full h-full flex items-center justify-center">account_circle</span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8 pb-24 md:pb-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0d1a12]/95 backdrop-blur-xl border-t border-[#1e2f22]">
        <div className="flex items-center justify-around px-1 py-2">
          {NAV.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
                  active ? 'text-primary' : 'text-slate-600'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${active ? 'icon-filled' : ''}`}>{icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide truncate w-full text-center">{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-slate-600"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            <span className="text-[9px] font-bold uppercase tracking-wide truncate w-full text-center">Add</span>
          </button>
        </div>
      </nav>

      {showAddModal && (
        <ItemModal
          item={null}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); triggerRefresh(); }}
        />
      )}
    </div>
  );
};

export default AppShell;

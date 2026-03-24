import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useClosetFilters } from '../context/ClosetFilterContext';
import { api, isApiConfigured } from '../api/client';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: 'apparel' },
  { id: 'Top', label: 'Tops', icon: 'dry_cleaning' },
  { id: 'Bottom', label: 'Bottoms', icon: 'styler' },
  { id: 'Outerwear', label: 'Outerwear', icon: 'checkroom' },
  { id: 'Shoes', label: 'Shoes', icon: 'steps' },
  { id: 'Accessory', label: 'Accessories', icon: 'watch' },
];

const COLOR_OPTIONS = [
  { value: 'black', bg: 'bg-black', border: 'border-slate-700' },
  { value: 'white', bg: 'bg-white', border: 'border-slate-200' },
  { value: 'navy', bg: 'bg-blue-900', border: '' },
  { value: 'primary', bg: 'bg-[#13ec80]', border: '' },
  { value: 'grey', bg: 'bg-stone-500', border: '' },
];

const CATEGORIES_FORM = ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'];

function AddItemModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', category: 'Top', image_url: '', color: '', formality: 'MODERATE', formality_value: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = { name: form.name, category: form.category, image_url: form.image_url || null, color: form.color || null, formality: form.formality, formality_value: Number(form.formality_value) };
      const item = await api.createClosetItem(payload);
      onAdded(item);
      onClose();
    } catch (err) {
      setError(err.body?.detail || err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Navy Blazer" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
              {CATEGORIES_FORM.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Image URL</label>
            <input type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Color</label>
              <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="e.g. navy, black" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Formality</label>
              <select value={form.formality} onChange={e => setForm({...form, formality: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                {['CASUAL', 'MODERATE', 'FORMAL', 'UNIVERSAL'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">{loading ? 'Adding…' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const AppShell = ({ activeTab, setActiveTab, onLogout, darkMode, setDarkMode }) => {
  const { category, setCategory, color, setColor, search, setSearch } = useClosetFilters();
  const [suggestion, setSuggestion] = useState({ item_name: 'Navy Blazer', reason: 'Based on your calendar, try the Navy Blazer today.' });
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isApiConfigured()) {
      api.getSuggestionsToday().then((data) => setSuggestion(data)).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display flex flex-col transition-colors">
      {/* Top Navigation Bar - exact match to uploaded HTML */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-10 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                <span className="material-symbols-outlined font-bold">checkroom</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden md:block">Digital Closet</h1>
            </div>
            <div className="relative hidden lg:flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items, tags, or colors..."
                className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg pl-10 pr-4 py-2 w-80 text-sm focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>
          <nav className="hidden xl:flex items-center gap-8">
            <button type="button" onClick={() => setActiveTab('dashboard')} className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-primary font-semibold' : 'text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary'}`}>Dashboard</button>
            <button type="button" onClick={() => setActiveTab('wardrobe')} className={`text-sm font-medium transition-colors ${activeTab === 'wardrobe' ? 'text-primary' : 'text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary'}`}>Outfits</button>
            <button type="button" onClick={() => navigate('/app/dashboard')} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium dark:text-slate-400">Calendar</button>
            <button type="button" onClick={() => navigate('/app/analytics')} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium dark:text-slate-400">Analytics</button>
          </nav>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label={darkMode ? 'Light mode' : 'Dark mode'}>
              <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button type="button" onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform active:scale-95">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add New Item</span>
            </button>
            <button type="button" onClick={onLogout} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Logout">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full min-h-0">
        {/* Sidebar - exact match to uploaded HTML */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 p-6 hidden md:flex flex-col gap-8 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto hide-scrollbar">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Categories</h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors ${category === id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  <span className={category === id ? 'text-sm font-semibold' : 'text-sm font-medium'}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Color Palette</h3>
            <div className="grid grid-cols-5 gap-3">
              {COLOR_OPTIONS.map(({ value, bg, border }) => (
                <label key={value} className={`size-8 rounded-full cursor-pointer ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark has-[:checked]:ring-2 ring-primary border ${border} ${bg}`}>
                  <input type="radio" name="color" value={value} checked={color === value} onChange={() => setColor(value)} className="hidden" />
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Formality</h3>
            <div className="px-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-2 uppercase">
                <span>Casual</span>
                <span>Formal</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" defaultValue={65} />
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-xs font-bold text-primary uppercase mb-1">AI Suggestion</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {suggestion.reason || `Based on your calendar, try the ${suggestion.item_name || 'Navy Blazer'} today.`}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => setShowAddModal(false)}
        />
      )}

      {/* Mobile Navigation Bar - exact match to uploaded HTML */}
      <footer className="md:hidden fixed bottom-0 w-full bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-6 py-3 z-50">
        <div className="flex justify-between items-center">
          <button type="button" onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-bold">Closet</span>
          </button>
          <button type="button" onClick={() => setActiveTab('wardrobe')} className={`flex flex-col items-center gap-1 ${activeTab === 'wardrobe' ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-[10px] font-bold">Plans</span>
          </button>
          <button type="button" onClick={() => setShowAddModal(true)} className="bg-primary text-background-dark size-12 rounded-full flex items-center justify-center -mt-8 border-4 border-white dark:border-background-dark shadow-lg">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button type="button" onClick={() => setActiveTab('generator')} className={`flex flex-col items-center gap-1 ${activeTab === 'generator' ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-[10px] font-bold">AI</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;

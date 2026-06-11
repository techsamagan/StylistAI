import React, { useState, useEffect } from 'react';
import { api, isApiConfigured, getCachedSync } from '../api/client';
import { useClosetFilters } from '../context/ClosetFilterContext';
import ItemModal from '../components/ItemModal';
import Toast from '../components/Toast';

const CATEGORIES = [
  { id: 'all',       label: 'All',        icon: 'apparel'     },
  { id: 'Top',       label: 'Tops',       icon: 'dry_cleaning' },
  { id: 'Bottom',    label: 'Bottoms',    icon: 'styler'      },
  { id: 'Outerwear', label: 'Outerwear',  icon: 'checkroom'   },
  { id: 'Shoes',     label: 'Shoes',      icon: 'steps'       },
  { id: 'Accessory', label: 'Accessories',icon: 'watch'       },
];

const FORMALITY_COLORS = {
  FORMAL:    'text-stone-400 bg-stone-400/10',
  MODERATE:  'text-primary bg-primary/10',
  CASUAL:    'text-sky-400 bg-sky-400/10',
  UNIVERSAL: 'text-amber-400 bg-amber-400/10',
};

function normalizeItem(item) {
  const tag = item.category?.value ?? item.category ?? item.tag ?? 'Top';
  return {
    id:          item.id,
    name:        item.name,
    image:       item.image_url ?? item.image,
    tag,
    formality:   item.formality ?? 'MODERATE',
    formalityValue: item.formality_value ?? item.formalityValue ?? 50,
    color:       item.color ?? null,
  };
}

/* ── Skeleton card ────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-[#1E1813] border border-[#33291F] rounded-2xl overflow-hidden">
    <div className="aspect-[4/5] skeleton" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="skeleton h-2.5 w-1/3 rounded" />
    </div>
  </div>
);

/* ── Grid item card ───────────────────────── */
const GridCard = ({ item, onEdit, onDelete, onWear }) => (
  <div className="group relative flex flex-col bg-[#1E1813] border border-[#33291F] rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
    <div className="relative aspect-[4/5] bg-[#17120E] flex items-center justify-center p-5">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <span className="material-symbols-outlined text-[48px] text-[#33291F]">checkroom</span>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onWear(item)}
          className="bg-primary text-[#17120E] font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Wear
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="bg-[#9B4A3D]/25 text-[#CF8675] text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#9B4A3D]/35 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>
        </button>
      </div>

      {/* Category badge */}
      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
        <span className="text-[9px] font-bold text-white uppercase tracking-wide">{item.tag}</span>
      </div>
    </div>

    <div className="p-3.5">
      <h3 className="font-bold text-sm text-white truncate mb-1.5">{item.name}</h3>
      <div className="flex items-center justify-between">
        {item.formality && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${FORMALITY_COLORS[item.formality] || 'text-slate-400 bg-slate-800'}`}>
            {item.formality}
          </span>
        )}
        {item.color && (
          <span className="text-[9px] text-slate-500 capitalize">{item.color}</span>
        )}
      </div>
      {item.formalityValue !== undefined && (
        <div className="mt-2.5 h-0.5 w-full bg-[#33291F] rounded-full overflow-hidden">
          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${item.formalityValue}%` }} />
        </div>
      )}
    </div>
  </div>
);

/* ── List item row ────────────────────────── */
const ListRow = ({ item, onEdit, onDelete, onWear }) => (
  <div className="group flex items-center gap-4 bg-[#1E1813] border border-[#33291F] rounded-xl p-3 hover:border-primary/20 hover:bg-[#251D16] transition-all duration-200">
    <div className="size-14 flex-shrink-0 bg-[#17120E] rounded-lg overflow-hidden flex items-center justify-center border border-[#33291F]">
      {item.image
        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
        : <span className="material-symbols-outlined text-[22px] text-[#33291F]">checkroom</span>
      }
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
        {item.formality && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 ${FORMALITY_COLORS[item.formality] || 'text-slate-400 bg-slate-800'}`}>
            {item.formality}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-600 uppercase tracking-wide">{item.tag}</span>
        {item.color && <span className="text-[10px] text-slate-600">· {item.color}</span>}
      </div>
    </div>

    <div className="w-20 h-1 bg-[#33291F] rounded-full overflow-hidden flex-shrink-0 hidden sm:block">
      <div className="h-full bg-primary/50 rounded-full" style={{ width: `${item.formalityValue ?? 50}%` }} />
    </div>

    <div className="flex-shrink-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button type="button" onClick={() => onWear(item)} className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
        Wear
      </button>
      <button type="button" onClick={() => onEdit(item)} className="bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 transition-colors">
        Edit
      </button>
      <button type="button" onClick={() => onDelete(item)} className="bg-[#9B4A3D]/12 text-[#CF8675] p-1 rounded-lg hover:bg-[#9B4A3D]/25 transition-colors">
        <span className="material-symbols-outlined text-[13px]">delete</span>
      </button>
    </div>
  </div>
);

/* ── Main View ────────────────────────────── */
const WardrobeView = () => {
  const { refreshKey, triggerRefresh } = useClosetFilters();
  const [viewMode,   setViewMode]   = useState('grid');
  const [category,   setCategory]   = useState('all');
  const [search,     setSearch]     = useState('');
  
  const [items,      setItems]      = useState(() => {
    const params = new URLSearchParams();
    const q = params.toString() ? `?${params.toString()}` : '';
    const cached = getCachedSync(`closet-${q}`);
    return cached ? cached.map(normalizeItem) : [];
  });
  
  const [loading,    setLoading]    = useState(() => items.length === 0);

  const [editItem,   setEditItem]   = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [toast,      setToast]      = useState(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => { if (!cancelled) setLoading(true); }, 150);
    
    if (isApiConfigured()) {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search.trim()) params.search = search.trim();
      api.getCloset(params)
        .then(data => { 
          clearTimeout(timer);
          if (!cancelled) { setItems(data.map(normalizeItem)); setLoading(false); }
        })
        .catch(() => { 
          clearTimeout(timer);
          if (!cancelled) { setItems([]); setLoading(false); }
        });
    } else {
      clearTimeout(timer);
      setItems([]);
      setLoading(false);
    }
    return () => { cancelled = true; clearTimeout(timer); };
  }, [category, search, refreshKey]);

  const handleDelete = async (item) => {
    if (!isApiConfigured()) return;
    try {
      await api.deleteClosetItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setToast(`${item.name} removed.`);
    } catch {
      setToast('Failed to delete item.');
    }
  };

  const handleWear = (item) => setToast(`${item.name} marked as worn today!`);

  /* ── Render ───────────────────────────── */
  return (
    <div className="animate-fade-up">

      {/* ── Top header ──────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-serif font-light text-white tracking-tight">My Closet</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? 'Loading…' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden sm:flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-slate-600 text-[16px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-[#1E1813] border border-[#33291F] rounded-xl py-2 pl-8 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/40 w-44 transition-all focus:w-52"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-[#1E1813] border border-[#33291F] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Category pills ──────────────── */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto hide-scrollbar pb-1">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
              category === id
                ? 'bg-primary text-[#17120E] shadow-lg shadow-primary/20'
                : 'bg-[#1E1813] border border-[#33291F] text-slate-400 hover:text-white hover:border-[#43372A]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Mobile search ───────────────── */}
      <div className="relative flex items-center sm:hidden mb-4">
        <span className="material-symbols-outlined absolute left-3 text-slate-600 text-[16px]">search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full bg-[#1E1813] border border-[#33291F] rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* ── Content ─────────────────────── */}
      {loading && items.length === 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        /* ── Empty state ─────────────────── */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-20 rounded-full bg-[#1E1813] border border-[#33291F] flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[36px] text-slate-600">checkroom</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {search || category !== 'all' ? 'No items found' : 'Your closet is empty'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {search || category !== 'all'
              ? 'Try a different search or category.'
              : 'Upload photos of your clothes to get started. The AI will suggest outfits once you have items.'}
          </p>
          {!search && category === 'all' && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-primary text-[#17120E] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[.98] shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">upload</span>
              Upload your first item
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid ───────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <GridCard
              key={item.id}
              item={item}
              onEdit={setEditItem}
              onDelete={handleDelete}
              onWear={handleWear}
            />
          ))}
          {/* Add card */}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="group flex flex-col items-center justify-center min-h-[200px] bg-[#1E1813] border-2 border-dashed border-[#33291F] rounded-2xl hover:border-primary/30 hover:bg-[#251D16] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[32px] text-slate-700 group-hover:text-primary transition-colors mb-2">add_circle</span>
            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-400 transition-colors">Add Item</span>
          </button>
        </div>
      ) : (
        /* ── List ───────────────────────── */
        <div className="space-y-2">
          {items.map(item => (
            <ListRow
              key={item.id}
              item={item}
              onEdit={setEditItem}
              onDelete={handleDelete}
              onWear={handleWear}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="group w-full flex items-center gap-4 bg-[#1E1813] border-2 border-dashed border-[#33291F] rounded-xl p-3 hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="size-14 flex-shrink-0 bg-[#17120E] rounded-lg flex items-center justify-center border border-[#33291F] group-hover:border-primary/20">
              <span className="material-symbols-outlined text-[22px] text-slate-600 group-hover:text-primary transition-colors">add</span>
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-400 transition-colors">Add new item to closet</span>
          </button>
        </div>
      )}

      {/* ── Modals ──────────────────────── */}
      {editItem && (
        <ItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); triggerRefresh(); setToast('Item updated!'); }}
        />
      )}
      {showAdd && (
        <ItemModal
          item={null}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); triggerRefresh(); setToast('Item added to your closet!'); }}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
};

export default WardrobeView;

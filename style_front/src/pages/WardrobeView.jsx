import React, { useState, useEffect } from 'react';
import { DASHBOARD_WARDROBE } from '../data/mockData';
import { api, isApiConfigured } from '../api/client';
import { useClosetFilters } from '../context/ClosetFilterContext';

const CATEGORY_ICON = {
  Top: 'dry_cleaning',
  Bottom: 'styler',
  Outerwear: 'checkroom',
  Shoes: 'steps',
  Accessory: 'watch',
};

function normalizeItem(item) {
  const tag = item.category?.value ?? item.category ?? item.tag ?? 'Top';
  const color = item.color;
  return {
    id: item.id,
    name: item.name,
    image: item.image_url ?? item.image,
    tag,
    formality: item.formality ?? 'MODERATE',
    formalityValue: item.formality_value ?? item.formalityValue ?? 50,
    colorDots: item.colorDots ?? item.colors ?? (color ? [color] : ['slate']),
    noEdit: item.noEdit ?? false,
  };
}

function ColorDot({ color }) {
  const map = {
    white: 'bg-white border-slate-200',
    slate: 'bg-slate-300 dark:bg-slate-500',
    blue: 'bg-blue-900',
    navy: 'bg-blue-900',
    green: 'bg-green-800',
    amber: 'bg-amber-900',
    black: 'bg-black',
    grey: 'bg-stone-500',
    primary: 'bg-primary',
  };
  return <div className={`size-3 rounded-full border border-slate-200 dark:border-slate-600 ${map[color] || 'bg-slate-300'}`} />;
}

const WardrobeView = () => {
  const { filters } = useClosetFilters();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (isApiConfigured()) {
      api.getCloset(filters)
        .then((data) => { if (!cancelled) setItems(data.map(normalizeItem)); })
        .catch(() => { if (!cancelled) setItems(DASHBOARD_WARDROBE.map(normalizeItem)); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      let list = DASHBOARD_WARDROBE;
      if (filters.category) list = list.filter((i) => i.tag === filters.category);
      if (filters.color) list = list.filter((i) => (i.colorDots || []).includes(filters.color) || (Array.isArray(i.colorDots) && i.colorDots[0] === filters.color));
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((i) => i.name.toLowerCase().includes(q) || (i.tag && i.tag.toLowerCase().includes(q)));
      }
      setItems(list.map(normalizeItem));
      setLoading(false);
    }
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.color, filters.formality, filters.search]);

  const isFormalityHighlight = (label) => ['MODERATE', 'FORMAL', 'UNIVERSAL'].includes(label);
  const displayCount = items.length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Closet</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Showing {displayCount} items in your collection.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'}`}
            aria-label="Grid view"
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'}`}
            aria-label="List view"
          >
            <span className="material-symbols-outlined text-[20px]">view_list</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      ) : viewMode === 'list' ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-5 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 p-4 hover:shadow-lg"
            >
              <div className="relative size-16 flex-shrink-0 bg-slate-50 dark:bg-[#1a2e24] rounded-xl overflow-hidden flex items-center justify-center">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">{CATEGORY_ICON[item.tag] || 'dry_cleaning'}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFormalityHighlight(item.formality) ? 'text-primary bg-primary/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>{item.formality}</span>
                  <div className="flex gap-1">{(item.colorDots || []).map((c, i) => <ColorDot key={i} color={c} />)}</div>
                </div>
              </div>
              <div className="flex-shrink-0 w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${item.formalityValue ?? 50}%` }} />
              </div>
              <button type="button" className="flex-shrink-0 opacity-0 group-hover:opacity-100 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:bg-primary/20">Wear</button>
            </div>
          ))}
          <div className="group flex items-center gap-5 bg-slate-100 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 p-4 cursor-pointer">
            <div className="size-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px] text-slate-400 group-hover:text-primary">upload</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">Upload Item</h3>
              <p className="text-sm text-slate-400">Drop your image here or click to browse</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8`}>
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col bg-white dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="relative aspect-[4/5] bg-slate-50 dark:bg-[#1a2e24] flex items-center justify-center p-8">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 size-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[18px] text-primary">{CATEGORY_ICON[item.tag] || 'dry_cleaning'}</span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" className="bg-white text-slate-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary transition-colors">Wear Today</button>
                  {!item.noEdit && (
                    <button type="button" className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.name}</h3>
                  <div className="flex gap-1">
                    {(item.colorDots || []).map((c, i) => (
                      <ColorDot key={i} color={c} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter dark:text-slate-400">Formality</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isFormalityHighlight(item.formality)
                          ? 'text-primary bg-primary/10'
                          : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {item.formality}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${item.formalityValue ?? 50}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Upload Item */}
          <div className="group flex flex-col bg-slate-100 dark:bg-slate-900/20 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 items-center justify-center min-h-[350px] cursor-pointer">
            <div className="flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors text-center p-6">
              <div className="size-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">upload</span>
              </div>
              <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Upload Item</h3>
              <p className="text-sm mt-1 max-w-[150px]">Drop your image here or click to browse</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobeView;

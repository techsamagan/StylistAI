import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, isApiConfigured } from '../api/client';

const BASE = process.env.REACT_APP_API_URL || '';
function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return BASE + url;
}

const CATEGORIES = ['All', 'Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'];
const STORES = ['All Stores', 'Zara', 'H&M', 'Nike', 'Adidas', "Levi's", 'Uniqlo', 'Mango', 'ASOS'];

const TRY_ON_STEPS = [
  'Analysing item…',
  'Reading your profile…',
  'Building your look…',
  'Generating image…',
];

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === 'error'
      ? 'bg-red-900/80 border-red-700 text-red-200'
      : 'bg-[#1e2f22] border-[#2a4030] text-white';

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md max-w-xs w-full ${colors}`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button type="button" onClick={onClose} className="opacity-60 hover:opacity-100 transition">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────
function ProductCard({ item, onTryOn }) {
  return (
    <div className="flex flex-col bg-[#111e16] border border-[#1e2f22] rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0d1a12]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[48px]">checkroom</span>
          </div>
        )}
        {/* Store badge overlay */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/90 text-[#0d1a12] shadow">
            {item.brand}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-0.5">
            {item.brand} · {item.category}
          </p>
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.name}</p>
          <p className="text-primary font-bold text-sm mt-1">${item.price}</p>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => onTryOn(item)}
            className="flex-1 bg-primary text-[#0d1a12] text-xs font-bold py-2 rounded-xl hover:bg-primary/90 active:scale-[.97] transition-all"
          >
            Try On
          </button>
          {item.store_url && (
            <a
              href={item.store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#1e2f22] hover:border-primary/40 hover:bg-primary/5 transition-all"
              title="Visit Store"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-primary transition-colors">
                shopping_bag
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TryOnModal ────────────────────────────────────────────────────────────────
function TryOnModal({ item, onClose, userAvatarUrl, onSaved }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const called = useRef(false);

  // Step cycling
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => {
      setStepIdx((i) => (i + 1) % TRY_ON_STEPS.length);
    }, 1800);
    return () => clearInterval(iv);
  }, [loading]);

  // Auto-call try-on on mount
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    api
      .shoppingTryOn({ item_id: item.id, context: 'Casual' })
      .then((res) => {
        setResultUrl(resolveUrl(res.image_url));
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.body?.detail || err?.message || 'Try-on failed. Please try again.');
        setLoading(false);
      });
  }, [item.id]);

  const handleRegenerate = () => {
    called.current = false;
    setLoading(true);
    setResultUrl(null);
    setError(null);
    setStepIdx(0);
    // re-trigger
    setTimeout(() => {
      called.current = false;
      api
        .shoppingTryOn({ item_id: item.id, context: 'Casual' })
        .then((res) => {
          setResultUrl(resolveUrl(res.image_url));
          setLoading(false);
        })
        .catch((err) => {
          setError(err?.body?.detail || err?.message || 'Try-on failed. Please try again.');
          setLoading(false);
        });
    }, 100);
  };

  const handleSave = async () => {
    if (!resultUrl) return;
    setSaving(true);
    try {
      await api.createClosetItem({
        name: item.name,
        category: item.category,
        image_url: resultUrl,
        color: item.color || null,
        formality: 'CASUAL',
        formality_value: 40,
      });
      onSaved('Saved to closet!');
      onClose();
    } catch {
      onSaved('Could not save item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#0d1a12] border border-[#1e2f22] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#1e2f22]">
          <h2 className="text-base font-extrabold tracking-tight">Virtual Try-On</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-400">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left — item info */}
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#111e16]">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/90 text-[#0d1a12]">
                  {item.brand}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">
                {item.category}
              </p>
              <p className="font-bold text-white text-sm leading-snug">{item.name}</p>
              <p className="text-primary font-bold mt-1">${item.price}</p>
              {item.color && (
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.color}</p>
              )}
              {item.description && (
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description}</p>
              )}
              {item.store_url && (
                <a
                  href={item.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                  Visit Store
                </a>
              )}
            </div>
          </div>

          {/* Right — result */}
          <div className="flex flex-col gap-4">
            {/* Avatar notice */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111e16] border border-[#1e2f22]">
              <div className="size-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#1e2f22] bg-primary/10">
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-slate-500">person</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">AI Try-On</p>
                <p className="text-[10px] text-slate-500">Styled to your profile</p>
              </div>
            </div>

            {/* Context pills */}
            <div className="flex flex-wrap gap-1.5">
              {['Casual', item.category, item.brand].filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Result area */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-[#1e2f22] bg-[#111e16] min-h-[240px] relative flex items-center justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-white">{TRY_ON_STEPS[stepIdx]}</p>
                  <p className="text-[10px] text-slate-500">~15 sec</p>
                </div>
              )}
              {!loading && error && (
                <div className="p-4">
                  <div className="p-4 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 text-sm text-center">
                    <span className="material-symbols-outlined text-[20px] mb-2 block">error</span>
                    {error}
                  </div>
                </div>
              )}
              {!loading && resultUrl && !error && (
                <>
                  <img
                    src={resultUrl}
                    alt="Try-on result"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="material-symbols-outlined text-[12px] text-primary">auto_awesome</span>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">AI</span>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            {!loading && (
              <div className="flex gap-2">
                {resultUrl && !error && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-[#0d1a12] py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[.97] transition-all disabled:opacity-60"
                  >
                    {saving ? (
                      <div className="size-4 border-2 border-[#0d1a12]/40 border-t-[#0d1a12] rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    )}
                    Save to Closet
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1e2f22] hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-semibold text-slate-300"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ShoppingView (main) ───────────────────────────────────────────────────────
const ShoppingView = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStore, setActiveStore] = useState('All Stores');
  const [selectedItem, setSelectedItem] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState(() => {
    try {
      const raw = localStorage.getItem('user_avatar');
      return resolveUrl(raw);
    } catch {
      return null;
    }
  });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Fetch items when category changes
  useEffect(() => {
    if (!isApiConfigured()) return;
    setLoading(true);
    api
      .getShoppingItems({ category: activeCategory })
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setItems([]);
        showToast('Failed to load items', 'error');
      })
      .finally(() => setLoading(false));
  }, [activeCategory, showToast]);

  // Fetch profile avatar
  useEffect(() => {
    if (!isApiConfigured()) return;
    api
      .getProfile()
      .then((res) => {
        if (res?.avatar_url) {
          const resolved = resolveUrl(res.avatar_url);
          setUserAvatarUrl(resolved);
          try {
            localStorage.setItem('user_avatar', res.avatar_url);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Client-side store filter
  const filteredItems =
    activeStore === 'All Stores'
      ? items
      : items.filter((item) => item.brand === activeStore);

  const pillBase =
    'px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap';
  const pillActive = 'bg-primary text-[#0d1a12]';
  const pillInactive =
    'bg-[#111e16] border border-[#1e2f22] text-slate-400 hover:text-white hover:border-primary/30';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Shop &amp; Try On</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse curated items from top stores and see how they look on you with AI.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`${pillBase} ${activeCategory === cat ? pillActive : pillInactive}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Store filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {STORES.map((store) => (
          <button
            key={store}
            type="button"
            onClick={() => setActiveStore(store)}
            className={`${pillBase} ${activeStore === store ? pillActive : pillInactive}`}
          >
            {store}
          </button>
        ))}
      </div>

      {/* Item count */}
      {!loading && (
        <p className="text-[11px] text-slate-600 mb-4 font-medium">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          {activeStore !== 'All Stores' ? ` from ${activeStore}` : ''}
          {activeCategory !== 'All' ? ` · ${activeCategory}` : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-[#111e16] border border-[#1e2f22] animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-slate-700">
            shopping_bag
          </span>
          <p className="text-slate-500 text-sm">No items found for this filter.</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('All');
              setActiveStore('All Stores');
            }}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} onTryOn={setSelectedItem} />
          ))}
        </div>
      )}

      {/* Try-on modal */}
      {selectedItem && (
        <TryOnModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          userAvatarUrl={userAvatarUrl}
          onSaved={(msg, type) => {
            setSelectedItem(null);
            showToast(msg, type);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ShoppingView;

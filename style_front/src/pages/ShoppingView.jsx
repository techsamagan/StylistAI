import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';

const BASE = process.env.REACT_APP_API_URL || '';
function resolveUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : BASE + url;
}

const CAT_ICON = {
  Top: 'checkroom', Bottom: 'apparel', Outerwear: 'dry_cleaning',
  Shoes: 'footprint', Accessory: 'watch',
};

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const tone = type === 'error'
    ? 'bg-[#3a201c] border-[#5b2f29] text-[#f0c9c2]'
    : 'bg-[#251D16] border-[#43372A] text-white';
  return (
    <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md max-w-xs w-full ${tone}`}>
      <span className="material-symbols-outlined text-[18px]">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Product thumbnail (handles missing image) ────────────────────────────────
function Thumb({ item, className = '' }) {
  const img = resolveUrl(item.image_url);
  return (
    <div className={`relative overflow-hidden bg-[#251D16] border border-[#33291F] ${className}`}>
      {img ? (
        <img src={img} alt={item.name} className="w-full h-full object-cover"
             onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-clay/50">
          <span className="material-symbols-outlined text-[28px]">{CAT_ICON[item.category] || 'apparel'}</span>
        </div>
      )}
    </div>
  );
}

// ── Single product card ──────────────────────────────────────────────────────
function SingleCard({ item }) {
  return (
    <a
      href={item.store_url || '#'}
      target={item.store_url ? '_blank' : undefined}
      rel="noreferrer"
      className="group block"
    >
      <Thumb item={item} className="aspect-[3/4] rounded-xl group-hover:border-primary/40 transition-colors" />
      <div className="mt-2.5 px-0.5">
        <div className="flex items-center gap-2">
          {item.color && (
            <span className="size-3 rounded-full border border-white/15 flex-shrink-0"
                  style={{ background: namedToCss(item.color) }} />
          )}
          <p className="text-[10px] uppercase tracking-[0.18em] text-clay truncate">{item.brand || item.category}</p>
        </div>
        <p className="text-sm text-white mt-1 leading-snug line-clamp-1 group-hover:text-primary transition-colors">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-white/90" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {item.price != null ? `$${Number(item.price).toFixed(0)}` : '—'}
          </p>
          {item.store_url && (
            <span className="text-[10px] text-clay group-hover:text-primary inline-flex items-center gap-0.5 transition-colors">
              Shop <span className="material-symbols-outlined text-[12px]">north_east</span>
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

// ── Complete-look card (a composition) ───────────────────────────────────────
function LookCard({ look, index }) {
  return (
    <div className="border border-[#33291F] rounded-2xl bg-[#1E1813] overflow-hidden">
      <div className="grid grid-cols-4">
        {look.items.slice(0, 4).map((it, i) => (
          <a key={i} href={it.store_url || '#'} target={it.store_url ? '_blank' : undefined} rel="noreferrer" className="group">
            <Thumb item={it} className="aspect-square group-hover:opacity-90 transition-opacity" />
          </a>
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl text-white leading-none">{look.title}</h3>
          {look.total_price != null && (
            <span className="text-sm text-clay flex-shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
              ${Number(look.total_price).toFixed(0)}
            </span>
          )}
        </div>
        <p className="text-xs text-clay mt-2 leading-relaxed">{look.why}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {look.items.map((it, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-white/70 bg-[#251D16] border border-[#33291F] rounded-full px-2 py-1">
              <span className="size-2 rounded-full" style={{ background: namedToCss(it.color) }} />
              {it.category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Upload zone (drag + drop) ────────────────────────────────────────────────
function UploadZone({ onFile, busy }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const f = files && files[0];
    if (f) onFile(f);
  };

  return (
    <div className="max-w-xl mx-auto text-center pt-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-clay">Personal Color Analysis</p>
      <h2 className="font-serif font-light text-4xl md:text-5xl text-white mt-3 leading-tight">
        Find the colors<br /><span className="italic text-primary">that were always yours.</span>
      </h2>
      <p className="text-sm text-clay mt-4 max-w-md mx-auto leading-relaxed">
        Upload a selfie in natural light. We read your undertones, build your seasonal palette, and curate complete looks and pieces engineered to flatter you.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`mt-8 cursor-pointer rounded-2xl border border-dashed transition-all px-6 py-14
          ${drag ? 'border-primary bg-primary/5' : 'border-[#43372A] hover:border-primary/50 bg-[#1E1813]'}`}
      >
        {busy ? (
          <div className="flex flex-col items-center gap-3">
            <span className="size-9 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm text-clay">Reading your undertones…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[40px] text-primary/80">add_a_photo</span>
            <p className="text-sm text-white">Drag a selfie here, or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="text-[11px] text-clay">JPEG, PNG or WebP · up to 8MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
               onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

// ── Color-season reveal ──────────────────────────────────────────────────────
function SeasonReveal({ analysis, onReanalyze }) {
  return (
    <div className="border-b border-[#33291F] pb-10 mb-10">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-clay">Your Color Season</p>
        <button onClick={onReanalyze} className="text-[11px] uppercase tracking-[0.18em] text-clay hover:text-primary inline-flex items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[14px]">refresh</span> Re-analyze
        </button>
      </div>
      <h1 className="font-serif font-light text-5xl md:text-7xl text-white mt-3 leading-none tracking-tight">{analysis.season}</h1>
      {analysis.undertone && (
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary mt-3">{analysis.undertone} undertone</p>
      )}
      {analysis.description && (
        <p className="text-sm text-clay mt-4 max-w-xl leading-relaxed">{analysis.description}</p>
      )}

      {/* palette as flush color fields */}
      <div className="grid grid-cols-4 sm:grid-cols-8 mt-7 border border-[#33291F] rounded-xl overflow-hidden">
        {analysis.palette.map((c, i) => (
          <div key={i} className="h-20 sm:h-24 flex items-end p-2" style={{ background: c.hex }} title={`${c.name} ${c.hex}`}>
            <span className="text-[9px] uppercase tracking-wide" style={{ color: '#fff', mixBlendMode: 'difference' }}>{c.name}</span>
          </div>
        ))}
      </div>
      {analysis.avoid?.length > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] text-clay">Wear sparingly</span>
          <div className="flex gap-1">
            {analysis.avoid.map((h, i) => (
              <span key={i} className="size-4 rounded-full border border-white/10" style={{ background: h }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ShoppingView() {
  const [view, setView] = useState('loading'); // loading | upload | analyzing | results
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setView('loading');
    api.getColorShop()
      .then((d) => { setData(d); setView('results'); })
      .catch((e) => {
        if (e.status === 401) { setToast({ message: 'Please sign in to get recommendations.', type: 'error' }); }
        setView('upload');
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFile = (file) => {
    setView('analyzing');
    const fd = new FormData();
    fd.append('file', file);
    api.analyzeSelfie(fd)
      .then(() => api.getColorShop())
      .then((d) => { setData(d); setView('results'); setToast({ message: 'Your colors are ready.' }); })
      .catch((e) => {
        setToast({ message: e.body?.detail || 'Could not analyze that selfie. Try another.', type: 'error' });
        setView('upload');
      });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif font-light text-3xl text-white tracking-tight">Recommendations</h1>
        <p className="text-sm text-clay mt-1">Shopping curated to the colors that flatter you most.</p>
      </div>

      {view === 'loading' && (
        <div className="flex justify-center py-28">
          <span className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      {(view === 'upload' || view === 'analyzing') && (
        <UploadZone onFile={handleFile} busy={view === 'analyzing'} />
      )}

      {view === 'results' && data && (
        <>
          <SeasonReveal analysis={data.analysis} onReanalyze={() => setView('upload')} />

          {/* Complete looks */}
          {data.looks?.length > 0 && (
            <section className="mb-12">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-serif text-2xl text-white">Complete looks for you</h2>
                <span className="text-[11px] uppercase tracking-[0.18em] text-clay">{data.looks.length} curated</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {data.looks.map((lk, i) => <LookCard key={i} look={lk} index={i} />)}
              </div>
            </section>
          )}

          {/* Single pieces */}
          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="font-serif text-2xl text-white">Single pieces in your palette</h2>
              <span className="text-[11px] uppercase tracking-[0.18em] text-clay">{data.singles.length} items</span>
            </div>
            {data.singles.length === 0 ? (
              <p className="text-sm text-clay py-12 text-center">No catalog pieces match your palette yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7">
                {data.singles.map((it) => <SingleCard key={it.id} item={it} />)}
              </div>
            )}
          </section>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// Map a named/loose color string to a CSS color for small dots (best-effort).
function namedToCss(c) {
  if (!c) return '#8C8175';
  const s = c.trim().toLowerCase();
  const map = {
    navy: '#1F2A44', charcoal: '#36454F', burgundy: '#800020', maroon: '#800000',
    sapphire: '#0F52BA', cobalt: '#0047AB', emerald: '#046307', forest: '#0B6623',
    cream: '#FFFDD0', ivory: '#FFFFF0', beige: '#F5F5DC', camel: '#C19A6B',
    tan: '#D2B48C', khaki: '#C3B091', olive: '#708238', sage: '#9CAF88',
    'light blue': '#9DB4D6', blue: '#2563EB', teal: '#008080', mustard: '#C9A227',
    rust: '#B7410E', terracotta: '#C66B3D', plum: '#8E4585', mauve: '#915F6D',
    grey: '#808080', gray: '#808080', stone: '#E4DDD1', taupe: '#B38B6D',
  };
  if (map[s]) return map[s];
  if (/^#?[0-9a-f]{6}$/.test(s)) return s.startsWith('#') ? s : `#${s}`;
  return s; // let the browser try (e.g. "black", "white", "red")
}

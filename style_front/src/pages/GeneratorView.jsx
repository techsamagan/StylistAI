import React, { useState } from 'react';
import { api, isApiConfigured } from '../api/client';
import Toast from '../components/Toast';

const OCCASIONS = [
  { id: 'Office',     label: 'Office',      icon: 'work',          desc: 'Professional & polished'   },
  { id: 'Date Night', label: 'Date Night',   icon: 'favorite',      desc: 'Elevated & confident'      },
  { id: 'Travel',     label: 'Travel',       icon: 'flight',        desc: 'Comfortable & versatile'   },
  { id: 'Gym',        label: 'Gym',          icon: 'fitness_center', desc: 'Athletic & functional'    },
  { id: 'Casual',     label: 'Casual',       icon: 'weekend',       desc: 'Relaxed & effortless'      },
  { id: 'Event',      label: 'Special Event',icon: 'celebration',   desc: 'Standout & memorable'      },
];

const VIBE_LABELS = [
  { max: 20,  label: 'Pure Comfort',   desc: 'cozy and relaxed'       },
  { max: 40,  label: 'Casual',         desc: 'easy and approachable'  },
  { max: 60,  label: 'Balanced',       desc: 'versatile and safe'     },
  { max: 80,  label: 'Polished',       desc: 'sharp and intentional'  },
  { max: 100, label: 'Style Focus',    desc: 'bold and expressive'    },
];

function getVibeInfo(v) {
  return VIBE_LABELS.find(x => v <= x.max) || VIBE_LABELS[VIBE_LABELS.length - 1];
}

const FORMALITY_COLORS = {
  FORMAL:    'text-violet-400 bg-violet-400/10 border-violet-400/20',
  MODERATE:  'text-primary bg-primary/10 border-primary/20',
  CASUAL:    'text-sky-400 bg-sky-400/10 border-sky-400/20',
  UNIVERSAL: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

const GeneratorView = () => {
  const [context, setContext]     = useState('Office');
  const [vibe,    setVibe]        = useState(50);
  const [step,    setStep]        = useState('config');   // 'config' | 'loading' | 'result'
  const [outfit,  setOutfit]      = useState(null);
  const [error,   setError]       = useState(null);
  const [saving,  setSaving]      = useState(false);
  const [toast,   setToast]       = useState(null);

  const vibeInfo = getVibeInfo(vibe);

  const handleGenerate = async () => {
    setError(null);
    setStep('loading');
    if (isApiConfigured()) {
      try {
        const res = await api.generateOutfit({ context, vibe });
        setOutfit(res);
        setStep('result');
      } catch (e) {
        setError(e.body?.detail || e.message || 'Failed to generate outfit.');
        setStep('config');
      }
    } else {
      await new Promise(r => setTimeout(r, 1200));
      setOutfit({
        items: [],
        explanation: `Styled for ${context} — ${vibeInfo.label} vibe.`,
      });
      setStep('result');
    }
  };

  const handleSave = async () => {
    if (!outfit) return;
    setSaving(true);
    try {
      if (isApiConfigured()) {
        await api.saveOutfit({ context, items: outfit.items, explanation: outfit.explanation });
      }
      setToast('Outfit saved to your collection!');
    } catch {
      setToast('Failed to save outfit.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => { setOutfit(null); setStep('config'); setError(null); };

  const items = outfit?.items ?? [];

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">

      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Style Generator</h1>
        <p className="text-slate-500 text-sm mt-1">Tell us the context, set the vibe, get your outfit.</p>
      </div>

      {/* ── Config step ─────────────────────────── */}
      {step === 'config' && (
        <div className="space-y-6 animate-fade-up">

          {/* Occasion grid */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Where are you going?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OCCASIONS.map(({ id, label, icon, desc }) => {
                const active = context === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setContext(id)}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                      active
                        ? 'border-primary bg-primary/8 shadow-lg shadow-primary/10'
                        : 'border-[#1e2f22] bg-[#121f17] hover:border-[#2a4032] hover:bg-[#162118]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] mb-2.5 ${active ? 'text-primary icon-filled' : 'text-slate-500'}`}>
                      {icon}
                    </span>
                    <span className={`text-sm font-bold mb-0.5 ${active ? 'text-white' : 'text-slate-300'}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-slate-600 leading-tight">{desc}</span>
                    {active && (
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Vibe
              </label>
              <div className="text-right">
                <span className="text-sm font-bold text-primary">{vibeInfo.label}</span>
                <span className="text-xs text-slate-500 ml-1.5">— {vibeInfo.desc}</span>
              </div>
            </div>
            <div className="bg-[#121f17] border border-[#1e2f22] rounded-2xl p-5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-3">
                <span>Comfort</span>
                <span>Style</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
                  <div
                    className="h-1 bg-primary rounded-full transition-all"
                    style={{ width: `${vibe}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0} max={100}
                  value={vibe}
                  onChange={e => setVibe(Number(e.target.value))}
                  className="relative z-10"
                />
              </div>
              <div className="flex justify-between mt-3">
                {VIBE_LABELS.map(({ label }, i) => (
                  <span
                    key={label}
                    className={`text-[9px] font-bold transition-colors ${
                      getVibeInfo(vibe).label === label ? 'text-primary' : 'text-slate-700'
                    }`}
                  >
                    {i === 0 || i === VIBE_LABELS.length - 1 ? label : '·'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 bg-primary text-[#0d1a12] py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 active:scale-[.98] transition-all shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Generate Outfit
          </button>
        </div>
      )}

      {/* ── Loading step ─────────────────────────── */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <div className="relative mb-6">
            <div className="size-16 rounded-full border-2 border-[#1e2f22] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] text-primary animate-pulse">auto_awesome</span>
            </div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin-slow" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Building your look…</h3>
          <p className="text-slate-500 text-sm">Matching pieces for &ldquo;{context}&rdquo;</p>
        </div>
      )}

      {/* ── Result step ─────────────────────────── */}
      {step === 'result' && outfit && (
        <div className="animate-fade-up space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Outfit Ready</span>
              <h2 className="text-xl font-bold text-white mt-0.5">{context} · {vibeInfo.label}</h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-[#1e2f22] hover:border-[#2a4032]"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              New Look
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-[#121f17] border border-[#1e2f22] rounded-2xl p-4">
            <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-primary/40 pl-3">
              &ldquo;{outfit.explanation}&rdquo;
            </p>
          </div>

          {/* Items grid */}
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="animate-fade-up bg-[#121f17] border border-[#1e2f22] rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[4/5] bg-[#0d1a12] flex items-center justify-center p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[40px] text-[#1e2f22]">checkroom</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-white truncate mb-1">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      {item.category && (
                        <span className="text-[9px] font-bold text-slate-600 uppercase">{item.category}</span>
                      )}
                      {item.formality && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${FORMALITY_COLORS[item.formality] || ''}`}>
                          {item.formality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#121f17] border border-[#1e2f22] rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-[36px] text-slate-600 block mb-2">checkroom</span>
              <p className="text-slate-500 text-sm">No items matched. Add more clothes to your closet.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !items.length}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-[#0d1a12] py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 disabled:opacity-40 transition-all active:scale-[.98] shadow-lg shadow-primary/15"
            >
              <span className="material-symbols-outlined text-[16px]">{saving ? 'hourglass_top' : 'bookmark_add'}</span>
              {saving ? 'Saving…' : 'Save Outfit'}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-3 border border-[#2a4032] text-slate-400 rounded-2xl hover:bg-white/5 hover:text-white transition-all"
              title="Generate another"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
};

export default GeneratorView;

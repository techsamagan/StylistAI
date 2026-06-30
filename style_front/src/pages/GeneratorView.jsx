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
  FORMAL:    'text-stone-400 bg-stone-400/10 border-stone-400/20',
  MODERATE:  'text-gold-soft bg-primary/10 border-primary/20',
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
  const [weather, setWeather]     = useState(null);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnImage, setTryOnImage] = useState(null);

  React.useEffect(() => {
    if (isApiConfigured()) {
      const userCity = localStorage.getItem('user_city');
      if (userCity) {
        api.getWeather({ city: userCity }).then(setWeather).catch(() => {});
      }
    }
  }, []);

  const vibeInfo = getVibeInfo(vibe);

  const handleGenerate = async () => {
    setError(null);
    setStep('loading');
    if (isApiConfigured()) {
      try {
        const req = { context, vibe };
        if (weather && weather.temp_c !== undefined) {
          req.weather_temp_c = weather.temp_c;
        }
        const res = await api.generateOutfit(req);
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

  const handleTryOn = async () => {
    if (!outfit || !outfit.items.length) return;
    setTryOnLoading(true);
    setTryOnImage(null);
    try {
      if (isApiConfigured()) {
        const outfit_items = outfit.items.map(i => `${i.color ? i.color + ' ' : ''}${i.name}`);
        const res = await api.virtualTryOn({ outfit_items, context });
        setTryOnImage(res.image_url);
        setToast('Try-on image generated!');
      } else {
        await new Promise(r => setTimeout(r, 2000));
        setTryOnImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80');
        setToast('Mock Try-on image generated!');
      }
    } catch (e) {
      setToast(e.body?.detail || e.message || 'Failed to generate try-on.');
    } finally {
      setTryOnLoading(false);
    }
  };

  const handleReset = () => { setOutfit(null); setStep('config'); setError(null); setTryOnImage(null); };

  const items = outfit?.items ?? [];

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">

      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light text-fg tracking-tight">Style Generator</h1>
          <p className="text-subtle text-sm mt-1">Tell us the context, set the vibe, get your outfit.</p>
        </div>
        {weather && (
          <div className="flex items-center gap-2 bg-card border border-line px-3 py-1.5 rounded-xl text-sm font-medium">
            <span className="material-symbols-outlined text-[16px] text-gold-soft">{weather.icon === 'clear_day' ? 'sunny' : 'cloudy'}</span>
            <span className="text-fg">{weather.temp_c?.toFixed(0)}°C</span>
            <span className="text-subtle text-xs hidden sm:inline">— {weather.city?.split(',')[0]}</span>
          </div>
        )}
      </div>

      {/* ── Config step ─────────────────────────── */}
      {step === 'config' && (
        <div className="space-y-6 animate-fade-up">

          {/* Occasion grid */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-3">
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
                        : 'border-line bg-card hover:border-line-strong hover:bg-field'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] mb-2.5 ${active ? 'text-gold-soft icon-filled' : 'text-subtle'}`}>
                      {icon}
                    </span>
                    <span className={`text-sm font-bold mb-0.5 ${active ? 'text-fg' : 'text-muted'}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-subtle leading-tight">{desc}</span>
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
              <label className="text-xs font-bold text-muted uppercase tracking-widest">
                Vibe
              </label>
              <div className="text-right">
                <span className="text-sm font-bold text-gold-soft">{vibeInfo.label}</span>
                <span className="text-xs text-subtle ml-1.5">— {vibeInfo.desc}</span>
              </div>
            </div>
            <div className="bg-card border border-line rounded-2xl p-5">
              <div className="flex justify-between text-[10px] font-bold text-subtle uppercase tracking-wide mb-3">
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
                      getVibeInfo(vibe).label === label ? 'text-gold-soft' : 'text-subtle'
                    }`}
                  >
                    {i === 0 || i === VIBE_LABELS.length - 1 ? label : '·'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-error/12 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 bg-primary text-[#1F2937] py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 active:scale-[.98] transition-all shadow-xl shadow-primary/20"
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
            <div className="size-16 rounded-full border-2 border-line flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] text-gold-soft animate-pulse">auto_awesome</span>
            </div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin-slow" />
          </div>
          <h3 className="text-lg font-bold text-fg mb-1">Building your look…</h3>
          <p className="text-subtle text-sm">Matching pieces for &ldquo;{context}&rdquo;</p>
        </div>
      )}

      {/* ── Result step ─────────────────────────── */}
      {step === 'result' && outfit && (
        <div className="animate-fade-up space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gold-soft uppercase tracking-widest">Outfit Ready</span>
              <h2 className="text-xl font-bold text-fg mt-0.5">{context} · {vibeInfo.label}</h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-subtle hover:text-fg transition-colors px-3 py-1.5 rounded-lg border border-line hover:border-line-strong"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              New Look
            </button>
          </div>

          {/* Explanation */}
          <div className="bg-card border border-line rounded-2xl p-4">
            <p className="text-sm text-muted italic leading-relaxed border-l-2 border-primary/40 pl-3">
              &ldquo;{outfit.explanation}&rdquo;
            </p>
          </div>

          {/* Items grid */}
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="animate-fade-up bg-card border border-line rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[4/5] bg-canvas flex items-center justify-center p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[40px] text-line">checkroom</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-fg truncate mb-1">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      {item.category && (
                        <span className="text-[9px] font-bold text-subtle uppercase">{item.category}</span>
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
            <div className="bg-card border border-line rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-[36px] text-subtle block mb-2">checkroom</span>
              <p className="text-subtle text-sm">No items matched. Add more clothes to your closet.</p>
            </div>
          )}

          {/* Try On Image */}
          {tryOnImage && (
            <div className="bg-card border border-primary/30 p-2 rounded-2xl animate-fade-in mt-4">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-canvas">
                 <img src={tryOnImage} alt="Virtual Try-On" className="w-full h-full object-cover" />
                 <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-gold">auto_awesome</span>
                    AI Preview
                 </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !items.length}
              className="flex-1 flex items-center justify-center gap-2 bg-card border border-line text-fg py-3 rounded-2xl font-bold text-sm hover:border-line-strong disabled:opacity-40 transition-all active:scale-[.98]"
            >
              <span className="material-symbols-outlined text-[16px]">{saving ? 'hourglass_top' : 'bookmark_add'}</span>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleTryOn}
              disabled={tryOnLoading || !items.length}
              className="flex-[2] flex items-center justify-center gap-2 bg-primary text-[#1F2937] py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 disabled:opacity-40 transition-all active:scale-[.98] shadow-lg shadow-primary/15"
            >
              {tryOnLoading ? (
                 <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              ) : (
                 <span className="material-symbols-outlined text-[16px]">accessibility_new</span>
              )}
              {tryOnLoading ? 'Generating Image…' : 'Virtual Try-On'}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-3 border border-line-strong text-muted rounded-2xl hover:bg-fg/[0.04] hover:text-fg transition-all"
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

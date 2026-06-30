import React, { useState, useEffect, useCallback } from 'react';
import { CloudRain, Cloud, Sun, Briefcase, Thermometer, RefreshCw, Check, Sparkles } from 'lucide-react';
import { api, isApiConfigured, getCachedSync } from '../api/client';
import Toast from '../components/Toast';

const WeatherIcon = ({ icon, size = 14 }) => {
  if (icon === 'rainy_light' || icon === 'rainy' || icon === 'rainy_heavy') return <CloudRain size={size} />;
  if (icon === 'clear_day') return <Sun size={size} />;
  return <Cloud size={size} />;
};

const FALLBACK = {
  items: [],
  explanation: 'Connect to the backend to get personalised outfit suggestions.',
};

const StatChip = ({ icon, label, sub }) => (
  <div className="flex items-center gap-2.5 bg-card border border-line px-4 py-2.5 rounded-xl">
    <span className="text-gold-soft text-[16px] material-symbols-outlined flex-shrink-0">{icon}</span>
    <div>
      <p className="text-xs font-bold text-fg leading-none">{label}</p>
      {sub && <p className="text-[10px] text-subtle mt-0.5">{sub}</p>}
    </div>
  </div>
);

const DashboardView = ({ setView }) => {
  const [outfit, setOutfit]             = useState(() => getCachedSync('outfit-today-false') || null);
  const [outfitLoading, setOutfitLoading] = useState(() => !getCachedSync('outfit-today-false'));
  const [weather, setWeather]           = useState(() => getCachedSync('weather-') || null);
  const [nextEvent, setNextEvent]       = useState(() => {
    const cached = getCachedSync('calendar-events-');
    return cached && cached.length > 0 ? cached[0] : null;
  });
  const [closetCount, setClosetCount]   = useState(null);
  const [gapAnalysis, setGapAnalysis]   = useState(() => getCachedSync('wardrobe-gaps') || null);
  const [toast, setToast]               = useState(null);

  const userName = (() => { try { return localStorage.getItem('user_name') || ''; } catch { return ''; } })();
  const userCity = (() => { try { return localStorage.getItem('user_city') || ''; } catch { return ''; } })();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const loadOutfit = useCallback(async (refresh = false) => {
    const timer = setTimeout(() => setOutfitLoading(true), 150);
    try {
      const result = await api.getTodayOutfit(refresh);
      clearTimeout(timer);
      setOutfit(result);
    } catch {
      clearTimeout(timer);
      setOutfit(FALLBACK);
    } finally {
      setOutfitLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isApiConfigured()) { setOutfit(FALLBACK); setOutfitLoading(false); return; }
    loadOutfit();
    if (userCity) api.getWeather({ city: userCity }).then(setWeather).catch(() => {});
    const today = new Date().toISOString().slice(0, 10);
    api.getCalendarEvents(today).then(ev => { if (ev?.length) setNextEvent(ev[0]); }).catch(() => {});
    api.getCloset().then(items => setClosetCount(items.length)).catch(() => {});
    api.getWardrobeGaps().then(setGapAnalysis).catch(() => {});
  }, [loadOutfit, userCity]);

  const items = outfit?.items ?? [];

  const ImageGrid = () => {
    if (outfitLoading) {
      return (
        <div className="grid grid-cols-2 gap-2 h-64 md:h-80">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`skeleton rounded-xl ${i === 2 ? 'col-span-2' : ''}`} />
          ))}
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="h-64 md:h-80 rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center text-subtle gap-3">
          <span className="material-symbols-outlined text-[40px]">checkroom</span>
          <p className="text-sm text-center px-4">Upload clothes to your closet to get outfit suggestions</p>
          <button
            type="button"
            onClick={() => setView('wardrobe')}
            className="mt-1 bg-primary/10 text-gold-soft border border-primary/20 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            Go to Wardrobe
          </button>
        </div>
      );
    }
    return (
      <div className={`grid gap-2 h-64 md:h-80 ${items.length >= 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {items.slice(0, 4).map((item, idx) => (
          <div
            key={item.id}
            className={`relative bg-card rounded-xl overflow-hidden border border-line group ${
              items.length === 3 && idx === 2 ? 'col-span-2' : ''
            }`}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-contain p-3 transform group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px] text-subtle">checkroom</span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
              <p className="text-fg text-[11px] font-semibold truncate">{item.name}</p>
              <p className="text-muted text-[9px] uppercase tracking-wide">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-up max-w-5xl">

      {/* ── Header ────────────────────────────── */}
      <div className="mb-6">
        <p className="text-subtle text-sm">{dateStr}</p>
        <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight text-fg mt-0.5">
          {greeting}{userName ? `, ${userName}` : ''}.
        </h1>
      </div>

      {/* ── Context chips ─────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {weather ? (
          <StatChip
            icon={weather.icon === 'clear_day' ? 'sunny' : 'cloudy'}
            label={`${weather.temp_c?.toFixed(0)}°C`}
            sub={weather.city?.split(',')[0]}
          />
        ) : userCity ? (
          <StatChip icon="thermometer" label={userCity} />
        ) : null}

        {nextEvent && (
          <StatChip
            icon="calendar_today"
            label={nextEvent.title}
            sub={`at ${nextEvent.start.slice(11, 16)}`}
          />
        )}

        {closetCount !== null && (
          <StatChip icon="checkroom" label={`${closetCount} items`} sub="in your closet" />
        )}
      </div>

      {/* ── Main outfit card ──────────────────── */}
      <div className="grid lg:grid-cols-5 gap-0 bg-card border border-line rounded-2xl overflow-hidden mb-8">

        {/* Image side */}
        <div className="lg:col-span-3 p-4 md:p-5">
          <ImageGrid />
        </div>

        {/* Info side */}
        <div className="lg:col-span-2 p-5 md:p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-line">
          <span className="text-[10px] font-bold text-gold-soft uppercase tracking-widest">
            Today&apos;s Look
          </span>

          <h2 className="text-lg font-bold text-fg mt-1.5 mb-3 leading-snug line-clamp-2">
            {items.length > 0
              ? items.map(i => i.name).join(' · ')
              : outfitLoading ? 'Building your outfit…' : 'No outfit yet'}
          </h2>

          <p className="text-sm text-muted italic leading-relaxed border-l-2 border-primary/30 pl-3 mb-4">
            &ldquo;{outfit?.explanation || 'Loading…'}&rdquo;
          </p>

          {/* Item list */}
          {items.length > 0 && (
            <div className="flex-1 space-y-1.5 mb-4 overflow-y-auto hide-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-canvas rounded-lg border border-line group hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[9px] font-bold text-subtle uppercase tracking-wide w-14 flex-shrink-0">
                      {item.category}
                    </span>
                    <span className="text-sm text-fg font-medium truncate">{item.name}</span>
                  </div>
                  <Check size={12} className="text-gold-soft flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button
              type="button"
              onClick={() => items.length && setToast('Outfit logged for today!')}
              disabled={!items.length || outfitLoading}
              className="flex-1 bg-primary text-[#1F2937] py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-30 transition-all active:scale-[.98]"
            >
              Wear Today
            </button>
            <button
              type="button"
              onClick={() => loadOutfit(true)}
              disabled={outfitLoading || !items.length}
              className="px-3 py-2.5 border border-line-strong text-muted rounded-xl hover:bg-fg/[0.04] hover:text-fg disabled:opacity-30 transition-all"
              title="Get a different outfit"
            >
              <RefreshCw size={15} className={outfitLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setView('generator')}
              className="flex-1 border border-line-strong text-muted py-2.5 rounded-xl text-sm font-medium hover:bg-fg/[0.04] hover:text-fg transition-all"
            >
              Customise
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick tips ────────────────────────── */}
      {items.length === 0 && !outfitLoading && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: 'upload',        title: 'Upload clothes',    desc: 'Add photos of your items to the closet'   },
            { icon: 'calendar_today',title: 'Add events',        desc: 'Connect your schedule for smart picks'    },
            { icon: 'auto_awesome',  title: 'Generate outfits',  desc: 'Use the Style AI to build any look'       },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-card border border-line rounded-xl p-4 hover:border-primary/20 transition-colors">
              <span className="material-symbols-outlined text-gold-soft text-[22px] mb-2 block">{icon}</span>
              <h3 className="text-sm font-bold text-fg mb-1">{title}</h3>
              <p className="text-xs text-subtle leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Gap Analysis ──────────────────────── */}
      {gapAnalysis && items.length > 0 && (
        <div className="bg-card border border-primary/30 shadow-lg shadow-primary/5 rounded-2xl p-5 mt-6 flex gap-4 items-start">
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-gold-soft mt-1">
             <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gold-soft uppercase tracking-widest mb-1">Wardrobe Analysis</h3>
            <p className="text-fg font-bold text-lg mb-1.5">Consider getting: {gapAnalysis.suggestion}</p>
            <p className="text-muted text-sm leading-relaxed">{gapAnalysis.reason}</p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
};

export default DashboardView;

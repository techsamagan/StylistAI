import React, { useState } from 'react';
import { api, isApiConfigured } from '../api/client';

const TravelView = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination.trim() || days < 1) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (isApiConfigured()) {
        const res = await api.generatePackingList({ destination, days });
        setResult(res);
      } else {
        await new Promise(r => setTimeout(r, 1000));
        setResult({
          destination,
          weather_summary: "Mock weather: Sunny, 22°C",
          packing_list: [],
          daily_outfits: []
        });
      }
    } catch (err) {
      setError(err.body?.detail || err.message || "Failed to generate packing list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="text-3xl font-serif font-light text-fg tracking-tight">Smart Packing List</h1>
        <p className="text-subtle text-sm mt-1">Tell us where you're going. We'll check the weather and pack your bags.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="md:col-span-1 space-y-4">
          <form onSubmit={handleGenerate} className="bg-card border border-line p-5 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g. Paris, Tokyo..."
                className="w-full bg-canvas border border-line rounded-xl px-4 py-2.5 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Duration (Days)</label>
              <div className="flex items-center gap-3 bg-canvas border border-line rounded-xl px-3 py-1.5">
                <input
                  type="range"
                  min={1} max={14}
                  value={days}
                  onChange={e => setDays(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-fg w-6 text-center">{days}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !destination}
              className="w-full mt-4 bg-primary text-[#1F2937] py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/10 flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
              )}
              {loading ? 'Packing...' : 'Generate List'}
            </button>
          </form>

          {error && (
            <div className="bg-error/12 border border-error/25 text-error p-4 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="md:col-span-2">
          {!result && !loading && (
            <div className="bg-card border border-line border-dashed rounded-2xl p-10 flex flex-col items-center text-center h-full justify-center text-subtle">
              <span className="material-symbols-outlined text-4xl mb-3 opacity-50">luggage</span>
              <p className="text-sm">Enter your destination to generate a smart packing itinerary.</p>
            </div>
          )}

          {loading && (
            <div className="bg-card border border-line rounded-2xl p-10 flex flex-col items-center text-center h-full justify-center">
              <span className="material-symbols-outlined text-4xl mb-3 text-gold-soft animate-bounce">cases</span>
              <p className="text-fg font-bold">Analyzing your closet & weather...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-4">
                <span className="material-symbols-outlined text-gold-soft text-3xl">wb_sunny</span>
                <div>
                  <h3 className="text-fg font-bold text-lg mb-1">{result.destination}</h3>
                  <p className="text-gold-soft text-sm font-medium">{result.weather_summary}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 border-b border-line pb-2">Your Packing List ({result.packing_list?.length || 0} items)</h3>
                {result.packing_list?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {result.packing_list.map((item, idx) => (
                      <div key={`pack-${idx}`} className="bg-card border border-line rounded-xl overflow-hidden text-center group relative">
                        <div className="aspect-square bg-canvas p-2 flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-3xl text-subtle">checkroom</span>
                          )}
                        </div>
                        <div className="p-2 truncate text-[10px] text-muted font-medium">
                          {item.name}
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-gold text-sm bg-black/50 rounded-full p-0.5">check_circle</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm text-subtle">No items packed. Your closet might be empty.</p>
                )}
              </div>

              <div>
                 <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 border-b border-line pb-2">Daily Outfits</h3>
                 <div className="space-y-3">
                   {result.daily_outfits?.map(day => (
                     <div key={`day-${day.day}`} className="bg-card border border-line p-4 rounded-xl flex items-center gap-4 overflow-x-auto hide-scrollbar">
                       <div className="flex-shrink-0 text-center pr-4 border-r border-line">
                         <span className="block text-[10px] text-subtle uppercase font-bold">Day</span>
                         <span className="block text-2xl font-black text-fg">{day.day}</span>
                       </div>
                       <div className="flex gap-2 flex-1">
                          {day.items?.map((item, idx) => (
                            <div key={`day-${day.day}-item-${idx}`} className="size-14 flex-shrink-0 bg-canvas border border-line rounded-lg p-1" title={item.name}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-subtle text-sm">checkroom</span></div>
                              )}
                            </div>
                          ))}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelView;

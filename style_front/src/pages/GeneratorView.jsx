import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { SAMPLE_WARDROBE } from '../data/mockData';
import { api, isApiConfigured } from '../api/client';

const CONTEXTS = ['Date Night', 'Office', 'Travel', 'Gym'];

const GeneratorView = () => {
  const [context, setContext] = useState('Office');
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setError(null);
    if (isApiConfigured()) {
      setLoading(true);
      try {
        const res = await api.generateOutfit({ context });
        setSuggestion(res);
        setGenerated(true);
      } catch (e) {
        setError(e.message || 'Failed to generate outfit');
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestion({
        items: [SAMPLE_WARDROBE[0], SAMPLE_WARDROBE[5], SAMPLE_WARDROBE[3]],
        explanation: 'Based on "Date Night" + Cold Weather.',
      });
      setGenerated(true);
    }
  };

  const displayItems = suggestion?.items ?? [];
  const displayExplanation = suggestion?.explanation ?? '';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">Plan a new outfit</h1>

      {!generated ? (
        <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl shadow-sm space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Where are you going?</label>
            <div className="grid grid-cols-2 gap-4">
              {CONTEXTS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setContext(e)}
                  className={`p-4 rounded-xl border text-left transition-all ${context === e ? 'border-primary bg-primary/10 text-primary' : 'border-slate-700 text-slate-300 hover:border-primary/50 hover:bg-slate-800/50'}`}
                >
                  <span className="block font-medium">{e}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Vibe Check</label>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Comfort</span>
                <span>Style</span>
              </div>
              <input type="range" className="w-full accent-primary" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold hover:bg-primary/90 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? 'Generating…' : 'Generate Options'} <Sparkles size={16} />
          </button>
        </div>
      ) : (
        <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl shadow-lg text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Check size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Outfit Found!</h2>
          <p className="text-slate-400 mb-8">Based on &quot;{context}&quot;. {displayExplanation}</p>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {displayItems.map((item) => (
              <img
                key={item.id}
                src={item.image_url ?? item.image}
                alt={item.name}
                className="rounded-xl h-32 w-full object-cover border border-slate-700"
              />
            ))}
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => { setGenerated(false); setSuggestion(null); }} className="flex-1 text-slate-400 py-3 hover:text-white transition-colors">
              Try Again
            </button>
            <button type="button" className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-bold hover:bg-primary/90">
              Save Outfit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorView;

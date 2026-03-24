import React from 'react';
import { CloudRain, Briefcase, Sparkles, Check } from 'lucide-react';

const DashboardView = ({ setView }) => (
  <div className="animate-fade-in">
    <header className="mb-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Good morning, Alex.</h1>
      <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
        <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          <CloudRain size={14} /> London, 12°C
        </span>
        <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          <Briefcase size={14} /> Q3 Review at 10:00
        </span>
      </div>
    </header>

    <div className="bg-white/5 border border-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden grid md:grid-cols-2 gap-8 mb-8">
      <div className="h-80 md:h-96 bg-slate-800/50 rounded-xl overflow-hidden relative group border border-slate-800">
        <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Outfit" />
        <button type="button" className="absolute bottom-4 right-4 bg-primary/90 text-background-dark p-2 rounded-lg shadow-lg hover:bg-primary transition-colors">
          <Sparkles size={18} />
        </button>
      </div>
      <div className="flex flex-col justify-center">
        <div className="mb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Today&apos;s Pick</span>
          <h2 className="text-3xl font-bold text-white mt-2 mb-4">The Rainy Day Layer</h2>
          <p className="text-slate-400 leading-relaxed">
            &quot;We chose the trench coat because light rain is expected around 2 PM. The navy trousers match the formality of your Q3 review, while the boots keep your feet dry.&quot;
          </p>
        </div>
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg bg-cover" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=100)' }} />
              <span className="font-medium text-sm text-white">Beige Trench Coat</span>
            </div>
            <Check size={16} className="text-primary" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg bg-cover" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100)' }} />
              <span className="font-medium text-sm text-white">Navy Chinos</span>
            </div>
            <Check size={16} className="text-primary" />
          </div>
        </div>
        <div className="flex gap-4">
          <button type="button" className="flex-1 bg-primary text-background-dark py-3 rounded-xl font-bold hover:bg-primary/90">Wear This</button>
          <button type="button" onClick={() => setView('generator')} className="flex-1 border border-slate-600 text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-800/50">Change Look</button>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardView;

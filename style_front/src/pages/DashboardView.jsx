import React from 'react';
import { CloudRain, Briefcase, Sparkles, Check } from 'lucide-react';

const DashboardView = ({ setView }) => (
  <div className="animate-fade-in">
    <header className="mb-8">
      <h1 className="text-3xl font-medium tracking-tight mb-2">Good morning, Alex.</h1>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-100"><CloudRain size={14} /> London, 12°C</span>
        <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-100"><Briefcase size={14} /> Q3 Review at 10:00</span>
      </div>
    </header>

    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-200 shadow-sm grid md:grid-cols-2 gap-8 mb-8">
      <div className="h-80 md:h-96 bg-gray-50 rounded-2xl overflow-hidden relative group">
        <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Outfit" />
        <button className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-sm text-gray-700 hover:bg-black hover:text-white transition-colors">
          <Sparkles size={18} />
        </button>
      </div>
      <div className="flex flex-col justify-center">
        <div className="mb-6">
          <span className="text-xs font-bold text-sage-600 uppercase tracking-widest">Today's Pick</span>
          <h2 className="text-3xl font-medium mt-2 mb-4">The Rainy Day Layer</h2>
          <p className="text-gray-500 leading-relaxed">
            "We chose the trench coat because light rain is expected around 2 PM. The navy trousers match the formality of your Q3 review, while the boots keep your feet dry."
          </p>
        </div>
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gray-200 rounded-lg bg-cover" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=100)'}}></div>
               <span className="font-medium text-sm">Beige Trench Coat</span>
             </div>
             <Check size={16} className="text-sage-500" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gray-200 rounded-lg bg-cover" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=100)'}}></div>
               <span className="font-medium text-sm">Navy Chinos</span>
             </div>
             <Check size={16} className="text-sage-500" />
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex-1 bg-[#1F1F1F] text-white py-3 rounded-xl font-medium hover:opacity-90">Wear This</button>
          <button onClick={() => setView('generator')} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">Change Look</button>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardView;
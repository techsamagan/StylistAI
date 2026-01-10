import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { SAMPLE_WARDROBE } from '../data/mockData';

const GeneratorView = () => {
  const [generated, setGenerated] = useState(false);
  
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-medium mb-8 text-center">Plan a new outfit</h1>
      
      {!generated ? (
        <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Where are you going?</label>
            <div className="grid grid-cols-2 gap-4">
              {['Date Night', 'Office', 'Travel', 'Gym'].map(e => (
                <button key={e} className="p-4 rounded-xl border border-gray-200 text-left hover:border-sage-500 hover:bg-sage-50 transition-all">
                  <span className="block font-medium text-gray-900">{e}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Vibe Check</label>
            <div className="bg-gray-50 p-4 rounded-xl">
               <div className="flex justify-between text-xs text-gray-500 mb-2">
                 <span>Comfort</span>
                 <span>Style</span>
               </div>
               <input type="range" className="w-full accent-black" />
            </div>
          </div>

          <button onClick={() => setGenerated(true)} className="w-full bg-[#1F1F1F] text-white py-4 rounded-xl font-medium hover:scale-[1.02] transition-transform">
            Generate Options <Sparkles size={16} className="inline ml-2" />
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[32px] border border-sage-200 shadow-lg text-center animate-fade-in-up">
           <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-600">
             <Check size={32} />
           </div>
           <h2 className="text-2xl font-medium mb-2">Outfit Found!</h2>
           <p className="text-gray-500 mb-8">Based on "Date Night" + Cold Weather.</p>
           
           <div className="grid grid-cols-3 gap-2 mb-8">
              {/* FIXED: Added 'alt' attributes to all images below */}
              <img 
                src={SAMPLE_WARDROBE[0].image} 
                alt={SAMPLE_WARDROBE[0].name} 
                className="rounded-xl h-32 w-full object-cover" 
              />
              <img 
                src={SAMPLE_WARDROBE[5].image} 
                alt={SAMPLE_WARDROBE[5].name} 
                className="rounded-xl h-32 w-full object-cover" 
              />
              <img 
                src={SAMPLE_WARDROBE[3].image} 
                alt={SAMPLE_WARDROBE[3].name} 
                className="rounded-xl h-32 w-full object-cover" 
              />
           </div>

           <div className="flex gap-4">
             <button onClick={() => setGenerated(false)} className="flex-1 text-gray-500 py-3">Try Again</button>
             <button className="flex-1 bg-[#1F1F1F] text-white py-3 rounded-xl font-medium">Save Outfit</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorView;
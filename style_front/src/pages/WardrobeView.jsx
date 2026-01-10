import React from 'react';
import { Camera, Plus } from 'lucide-react';
import { SAMPLE_WARDROBE } from '../data/mockData';

const WardrobeView = () => (
  <div className="animate-fade-in">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-medium">My Wardrobe</h1>
      <button className="bg-[#1F1F1F] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
        <Plus size={16} /> Add Item
      </button>
    </div>
    
    {/* Filters */}
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'].map((f, i) => (
        <button key={f} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          {f}
        </button>
      ))}
    </div>

    {/* Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {SAMPLE_WARDROBE.map(item => (
        <div key={item.id} className="group cursor-pointer">
          <div className="aspect-[3/4] bg-white rounded-2xl border border-gray-100 overflow-hidden relative mb-3 shadow-sm group-hover:shadow-md transition-shadow">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {item.tag}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-400">Last worn 3 days ago</p>
        </div>
      ))}
      {/* Upload Placeholder */}
      <div className="aspect-[3/4] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer">
        <Camera size={24} className="mb-2" />
        <span className="text-sm font-medium">Digitize Item</span>
      </div>
    </div>
  </div>
);

export default WardrobeView;
import React from 'react';
import { 
  LayoutGrid, Shirt, Sparkles, LogOut, 
  BarChart2, Settings, User 
} from 'lucide-react';

const AppShell = ({ children, activeTab, setActiveTab, onLogout }) => (
  <div className="min-h-screen bg-[#FAFAF8] flex text-[#1F1F1F]">
    {/* --- DESKTOP SIDEBAR --- */}
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 fixed h-full z-20">
      
      {/* Brand */}
      <div className="flex items-center gap-2 mb-10 text-xl font-semibold tracking-tight cursor-pointer">
        <div className="w-8 h-8 bg-[#1F1F1F] rounded-lg text-white flex items-center justify-center text-sm font-serif italic">V</div>
        Varda.
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 flex-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4 mt-2">Menu</div>
        
        <NavButton 
          id="dashboard" icon={<LayoutGrid size={18} />} label="Today" 
          active={activeTab === 'dashboard'} onClick={setActiveTab} 
        />
        <NavButton 
          id="generator" icon={<Sparkles size={18} />} label="Generator" 
          active={activeTab === 'generator'} onClick={setActiveTab} 
        />
        <NavButton 
          id="wardrobe" icon={<Shirt size={18} />} label="Wardrobe" 
          active={activeTab === 'wardrobe'} onClick={setActiveTab} 
        />
        
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4 mt-8">Data</div>
        
        {/* NEW: Analytics Tab */}
        <NavButton 
          id="analytics" icon={<BarChart2 size={18} />} label="Insights" 
          active={activeTab === 'analytics'} onClick={setActiveTab} 
        />
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-100 pt-4 space-y-1">
        <NavButton 
          id="settings" icon={<Settings size={18} />} label="Settings" 
          active={activeTab === 'settings'} onClick={setActiveTab} 
        />
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} /> 
          Sign Out
        </button>
      </div>

      {/* User Mini Profile */}
      <div className="flex items-center gap-3 mt-6 px-2">
        <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-700">
          <User size={14} />
        </div>
        <div className="text-xs">
          <p className="font-medium">Alex Doe</p>
          <p className="text-gray-400">Free Plan</p>
        </div>
      </div>
    </aside>

    {/* --- MAIN CONTENT --- */}
    <main className="flex-1 md:ml-64 p-6 md:p-10 mb-20 md:mb-0 max-w-7xl mx-auto w-full">
      {children}
    </main>

    {/* --- MOBILE BOTTOM BAR --- */}
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-end z-50 pb-safe">
       <MobileNavButton id="dashboard" icon={<LayoutGrid size={20} />} label="Today" active={activeTab === 'dashboard'} onClick={setActiveTab} />
       <MobileNavButton id="wardrobe" icon={<Shirt size={20} />} label="Closet" active={activeTab === 'wardrobe'} onClick={setActiveTab} />
       
       {/* Featured Center Button */}
       <div className="relative -top-5">
         <button onClick={() => setActiveTab('generator')} className="w-14 h-14 bg-[#1F1F1F] rounded-full flex items-center justify-center text-white shadow-xl shadow-gray-300">
           <Sparkles size={24} />
         </button>
       </div>

       <MobileNavButton id="analytics" icon={<BarChart2 size={20} />} label="Stats" active={activeTab === 'analytics'} onClick={setActiveTab} />
       <MobileNavButton id="settings" icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={setActiveTab} />
    </div>
  </div>
);

// Helper Components
const NavButton = ({ id, icon, label, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active ? 'bg-[#1F1F1F] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
    }`}
  >
    <span className={active ? 'text-sage-200' : 'text-gray-400'}>{icon}</span>
    {label}
  </button>
);

const MobileNavButton = ({ id, icon, label, active, onClick }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`flex flex-col items-center gap-1 p-2 ${active ? 'text-black' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default AppShell;
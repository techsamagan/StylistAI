import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import is here
import { 
  ArrowUpRight, Sparkles, Check, Sun, CloudRain, Thermometer, 
  Briefcase, Coffee, Camera, ScanLine, ArrowRight, Menu, X, 
  Umbrella, Star 
} from 'lucide-react';

const LandingPage = () => { // 2. Removed unused 'onLogin' prop
  const navigate = useNavigate(); // 3. Initialize the hook
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [weather, setWeather] = useState('cold');
  const [occasion, setOccasion] = useState('work');
  const [isVisible, setIsVisible] = useState(false);
  
  const [isAnnual, setIsAnnual] = useState(true);

  // --- 1. Animation & Scroll Logic ---
  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- 2. Live Demo Logic ---
  const getDemoSuggestion = () => {
    if (occasion === 'work') {
      if (weather === 'rain') return { 
        title: 'The Commuter Trench', reason: 'Polished for the office, but protected from the downpour.', 
        items: ['Waterproof Trench', 'Navy Trousers', 'Leather Boots'],
        img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80'
      };
      if (weather === 'hot') return { 
        title: 'The Summer Suit', reason: 'Breathable linen to handle the heat while maintaining authority.', 
        items: ['Linen Blazer', 'Crisp White Shirt', 'Suede Loafers'],
        img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80'
      };
      return { 
        title: 'The Power Layer', reason: 'Classic wool layers. Ideal for air-conditioned offices.', 
        items: ['Charcoal Wool Coat', 'Oxford Shirt', 'Dark Denim'],
        img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'
      };
    }
    // Casual
    if (weather === 'hot') return { 
      title: 'Weekend Breeze', reason: 'Maximum airflow for a relaxed day out.', 
      items: ['Cuban Collar Shirt', 'Chino Shorts', 'Canvas Sneakers'],
      img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' 
    };
    return { 
      title: 'Coffee Shop Knit', reason: 'Cozy, oversized texture for reading or working remotely.', 
      items: ['Oversized Cardigan', 'Relaxed Jeans', 'Retro Runners'],
      img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'
    };
  };

  const activeDemo = getDemoSuggestion();

  return (
    <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden selection:bg-primary/20">
      {/* --- NAVBAR (matches Digital Closet app header) --- */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-background-dark/90 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
              <span className="material-symbols-outlined font-bold text-lg">checkroom</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Digital Closet</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('demo')} className="hover:text-primary transition-colors">Live Demo</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-primary transition-colors">Pricing</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">Log In</button>
            <button onClick={() => navigate('/register')} className="bg-primary text-background-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-transform active:scale-95">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Get Started
            </button>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-background-dark border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden">
            <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 font-medium text-white">How it Works</button>
            <button onClick={() => scrollToSection('demo')} className="text-left py-2 font-medium text-white">Live Demo</button>
            <button onClick={() => scrollToSection('pricing')} className="text-left py-2 font-medium text-white">Pricing</button>
            <hr className="border-slate-800" />
            <button onClick={() => navigate('/register')} className="bg-primary text-background-dark py-3 rounded-lg font-bold">Get Started</button>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6 md:px-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Sparkles size={12} /> AI Stylist
          </div>
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            Your closet, <br /> <span className="text-primary">organized.</span>
          </h1>
          <p className={`text-lg text-slate-400 max-w-md leading-relaxed border-l-2 border-primary/50 pl-6 ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Upload your clothes. We tag them with AI. Get daily outfit suggestions based on your calendar and the weather.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 pt-2 ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
            <button onClick={() => navigate('/register')} className="bg-primary text-background-dark px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              Build Your Closet <ArrowUpRight size={18} />
            </button>
            <button onClick={() => scrollToSection('pricing')} className="px-8 py-4 rounded-xl font-medium border border-slate-600 text-white hover:border-primary/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              View Plans <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className={`relative hidden lg:block h-[600px] ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-white/5 rounded-2xl border border-slate-800 overflow-hidden transform rotate-[-2deg] transition-all duration-700 hover:rotate-0 hover:scale-[1.01] cursor-default animate-float">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80" className="w-full h-[65%] object-cover" alt="Outfit" />
            <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Recommendation</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Monday Morning</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg text-primary"><Check size={20} /></div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1"><CloudRain size={12} /> Rainy (60%)</span>
                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1"><Briefcase size={12} /> Client Meeting</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-24 -left-8 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                <Umbrella size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Alert</p>
                <p className="text-sm font-medium text-white">Rain starting at 2 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">It starts with your closet.</h2>
            <p className="text-slate-400 text-lg">Upload photos of your clothes. We remove the background and tag them automatically.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl group hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary"><Camera size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">1. Snap a photo</h3>
              <p className="text-sm text-slate-400 mb-6">Just lay it on your bed and take a quick picture.</p>
              <div className="h-40 bg-slate-800/50 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1551488852-d7b71e97ed02?w=500" className="w-full h-full object-cover opacity-80" alt="Clothes laid out on a bed" />
              </div>
            </div>
            <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl group hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary"><ScanLine size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">2. AI Processing</h3>
              <p className="text-sm text-slate-400 mb-6">We isolate the item, detect color, and fabric.</p>
              <div className="h-40 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center"><span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">Processing...</span></div>
            </div>
            <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl group hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary"><Sparkles size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">3. Get Suggestions</h3>
              <p className="text-sm text-slate-400 mb-6">Every morning, get a recommendation.</p>
              <div className="h-40 bg-slate-800/50 rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500" className="w-full h-full object-cover opacity-80" alt="Wardrobe suggestions" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DEMO --- */}
      <section id="demo" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">See how it thinks.</h2>
          <p className="text-slate-400">Change inputs to see Digital Closet adapt to the context.</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-8 bg-white/5 rounded-2xl p-8 md:p-12 border border-slate-800">
          <div className="lg:col-span-4 space-y-10">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">1. Weather</h4>
              <div className="grid grid-cols-3 gap-3">
                {['cold', 'hot', 'rain'].map((w) => (
                  <button key={w} onClick={() => setWeather(w)} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${weather === w ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700'}`}>
                    {w === 'cold' ? <Thermometer size={18} /> : w === 'hot' ? <Sun size={18} /> : <CloudRain size={18} />}
                    <span className="text-xs mt-2 font-medium capitalize">{w}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">2. Context</h4>
              <div className="flex flex-col gap-3">
                {['work', 'casual'].map((o) => (
                  <button key={o} onClick={() => setOccasion(o)} className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 ${occasion === o ? 'bg-primary/10 text-primary border-2 border-primary/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border-2 border-slate-700'}`}>
                    {o === 'work' ? <Briefcase size={16} /> : <Coffee size={16} />}
                    {o === 'work' ? 'Work Meeting' : 'Casual Hangout'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 relative">
            <div className="bg-slate-900/50 rounded-xl p-2 h-full border border-slate-800">
              <div className="bg-slate-900/30 rounded-lg overflow-hidden h-full flex flex-col md:flex-row border border-slate-800">
                <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-slate-800">
                  <img key={activeDemo.img} src={activeDemo.img} className="w-full h-full object-cover animate-fade-in-up" alt="AI Suggested Outfit" />
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-bold bg-primary text-background-dark px-2 py-1 rounded w-max mb-3">AI SUGGESTION</span>
                  <h3 className="text-2xl font-bold text-white mb-3">{activeDemo.title}</h3>
                  <p className="text-primary text-sm italic mb-8 border-l-2 border-primary/50 pl-4">"{activeDemo.reason}"</p>
                  <div className="space-y-3">
                    {activeDemo.items.map((item, i) => (
                      <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                        <span className="text-sm font-medium text-white">{item}</span>
                        <Check size={14} className="text-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">Simple, transparent pricing.</h2>
            <p className="text-slate-400 text-lg mb-8">Start organizing your wardrobe today.</p>
            <div className="inline-flex bg-slate-800/50 p-1 rounded-full border border-slate-700 mb-8">
              <button onClick={() => setIsAnnual(false)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual ? 'bg-primary text-background-dark shadow-sm' : 'text-slate-400 hover:text-white'}`}>Monthly</button>
              <button onClick={() => setIsAnnual(true)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isAnnual ? 'bg-primary text-background-dark shadow-sm' : 'text-slate-400 hover:text-white'}`}>Yearly <span className="text-[10px] ml-1 opacity-80">(Save 20%)</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl flex flex-col hover:border-primary/30 transition-colors">
              <div className="mb-4">
                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Starter</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400">/forever</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Perfect for organizing your core essentials.</p>
              <div className="space-y-4 mb-8 flex-1">
                {['Digitize up to 30 items', 'Basic daily suggestions', 'Manual weather input', 'Standard support'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-primary"><Check size={12} /></div>
                    {feature}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="w-full border border-slate-600 text-white py-3 rounded-xl font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors">Start for Free</button>
            </div>

            <div className="bg-primary/5 border-2 border-primary/30 text-white p-8 rounded-2xl flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-primary/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-background-dark px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
              <div className="mb-4 mt-2">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Personal Stylist</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">${isAnnual ? '12' : '15'}</span>
                <span className="text-slate-400">/mo</span>
                {isAnnual && <div className="text-xs text-primary mt-1">Billed $144 yearly</div>}
              </div>
              <p className="text-slate-400 text-sm mb-8">Complete automation for your wardrobe.</p>
              <div className="space-y-4 mb-8 flex-1">
                {['Unlimited wardrobe items', 'Travel packing assistant', 'Calendar event integration', 'Advanced weather logic', 'Outfit "Vibe" sliders'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-background-dark"><Check size={12} /></div>
                    {feature}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="w-full bg-primary text-background-dark py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">Get Pro</button>
            </div>

            <div className="bg-white/5 border border-slate-800 p-8 rounded-2xl flex flex-col hover:border-primary/30 transition-colors">
              <div className="mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Lifetime</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$299</span>
                <span className="text-slate-400">/once</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Pay once, own it forever. Includes all future updates.</p>
              <div className="space-y-4 mb-8 flex-1">
                {['Everything in Pro', 'Priority 24/7 support', 'Early access to beta features', 'Founder community access', 'No recurring fees'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Star size={12} /></div>
                    {feature}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="w-full border border-slate-600 text-white py-3 rounded-xl font-medium hover:bg-primary/10 hover:border-primary/30 transition-colors">Buy Lifetime</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY --- */}
      <section id="philosophy" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="bg-white/5 border border-slate-800 rounded-2xl p-8 md:p-20 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Designed for calmness.</h2>
            <p className="text-slate-400 text-lg mb-12">Digital Closet keeps it simple. No neon colors, no gamification. Just a quiet tool for your wardrobe.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-slate-800 pt-8">
              <div><h4 className="font-bold text-white mb-2">Private</h4><p className="text-sm text-slate-500">Your data stays yours.</p></div>
              <div><h4 className="font-bold text-white mb-2">Adaptive</h4><p className="text-sm text-slate-500">Learns your style.</p></div>
              <div><h4 className="font-bold text-white mb-2">Neutral</h4><p className="text-sm text-slate-500">No trend bias.</p></div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </section>

      <footer className="py-20 px-6 md:px-10 max-w-7xl mx-auto border-t border-slate-800 mt-12">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                <span className="material-symbols-outlined font-bold text-lg">checkroom</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">Digital Closet</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs mb-6">Your AI-powered wardrobe. Organize, plan, and dress with confidence.</p>
            <div className="flex gap-4">
              <button className="bg-primary text-background-dark px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90">Get Started</button>
              <button className="border border-slate-600 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/5">Log In</button>
            </div>
          </div>
          <div><h4 className="font-bold text-sm text-white mb-4">Product</h4><ul className="space-y-2 text-sm text-slate-400"><li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary">Features</button></li><li><button onClick={() => scrollToSection('pricing')} className="hover:text-primary">Pricing</button></li></ul></div>
          <div><h4 className="font-bold text-sm text-white mb-4">Company</h4><ul className="space-y-2 text-sm text-slate-400"><li>About</li><li>Careers</li><li>Privacy</li></ul></div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">© 2026 Digital Closet.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
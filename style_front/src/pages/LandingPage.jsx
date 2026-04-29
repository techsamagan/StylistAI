import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [weather,   setWeather]   = useState('cold');
  const [occasion,  setOccasion]  = useState('work');
  const [annual,    setAnnual]    = useState(true);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const DEMO = {
    work: {
      cold: { title: 'The Power Layer',     reason: 'Classic wool layers — ideal for air-conditioned offices.',    items: ['Charcoal Wool Coat', 'Oxford Shirt', 'Dark Chinos']  },
      hot:  { title: 'The Summer Suit',     reason: 'Breathable linen handles the heat while keeping authority.', items: ['Linen Blazer', 'White Shirt', 'Suede Loafers']       },
      rain: { title: 'The Commuter Trench', reason: 'Polished for the office, protected from the downpour.',     items: ['Waterproof Trench', 'Navy Trousers', 'Leather Boots'] },
    },
    casual: {
      cold: { title: 'Coffee Shop Knit', reason: 'Cozy oversized texture for reading or working remotely.',  items: ['Oversized Cardigan', 'Relaxed Jeans', 'Retro Runners'] },
      hot:  { title: 'Weekend Breeze',   reason: 'Maximum airflow for a relaxed day out.',                  items: ['Cuban Collar Shirt', 'Chino Shorts', 'Canvas Sneakers'] },
      rain: { title: 'Rainy Day Easy',   reason: 'Practical layers that don\'t sacrifice comfort.',          items: ['Zip-Up Hoodie', 'Jogger Pants', 'Waterproof Boots']    },
    },
  };

  const demo = DEMO[occasion][weather];

  return (
    <div className="min-h-screen bg-[#0d1a12] text-white font-display overflow-x-hidden selection:bg-primary/20">

      {/* ── Navbar ───────────────────────────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d1a12]/95 backdrop-blur-md border-b border-[#1e2f22] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-[#0d1a12]">
              <span className="material-symbols-outlined icon-filled text-[18px]">checkroom</span>
            </div>
            <span className="text-base font-extrabold tracking-tight">Digital Closet</span>
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
            <button onClick={() => scrollTo('how')}     className="hover:text-white transition-colors">How it works</button>
            <button onClick={() => scrollTo('demo')}    className="hover:text-white transition-colors">Demo</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-slate-400 hover:text-white transition-colors">
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-[#0d1a12] px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-[.97] shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden text-white p-1.5" onClick={() => setMobileNav(v => !v)}>
            <span className="material-symbols-outlined">{mobileNav ? 'close' : 'menu'}</span>
          </button>
        </div>

        {mobileNav && (
          <div className="absolute top-full left-0 w-full bg-[#0d1a12] border-b border-[#1e2f22] p-5 flex flex-col gap-3 md:hidden animate-fade-in">
            {['how', 'demo', 'pricing'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left py-2 text-white font-medium capitalize">
                {id === 'how' ? 'How it works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <hr className="border-[#1e2f22]" />
            <button onClick={() => navigate('/register')} className="bg-primary text-[#0d1a12] py-3 rounded-xl font-bold">
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="pt-36 pb-24 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI Wardrobe Assistant
          </div>
          <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] ${mounted ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
            Your closet,<br />
            <span className="gradient-text">organised.</span>
          </h1>
          <p className={`text-slate-400 text-lg leading-relaxed max-w-md border-l-2 border-primary/30 pl-5 ${mounted ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
            Upload your clothes. Get daily outfit suggestions based on your calendar, the weather, and your personal style.
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 pt-1 ${mounted ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-[#0d1a12] px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[.97]"
            >
              Build Your Closet
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={() => scrollTo('demo')}
              className="border border-[#1e2f22] text-slate-300 px-7 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:border-[#2a4032] hover:bg-white/3 hover:text-white transition-all"
            >
              See it in action
            </button>
          </div>
          {/* Social proof */}
          <div className={`flex items-center gap-3 pt-2 ${mounted ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
            <div className="flex -space-x-2">
              {['#13ec80','#00d4ff','#a78bfa','#fb923c'].map(c => (
                <div key={c} className="size-7 rounded-full border-2 border-[#0d1a12]" style={{ background: c }} />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-white font-bold">2,400+</span> wardrobes organised
            </p>
          </div>
        </div>

        {/* Hero card */}
        <div className={`hidden lg:block ${mounted ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          <div className="relative">
            <div className="bg-[#121f17] border border-[#1e2f22] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-float">
              <div className="h-64 bg-[#0a1610] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                  alt="Outfit"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Today&apos;s Look</span>
                <h3 className="text-lg font-bold text-white mt-1 mb-3">Monday Morning</h3>
                <div className="flex gap-2 mb-4">
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-[#1e2f22]">
                    <span className="material-symbols-outlined text-[12px]">rainy</span> Rain · 60%
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-[#1e2f22]">
                    <span className="material-symbols-outlined text-[12px]">work</span> Client Call
                  </span>
                </div>
                {['Waterproof Trench', 'Oxford Shirt', 'Dark Chinos'].map(item => (
                  <div key={item} className="flex items-center justify-between py-1.5 border-b border-[#1e2f22] last:border-0">
                    <span className="text-sm text-slate-300">{item}</span>
                    <span className="material-symbols-outlined icon-filled text-primary text-[14px]">check_circle</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-6 bg-[#121f17] border border-[#1e2f22] p-3.5 rounded-xl shadow-xl animate-fade-up delay-500">
              <div className="flex items-center gap-2.5">
                <div className="size-8 bg-primary/15 text-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">umbrella</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Weather Alert</p>
                  <p className="text-xs font-bold text-white">Rain starts at 2 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section id="how" className="py-24 border-y border-[#1e2f22]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-extrabold text-white mt-2 mb-3">It starts with your closet.</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Upload photos of your clothes. We tag them and use them to generate daily outfit suggestions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'upload',
                step: '01',
                title: 'Snap a photo',
                desc: 'Lay your clothes flat and take a quick picture. We handle the rest.',
                img: 'https://images.unsplash.com/photo-1551488852-d7b71e97ed02?w=500',
              },
              {
                icon: 'auto_awesome',
                step: '02',
                title: 'AI tags everything',
                desc: 'Category, color, formality — detected and stored automatically.',
                img: null,
              },
              {
                icon: 'wb_sunny',
                step: '03',
                title: 'Get daily looks',
                desc: 'Every morning, wake up to a ready outfit matched to your day.',
                img: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500',
              },
            ].map(({ icon, step, title, desc, img }) => (
              <div key={step} className="bg-[#121f17] border border-[#1e2f22] p-7 rounded-2xl hover:border-primary/20 transition-colors group">
                <div className="flex items-center justify-between mb-5">
                  <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">{desc}</p>
                {img ? (
                  <div className="h-36 bg-[#0d1a12] rounded-xl overflow-hidden">
                    <img src={img} alt={title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  </div>
                ) : (
                  <div className="h-36 bg-[#0d1a12] rounded-xl border border-dashed border-[#1e2f22] flex items-center justify-center">
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                      Analysing…
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demo ─────────────────────────────── */}
      <section id="demo" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Interactive Demo</span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-3">See how it thinks.</h2>
          <p className="text-slate-400">Change the inputs and watch Digital Closet adapt instantly.</p>
        </div>

        <div className="bg-[#121f17] border border-[#1e2f22] rounded-2xl p-7 md:p-10 grid lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-7">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Weather</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cold', icon: 'thermostat', label: 'Cold' },
                  { id: 'hot',  icon: 'sunny',      label: 'Warm' },
                  { id: 'rain', icon: 'rainy',       label: 'Rain' },
                ].map(({ id, icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setWeather(id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                      weather === id
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-[#0d1a12] border-[#1e2f22] text-slate-500 hover:text-slate-300 hover:border-[#2a4032]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    <span className="text-[10px] font-bold uppercase">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Context</p>
              <div className="space-y-2">
                {[
                  { id: 'work',   icon: 'work',    label: 'Work Meeting' },
                  { id: 'casual', icon: 'weekend', label: 'Casual Day'   },
                ].map(({ id, icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOccasion(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      occasion === id
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-[#0d1a12] border-[#1e2f22] text-slate-400 hover:text-white hover:border-[#2a4032]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    {label}
                    {occasion === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-3 bg-[#0d1a12] rounded-xl border border-[#1e2f22] overflow-hidden animate-fade-up" key={`${weather}-${occasion}`}>
            <div className="p-5 border-b border-[#1e2f22]">
              <span className="text-[9px] font-bold bg-primary text-[#0d1a12] px-2 py-0.5 rounded-md">AI SUGGESTION</span>
              <h3 className="text-xl font-bold text-white mt-2">{demo.title}</h3>
              <p className="text-sm text-primary italic mt-1 border-l-2 border-primary/30 pl-3">&ldquo;{demo.reason}&rdquo;</p>
            </div>
            <div className="p-4 space-y-2">
              {demo.items.map((item, i) => (
                <div key={item} className="flex items-center justify-between px-3 py-2.5 bg-[#121f17] rounded-lg border border-[#1e2f22] animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-sm text-white font-medium">{item}</span>
                  <span className="material-symbols-outlined icon-filled text-primary text-[15px]">check_circle</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────── */}
      <section id="pricing" className="py-24 border-t border-[#1e2f22]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Pricing</span>
            <h2 className="text-4xl font-extrabold text-white mt-2 mb-3">Simple, transparent pricing.</h2>
            <div className="inline-flex bg-[#121f17] border border-[#1e2f22] p-1 rounded-full mt-4">
              <button onClick={() => setAnnual(false)} className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${!annual ? 'bg-primary text-[#0d1a12]' : 'text-slate-500 hover:text-white'}`}>Monthly</button>
              <button onClick={() => setAnnual(true)}  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${annual  ? 'bg-primary text-[#0d1a12]' : 'text-slate-500 hover:text-white'}`}>Yearly <span className="opacity-70 text-[9px]">−20%</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: 'Starter', badge: null,
                price: '0', period: '/forever',
                desc: 'Organise your core wardrobe essentials.',
                features: ['Up to 30 items', 'Basic daily suggestions', 'Manual weather input'],
                cta: 'Start Free', highlight: false,
              },
              {
                name: 'Pro', badge: 'Most Popular',
                price: annual ? '12' : '15', period: '/mo',
                desc: 'Full automation for your wardrobe.',
                features: ['Unlimited items', 'Calendar integration', 'Live weather logic', 'Vibe AI Generator', 'Saved outfits'],
                cta: 'Get Pro', highlight: true,
              },
              {
                name: 'Lifetime', badge: null,
                price: '299', period: '/once',
                desc: 'Pay once, own it forever.',
                features: ['Everything in Pro', 'All future updates', 'Priority support', 'No recurring fees'],
                cta: 'Buy Once', highlight: false,
              },
            ].map(({ name, badge, price, period, desc, features, cta, highlight }) => (
              <div
                key={name}
                className={`relative flex flex-col p-7 rounded-2xl border transition-colors ${
                  highlight
                    ? 'bg-primary/5 border-primary/30 shadow-2xl shadow-primary/10 md:-translate-y-3'
                    : 'bg-[#121f17] border-[#1e2f22] hover:border-[#2a4032]'
                }`}
              >
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-[#0d1a12] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    {badge}
                  </div>
                )}
                <div className="mb-5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-primary' : 'text-slate-500'}`}>{name}</span>
                  <div className="flex items-end gap-1 mt-1 mb-1">
                    <span className="text-3xl font-extrabold text-white">${price}</span>
                    <span className="text-slate-500 text-sm pb-0.5">{period}</span>
                  </div>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className={`material-symbols-outlined icon-filled text-[14px] flex-shrink-0 ${highlight ? 'text-primary' : 'text-slate-600'}`}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[.97] ${
                    highlight
                      ? 'bg-primary text-[#0d1a12] hover:bg-primary/90 shadow-lg shadow-primary/20'
                      : 'border border-[#2a4032] text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-[#121f17] border border-[#1e2f22] rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold text-white mb-4">Ready to get dressed smarter?</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">Join thousands of people who never have to think about what to wear again.</p>
              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-[#0d1a12] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[.97]"
              >
                Start for free — no credit card
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-[#1e2f22] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-[#0d1a12]">
              <span className="material-symbols-outlined icon-filled text-[15px]">checkroom</span>
            </div>
            <span className="text-sm font-extrabold">Digital Closet</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 Digital Closet. Your AI-powered wardrobe.</p>
          <div className="flex gap-5 text-xs text-slate-500">
            <button onClick={() => scrollTo('how')}     className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button>
            <button onClick={() => navigate('/login')}  className="hover:text-white transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

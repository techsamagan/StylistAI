import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

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
      cold: { title: 'The Power Layer',     reason: 'Tailored wool that keeps you sharp in air-conditioned offices.', items: ['Tailored Wool Coat', 'Silk Blouse', 'Cigarette Trousers'] },
      hot:  { title: 'The Linen Set',       reason: 'Breathable linen handles the heat while staying polished.',      items: ['Linen Blazer', 'Silk Camisole', 'Pointed Flats']         },
      rain: { title: 'The Belted Trench',   reason: 'Polished for the office, protected from the downpour.',          items: ['Belted Trench', 'Tailored Trousers', 'Ankle Boots']      },
    },
    casual: {
      cold: { title: 'Coffee Shop Knit', reason: 'Cozy oversized texture for reading or working remotely.', items: ['Oversized Cardigan', 'High-Rise Jeans', 'Retro Sneakers'] },
      hot:  { title: 'Weekend Breeze',   reason: 'Effortless and airy for a relaxed day out.',              items: ['Linen Sundress', 'Straw Tote', 'Canvas Sneakers']        },
      rain: { title: 'Rainy Day Easy',   reason: 'Practical layers that don\'t sacrifice comfort.',         items: ['Zip-Up Hoodie', 'Leggings', 'Chelsea Rain Boots']        },
    },
  };

  const demo = DEMO[occasion][weather];

  return (
    <div className="min-h-screen bg-canvas text-fg font-display overflow-x-hidden selection:bg-primary/20">

      {/* ── Navbar ───────────────────────────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-canvas/95 backdrop-blur-md border-b border-line py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="size-8 bg-primary rounded-xl flex items-center justify-center text-[#1F2937]">
              <span className="material-symbols-outlined icon-filled text-[18px]">checkroom</span>
            </div>
            <span className="font-serif text-lg tracking-[0.12em]">FitCheck <span className="text-gold">AI</span></span>
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted">
            <button onClick={() => scrollTo('how')}     className="hover:text-fg transition-colors">How it works</button>
            <button onClick={() => scrollTo('demo')}    className="hover:text-fg transition-colors">Demo</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-fg transition-colors">Pricing</button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle className="size-9" />
            <button onClick={() => navigate('/login')} className="text-sm text-muted hover:text-fg transition-colors">
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-[#1F2937] px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-[.97] shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden text-fg p-1.5" onClick={() => setMobileNav(v => !v)}>
            <span className="material-symbols-outlined">{mobileNav ? 'close' : 'menu'}</span>
          </button>
        </div>

        {mobileNav && (
          <div className="absolute top-full left-0 w-full bg-canvas border-b border-line p-5 flex flex-col gap-3 md:hidden animate-fade-in">
            {['how', 'demo', 'pricing'].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left py-2 text-fg font-medium capitalize">
                {id === 'how' ? 'How it works' : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <hr className="border-line" />
            <button onClick={() => navigate('/register')} className="bg-primary text-[#1F2937] py-3 rounded-xl font-bold">
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="pt-36 pb-24 px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 bg-primary/10 text-gold-soft border border-primary/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI Stylist for Women
          </div>
          <h1 className={`font-serif font-light text-5xl md:text-7xl tracking-tight leading-[1.02] ${mounted ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
            Your personal<br />
            <span className="italic text-gold-soft">AI fashion stylist.</span>
          </h1>
          <p className={`text-muted text-lg leading-relaxed max-w-md border-l-2 border-primary/30 pl-5 ${mounted ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
            Upload your closet and wake up to outfits styled for your day — built around your calendar, the weather, and the way you love to dress.
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 pt-1 ${mounted ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary text-[#1F2937] px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[.97]"
            >
              Build Your Closet
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={() => scrollTo('demo')}
              className="border border-line text-muted px-7 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:border-line-strong hover:bg-fg/[0.03] hover:text-fg transition-all"
            >
              See it in action
            </button>
          </div>
          {/* Social proof */}
          <div className={`flex items-center gap-3 pt-2 ${mounted ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
            <div className="flex -space-x-2">
              {['#B7A98F','#8C8175','#D8C9AC','#6E6358'].map(c => (
                <div key={c} className="size-7 rounded-full border-2 border-canvas" style={{ background: c }} />
              ))}
            </div>
            <p className="text-xs text-subtle">
              <span className="text-fg font-bold">2,400+</span> wardrobes organised
            </p>
          </div>
        </div>

        {/* Hero card */}
        <div className={`hidden lg:block ${mounted ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
          <div className="relative">
            <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-2xl shadow-black/10 animate-float">
              <div className="h-64 bg-canvas overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1632149877166-f75d49000351?w=900&q=80&auto=format&fit=crop"
                  alt="Tall model in a tailored blazer and black heels"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-6">
                <span className="text-[10px] font-bold text-gold-soft uppercase tracking-widest">Today&apos;s Look</span>
                <h3 className="text-lg font-bold text-fg mt-1 mb-3">Monday Morning</h3>
                <div className="flex gap-2 mb-4">
                  <span className="flex items-center gap-1 text-xs text-muted bg-fg/[0.04] px-2.5 py-1 rounded-lg border border-line">
                    <span className="material-symbols-outlined text-[12px]">rainy</span> Rain · 60%
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted bg-fg/[0.04] px-2.5 py-1 rounded-lg border border-line">
                    <span className="material-symbols-outlined text-[12px]">work</span> Client Call
                  </span>
                </div>
                {['Belted Trench', 'Silk Blouse', 'Tailored Trousers'].map(item => (
                  <div key={item} className="flex items-center justify-between py-1.5 border-b border-line last:border-0">
                    <span className="text-sm text-muted">{item}</span>
                    <span className="material-symbols-outlined icon-filled text-gold-soft text-[14px]">check_circle</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-6 bg-card border border-line p-3.5 rounded-xl shadow-xl animate-fade-up delay-500">
              <div className="flex items-center gap-2.5">
                <div className="size-8 bg-primary/15 text-gold-soft rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">umbrella</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-subtle uppercase">Weather Alert</p>
                  <p className="text-xs font-bold text-fg">Rain starts at 2 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated pieces (items gallery) ─────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-gold-soft uppercase tracking-widest">The Pieces</span>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-fg mt-2 leading-tight">Luxury, curated for her.</h2>
              <p className="text-muted mt-3 max-w-md">Designer bags, tailoring, and the finishing touches — the staples your AI stylist builds every look around.</p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-soft hover:gap-2.5 transition-all"
            >
              Build your closet
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {[
              { name: 'Quilted Shoulder Bag', tag: 'Bags',        img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80&auto=format&fit=crop' },
              { name: 'Top-Handle Bag',       tag: 'Bags',        img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80&auto=format&fit=crop' },
              { name: 'Structured Clutch',    tag: 'Bags',        img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=700&q=80&auto=format&fit=crop' },
              { name: 'Pointed Pumps',        tag: 'Shoes',       img: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=700&q=80&auto=format&fit=crop' },
              { name: 'Stiletto Heels',       tag: 'Shoes',       img: 'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=700&q=80&auto=format&fit=crop' },
              { name: 'Tailored Coat',        tag: 'Suiting',     img: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=700&q=80&auto=format&fit=crop' },
              { name: 'Camel Bomber',         tag: 'Outerwear',   img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80&auto=format&fit=crop' },
              { name: 'The Gold Edit',        tag: 'Jewelry',     img: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=700&q=80&auto=format&fit=crop' },
              { name: 'Sunglasses',           tag: 'Accessories', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&q=80&auto=format&fit=crop' },
            ].map((it) => (
              <div key={it.name} className="group">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-card border border-line shadow-md shadow-black/[0.04]">
                  <img
                    src={it.img}
                    alt={it.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-fg truncate">{it.name}</p>
                  <span className="text-[11px] uppercase tracking-wide text-subtle flex-shrink-0">{it.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section id="how" className="py-24 border-y border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-gold-soft uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-serif font-light text-fg mt-2 mb-3">It starts with your closet.</h2>
            <p className="text-muted max-w-lg mx-auto">Upload photos of your clothes. We tag them and use them to generate daily outfit suggestions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'upload',
                step: '01',
                title: 'Snap a photo',
                desc: 'Lay your clothes flat and take a quick picture. We handle the rest.',
                img: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80&auto=format&fit=crop',
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
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop',
              },
            ].map(({ icon, step, title, desc, img }) => (
              <div key={step} className="bg-card border border-line p-7 rounded-2xl hover:border-primary/20 transition-colors group">
                <div className="flex items-center justify-between mb-5">
                  <div className="size-10 bg-primary/10 text-gold-soft rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <span className="text-xs font-bold text-subtle">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-fg mb-2">{title}</h3>
                <p className="text-sm text-subtle mb-5 leading-relaxed">{desc}</p>
                {img ? (
                  <div className="h-36 bg-canvas rounded-xl overflow-hidden">
                    <img src={img} alt={title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  </div>
                ) : (
                  <div className="h-36 bg-canvas rounded-xl border border-dashed border-line flex items-center justify-center">
                    <span className="text-[10px] font-mono text-gold-soft bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
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
          <span className="text-xs font-bold text-gold-soft uppercase tracking-widest">Interactive Demo</span>
          <h2 className="text-4xl font-serif font-light text-fg mt-2 mb-3">See how it thinks.</h2>
          <p className="text-muted">Change the inputs and watch FitCheck adapt instantly.</p>
        </div>

        <div className="bg-card border border-line rounded-2xl p-7 md:p-10 grid lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-7">
            <div>
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mb-3">Weather</p>
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
                        ? 'bg-primary/10 border-primary/30 text-gold-soft'
                        : 'bg-canvas border-line text-subtle hover:text-muted hover:border-line-strong'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    <span className="text-[10px] font-bold uppercase">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mb-3">Context</p>
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
                        ? 'bg-primary/10 border-primary/30 text-gold-soft'
                        : 'bg-canvas border-line text-muted hover:text-fg hover:border-line-strong'
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
          <div className="lg:col-span-3 bg-canvas rounded-xl border border-line overflow-hidden animate-fade-up" key={`${weather}-${occasion}`}>
            <div className="p-5 border-b border-line">
              <span className="text-[9px] font-bold bg-primary text-[#1F2937] px-2 py-0.5 rounded-md">AI SUGGESTION</span>
              <h3 className="text-xl font-bold text-fg mt-2">{demo.title}</h3>
              <p className="text-sm text-gold-soft italic mt-1 border-l-2 border-primary/30 pl-3">&ldquo;{demo.reason}&rdquo;</p>
            </div>
            <div className="p-4 space-y-2">
              {demo.items.map((item, i) => (
                <div key={item} className="flex items-center justify-between px-3 py-2.5 bg-card rounded-lg border border-line animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-sm text-fg font-medium">{item}</span>
                  <span className="material-symbols-outlined icon-filled text-gold-soft text-[15px]">check_circle</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────── */}
      <section id="pricing" className="py-24 border-t border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-gold-soft uppercase tracking-widest">Pricing</span>
            <h2 className="text-4xl font-serif font-light text-fg mt-2 mb-3">Simple, transparent pricing.</h2>
            <div className="inline-flex bg-card border border-line p-1 rounded-full mt-4">
              <button onClick={() => setAnnual(false)} className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${!annual ? 'bg-primary text-[#1F2937]' : 'text-subtle hover:text-fg'}`}>Monthly</button>
              <button onClick={() => setAnnual(true)}  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${annual  ? 'bg-primary text-[#1F2937]' : 'text-subtle hover:text-fg'}`}>Yearly <span className="opacity-70 text-[9px]">−20%</span></button>
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
                    : 'bg-card border-line hover:border-line-strong'
                }`}
              >
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-[#1F2937] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    {badge}
                  </div>
                )}
                <div className="mb-5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-gold-soft' : 'text-subtle'}`}>{name}</span>
                  <div className="flex items-end gap-1 mt-1 mb-1">
                    <span className="text-3xl font-extrabold text-fg">${price}</span>
                    <span className="text-subtle text-sm pb-0.5">{period}</span>
                  </div>
                  <p className="text-xs text-subtle">{desc}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-muted">
                      <span className={`material-symbols-outlined icon-filled text-[14px] flex-shrink-0 ${highlight ? 'text-gold-soft' : 'text-subtle'}`}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[.97] ${
                    highlight
                      ? 'bg-primary text-[#1F2937] hover:bg-primary/90 shadow-lg shadow-primary/20'
                      : 'border border-line-strong text-muted hover:bg-fg/[0.04] hover:text-fg'
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
          <div className="bg-card border border-line rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="relative">
              <h2 className="text-4xl font-serif font-light text-fg mb-4">Ready to get dressed smarter?</h2>
              <p className="text-muted mb-8 leading-relaxed">Join thousands of women who never have to think about what to wear again.</p>
              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-[#1F2937] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[.97]"
              >
                Start for free — no credit card
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-line py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-[#1F2937]">
              <span className="material-symbols-outlined icon-filled text-[15px]">checkroom</span>
            </div>
            <span className="font-serif text-base tracking-[0.12em]">FitCheck <span className="text-gold">AI</span></span>
          </div>
          <p className="text-xs text-subtle">© 2026 FitCheck AI. Your personal AI fashion stylist.</p>
          <div className="flex gap-5 text-xs text-subtle">
            <button onClick={() => scrollTo('how')}     className="hover:text-fg transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-fg transition-colors">Pricing</button>
            <button onClick={() => navigate('/login')}  className="hover:text-fg transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

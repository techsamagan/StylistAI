import React, { useState } from 'react'; // Removed useEffect
import { 
  Mail, Lock, ArrowRight, Check, User, 
  Sparkles, Ruler, Shirt, Briefcase 
} from 'lucide-react';
import { api, isApiConfigured } from '../api/client';

// --- MOCK SOCIAL ICONS (SVGs) ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 3.57-1.62.9 0 2.45.18 3.5.76-1.94.88-2.14 3.38-.28 4.7.76.68 1.93.68 1.93.68s-.24 1.3-.65 2.1c-.55 1.15-1.25 2.08-2.05 2.08-.2.03-.4.03-.6.03l-.4-.02zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.18 2.38-1.98 4.35-3.74 4.25z" />
  </svg>
);

// --- COMPONENT: AUTH FORM (Login/Register) ---
const AuthForm = ({ onAuthSuccess, mode, setMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!isApiConfigured()) {
      onAuthSuccess();
      return;
    }
    try {
      setLoading(true);
      const payload = { email, password, ...(mode === 'signup' ? { name } : {}) };
      const res = mode === 'signup' 
        ? await api.register(payload) 
        : await api.login(payload);
      if (typeof window !== 'undefined' && res?.access_token) {
        window.localStorage.setItem('auth_token', res.access_token);
      }
      onAuthSuccess();
    } catch (e) {
      setError(e.body?.detail || e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl p-8 md:p-10 border border-gray-100 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User size={24} />
        </div>
        <h2 className="text-2xl font-medium tracking-tight mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500 text-sm">
          {mode === 'login' ? 'Enter your details to access your wardrobe.' : 'Start your style journey today.'}
        </p>
      </div>

      <div className="space-y-4">
        {mode === 'signup' && (
           <div className="relative">
             <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Full Name" 
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" 
             />
           </div>
        )}
        
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" 
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary focus:bg-white transition-colors" 
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="my-8 flex items-center gap-4">
        <div className="h-px bg-gray-100 flex-1" />
        <span className="text-xs text-gray-400 font-medium uppercase">Or continue with</span>
        <div className="h-px bg-gray-100 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          <GoogleIcon />
          <span className="text-sm font-medium">Google</span>
        </button>
        <button className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          <AppleIcon />
          <span className="text-sm font-medium">Apple</span>
        </button>
      </div>

      <div className="mt-8 text-center text-sm">
        <span className="text-gray-500">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button 
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="font-semibold text-primary hover:underline"
        >
          {mode === 'login' ? 'Sign Up' : 'Log In'}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: ONBOARDING QUIZ ---
const OnboardingQuiz = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({ style: [], fit: '', goal: '' });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onComplete();
  };

  const OptionButton = ({ label, icon, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
        active 
        ? 'border-primary bg-primary/10 text-primary' 
        : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-white text-primary' : 'bg-white text-gray-400'}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {active && <Check size={18} className="ml-auto text-primary" />}
    </button>
  );

  return (
    <div className="w-full max-w-lg bg-white rounded-[32px] shadow-xl p-8 md:p-12 border border-gray-100 animate-fade-in-up">
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-100'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-medium mb-2">Define your vibe.</h2>
          <p className="text-gray-500 mb-6">Select the styles that resonate with you most.</p>
          <div className="space-y-3">
            {[
              { id: 'minimalist', label: 'Minimalist & Clean', icon: <Sparkles size={18} /> },
              { id: 'professional', label: 'Structured & Professional', icon: <Briefcase size={18} /> },
              { id: 'streetwear', label: 'Relaxed Streetwear', icon: <Shirt size={18} /> },
            ].map((opt) => (
              <OptionButton 
                key={opt.id} 
                {...opt} 
                active={selections.style.includes(opt.id)} 
                onClick={() => setSelections({...selections, style: [opt.id]})}
              />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-medium mb-2">How do you like clothes to fit?</h2>
          <p className="text-gray-500 mb-6">This helps us suggest sizes and silhouettes.</p>
          <div className="space-y-3">
            {[
              { id: 'slim', label: 'Slim / Tailored', icon: <Ruler size={18} className="rotate-90" /> },
              { id: 'regular', label: 'Regular / Classic', icon: <Ruler size={18} /> },
              { id: 'oversized', label: 'Relaxed / Oversized', icon: <Shirt size={18} /> },
            ].map((opt) => (
              <OptionButton 
                key={opt.id} 
                {...opt} 
                active={selections.fit === opt.id} 
                onClick={() => setSelections({...selections, fit: opt.id})}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-medium mb-2">What is your primary goal?</h2>
          <p className="text-gray-500 mb-6">We will prioritize suggestions based on this.</p>
          <div className="space-y-3">
            {[
              { id: 'time', label: 'Save time in the morning', icon: <User size={18} /> },
              { id: 'look', label: 'Look more put-together', icon: <Sparkles size={18} /> },
              { id: 'money', label: 'Buy less, wear more', icon: <Lock size={18} /> },
            ].map((opt) => (
              <OptionButton 
                key={opt.id} 
                {...opt} 
                active={selections.goal === opt.id} 
                onClick={() => setSelections({...selections, goal: opt.id})}
              />
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={nextStep}
        className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold mt-8 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        {step === 3 ? 'Finish Setup' : 'Continue'} <ArrowRight size={18} />
      </button>
    </div>
  );
};

// --- MAIN WRAPPER COMPONENT ---
const AuthFlow = ({ onComplete, initialView = 'login' }) => {
  const [viewState, setViewState] = useState(initialView); 

  const handleAuthSuccess = () => {
    if (viewState === 'signup') {
      setViewState('onboarding'); 
    } else {
      onComplete(); 
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 relative overflow-hidden text-background-dark dark:text-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sage-100 rounded-full blur-[100px] opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-100 rounded-full blur-[100px] opacity-50 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      {/* Brand Header - Now links back to Home */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
        <a href="/" className="flex items-center gap-2 text-inherit no-underline">
          <div className="w-8 h-8 bg-primary rounded-lg text-background-dark flex items-center justify-center text-sm font-serif italic">V</div>
          <span className="font-semibold text-xl tracking-tight">Varda.</span>
        </a>
      </div>

      {/* Logic Switcher */}
      {viewState === 'onboarding' ? (
        <OnboardingQuiz onComplete={onComplete} />
      ) : (
        <AuthForm 
          mode={viewState} 
          setMode={setViewState} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}
      
      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400 text-center max-w-xs relative z-10">
        By continuing, you agree to Varda's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default AuthFlow;
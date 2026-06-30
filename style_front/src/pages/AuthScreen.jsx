import React from 'react';
import { User } from 'lucide-react';

const AuthScreen = ({ onAuthenticate }) => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-background-dark dark:text-fg">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
      <div className="w-12 h-12 bg-primary/10 text-gold-soft rounded-full flex items-center justify-center mx-auto mb-6">
        <User size={24} />
      </div>
      <h2 className="text-2xl font-medium mb-2">Welcome Back</h2>
      <p className="text-gray-500 mb-8">Sign in to sync your wardrobe.</p>
      <button onClick={onAuthenticate} className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold hover:opacity-90 transition-opacity mb-4">
        Continue with Email
      </button>
      <button onClick={onAuthenticate} className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors">
        Continue as Guest
      </button>
    </div>
  </div>
);

export default AuthScreen;
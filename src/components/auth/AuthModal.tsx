import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, register, clearError } from '../../store/slices/authSlice';

export default function AuthModal() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      dispatch(login({ email: authForm.email, password: authForm.password }));
    } else {
      dispatch(register(authForm));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-2xl border border-stone-200 dark:border-stone-800"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mx-auto mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-stone-500 text-sm mt-1">
            {authMode === 'login' ? 'Sign in to access your notes' : 'Join us to start organizing your thoughts'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-gap-4 flex flex-col gap-4">
          {authMode === 'register' && (
            <input 
              type="text" 
              placeholder="Username" 
              required
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          
          {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              dispatch(clearError());
            }}
            className="text-sm text-stone-500 hover:text-indigo-600 transition-colors"
          >
            {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

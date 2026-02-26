/**
 * Overview: AuthScreen.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import React, { useState, useEffect, useRef } from 'react';
import { VaneIcon } from '../../constants.tsx';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { Loader2, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  initialMode: 'signin' | 'signup';
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode, onBack }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchdogRef = useRef<number | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    return () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    };
  }, []);

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);

    watchdogRef.current = window.setTimeout(() => {
      setLoading(false);
      if (!SupabaseService.isConfigured()) {
         // Silently proceed to demo mode handled in service
      }
    }, 5000);

    try {
      await SupabaseService.auth.signInWithGoogle();
    } catch (e: any) {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      console.error("Auth Handshake Error:", e);
      setLoading(false);
      setError(e.message || "Unable to connect to the authentication provider.");
    }
  };

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await SupabaseService.auth.signUpWithEmail(email.trim(), password);
      } else {
        await SupabaseService.auth.signInWithEmail(email.trim(), password);
      }
    } catch (e: any) {
      setError(e.message || "Unable to authenticate with email/password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 flex flex-col items-center justify-center px-6 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
        <div className="mb-10 flex justify-center">
          <VaneIcon size={48} color="#1FA2A6" />
        </div>

        <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100 mb-3">
          {mode === 'signup' ? 'Create your Eduvane account' : 'Sign in to Eduvane'}
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
          Save your work, track progress, and pick up where you left off.
        </p>

        <div className="mb-8 flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              mode === 'signin'
                ? 'bg-[#1E3A5F] text-white'
                : 'bg-transparent text-slate-500 dark:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              mode === 'signup'
                ? 'bg-[#1E3A5F] text-white'
                : 'bg-transparent text-slate-500 dark:text-slate-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-relaxed">
              {error.includes("SUPABASE_CONFIG_MISSING") 
                ? "Demo Mode: We're currently in a preview state. Clicking 'Continue' will proceed with a Demo Profile."
                : error}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1FA2A6]"
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#1FA2A6]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1E3A5F] hover:bg-[#152a46] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Working...</span>
                </>
              ) : (
                <span>{mode === 'signup' ? 'Create account with Email' : 'Continue with Email'}</span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-[#1FA2A6] text-[#1E3A5F] dark:text-slate-100 font-bold py-5 px-6 rounded-2xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 size={24} className="animate-spin text-[#1FA2A6]" strokeWidth={3} />
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
              </>
            )}
          </button>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
            <button 
              onClick={onBack}
              disabled={loading}
              className="text-sm font-bold text-[#1FA2A6] hover:underline flex items-center justify-center gap-2 mx-auto"
            >
              Try without signing in
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center max-w-xs">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
          Eduvane securely manages your academic records. By continuing, you agree to our supportive Terms of Service.
        </p>
      </div>
    </div>
  );
};

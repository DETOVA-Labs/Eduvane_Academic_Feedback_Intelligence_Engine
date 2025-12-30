
import React, { useState, useEffect, useRef } from 'react';
import { VaneIcon } from '../../constants.tsx';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  initialMode: 'signin' | 'signup';
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode, onBack }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchdogRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup watchdog on unmount
    return () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    };
  }, []);

  const handleAuth = async () => {
    setError(null);
    setLoading(true);

    // Watchdog: If we haven't redirected in 8 seconds, something is wrong
    watchdogRef.current = window.setTimeout(() => {
      setLoading(false);
      setError("The authentication service is taking too long to respond. Please check your connection and try again.");
    }, 8000);

    try {
      await SupabaseService.auth.signIn();
      // If code reaches here, Supabase SDK has initialized the redirect.
      // We don't call setLoading(false) here because the browser is about to navigate away.
    } catch (e: any) {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      console.error("Auth Handshake Failed:", e);
      setLoading(false);
      setError(e.message || "Failed to connect to authentication provider.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 flex flex-col items-center justify-center px-6 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="mb-8 flex justify-center">
          <VaneIcon size={40} color="#1FA2A6" />
        </div>

        <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-slate-100 mb-2">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {mode === 'signin' 
            ? 'Sign in to access your learning intelligence.' 
            : 'Join Eduvane to start tracking your academic progress.'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-[#1E3A5F] dark:text-slate-200 font-bold py-4 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50 relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin text-[#1FA2A6]" />
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              disabled={loading}
              className="text-xs font-bold text-[#1FA2A6] hover:underline disabled:opacity-50"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={onBack}
        disabled={loading}
        className="mt-8 flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-[#1E3A5F] dark:hover:text-slate-200 text-sm font-bold transition-colors disabled:opacity-50"
      >
        <ArrowLeft size={16} /> Go back
      </button>

      <div className="mt-12 text-center max-w-xs">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          By continuing, you agree to Eduvane's Terms of Service and Privacy Policy. 
          Your academic data is processed securely and privately.
        </p>
      </div>
    </div>
  );
};

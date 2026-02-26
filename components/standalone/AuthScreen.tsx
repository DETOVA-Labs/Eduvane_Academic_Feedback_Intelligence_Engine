/**
 * Overview: AuthScreen.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import React, { useState, useEffect, useRef } from 'react';
import { VaneIcon } from '../../constants.tsx';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { ArrowLeft, Loader2, AlertCircle, Info } from 'lucide-react';

interface AuthScreenProps {
  initialMode: 'signin' | 'signup';
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchdogRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
    };
  }, []);

  const handleAuth = async () => {
    setError(null);
    setLoading(true);

    watchdogRef.current = window.setTimeout(() => {
      setLoading(false);
      if (!SupabaseService.isConfigured()) {
         // Silently proceed to demo mode handled in service
      }
    }, 5000);

    try {
      await SupabaseService.auth.signIn();
    } catch (e: any) {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      console.error("Auth Handshake Error:", e);
      setLoading(false);
      setError(e.message || "Unable to connect to the authentication provider.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 flex flex-col items-center justify-center px-6 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
        <div className="mb-10 flex justify-center">
          <VaneIcon size={48} color="#1FA2A6" />
        </div>

        <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100 mb-3">
          Continue to Eduvane
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
          Sign in to save your work, track progress, and pick up where you left off.
        </p>

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
          <button 
            onClick={handleAuth}
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
                <span>Continue with Google</span>
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

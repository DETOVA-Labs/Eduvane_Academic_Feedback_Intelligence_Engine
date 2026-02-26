/**
 * Overview: LandingPage.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import React from 'react';
import { VaneIcon } from '../../constants.tsx';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
  onGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onSignIn, onGuest }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
      <main className="flex-grow w-full max-w-4xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        <div className="mb-8">
          <VaneIcon size={56} color="#1FA2A6" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[#1E3A5F] dark:text-slate-100 tracking-tight mb-4">
          Turning student work into learning intelligence.
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mb-12 leading-relaxed">
          Upload written work to get clear feedback, scores, and guidance — instantly. Works for any subject. No setup required.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
          <button 
            onClick={onSignUp}
            className="w-full bg-[#1E3A5F] dark:bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-[#152a46] dark:hover:bg-slate-700 transition-all shadow-lg"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            onClick={onSignIn}
            className="w-full bg-white dark:bg-slate-900 text-[#1E3A5F] dark:text-slate-100 px-6 py-4 rounded-xl font-bold text-base border border-slate-200 dark:border-slate-700 hover:border-[#1FA2A6] transition-all shadow-sm"
          >
            Sign In
          </button>
          <p className="text-[11px] text-slate-400 font-medium">Create an account or sign in to save your progress.</p>
        </div>

        <button 
          onClick={onGuest}
          className="group flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-[#1E3A5F] dark:hover:text-slate-200 transition-colors py-4"
        >
          <span className="text-sm font-bold">Try without signing in</span>
          <span className="text-[11px] opacity-70">No account needed</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 text-left w-full max-w-3xl">
          <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 transition-all hover:shadow-sm">
            <BookOpen size={24} className="text-[#1FA2A6] mb-4" />
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-2">Learning from your work</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
              Snap a photo of any assignment or test. Eduvane reviews the work and provides clear, supportive steps for improvement.
            </p>
          </div>
          <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 transition-all hover:shadow-sm">
            <Sparkles size={24} className="text-[#1FA2A6] mb-4" />
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-2">Targeted practice</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
              Create focused questions for any topic to sharpen your skills and test your understanding at your own pace.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center border-t border-slate-100 dark:border-slate-900">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
          Eduvane • Academic support for students and teachers.
        </p>
      </footer>
    </div>
  );
};

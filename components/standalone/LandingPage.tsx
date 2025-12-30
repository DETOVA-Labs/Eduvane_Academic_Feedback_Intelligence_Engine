
import React from 'react';
import { VaneIcon } from '../../constants.tsx';
import { ArrowRight, LogIn, ShieldCheck, Sparkles } from 'lucide-react';

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
          <VaneIcon size={48} color="#1FA2A6" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[#1E3A5F] dark:text-slate-100 tracking-tight mb-4">
          Turning student work into learning intelligence.
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mb-12 leading-relaxed">
          Snap a photo of your work to get clear feedback, or generate targeted practice questions for any subject. No setup required.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs mb-10">
          <button 
            onClick={onSignUp}
            className="w-full bg-[#1E3A5F] dark:bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#152a46] dark:hover:bg-slate-700 transition-all shadow-lg"
          >
            Get started <ArrowRight size={18} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onSignIn}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1E3A5F] dark:text-slate-200 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <LogIn size={16} className="text-[#1FA2A6]" /> Sign in
            </button>
          </div>
        </div>

        <button 
          onClick={onGuest}
          className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#1E3A5F] dark:hover:text-slate-200 transition-colors text-sm font-semibold py-4"
        >
          Try without signing in
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 text-left w-full max-w-3xl">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800">
            <ShieldCheck size={24} className="text-[#1FA2A6] mb-3" />
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-2">Learning from your work</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Upload any assignment or test. Eduvane recognizes the subject automatically to provide scores and clear steps for improvement.
            </p>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800">
            <Sparkles size={24} className="text-[#1FA2A6] mb-3" />
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-2">Targeted practice</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Create focused questions for any topic to test your understanding and sharpen your skills.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-slate-100 dark:border-slate-900">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Eduvane • Academic support for students and teachers.
        </p>
      </footer>
    </div>
  );
};


import React from 'react';
import { VaneIcon } from '../../constants.tsx';
import { Upload, Sparkles, ArrowRight, LogIn, Play } from 'lucide-react';

interface LandingPageProps {
  onStart: (intent: 'DASHBOARD' | 'UPLOAD' | 'PRACTICE') => void;
  onGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onGuest }) => {
  return (
    <div className="min-h-screen bg-[#1E3A5F] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="mb-8 animate-bounce">
        <VaneIcon size={80} color="#1FA2A6" />
      </div>
      
      <div className="max-w-3xl space-y-4 mb-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">EDUVANE</h1>
        <p className="text-xl md:text-2xl font-light text-[#1FA2A6] insight-narrative">
          Turning student work into learning intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Primary Action: Upload */}
        <button 
          onClick={() => onStart('UPLOAD')}
          className="group bg-white text-[#1E3A5F] p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 transition-all hover:scale-[1.02] border-b-8 border-slate-200"
        >
          <div className="bg-[#1FA2A6]/10 p-6 rounded-3xl text-[#1FA2A6]">
            <Upload size={48} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h3 className="font-black text-2xl uppercase tracking-tight">Upload Your Work</h3>
            <p className="text-sm text-slate-500 mt-2 leading-snug">
              Instant evaluation. No subject required.<br/>
              Agnostic intelligence for all disciplines.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#1FA2A6] text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest mt-2 group-hover:bg-[#198d91] transition-all shadow-lg">
            Try Eduvane Now <ArrowRight size={14} />
          </div>
        </button>

        {/* Primary Action: Practice */}
        <button 
          onClick={() => onStart('PRACTICE')}
          className="group bg-[#1FA2A6] text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 transition-all hover:scale-[1.02] border-b-8 border-[#198d91]"
        >
          <div className="bg-white/20 p-6 rounded-3xl text-white">
            <Sparkles size={48} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h3 className="font-black text-2xl uppercase tracking-tight">Generate Practice</h3>
            <p className="text-white/80 text-sm mt-2 leading-snug">
              Design rigorous assessments.<br/>
              Tailored AI-generated questions.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white text-[#1FA2A6] px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest mt-2 group-hover:bg-slate-50 transition-all shadow-lg">
            Build Assessment <ArrowRight size={14} />
          </div>
        </button>
      </div>

      <div className="mt-16 flex flex-col items-center gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <button 
            onClick={() => onStart('DASHBOARD')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 px-8 py-4 rounded-2xl text-sm font-bold transition-all"
          >
            <LogIn size={18} className="text-[#1FA2A6]" /> Save your progress with Google
          </button>
          
          <div className="hidden md:block h-8 w-px bg-white/10"></div>

          <button 
            onClick={onGuest}
            className="group text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <Play size={14} className="group-hover:fill-current" /> Continue as Guest
          </button>
        </div>
        
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase opacity-50">
          Intelligence Follows Action • Eduvane v1.0 MVP
        </p>
      </div>
    </div>
  );
};

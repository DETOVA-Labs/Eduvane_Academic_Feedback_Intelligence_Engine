
import React from 'react';
import { VaneIcon } from '../../constants.tsx';
import { Upload, Sparkles, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#1E3A5F] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="mb-8 animate-bounce">
        <VaneIcon size={80} color="#1FA2A6" />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter">EDUVANE</h1>
      <p className="text-xl md:text-2xl font-light text-[#1FA2A6] mb-12 insight-narrative">
        Turning student work into learning intelligence.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button 
          onClick={onStart}
          className="group bg-white text-[#1E3A5F] p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 transition-all hover:scale-105"
        >
          <div className="bg-[#1FA2A6]/10 p-4 rounded-full text-[#1FA2A6]">
            <Upload size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg">Upload Your Work</h3>
            <p className="text-xs text-slate-500 mt-1">Instant scores from handwritten work.</p>
          </div>
          <ArrowRight className="text-slate-200 group-hover:text-[#1FA2A6] transition-colors" />
        </button>

        <button 
          onClick={onStart}
          className="group bg-[#1FA2A6] text-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 transition-all hover:scale-105"
        >
          <div className="bg-white/10 p-4 rounded-full text-white">
            <Sparkles size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg">Practice Questions</h3>
            <p className="text-white/70 text-xs mt-1">AI-assisted assessment generator.</p>
          </div>
          <ArrowRight className="text-white/30 group-hover:text-white transition-colors" />
        </button>
      </div>

      <button 
        onClick={onStart}
        className="mt-12 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
      >
        Continue as Guest
      </button>
    </div>
  );
};

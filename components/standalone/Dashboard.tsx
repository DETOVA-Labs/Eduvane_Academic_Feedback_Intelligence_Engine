
import React, { useState } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, ChevronRight, Camera, FileText, Search } from 'lucide-react';
import { Submission, UserProfile } from '../../types.ts';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';

interface DashboardProps {
  onAction: (view: 'UPLOAD' | 'PRACTICE' | 'HISTORY') => void;
  onCommand: (intent: string, subject?: string, topic?: string) => void;
  submissions: Submission[];
  profile: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAction, onCommand, submissions, profile }) => {
  const [command, setCommand] = useState('');
  const [isRouting, setIsRouting] = useState(false);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setIsRouting(true);
    try {
      const result = await AIOrchestrator.interpretation.parseIntent(command);
      setCommand('');
      onCommand(result.intent, result.subject, result.topic);
    } catch (e) {
      console.error("Routing Error:", e);
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="mb-2">
        <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100">Welcome to Eduvane</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base mt-1">What would you like to do today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onAction('UPLOAD')}
          className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-[#1FA2A6] dark:hover:border-[#1FA2A6] transition-all group shadow-sm"
        >
          <div className="bg-[#1FA2A6]/10 p-4 rounded-xl w-fit mb-4 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Camera size={28} />
          </div>
          <h3 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-xl">Upload student work</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed font-medium">Eduvane will review your work and give clear, supportive feedback.</p>
        </button>

        <button 
          onClick={() => onAction('PRACTICE')}
          className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-[#1FA2A6] dark:hover:border-[#1FA2A6] transition-all group shadow-sm"
        >
          <div className="bg-[#1FA2A6]/10 p-4 rounded-xl w-fit mb-4 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Sparkles size={28} />
          </div>
          <h3 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-xl">Generate practice</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed font-medium">Create new practice questions to test your knowledge.</p>
        </button>
      </div>

      <section className="bg-[#1E3A5F] dark:bg-slate-900 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-[#1FA2A6]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Quick Action</h3>
        </div>
        <form onSubmit={handleCommandSubmit} className="relative">
          <input 
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. '10 questions on photosynthesis'..."
            className="w-full bg-white/10 dark:bg-white/5 text-white rounded-xl py-5 px-6 pr-14 outline-none focus:ring-2 focus:ring-[#1FA2A6] transition-all placeholder:text-white/30 font-medium border border-white/10"
            disabled={isRouting}
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#1FA2A6] rounded-lg text-white disabled:opacity-50 hover:bg-[#188b8e] transition-colors"
            disabled={isRouting}
          >
            {isRouting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </section>

      {submissions.length > 0 && (
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#1FA2A6]" />
              <h4 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-sm uppercase tracking-wide">Recent activity</h4>
            </div>
            <button onClick={() => onAction('HISTORY')} className="text-xs font-bold text-[#1FA2A6] hover:underline">See full history</button>
          </div>
          <div className="space-y-2">
            {submissions.slice(0, 3).map(s => (
              <div key={s.id} onClick={() => onAction('HISTORY')} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1E3A5F] dark:text-slate-100 text-base">{s.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(s.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-[#1FA2A6] text-lg">{s.score}%</span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

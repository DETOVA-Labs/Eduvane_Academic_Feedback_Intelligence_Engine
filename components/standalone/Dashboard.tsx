
import React, { useState } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, ChevronRight, Camera, FileText } from 'lucide-react';
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
      alert("Try something like 'Practice math' or 'Analyze my work'.");
    } finally {
      setIsRouting(false);
    }
  };

  const avgScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
    : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-slate-100 transition-colors">Your Hub</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back. What would you like to do today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => onAction('UPLOAD')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-[#1FA2A6] dark:hover:border-[#1FA2A6] transition-all group"
        >
          <div className="bg-[#1FA2A6]/10 dark:bg-[#1FA2A6]/20 p-3 rounded-xl w-fit mb-4 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Camera size={24} />
          </div>
          <h3 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-lg">Upload work</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Get feedback on your homework or exam practice.</p>
        </button>

        <button 
          onClick={() => onAction('PRACTICE')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-[#1FA2A6] dark:hover:border-[#1FA2A6] transition-all group"
        >
          <div className="bg-[#1FA2A6]/10 dark:bg-[#1FA2A6]/20 p-3 rounded-xl w-fit mb-4 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-lg">Practice questions</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate new questions to test your knowledge.</p>
        </button>
      </div>

      <section className="bg-[#1E3A5F] dark:bg-slate-800 p-6 rounded-2xl text-white transition-colors">
        <h3 className="text-sm font-bold opacity-80 mb-4">Quick Search</h3>
        <form onSubmit={handleCommandSubmit} className="relative">
          <input 
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. '10 questions on history'..."
            className="w-full bg-white/10 dark:bg-slate-900/50 text-white rounded-xl py-4 px-5 pr-12 outline-none focus:ring-2 focus:ring-[#1FA2A6] transition-all placeholder:text-white/40 dark:placeholder:text-slate-500 font-medium border border-transparent dark:border-slate-700"
            disabled={isRouting}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#1FA2A6] rounded-lg text-white disabled:opacity-50"
            disabled={isRouting}
          >
            {isRouting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </section>

      {submissions.length > 0 && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#1FA2A6]" />
              <h4 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-sm">Recent Activity</h4>
            </div>
            <button onClick={() => onAction('HISTORY')} className="text-xs font-bold text-[#1FA2A6] hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {submissions.slice(0, 3).map(s => (
              <div key={s.id} onClick={() => onAction('HISTORY')} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="font-semibold text-[#1E3A5F] dark:text-slate-200 text-sm">{s.subject}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(s.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1FA2A6] text-sm">{s.score}%</span>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Upload, Sparkles, TrendingUp, Clock, Search, Send, Loader2, Command } from 'lucide-react';
import { Submission, UserProfile } from '../../types.ts';
import { BackendService } from '../../services/BackendService.ts';

interface DashboardProps {
  onAction: (view: 'UPLOAD' | 'PRACTICE' | 'HISTORY') => void;
  onCommand: (intent: string, subject?: string, topic?: string) => void;
  submissions: Submission[];
  profile: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAction, onCommand, submissions, profile }) => {
  const [command, setCommand] = useState('');
  const [isRouting, setIsRouting] = useState(false);

  const avgScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
    : 0;

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setIsRouting(true);
    try {
      // Logic: Trigger backend service for intent parsing
      const result = await BackendService.routeIntent(command);
      setCommand('');
      onCommand(result.intent, result.subject, result.topic);
    } catch (e) {
      console.error("Dashboard Intelligence Routing Error:", e);
      alert("Command was not understood. Try: 'Analyze my work' or 'Practice Math'.");
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#1E3A5F] p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden border-b-8 border-[#1FA2A6]">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-2">
            <Command size={16} className="text-[#1FA2A6]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1FA2A6]">Eduvane Intel-Link</span>
          </div>
          
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Welcome, {profile?.email.split('@')[0]}</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg mt-2 font-medium italic">Command the core. Practice, analyze, or track progress in seconds.</p>
          </div>
          
          <form onSubmit={handleCommandSubmit} className="relative group">
            <input 
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., 'Generate 10 Physics items' or 'Analyze work'..."
              className="w-full bg-white text-[#1E3A5F] border-4 border-transparent rounded-2xl py-6 px-8 pr-20 outline-none focus:border-[#1FA2A6] transition-all placeholder:text-slate-400 font-bold shadow-2xl text-lg"
              disabled={isRouting}
            />
            <button 
              type="submit"
              disabled={isRouting}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 md:p-5 bg-[#1E3A5F] rounded-xl text-[#1FA2A6] shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isRouting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          </form>
          
          <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-[#1FA2A6]" /> Semantic Routing</span>
            <span className="flex items-center gap-1.5"><Search size={12} className="text-[#1FA2A6]" /> Pattern Inference</span>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none rotate-12">
          <Sparkles size={400} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:border-[#1FA2A6]/30 transition-all group">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-[#1FA2A6]" />
            <h3 className="font-black text-[#1E3A5F] text-xs uppercase tracking-widest">Mastery Index</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-6xl font-black text-[#1E3A5F] group-hover:text-[#1FA2A6] transition-colors">{avgScore}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Aggregated Growth</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#1E3A5F]">{submissions.length}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Intelligence Signals</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:border-[#1FA2A6]/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-[#1E3A5F]" />
            <h3 className="font-black text-[#1E3A5F] text-xs uppercase tracking-widest">Recent Signals</h3>
          </div>
          <div className="space-y-4">
            {submissions.slice(0, 3).map(s => (
              <div key={s.id} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-all border border-transparent hover:border-slate-100">
                <div>
                  <h4 className="font-bold text-[#1E3A5F] text-sm group-hover:text-[#1FA2A6] transition-colors">{s.subject}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-tighter">{new Date(s.timestamp).toLocaleDateString()}</p>
                </div>
                <span className={`font-black text-xl ${s.score >= 80 ? 'text-[#1FA2A6]' : 'text-amber-500'}`}>{s.score}%</span>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 italic mb-4">No academic data indexed yet.</p>
                <button 
                  onClick={() => onAction('UPLOAD')} 
                  className="bg-[#1FA2A6] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full hover:bg-[#198d91] transition-all shadow-md"
                >
                  Analyze First Work
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

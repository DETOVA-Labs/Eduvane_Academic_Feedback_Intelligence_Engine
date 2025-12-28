
import React from 'react';
import { Upload, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Submission } from '../../types.ts';

interface DashboardProps {
  onAction: (view: 'UPLOAD' | 'PRACTICE' | 'HISTORY') => void;
  submissions: Submission[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onAction, submissions }) => {
  const avgScore = submissions.length > 0 
    ? Math.round(submissions.reduce((a, b) => a + b.score, 0) / submissions.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">What would you like to do today?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => onAction('UPLOAD')}
            className="flex items-center gap-6 p-6 rounded-2xl bg-[#F7F9FC] border border-transparent hover:border-[#1FA2A6] transition-all text-left"
          >
            <div className="bg-[#1FA2A6] text-white p-4 rounded-xl">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#1E3A5F]">Analyze Answer</h3>
              <p className="text-sm text-slate-500">Upload a photo for instant scoring.</p>
            </div>
          </button>

          <button 
            onClick={() => onAction('PRACTICE')}
            className="flex items-center gap-6 p-6 rounded-2xl bg-[#F7F9FC] border border-transparent hover:border-[#1FA2A6] transition-all text-left"
          >
            <div className="bg-[#1E3A5F] text-white p-4 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#1E3A5F]">Practice Engine</h3>
              <p className="text-sm text-slate-500">Generate tests and exercises.</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#1FA2A6]" />
            <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wider">Progress Snapshot</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-black text-[#1FA2A6]">{avgScore}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Average Mastery</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#1E3A5F]">{submissions.length}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Signals</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[#1E3A5F]" />
            <h3 className="font-bold text-[#1E3A5F] text-sm uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {submissions.slice(0, 3).map(s => (
              <div key={s.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-600 font-medium">{s.subject}</span>
                <span className={`font-bold ${s.score >= 80 ? 'text-[#1FA2A6]' : 'text-amber-500'}`}>{s.score}%</span>
              </div>
            ))}
            {submissions.length === 0 && <p className="text-xs text-slate-400 italic">No activity yet. Start by uploading an answer!</p>}
          </div>
        </section>
      </div>
    </div>
  );
};


import React from 'react';
import { ArrowLeft, Clock, BarChart3, ChevronRight, FileText, Zap } from 'lucide-react';
import { Submission, PracticeSet } from '../../types.ts';

interface HistoryViewProps {
  submissions: Submission[];
  practiceSets: PracticeSet[];
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ submissions, practiceSets, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1E3A5F]">Learning History</h2>
          <p className="text-slate-500">Your journey from work to intelligence.</p>
        </div>
        <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#1E3A5F] flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#1FA2A6]" />
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-widest">Recent Submissions</h3>
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-100 text-center text-slate-300 italic">
                No work analyzed yet.
              </div>
            ) : (
              submissions.map(s => (
                <div key={s.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-[#1FA2A6]/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-[#1FA2A6]/5 group-hover:text-[#1FA2A6] transition-all">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E3A5F]">{s.subject}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{new Date(s.timestamp).toLocaleDateString()} • {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className={`text-xl font-black ${s.score >= 80 ? 'text-[#1FA2A6]' : 'text-amber-500'}`}>
                        {s.score}%
                      </span>
                      <p className="text-[8px] font-bold text-slate-300 uppercase leading-none">Mastery</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-8">
          <div className="bg-[#1E3A5F] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <BarChart3 className="text-[#1FA2A6] mb-4" size={32} />
              <h3 className="text-xl font-bold mb-1">Growth Index</h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">Tracking your conceptual evolution.</p>
              
              <div className="flex items-end gap-1 h-20 mb-4">
                {submissions.slice(-7).map((s, i) => (
                  <div key={i} className="flex-1 bg-[#1FA2A6]/20 rounded-t-sm relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-[#1FA2A6] rounded-t-sm transition-all duration-1000"
                      style={{ height: `${s.score}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold bg-white text-[#1E3A5F] px-1 rounded transition-opacity">
                      {s.score}%
                    </div>
                  </div>
                ))}
                {submissions.length < 7 && Array(7 - submissions.length).fill(0).map((_, i) => (
                   <div key={`empty-${i}`} className="flex-1 bg-white/5 rounded-t-sm h-4" />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Last 7 Submissions</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap size={120} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Practice Archives</h3>
            {practiceSets.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-1">No practice sets saved.</p>
            ) : (
              practiceSets.map(set => (
                <div key={set.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all cursor-pointer">
                  <h5 className="text-xs font-bold text-[#1E3A5F]">{set.topic}</h5>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-bold text-[#1FA2A6] uppercase">{set.difficulty}</span>
                    <span className="text-[9px] text-slate-400">{set.questions.length} Questions</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

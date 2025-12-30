
import React from 'react';
import { ArrowLeft, Clock, BarChart3, ChevronRight, FileText } from 'lucide-react';
import { Submission, PracticeSet } from '../../types.ts';

interface HistoryViewProps {
  submissions: Submission[];
  practiceSets: PracticeSet[];
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ submissions, practiceSets, onBack }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6 px-2 transition-colors">
        <div>
          <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100">Timeline</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Record of signals and sessions.</p>
        </div>
        <button onClick={onBack} className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-[#1E3A5F] dark:hover:text-slate-100 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Hub
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Clock size={16} className="text-[#1FA2A6]" />
            <h3 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-300 dark:text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors">
                No signals captured yet.
              </div>
            ) : (
              submissions.map(s => (
                <div key={s.id} className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-[#1FA2A6] dark:hover:border-[#1FA2A6] transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-[#1FA2A6] group-hover:bg-[#1FA2A6] group-hover:text-white transition-all">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-sm md:text-base transition-colors">{s.subject}</h4>
                      <p className="text-[9px] text-slate-300 dark:text-slate-500 font-bold uppercase tracking-widest">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="text-right">
                      <span className="text-lg md:text-xl font-black text-[#1FA2A6]">
                        {s.score}%
                      </span>
                      <p className="text-[7px] font-black text-slate-200 dark:text-slate-700 uppercase leading-none tracking-widest transition-colors">Index</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <BarChart3 className="text-[#1FA2A6] mb-4" size={24} />
              <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-1 transition-colors">Growth Trend</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-widest">Conceptual Evolution</p>
              
              <div className="flex items-end gap-1.5 h-16 mb-4">
                {submissions.slice(-7).map((s, i) => (
                  <div key={i} className="flex-1 bg-[#1FA2A6]/10 dark:bg-[#1FA2A6]/20 rounded-t-sm relative group h-full">
                    <div 
                      className="absolute bottom-0 w-full bg-[#1FA2A6] rounded-t-sm transition-all duration-700"
                      style={{ height: `${s.score}%` }}
                    />
                  </div>
                ))}
                {submissions.length < 7 && Array(7 - submissions.length).fill(0).map((_, i) => (
                   <div key={`empty-${i}`} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-t-sm h-4" />
                ))}
              </div>
              <p className="text-[8px] text-slate-300 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-center">Snapshot: Last 7 signals</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest px-2">Practice Archives</h3>
            {practiceSets.length === 0 ? (
              <p className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest px-2 transition-colors">No archived sets.</p>
            ) : (
              practiceSets.map(set => (
                <div key={set.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer">
                  <h5 className="text-xs font-bold text-[#1E3A5F] dark:text-slate-100 uppercase tracking-tight transition-colors">{set.topic}</h5>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[8px] font-bold text-[#1FA2A6] uppercase tracking-widest">{set.difficulty}</span>
                    <span className="text-[8px] text-slate-300 dark:text-slate-500 font-bold uppercase tracking-widest">{set.questions.length} Items</span>
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

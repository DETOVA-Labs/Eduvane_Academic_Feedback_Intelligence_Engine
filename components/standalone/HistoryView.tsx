
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
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-8 px-2">
        <div>
          <h2 className="text-4xl font-bold text-[#1E3A5F] dark:text-slate-100">Your Activity</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium mt-1">Review past uploads and feedback.</p>
        </div>
        <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-[#1E3A5F] transition-colors flex items-center gap-2 uppercase tracking-widest">
          <ArrowLeft size={16} /> Hub
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-2 px-2">
            <Clock size={16} className="text-[#1FA2A6]" />
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Recent history</h3>
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm font-bold flex flex-col items-center gap-4">
                <FileText size={32} className="opacity-20" />
                <p>You haven't reviewed any work yet.<br/><span className="text-xs opacity-60">Upload an assignment to begin.</span></p>
              </div>
            ) : (
              submissions.map(s => (
                <div key={s.id} className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-[#1FA2A6] transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl text-slate-400 group-hover:text-[#1FA2A6] transition-all">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E3A5F] dark:text-slate-100 text-lg">{s.subject}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                        {new Date(s.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#1FA2A6]">
                        {s.score}%
                      </span>
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
            <BarChart3 className="text-[#1FA2A6] mb-4" size={24} />
            <h3 className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-1">Growth trend</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">Mastery progress</p>
            
            <div className="flex items-end gap-2 h-20 mb-6">
              {submissions.slice(-7).map((s, i) => (
                <div key={i} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-full relative group h-full">
                  <div 
                    className="absolute bottom-0 w-full bg-[#1FA2A6] rounded-full transition-all duration-1000"
                    style={{ height: `${s.score}%` }}
                  />
                </div>
              ))}
              {submissions.length < 7 && Array(7 - submissions.length).fill(0).map((_, i) => (
                 <div key={`empty-${i}`} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-full h-4" />
              ))}
            </div>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest text-center">Last 7 snapshots</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest px-2">Archived practice</h3>
            {practiceSets.length === 0 ? (
              <p className="text-xs text-slate-300 font-bold uppercase tracking-widest px-2 italic">No archived sets.</p>
            ) : (
              practiceSets.map(set => (
                <div key={set.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer">
                  <h5 className="text-sm font-bold text-[#1E3A5F] dark:text-slate-100 uppercase tracking-wide">{set.topic}</h5>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[9px] font-bold text-[#1FA2A6] uppercase tracking-[0.2em] bg-[#1FA2A6]/5 px-2 py-0.5 rounded-full">{set.difficulty}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{set.questions.length} Items</span>
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

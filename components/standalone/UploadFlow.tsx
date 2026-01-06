
import React, { useState } from 'react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { Submission } from '../../types.ts';
import { Loader2, ArrowLeft, Camera, Upload, BookOpen, CheckCircle2 } from 'lucide-react';

interface UploadFlowProps {
  userId: string;
  onComplete: (sub: Submission) => void;
  onBack: () => void;
}

export const UploadFlow: React.FC<UploadFlowProps> = ({ userId, onComplete, onBack }) => {
  const [state, setState] = useState<'IDLE' | 'PROCESSING' | 'RESULT'>('IDLE');
  const [result, setResult] = useState<Submission | null>(null);
  const [progressMsg, setProgressMsg] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mimeType = file.type || "image/jpeg";
    setState('PROCESSING');
    setProgressMsg('Analyzing answers...');
    
    const reader = new FileReader();
    reader.onload = async () => {
      const fullData = reader.result as string;
      const base64 = fullData.split(',')[1];
      
      try {
        const publicUrl = await SupabaseService.storage.upload(userId, base64);
        
        const analysis = await AIOrchestrator.evaluateWorkFlow(base64, mimeType, (msg) => {
          if (msg.includes("Local")) setProgressMsg("Reading the work...");
          else if (msg.includes("Synthesizing")) setProgressMsg("Identifying areas for improvement...");
          else setProgressMsg(msg);
        });
        
        const submission: Submission = {
          ...analysis,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          imageUrl: publicUrl
        };
        
        await SupabaseService.submissions.save(userId, submission);
        setResult(submission);
        onComplete(submission);
        setState('RESULT');
      } catch (err) {
        console.error("Evaluation Error:", err);
        setState('IDLE');
        alert("We couldn't process this file. Please try a clearer photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 max-w-sm mx-auto">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={48} strokeWidth={2.5} />
        <div>
          <h3 className="text-2xl font-bold text-[#1E3A5F] dark:text-slate-100 transition-all">Reviewing your work...</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
            {progressMsg || "This may take a moment. Eduvane is carefully analyzing the answers."}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'RESULT' && result) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-12">
        <header className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 font-bold text-xs hover:text-[#1E3A5F] transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Hub
          </button>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-[#1FA2A6]/5 w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 border-[#1FA2A6]/10 shrink-0">
              <span className="text-4xl font-black text-[#1FA2A6]">{result.score || 0}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
            </div>
            <div className="space-y-4 flex-grow">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#1FA2A6]" />
                <h4 className="text-xs font-bold text-[#1FA2A6] uppercase tracking-widest">Feedback & guidance</h4>
              </div>
              <p className="text-[#1E3A5F] dark:text-slate-200 text-lg leading-relaxed font-serif italic">
                {result.feedback}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-[#1E3A5F] dark:bg-slate-800 p-8 rounded-3xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 size={18} className="text-[#1FA2A6]" />
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/70">Suggested next steps</h4>
            </div>
            <ul className="space-y-4">
              {result.improvementSteps.map((step, i) => (
                <li key={i} className="flex gap-4 text-base text-white/90 font-medium">
                  <span className="font-black text-[#1FA2A6] shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={onBack} 
            className="w-full bg-[#1FA2A6] text-white py-5 rounded-2xl font-bold text-base hover:bg-[#188b8e] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Save and return to dashboard
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-[#1E3A5F] dark:text-slate-100">Upload student work</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">
          Upload a photo or PDF of completed work. Eduvane will automatically review and respond.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <label className="flex flex-col items-center justify-center w-full min-h-[320px] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-[#1FA2A6]/50 transition-all group p-10">
          <div className="bg-[#1FA2A6]/5 p-6 rounded-2xl mb-6 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Upload size={40} />
          </div>
          <p className="text-xl font-bold text-[#1E3A5F] dark:text-slate-100 mb-2">
            Upload photo or PDF
          </p>
          <p className="text-sm text-slate-400 font-medium">
            Handwritten or typed work is supported.
          </p>
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
        </label>
      </div>
      
      <button onClick={onBack} className="w-full text-sm font-bold text-slate-400 hover:text-[#1E3A5F] transition-colors">
        Cancel and go back
      </button>
    </div>
  );
};

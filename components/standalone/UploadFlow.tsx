
import React, { useState } from 'react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { Submission } from '../../types.ts';
import { Loader2, ArrowLeft, Lightbulb, Camera, Upload, CheckCircle } from 'lucide-react';

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
    setProgressMsg('Uploading file...');
    
    const reader = new FileReader();
    reader.onload = async () => {
      const fullData = reader.result as string;
      const base64 = fullData.split(',')[1];
      
      try {
        const publicUrl = await SupabaseService.storage.upload(userId, base64);
        setProgressMsg('Analyzing your work...');
        const analysis = await AIOrchestrator.evaluateWorkFlow(base64, mimeType);
        
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
        alert("Evaluation failed. Please try a clearer photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={48} strokeWidth={2} />
        <div>
          <h3 className="text-xl font-bold text-[#1E3A5F] dark:text-slate-100">Processing</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{progressMsg}</p>
        </div>
      </div>
    );
  }

  if (state === 'RESULT' && result) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <header className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs hover:text-[#1E3A5F] dark:hover:text-slate-100">
            <ArrowLeft size={16} /> Hub
          </button>
          <div className="bg-[#1FA2A6]/10 dark:bg-[#1FA2A6]/20 text-[#1FA2A6] px-3 py-1 rounded-full text-xs font-bold">
            {result.subject}
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center md:text-left shadow-sm transition-colors">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-slate-50 dark:bg-slate-800 w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-slate-100 dark:border-slate-700 shrink-0">
              <span className="text-3xl font-bold text-[#1FA2A6] leading-none">{result.score}%</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">Score</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Feedback</h4>
              <p className="text-base text-[#1E3A5F] dark:text-slate-200 leading-relaxed font-medium">
                {result.feedback}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-[#1E3A5F] dark:bg-slate-800 p-6 rounded-2xl text-white shadow-md transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-[#1FA2A6]" />
              <h4 className="font-bold text-sm">Steps to improve</h4>
            </div>
            <ul className="space-y-4">
              {result.improvementSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/90">
                  <span className="font-bold text-[#1FA2A6] shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => setState('IDLE')} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-4 rounded-xl font-bold text-[#1E3A5F] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Camera size={18} /> Upload new work
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100">Upload your work</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Get your score and clear feedback instantly.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
        <h3 className="text-sm font-bold text-[#1E3A5F] dark:text-slate-200 mb-6 transition-colors">Add your answer</h3>
        
        <label className="flex flex-col items-center justify-center w-full min-h-[250px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-[#1FA2A6] transition-all group p-6">
          <div className="bg-[#1FA2A6]/5 dark:bg-[#1FA2A6]/20 p-5 rounded-full mb-4 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <p className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-1 transition-colors">
            Upload image or PDF
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Take a photo or upload a file from your device.
          </p>
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
        </label>
        
        <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 font-medium transition-colors">
          No subject selection needed. Eduvane will figure it out.
        </p>
      </div>
      
      <button onClick={onBack} className="w-full text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-[#1E3A5F] dark:hover:text-slate-100 transition-colors">
        Go back
      </button>
    </div>
  );
};


import React, { useState } from 'react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { Submission } from '../../types.ts';
import { Loader2, ArrowLeft, Camera, Upload, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

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
    setProgressMsg('Ingesting artifact...');
    
    const reader = new FileReader();
    reader.onload = async () => {
      const fullData = reader.result as string;
      const base64 = fullData.split(',')[1];
      
      try {
        const publicUrl = await SupabaseService.storage.upload(userId, base64);
        
        const analysis = await AIOrchestrator.evaluateWorkFlow(base64, mimeType, (msg) => {
          setProgressMsg(msg);
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
        alert("Processing failed. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 max-w-sm mx-auto">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={48} strokeWidth={2} />
        <div>
          <h3 className="text-xl font-bold text-[#1E3A5F] dark:text-slate-100">Processing Signal</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{progressMsg}</p>
        </div>
      </div>
    );
  }

  if (state === 'RESULT' && result) {
    const isLocal = result.reasoningType === 'LOCAL';

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <header className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs hover:text-[#1E3A5F] transition-colors uppercase tracking-wider">
            <ArrowLeft size={16} /> Hub
          </button>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isLocal ? 'bg-slate-100 text-slate-500' : 'bg-[#1FA2A6]/10 text-[#1FA2A6]'}`}>
            {isLocal ? 'Local Perception' : 'AI Reasoning'}
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {result.score !== null ? (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-[#1FA2A6]/5 w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-[#1FA2A6]/10 shrink-0">
                <span className="text-3xl font-bold text-[#1FA2A6]">{result.score}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Grade</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1FA2A6] uppercase">Pedagogical Feedback</h4>
                <p className="text-[#1E3A5F] dark:text-slate-200 leading-relaxed font-medium">
                  {result.feedback}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldAlert size={20} />
                <h4 className="font-bold text-sm uppercase">Perception Signal Summary</h4>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed italic">
                "No reasoning key detected. Local perception successfully extracted text from artifact, but authoritative grading is disabled to ensure academic integrity."
              </p>
              {result.rawText && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-400 overflow-hidden line-clamp-4">
                  {result.rawText}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="bg-[#1E3A5F] dark:bg-slate-800 p-6 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-[#1FA2A6]" />
              <h4 className="font-bold text-sm">Suggested Steps</h4>
            </div>
            <ul className="space-y-3">
              {result.improvementSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/80">
                  <span className="font-bold text-[#1FA2A6] shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => setState('IDLE')} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-4 rounded-xl font-bold text-[#1E3A5F] dark:text-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Camera size={18} /> Capture New Artifact
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100">Upload Signal</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Submit your artifact for local perception and reasoning.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <label className="flex flex-col items-center justify-center w-full min-h-[280px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-[#1FA2A6] transition-all group p-6">
          <div className="bg-[#1FA2A6]/5 p-5 rounded-full mb-4 text-[#1FA2A6] group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <p className="text-lg font-bold text-[#1E3A5F] dark:text-slate-100 mb-1">
            Upload Artifact
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            OCR performs locally on your device.
          </p>
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
        </label>
      </div>
      
      <button onClick={onBack} className="w-full text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-[#1E3A5F] transition-colors">
        Cancel and return to Hub
      </button>
    </div>
  );
};

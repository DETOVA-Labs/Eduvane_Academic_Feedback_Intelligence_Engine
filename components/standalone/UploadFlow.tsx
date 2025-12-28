
import React, { useState } from 'react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { Submission } from '../../types.ts';
import { Upload, Loader2, CheckCircle, ArrowLeft, Lightbulb } from 'lucide-react';

interface UploadFlowProps {
  onComplete: (sub: Submission) => void;
  onBack: () => void;
}

export const UploadFlow: React.FC<UploadFlowProps> = ({ onComplete, onBack }) => {
  const [state, setState] = useState<'IDLE' | 'PROCESSING' | 'RESULT'>('IDLE');
  const [subject, setSubject] = useState('Math');
  const [result, setResult] = useState<Submission | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState('PROCESSING');
    
    // Convert to base64 for Gemini
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await AIOrchestrator.analyzeWork(base64, { subject });
        const submission: Submission = {
          ...analysis,
          id: `SUB-${Date.now()}`,
          timestamp: new Date().toISOString(),
          imageUrl: reader.result as string
        };
        setResult(submission);
        onComplete(submission);
        setState('RESULT');
      } catch (err) {
        console.error(err);
        setState('IDLE');
        alert("Could not process image. Please try a clearer photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  if (state === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={64} />
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#1E3A5F]">Analyzing Your Work...</h3>
          <p className="text-slate-400 animate-pulse mt-2">Reading handwriting, understanding concepts, and finding gems.</p>
        </div>
      </div>
    );
  }

  if (state === 'RESULT' && result) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-[#1E3A5F]">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="bg-[#1FA2A6]/10 text-[#1FA2A6] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Intelligence Captured
          </span>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-2xl border-b-8 border-[#1FA2A6]">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - result.score / 100)} className="text-[#1FA2A6] transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1E3A5F]">{result.score}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Score</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-4">
              <h2 className="text-3xl font-bold text-[#1E3A5F]">Here's how you did!</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium insight-narrative">
                "{result.feedback}"
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-[#1FA2A6]">
              <Lightbulb size={20} />
              <h4 className="font-bold text-[#1E3A5F] uppercase text-xs tracking-widest">Growth Pathway</h4>
            </div>
            <ul className="space-y-3">
              {result.improvementSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="font-black text-[#1FA2A6]">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#1E3A5F] p-8 rounded-2xl text-white flex flex-col justify-center items-center text-center">
            <CheckCircle size={48} className="text-[#1FA2A6] mb-4" />
            <h4 className="text-xl font-bold mb-2">Saved to History</h4>
            <p className="text-slate-400 text-xs mb-6">Your progress has been updated.</p>
            <button onClick={() => setState('IDLE')} className="w-full py-3 bg-[#1FA2A6] rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#198d91] transition-all">
              Analyze Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1E3A5F]">Analyze Your Work</h2>
        <p className="text-slate-500 mt-2">Get instant scores and encouraging feedback from your handwritten answers.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setSubject('Math')} 
            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${subject === 'Math' ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'text-slate-400 border-slate-100 hover:border-slate-300'}`}
          >Math</button>
          <button 
            onClick={() => setSubject('Science')} 
            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${subject === 'Science' ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'text-slate-400 border-slate-100 hover:border-slate-300'}`}
          >Science</button>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400 group-hover:text-[#1FA2A6] group-hover:bg-[#1FA2A6]/10 transition-all mb-4">
              <Upload size={32} />
            </div>
            <p className="mb-2 text-sm text-slate-500 font-bold uppercase tracking-widest">Click to upload photo or PDF</p>
            <p className="text-xs text-slate-400">Handwritten work works best!</p>
          </div>
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { ShieldCheck, User, Zap, MessageSquare, Send, Check, X } from 'lucide-react';

interface DiagnosticCardProps {
  data: {
    id: string;
    student: string;
    confidence: number;
    status: string;
    insight: string;
    clarityNote: string;
    priority: string;
  };
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({ data }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isPriority = data.priority === 'high' || data.priority === 'amber';

  // Placeholder for submission logic as requested
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    
    try {
      console.log(`[EDUVANE_API] Submitting feedback for ${data.id}:`, feedback);
      
      // Simulate network latency (per production simulation standards)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setFeedback('');
      
      // Clear success state and hide the expanded section after a delay
      setTimeout(() => {
        setIsSuccess(false);
        setIsFeedbackOpen(false);
      }, 2500);
      
    } catch (error) {
      console.error("Diagnostic Feedback Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg border-l-4 shadow-sm p-5 transition-all hover:shadow-md ${isPriority ? 'border-[#F2A900]' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-full">
            <User size={16} className="text-slate-600" />
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F]">{data.student}</h4>
            <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{data.id}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-bold ${data.confidence >= 0.85 ? 'text-[#1FA2A6]' : 'text-[#F2A900]'}`}>
            {(data.confidence * 100).toFixed(0)}% Confidence
          </div>
          <div className="text-[9px] text-slate-400 uppercase font-semibold">Intelligence Score</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-[#F7F9FC] p-3 rounded-md border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={12} className="text-[#1FA2A6]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E3A5F]">Conceptual Diagnosis</span>
          </div>
          <p className="text-sm insight-narrative text-[#2B2E34] leading-relaxed">
            "{data.insight}"
          </p>
        </div>

        <div className="p-3 bg-white rounded-md border border-slate-100">
          <div className="flex items-center gap-2 mb-1 text-slate-400">
            <ShieldCheck size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Handwriting Clarity</span>
          </div>
          <p className="text-[13px] text-slate-600 italic">
            {data.clarityNote}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          {data.status === 'insight-review' ? (
            <>
              <button className="flex-1 bg-[#1E3A5F] text-white text-xs font-bold py-2 rounded hover:bg-[#2a4e7a] transition-colors uppercase tracking-wider">
                VALIDATE
              </button>
              <button className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded hover:bg-slate-50 transition-colors uppercase tracking-wider">
                ADJUST
              </button>
            </>
          ) : (
            <div className="flex-1 text-[10px] text-slate-400 italic flex items-center gap-1">
              <ShieldCheck size={10} /> Auto-Validated per Section VIII.C
            </div>
          )}
          
          <button 
            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
            className={`px-3 py-2 rounded border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isFeedbackOpen ? 'bg-slate-100 border-slate-300 text-slate-700' : 'border-[#1FA2A6]/30 text-[#1FA2A6] hover:bg-[#1FA2A6]/5'}`}
            title="Student Input"
          >
            {isFeedbackOpen ? <X size={14} /> : <MessageSquare size={14} />}
            <span>Student Input</span>
          </button>
        </div>

        {/* Feedback Form Expansion */}
        {isFeedbackOpen && (
          <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
            {isSuccess ? (
              <div className="p-4 bg-[#1FA2A6]/10 rounded-lg border border-[#1FA2A6]/20 flex items-center justify-center text-[#1FA2A6] gap-3 animate-in zoom-in-95 duration-500">
                <Check size={20} className="bg-[#1FA2A6] text-white rounded-full p-0.5" />
                <span className="text-sm font-bold uppercase tracking-tight">Feedback Captured Successfully</span>
              </div>
            ) : (
              <form 
                onSubmit={handleFeedbackSubmit}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Qualitative Student Feedback
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Internal Review Only</span>
                </div>
                
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us more about your thought process... (e.g. 'I didn't notice the negative sign' or 'I need more help with long division')"
                  className="w-full h-24 p-3 text-sm border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-[#1FA2A6]/20 focus:border-[#1FA2A6] bg-white resize-none shadow-sm placeholder:text-slate-300 transition-all"
                  required
                  disabled={isSubmitting}
                />
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !feedback.trim()}
                    className="bg-[#1FA2A6] text-white text-[10px] font-bold py-2 px-6 rounded shadow-sm flex items-center gap-2 hover:bg-[#198d91] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        SUBMITTING...
                      </span>
                    ) : (
                      <>
                        SUBMIT FEEDBACK
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

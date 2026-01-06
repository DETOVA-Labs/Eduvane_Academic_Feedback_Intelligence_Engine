
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, Send, Search } from 'lucide-react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { Question, PracticeSet } from '../../types.ts';

interface PracticeFlowProps {
  initialSubject?: string;
  onSave: (set: PracticeSet) => void;
  onBack: () => void;
}

export const PracticeFlow: React.FC<PracticeFlowProps> = ({ initialSubject = '', onSave, onBack }) => {
  const [state, setState] = useState<'SETUP' | 'GENERATING' | 'REVIEW' | 'SAVED'>('SETUP');
  const [prompt, setPrompt] = useState(initialSubject ? `Generate questions for ${initialSubject}` : '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [metadata, setMetadata] = useState<{ subject: string; topic: string }>({ subject: '', topic: '' });
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setState('GENERATING');
    setError(null);
    try {
      const generated = await AIOrchestrator.generatePracticeFlow(prompt);
      const interpretation = await AIOrchestrator.interpretation.parseIntent(prompt);
      
      if (!Array.isArray(generated) || generated.length === 0) {
        throw new Error("EMPTY_GENERATION");
      }

      setMetadata({ subject: interpretation.subject, topic: interpretation.topic || interpretation.subject });
      setQuestions(generated);
      setState('REVIEW');
    } catch (err) {
      console.error("Practice Generation Error:", err);
      setState('SETUP');
      setError("Unable to generate questions. Try a simpler prompt like '10 math problems'.");
    }
  };

  const handleSave = () => {
    const newSet: PracticeSet = {
      id: `SET-${Date.now()}`,
      subject: metadata.subject,
      topic: metadata.topic,
      difficulty: 'Dynamic',
      questions: questions,
      timestamp: new Date().toISOString()
    };
    onSave(newSet);
    setState('SAVED');
    onBack();
  };

  if (state === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={48} strokeWidth={2.5} />
        <div>
          <h3 className="text-2xl font-bold text-[#1E3A5F] dark:text-slate-100">Generating questions...</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Creating your study material at your own pace.</p>
        </div>
      </div>
    );
  }

  if (state === 'REVIEW') {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-16">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] dark:text-slate-100">{metadata.topic}</h2>
            <p className="text-xs font-bold text-[#1FA2A6] uppercase tracking-widest">{metadata.subject}</p>
          </div>
          <button onClick={() => setState('SETUP')} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest">Discard</button>
        </header>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Practice Questions</h3>
          {questions.map((q, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex gap-4">
              <span className="font-black text-[#1FA2A6] text-lg leading-tight">{idx + 1}.</span>
              <p className="text-[#1E3A5F] dark:text-slate-200 font-medium leading-relaxed">{q.text}</p>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave} 
            className="w-full bg-[#1FA2A6] text-white py-5 rounded-2xl font-bold text-base shadow-lg hover:bg-[#188b8e] transition-all"
          >
            Save and return to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-[#1E3A5F] dark:text-slate-100">Generate practice questions</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">Create focused questions for any subject or topic to sharpen your skills.</p>
        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}
      </header>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleExecute} className="space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">What are you studying?</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. '10 algebra questions on linear equations'..."
                className="w-full bg-slate-50 dark:bg-slate-950 text-[#1E3A5F] dark:text-slate-200 rounded-2xl py-5 px-14 outline-none focus:ring-4 focus:ring-[#1FA2A6]/10 transition-all font-medium border-2 border-slate-100 dark:border-slate-800 placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#1E3A5F] dark:bg-slate-800 text-white py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:bg-[#152a46] dark:hover:bg-slate-700 transition-all"
          >
            Generate questions <Send size={20} className="text-[#1FA2A6]" />
          </button>
        </form>
      </div>
      
      <button onClick={onBack} className="w-full text-sm font-bold text-slate-400 hover:text-[#1E3A5F] transition-colors">
        Cancel and return to Hub
      </button>
    </div>
  );
};

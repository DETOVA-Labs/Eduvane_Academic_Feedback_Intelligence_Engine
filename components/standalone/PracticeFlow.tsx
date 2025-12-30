
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, Send, Command } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={48} strokeWidth={2} />
        <div>
          <h3 className="text-xl font-bold text-[#1E3A5F] dark:text-slate-100">Generating questions</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Creating your study material...</p>
        </div>
      </div>
    );
  }

  if (state === 'REVIEW') {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-10">
        <header className="flex justify-between items-center px-2">
          <div>
            <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-slate-100">{metadata.topic}</h2>
            <p className="text-xs font-bold text-[#1FA2A6] uppercase">{metadata.subject}</p>
          </div>
          <button onClick={() => setState('SETUP')} className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-[#1E3A5F] dark:hover:text-slate-200">Discard</button>
        </header>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-2 uppercase">Question {idx + 1}</span>
              <p className="text-[#1E3A5F] dark:text-slate-200 font-medium">{q.text}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave} 
          className="w-full bg-[#1FA2A6] text-white py-4 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
        >
          Save this set
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-[#1E3A5F] dark:text-slate-100 transition-colors">Generate practice questions</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Create focused questions for any subject or topic.</p>
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-semibold border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <form onSubmit={handleExecute} className="space-y-6">
          <div className="relative">
            <Command className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. '10 questions on quadratic equations'"
              className="w-full bg-slate-50 dark:bg-slate-950 text-[#1E3A5F] dark:text-slate-200 rounded-xl py-4 px-11 outline-none focus:ring-2 focus:ring-[#1FA2A6] transition-all font-medium border border-slate-100 dark:border-slate-800 placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#1E3A5F] dark:bg-slate-800 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#152a46] dark:hover:bg-slate-700 transition-all"
          >
            Generate questions <Send size={16} className="text-[#1FA2A6]" />
          </button>
        </form>
      </div>
      
      <button onClick={onBack} className="w-full text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-[#1E3A5F] dark:hover:text-slate-100 transition-colors">
        Go back
      </button>
    </div>
  );
};

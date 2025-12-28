
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, Save, Plus, Trash2, CheckCircle } from 'lucide-react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { Question, PracticeSet } from '../../types.ts';

interface PracticeFlowProps {
  onSave: (set: PracticeSet) => void;
  onBack: () => void;
}

export const PracticeFlow: React.FC<PracticeFlowProps> = ({ onSave, onBack }) => {
  const [state, setState] = useState<'SETUP' | 'GENERATING' | 'REVIEW' | 'SAVED'>('SETUP');
  const [config, setConfig] = useState({
    subject: 'Math',
    topic: '',
    difficulty: 'Medium',
    count: 5
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    if (!config.topic) return;
    setState('GENERATING');
    try {
      const generated = await AIOrchestrator.generateQuestions({
        subject: config.subject,
        topic: config.topic,
        difficulty: config.difficulty,
        count: config.count
      });
      setQuestions(generated);
      setState('REVIEW');
    } catch (err) {
      console.error(err);
      setState('SETUP');
      alert("Failed to generate questions. Please try again.");
    }
  };

  const handleSave = () => {
    const newSet: PracticeSet = {
      id: `SET-${Date.now()}`,
      subject: config.subject,
      topic: config.topic,
      difficulty: config.difficulty,
      questions: questions,
      timestamp: new Date().toISOString()
    };
    onSave(newSet);
    setState('SAVED');
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  if (state === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Loader2 className="animate-spin text-[#1FA2A6]" size={64} />
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#1E3A5F]">Architecting Assessment...</h3>
          <p className="text-slate-400 animate-pulse mt-2">AI is aligning concepts and building your practice set.</p>
        </div>
      </div>
    );
  }

  if (state === 'SAVED') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-[#1FA2A6]/10 rounded-full flex items-center justify-center mx-auto text-[#1FA2A6]">
          <CheckCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#1E3A5F]">Assessment Saved!</h2>
          <p className="text-slate-500 mt-2">Your practice set is now available in your history.</p>
        </div>
        <div className="pt-6 flex gap-4">
          <button onClick={onBack} className="flex-1 py-3 bg-[#1E3A5F] text-white rounded-xl font-bold uppercase text-xs tracking-widest">Done</button>
          <button onClick={() => setState('SETUP')} className="flex-1 py-3 border border-slate-200 text-slate-400 rounded-xl font-bold uppercase text-xs tracking-widest">Create Another</button>
        </div>
      </div>
    );
  }

  if (state === 'REVIEW') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-center">
          <button onClick={() => setState('SETUP')} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-[#1E3A5F]">
            <ArrowLeft size={16} /> Reconfigure
          </button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-[#1E3A5F]">{config.topic}</h2>
            <p className="text-[10px] font-bold text-[#1FA2A6] uppercase tracking-widest">{config.difficulty} • {questions.length} Questions</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="group flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-[#1FA2A6]/30 transition-all">
              <span className="text-xs font-black text-slate-300 mt-1">{idx + 1}.</span>
              <textarea 
                value={q.text}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                className="flex-grow bg-transparent text-sm font-medium focus:outline-none resize-none h-16"
              />
              <button onClick={() => deleteQuestion(q.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => setQuestions([...questions, { id: Date.now().toString(), text: 'New Question...', type: 'GENERAL' }])}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-[#1FA2A6]/50 transition-all"
          >
            <Plus size={16} /> ADD QUESTION
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onBack} className="px-8 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Discard</button>
          <button onClick={handleSave} className="bg-[#1FA2A6] text-white px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-3">
            <Save size={16} /> Save to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1E3A5F]">Practice Engine</h2>
        <p className="text-slate-500 mt-2">Generate tailored assessments to strengthen your learning loop.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {['Math', 'Science'].map(s => (
                <button 
                  key={s}
                  onClick={() => setConfig({...config, subject: s})}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${config.subject === s ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'text-slate-400 border-slate-100 hover:border-slate-300'}`}
                >{s}</button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specific Topic</span>
            <input 
              type="text" 
              placeholder="e.g., Quadratic Equations, Cellular Respiration" 
              value={config.topic}
              onChange={(e) => setConfig({...config, topic: e.target.value})}
              className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA2A6]/20 transition-all"
            />
          </label>

          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Difficulty</span>
              <select 
                value={config.difficulty}
                onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none appearance-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity</span>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={config.count}
                onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none"
              />
            </label>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!config.topic}
          className="w-full py-4 bg-[#1FA2A6] text-white rounded-2xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          <Sparkles size={18} /> Generate Questions
        </button>
      </div>
    </div>
  );
};

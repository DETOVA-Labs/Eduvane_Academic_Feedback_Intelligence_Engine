
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Loader2, Save, Plus, Trash2, CheckCircle, Command, Send, HelpCircle, Settings2 } from 'lucide-react';
import { BackendService } from '../../services/BackendService.ts';
import { Question, PracticeSet } from '../../types.ts';

interface PracticeFlowProps {
  initialSubject?: string;
  initialTopic?: string;
  onSave: (set: PracticeSet) => void;
  onBack: () => void;
}

export const PracticeFlow: React.FC<PracticeFlowProps> = ({ initialSubject = '', initialTopic = '', onSave, onBack }) => {
  const [state, setState] = useState<'SETUP' | 'GENERATING' | 'REVIEW' | 'SAVED'>('SETUP');
  const [command, setCommand] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState({
    subject: initialSubject,
    topic: initialTopic,
    difficulty: 'Medium',
    count: 5
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (initialSubject || initialTopic) {
      setConfig(prev => ({ 
        ...prev, 
        subject: initialSubject || prev.subject, 
        topic: initialTopic || prev.topic 
      }));
    }
  }, [initialSubject, initialTopic]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    setIsRouting(true);
    try {
      // Trigger "Backend Endpoint"
      const result = await BackendService.routeIntent(command);
      
      const updatedConfig = {
        subject: result.subject || config.subject,
        topic: result.topic || config.topic,
        difficulty: (result.difficulty as any) || config.difficulty,
        count: result.count || config.count
      };
      
      setConfig(updatedConfig);
      setCommand('');

      if (updatedConfig.subject && updatedConfig.topic) {
         handleGenerateWithConfig(updatedConfig);
      } else {
        setShowAdvanced(true);
      }
    } catch (e) {
      console.error(e);
      alert("Intelligence bridge failed. Please try a simpler command.");
    } finally {
      setIsRouting(false);
    }
  };

  const handleGenerateWithConfig = async (customConfig: typeof config) => {
    setState('GENERATING');
    try {
      const generated = await BackendService.generateQuestions(customConfig);
      setQuestions(generated);
      setState('REVIEW');
    } catch (err) {
      console.error(err);
      setState('SETUP');
      alert("Failed to generate items. Please refine your topic.");
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
      <div className="flex flex-col items-center justify-center py-24 space-y-10 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <Loader2 className="animate-spin text-[#1FA2A6]" size={100} strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={40} color="#1FA2A6" className="animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-black text-[#1E3A5F] tracking-tight text-balance">Synthesizing Pedagogical Content</h3>
          <p className="text-slate-500 animate-pulse font-mono text-xs uppercase tracking-[0.3em]">
            Rigor Profile: {config.difficulty} • {config.subject}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'SAVED') {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-[#1FA2A6]/10 rounded-full flex items-center justify-center mx-auto text-[#1FA2A6] shadow-inner">
          <CheckCircle size={56} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-[#1E3A5F] tracking-tight">Intelligence Logged</h2>
          <p className="text-slate-500 mt-3 font-medium">Assessment criteria have been successfully indexed.</p>
        </div>
        <div className="pt-8 flex gap-4">
          <button onClick={onBack} className="flex-1 py-5 bg-[#1E3A5F] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg">View History</button>
          <button onClick={() => setState('SETUP')} className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">New Command</button>
        </div>
      </div>
    );
  }

  if (state === 'REVIEW') {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20">
        <div className="flex justify-between items-center">
          <button onClick={() => setState('SETUP')} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#1E3A5F] transition-colors">
            <ArrowLeft size={14} /> Redefine Context
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight">{config.topic}</h2>
            <p className="text-xs font-black text-[#1FA2A6] uppercase tracking-[0.2em]">{config.subject} • {config.difficulty} • {questions.length} Items</p>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="group flex items-start gap-8 p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:border-[#1FA2A6]/30 transition-all">
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-[#1FA2A6]">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-[8px] font-black text-slate-300 uppercase mt-2 tracking-widest">{q.type}</span>
              </div>
              <textarea 
                value={q.text}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                className="flex-grow bg-transparent text-lg font-medium text-[#1E3A5F] focus:outline-none resize-none h-24 leading-relaxed placeholder:text-slate-200"
              />
              <button onClick={() => deleteQuestion(q.id)} className="text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => setQuestions([...questions, { id: Date.now().toString(), text: 'New assessment item...', type: 'GENERAL' }])}
            className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white hover:border-[#1FA2A6]/30 transition-all hover:text-[#1FA2A6]"
          >
            <Plus size={20} /> Add Item Manually
          </button>
        </div>

        <div className="sticky bottom-8 flex justify-end gap-6">
          <button onClick={onBack} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors bg-white/80 backdrop-blur rounded-2xl border border-slate-100 shadow-sm">Discard</button>
          <button onClick={handleSave} className="bg-[#1FA2A6] text-white px-14 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-4 hover:bg-[#198d91] transition-all hover:-translate-y-1">
            <Save size={18} /> Finalize Intelligence Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 py-10 px-4 md:px-0">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#1FA2A6]/10 px-4 py-1 rounded-full text-[#1FA2A6] mb-4">
          <Sparkles size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Core Engine</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] tracking-tighter">Practice Flow</h2>
        <p className="text-slate-400 font-medium italic text-lg">Natural language setup. Advanced AI generation.</p>
      </div>

      <div className="bg-[#1E3A5F] p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(30,58,95,0.25)] border-b-8 border-[#1FA2A6] text-white space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Command size={18} className="text-[#1FA2A6]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1FA2A6]">Command Input</span>
          </div>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded-lg transition-all ${showAdvanced ? 'bg-[#1FA2A6] text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
          >
            <Settings2 size={18} />
          </button>
        </div>
        
        <form onSubmit={handleCommandSubmit} className="relative group">
          <input 
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., 'Generate 10 Math problems on Calculus'"
            className="w-full bg-white text-[#1E3A5F] border-[6px] border-transparent rounded-[1.5rem] md:rounded-[2rem] py-6 md:py-7 px-6 md:px-10 pr-20 outline-none focus:border-[#1FA2A6] transition-all placeholder:text-slate-300 font-black shadow-2xl text-lg md:text-xl"
            disabled={isRouting}
          />
          <button 
            type="submit"
            disabled={isRouting}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 md:p-5 bg-[#1E3A5F] rounded-2xl text-[#1FA2A6] shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isRouting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="flex items-center gap-3 text-white/40">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#1FA2A6] font-black text-xs">01</div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Parse<br/>Intent</span>
          </div>
          <div className="flex items-center gap-3 text-white/40">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#1FA2A6] font-black text-xs">02</div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Scope<br/>Context</span>
          </div>
          <div className="flex items-center gap-3 text-white/40">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#1FA2A6] font-black text-xs">03</div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Execute<br/>Build</span>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-10 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Academic Subject</span>
              <input 
                type="text" 
                placeholder="Physics, Literature..." 
                value={config.subject}
                onChange={(e) => setConfig({...config, subject: e.target.value})}
                className="w-full mt-2 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-base text-[#1E3A5F] font-black focus:outline-none focus:ring-4 focus:ring-[#1FA2A6]/10 transition-all"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Rigor Tier</span>
              <select 
                value={config.difficulty}
                onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                className="w-full mt-2 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-base text-[#1E3A5F] font-black focus:outline-none appearance-none cursor-pointer"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Topic Focus</span>
            <input 
              type="text" 
              placeholder="e.g. Plate Tectonics..." 
              value={config.topic}
              onChange={(e) => setConfig({...config, topic: e.target.value})}
              className="w-full mt-2 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-base text-[#1E3A5F] font-black focus:outline-none focus:ring-4 focus:ring-[#1FA2A6]/10 transition-all"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Item Volume ({config.count})</span>
            <div className="mt-4 flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <input 
                type="range" 
                min="1" 
                max="30" 
                value={config.count}
                onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                className="flex-grow h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1FA2A6]"
              />
              <span className="text-3xl font-black text-[#1FA2A6] min-w-[2ch]">{config.count}</span>
            </div>
          </label>

          <button 
            onClick={() => handleGenerateWithConfig(config)}
            disabled={!config.topic || !config.subject}
            className="w-full py-6 bg-[#1FA2A6] text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 disabled:opacity-30"
          >
            <Sparkles size={20} /> Manually Trigger Build
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 pb-12">
        <div className="flex items-center gap-2 text-slate-300">
          <HelpCircle size={14} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-center">Try: "Help generate a 10 physics questions on wave optics"</p>
        </div>
        <button onClick={onBack} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-[#1E3A5F] transition-colors py-4">Exit Engine</button>
      </div>
    </div>
  );
};

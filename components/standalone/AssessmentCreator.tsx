
import React, { useState } from 'react';
import { Sparkles, Save, Plus, Trash2 } from 'lucide-react';

export const AssessmentCreator: React.FC = () => {
  const [questions, setQuestions] = useState([
    { id: 1, text: "What is 3/4 + 1/2?", type: "MATH_FRACTION" }
  ]);

  const generateAI = () => {
    const newQ = { 
      id: Date.now(), 
      text: "[AI Draft] Calculate the area of a circle with a radius of 5cm.", 
      type: "GEOMETRY" 
    };
    setQuestions([...questions, newQ]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F]">Assessment Architect</h2>
            <p className="text-sm text-slate-400">Collaborate with AI to build rigorous assignments.</p>
          </div>
          <button 
            onClick={generateAI}
            className="bg-[#1E3A5F] text-[#1FA2A6] px-4 py-2 rounded-lg text-xs font-bold border border-[#1FA2A6]/30 flex items-center gap-2 hover:bg-[#1E3A5F]/90 transition-all"
          >
            <Sparkles size={14} /> AI ASSIST
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="group flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-transparent hover:border-[#1FA2A6]/30 transition-all">
              <span className="text-xs font-bold text-slate-300 mt-1">{idx + 1}.</span>
              <textarea 
                defaultValue={q.text}
                className="flex-grow bg-transparent text-sm font-medium focus:outline-none resize-none h-12"
              />
              <button className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          
          <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-[#1FA2A6]/50 transition-all">
            <Plus size={14} /> ADD QUESTION
          </button>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end gap-3">
          <button className="px-6 py-2 text-xs font-bold text-slate-400">CANCEL</button>
          <button className="px-6 py-2 text-xs font-bold bg-[#1FA2A6] text-white rounded-lg shadow-md flex items-center gap-2">
            <Save size={14} /> PUBLISH ASSESSMENT
          </button>
        </div>
      </div>
    </div>
  );
};

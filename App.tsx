
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/standalone/LandingPage.tsx';
import { Dashboard } from './components/standalone/Dashboard.tsx';
import { UploadFlow } from './components/standalone/UploadFlow.tsx';
import { PracticeFlow } from './components/standalone/PracticeFlow.tsx';
import { HistoryView } from './components/standalone/HistoryView.tsx';
import { VaneIcon } from './constants.tsx';
import { Submission, PracticeSet } from './types.ts';

const App: React.FC = () => {
  const [view, setView] = useState<'LANDING' | 'DASHBOARD' | 'UPLOAD' | 'PRACTICE' | 'HISTORY'>('LANDING');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);

  // Load persistence
  useEffect(() => {
    const savedSubmissions = localStorage.getItem('eduvane_submissions');
    const savedSets = localStorage.getItem('eduvane_practice');
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
    if (savedSets) setPracticeSets(JSON.parse(savedSets));
  }, []);

  const saveSubmission = (sub: Submission) => {
    const updated = [sub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('eduvane_submissions', JSON.stringify(updated));
  };

  const savePracticeSet = (set: PracticeSet) => {
    const updated = [set, ...practiceSets];
    setPracticeSets(updated);
    localStorage.setItem('eduvane_practice', JSON.stringify(updated));
  };

  if (view === 'LANDING') return <LandingPage onStart={() => setView('DASHBOARD')} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <header className="bg-[#1E3A5F] text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <VaneIcon color="#1FA2A6" size={32} />
            <h1 className="text-xl font-bold tracking-tight">EDUVANE</h1>
          </div>
          <nav className="flex gap-6">
            <button onClick={() => setView('UPLOAD')} className={`text-xs font-bold uppercase tracking-widest ${view === 'UPLOAD' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Upload</button>
            <button onClick={() => setView('PRACTICE')} className={`text-xs font-bold uppercase tracking-widest ${view === 'PRACTICE' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>Practice</button>
            <button onClick={() => setView('HISTORY')} className={`text-xs font-bold uppercase tracking-widest ${view === 'HISTORY' ? 'text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}>History</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 px-4">
        {view === 'DASHBOARD' && <Dashboard onAction={setView} submissions={submissions} />}
        {view === 'UPLOAD' && <UploadFlow onComplete={saveSubmission} onBack={() => setView('DASHBOARD')} />}
        {view === 'PRACTICE' && <PracticeFlow onSave={savePracticeSet} onBack={() => setView('DASHBOARD')} />}
        {view === 'HISTORY' && <HistoryView submissions={submissions} practiceSets={practiceSets} onBack={() => setView('DASHBOARD')} />}
      </main>

      <footer className="p-6 text-center text-[10px] text-slate-400 font-mono tracking-widest uppercase border-t border-slate-200 bg-white">
        Standalone MVP v1.0 | Eduvane Learning Intelligence
      </footer>
    </div>
  );
};

export default App;

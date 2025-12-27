
import React, { useState } from 'react';
import { InterventionMatrix } from './components/InterventionMatrix';
import { ComplianceDiagram } from './components/ComplianceDiagram';
import { AcademicEngineCode } from './components/AcademicEngineCode';
import { VaneIcon } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compliance' | 'backend'>('dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Per Sec III.C: #1E3A5F */}
      <header className="bg-[#1E3A5F] text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <VaneIcon color="#1FA2A6" size={32} />
            <h1 className="text-xl font-bold tracking-tight">EDUVANE <span className="font-light text-slate-300">| Intelligence Engine</span></h1>
          </div>
          <nav className="flex gap-6 text-sm font-semibold" role="tablist" aria-label="Module Navigation">
            <button 
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              aria-controls="dashboard-panel"
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`pb-1 transition-colors outline-none focus:ring-2 focus:ring-[#1FA2A6] rounded ${activeTab === 'dashboard' ? 'border-b-2 border-[#1FA2A6] text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}
            >
              Educator Dashboard
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'compliance'}
              aria-controls="compliance-panel"
              id="tab-compliance"
              onClick={() => setActiveTab('compliance')}
              className={`pb-1 transition-colors outline-none focus:ring-2 focus:ring-[#1FA2A6] rounded ${activeTab === 'compliance' ? 'border-b-2 border-[#1FA2A6] text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}
            >
              Compliance Workflow
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'backend'}
              aria-controls="backend-panel"
              id="tab-backend"
              onClick={() => setActiveTab('backend')}
              className={`pb-1 transition-colors outline-none focus:ring-2 focus:ring-[#1FA2A6] rounded ${activeTab === 'backend' ? 'border-b-2 border-[#1FA2A6] text-[#1FA2A6]' : 'text-slate-300 hover:text-white'}`}
            >
              Academic Engine (FastAPI)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content - Per Sec III.C: #F7F9FC bg */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <div role="tabpanel" id="dashboard-panel" aria-labelledby="tab-dashboard" className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <InterventionMatrix />
        </div>
        <div role="tabpanel" id="compliance-panel" aria-labelledby="tab-compliance" className={activeTab === 'compliance' ? 'block' : 'hidden'}>
          <ComplianceDiagram />
        </div>
        <div role="tabpanel" id="backend-panel" aria-labelledby="tab-backend" className={activeTab === 'backend' ? 'block' : 'hidden'}>
          <AcademicEngineCode />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 mt-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2025 DETOVA LABS | Lead Architect: Eduvane AI</p>
          <p className="font-medium text-[#1FA2A6]">
            [INSIGHT_AMBER: Requires human validation per Sec VIII.C]
          </p>
          <p className="italic">
            *Tested on dysgraphia handwriting samples from NIH dataset v3.1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

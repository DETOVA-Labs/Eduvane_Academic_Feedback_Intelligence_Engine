
import React from 'react';
import { AlertCircle, CheckCircle2, FileSearch, TrendingUp } from 'lucide-react';
import { DiagnosticCard } from './DiagnosticCard';

const MOCK_DATA = [
  {
    id: 'ST-001',
    student: 'A. Miller',
    confidence: 0.92,
    status: 'auto-validated',
    insight: 'The solution correctly applies the area formula but inconsistently converts units—a pattern suggesting spatial reasoning development needs.',
    clarityNote: 'Baseline alignment progressing—practice vertical strokes to improve expression fluency.',
    priority: 'low'
  },
  {
    id: 'ST-002',
    student: 'J. Doe',
    confidence: 0.68,
    status: 'insight-review',
    insight: 'The learner demonstrates emerging fraction equivalence understanding but inverts denominators during subtraction—a pattern to address before algebraic ratios.',
    clarityNote: 'Stroke pressure shows increasing stability; vertical alignment requires focused reinforcement.',
    priority: 'high'
  },
  {
    id: 'ST-003',
    student: 'S. Chen',
    confidence: 0.81,
    status: 'insight-review',
    insight: 'Calculations show mastery of procedural multiplication; however, variable isolation logic appears inconsistent in multi-step equations.',
    clarityNote: 'Letter formations show emerging consistency. Focusing on baseline alignment will improve expression fluency.',
    priority: 'amber'
  }
];

export const InterventionMatrix: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Intervention Matrix</h2>
          <p className="text-slate-500 text-sm">Actionable diagnostic pathways for Middle School Math (Weeks 4-7 Scope)</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#F2A900]"></span>
            Priority Alerts: {MOCK_DATA.filter(d => d.priority === 'high' || d.priority === 'amber').length}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle2 size={14} className="text-[#1FA2A6]" />
            Auto-Validated: {MOCK_DATA.filter(d => d.status === 'auto-validated').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insight Review - Validation Queue */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileSearch size={18} className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-[#1E3A5F] uppercase tracking-wider text-sm">Insight Review Queue</h3>
          </div>
          <div className="space-y-4">
            {MOCK_DATA.filter(d => d.status === 'insight-review').map(item => (
              <DiagnosticCard key={item.id} data={item} />
            ))}
          </div>
        </section>

        {/* Recently Validated */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-[#1E3A5F] uppercase tracking-wider text-sm">Auto-Validated Trends</h3>
          </div>
          <div className="space-y-4 opacity-75">
            {MOCK_DATA.filter(d => d.status === 'auto-validated').map(item => (
              <DiagnosticCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

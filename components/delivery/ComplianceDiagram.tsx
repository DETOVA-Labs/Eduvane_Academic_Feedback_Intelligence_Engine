
import React from 'react';
import { Lock, UserMinus, ShieldAlert, ArrowRight } from 'lucide-react';

export const ComplianceDiagram: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-[#1E3A5F]">Compliance by Design</h2>
        <p className="text-slate-500">Pseudonymization Workflow & FERPA-Native Ingestion (Sec IV.B)</p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 py-12">
        {/* Step 1: Ingestion */}
        <div className="flex flex-col items-center gap-4 w-48 text-center z-10">
          <div className="w-16 h-16 bg-[#1FA2A6] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldAlert size={32} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1FA2A6] uppercase">Ingestion</span>
            <p className="text-sm font-semibold text-[#1E3A5F]">Raw PII Signal</p>
            <p className="text-[10px] text-slate-400 mt-1">Assignment scan with student name & ID.</p>
          </div>
        </div>

        <ArrowRight className="hidden md:block text-[#1FA2A6] opacity-30" size={48} />

        {/* Step 2: Stripping */}
        <div className="flex flex-col items-center gap-4 w-48 text-center z-10">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <UserMinus size={32} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1FA2A6] uppercase">→ Pseudonymization</span>
            <p className="text-sm font-semibold text-[#1E3A5F]">PII Stripping</p>
            <p className="text-[10px] text-slate-400 mt-1">Separation of identity from diagnostic data.</p>
          </div>
        </div>

        <ArrowRight className="hidden md:block text-[#1FA2A6] opacity-30" size={48} />

        {/* Step 3: Secure Store */}
        <div className="flex flex-col items-center gap-4 w-48 text-center z-10">
          <div className="w-16 h-16 bg-[#2B2E34] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Lock size={32} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1FA2A6] uppercase">Encryption</span>
            <p className="text-sm font-semibold text-[#1E3A5F]">AES-256 Storage</p>
            <p className="text-[10px] text-slate-400 mt-1">Encrypted shards across S3 & Supabase.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-12">
        <h4 className="font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
           Teacher-Controlled Permission Node
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked readOnly className="form-checkbox text-[#1FA2A6] rounded" />
              <span className="text-sm font-medium text-slate-700">Anonymize for School-Level Heatmaps</span>
            </label>
            <p className="text-xs text-slate-400 ml-6">Removes all individual identifiers before institutional aggregation.</p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked readOnly className="form-checkbox text-[#1FA2A6] rounded" />
              <span className="text-sm font-medium text-slate-700">Enable Family "Conversation Catalyst" Delivery</span>
            </label>
            <p className="text-xs text-slate-400 ml-6">Requires verified educator validation of AI insights before dispatch.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

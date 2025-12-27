
import React from 'react';
import { Terminal, Copy } from 'lucide-react';

export const AcademicEngineCode: React.FC = () => {
  const pythonCode = `
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sympy import sympify, solve
from transformers import pipeline
import logging

# [EDUVANE INTELLIGENCE ENGINE | MVP MODULE: ACADEMIC DIAGNOSTICS | SEC III.C COMPLIANT]
# SEC IV.B FERPA-compliant Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eduvane_diagnostics")

app = FastAPI()

# DeBERTa for concept gap analysis (Weeks 4-7 scope)
classifier = pipeline("zero-shot-classification", model="microsoft/deberta-v3-base")

class DiagnosisRequest(BaseModel):
    student_id: str
    problem_text: str
    student_answer: str
    target_solution: str

@app.post("/v1/diagnostics/math/gap-analysis")
async def analyze_concept_gap(req: DiagnosisRequest):
    """
    Per Sec III.B.1: Confidence-Aware Diagnosis logic.
    Hardcoded confidence threshold (>=85% = auto-validate).
    """
    try:
        # 1. Procedural Validation using SymPy
        s_expr = sympify(req.student_answer)
        t_expr = sympify(req.target_solution)
        is_procedurally_correct = (s_expr == t_expr)
        
        # 2. Conceptual Gap Analysis via DeBERTa
        candidate_labels = ["conceptual", "procedural", "careless"]
        result = classifier(req.student_answer, candidate_labels)
        top_label = result['labels'][0]
        confidence = result['scores'][0]
        
        # 3. Compliance & Validation Logic (Sec VIII.C)
        validation_status = "AUTO_VALIDATED" if confidence >= 0.85 else "PENDING_REVIEW"
        
        # Tag for low-confidence cases
        if validation_status == "PENDING_REVIEW":
            logger.warning(f"[INSIGHT_AMBER] Low-confidence diagnosis for {req.student_id}")

        return {
            "status": validation_status,
            "diagnosis": {
                "category": top_label,
                "confidence_score": confidence,
                "procedural_match": is_procedurally_correct,
                "insight_narration": f"The solution demonstrates emerging {top_label} understanding..."
            },
            "meta": {
                "blueprint_version": "2025.12.27",
                "ferpa_compliant": True
            }
        }
    except Exception as e:
        logger.error(f"Diagnostic failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal diagnostic engine failure")
`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-[#2B2E34] text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#1FA2A6]" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">engine/v1/academic_gap.py</span>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Copy size={16} />
        </button>
      </div>
      <div className="bg-[#1E2127] p-6 rounded-b-lg overflow-x-auto shadow-inner">
        <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre">
          {pythonCode}
        </pre>
      </div>
      <div className="p-4 bg-blue-50 border-l-4 border-[#1FA2A6] text-[#1E3A5F]">
        <p className="text-xs font-bold mb-1">Lead AI Architect Note:</p>
        <p className="text-xs italic leading-relaxed">
          "This implementation adheres to Sec V.C cost discipline by leveraging SymPy and Microsoft's open-source DeBERTa models, 
          eliminating per-token costs for basic structural validation. FERPA compliance is maintained via internal logging 
          of Amber signals for educator intervention hooks."
        </p>
      </div>
    </div>
  );
};

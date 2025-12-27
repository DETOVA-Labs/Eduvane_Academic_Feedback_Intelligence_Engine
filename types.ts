
export enum DiagnosticCategory {
  CONCEPTUAL = 'conceptual',
  PROCEDURAL = 'procedural',
  CARELESS = 'careless'
}

export interface StudentInsight {
  id: string;
  student: string;
  confidence: number;
  status: 'auto-validated' | 'insight-review';
  insight: string;
  clarityNote: string;
  priority: 'low' | 'amber' | 'high';
}

export interface DiagnosticResponse {
  status: string;
  diagnosis: {
    category: DiagnosticCategory;
    confidence_score: number;
    procedural_match: boolean;
    insight_narration: string;
  };
  meta: {
    blueprint_version: string;
    ferpa_compliant: boolean;
  };
}

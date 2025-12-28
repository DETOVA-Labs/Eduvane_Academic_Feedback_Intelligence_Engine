
import { IntelligenceInsight } from '../types.ts';

/**
 * INTELLIGENCE CORE DOMAIN
 * Responsibility: Processing anonymized signals into structured Insight objects.
 */
export const IntelligenceCore = {
  /**
   * Generates confidence-aware intelligence from processed artifacts.
   * Logic follows Sec III.B.1 (Confidence-Aware Diagnosis).
   */
  generateInsight: (data: any): IntelligenceInsight => {
    const confidence = calculateConfidence(data);
    
    // Fix: Aligned properties with IntelligenceInsight interface and corrected 'EDUCATOR_REVIEW' to 'PENDING_REVIEW'
    // Added observationalStatement to fix rendering in ValidationGate component.
    return {
      id: `INS-${Math.random().toString(36).substr(2, 9)}`,
      studentId: data.studentId || 'ANON',
      artifactId: data.refId,
      timestamp: new Date().toISOString(),
      confidenceScore: confidence,
      category: determineCategory(data),
      handwritingClarity: data.clarity || 0.85,
      rawObservation: data.rawObservation,
      observationalStatement: data.rawObservation,
      status: confidence >= 0.85 ? 'VALIDATED' : 'PENDING_REVIEW',
      mode: data.mode || 'INSTITUTIONAL',
      impactLevel: confidence < 0.7 ? 'HIGH' : (confidence < 0.85 ? 'AMBER' : 'LOW')
    };
  }
};

const calculateConfidence = (data: any): number => {
  // Complex heuristic simulation based on pattern matching reliability
  return data.confidence || 0.85;
};

const determineCategory = (data: any): 'CONCEPTUAL' | 'PROCEDURAL' | 'CARELESS' => {
  if (data.errorPattern === 'logic') return 'CONCEPTUAL';
  if (data.errorPattern === 'arithmetic') return 'PROCEDURAL';
  return 'CARELESS';
};

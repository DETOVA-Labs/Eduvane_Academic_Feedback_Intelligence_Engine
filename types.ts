
export type UserMode = 'LEARNER' | 'TEACHER';
export type EduvaneMode = 'INSTITUTIONAL' | 'STANDALONE';
export type ValidationStatus = 'VALIDATED' | 'PENDING_REVIEW' | 'DRAFT_GENERATED' | 'RELEASED';
export type IntelligenceAudience = 'EDUCATOR' | 'FAMILY' | 'LEARNER';

export interface Question {
  id: string;
  text: string;
  type: string;
}

export interface Submission {
  id: string;
  timestamp: string;
  subject: string;
  topic?: string;
  score: number;
  feedback: string;
  improvementSteps: string[];
  imageUrl?: string;
  confidenceScore: number;
}

export interface PracticeSet {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  timestamp: string;
}

export interface IntelligenceInsight {
  id: string;
  studentId: string;
  artifactId: string;
  timestamp: string;
  confidenceScore: number;
  category: 'CONCEPTUAL' | 'PROCEDURAL' | 'CARELESS';
  handwritingClarity: number;
  rawObservation: string;
  /** 
   * Narrative summary of the observation. 
   * Synchronized with 'rawObservation' in IntelligenceCore. 
   */
  observationalStatement: string; 
  status: ValidationStatus;
  mode: string;
  impactLevel: 'HIGH' | 'AMBER' | 'LOW';
}

export interface TranslatedIntelligence {
  audience: IntelligenceAudience;
  headline: string;
  narrative: string;
  actionableStep: string;
}

export interface PresentationContent {
  headline: string;
  narrative: string;
  actionableStep: string;
}

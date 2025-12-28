
export type UserMode = 'LEARNER' | 'TEACHER';
export type ValidationStatus = 'VALIDATED' | 'PENDING_REVIEW' | 'DRAFT_GENERATED' | 'RELEASED';
export type EduvaneMode = 'STANDALONE' | 'INSTITUTIONAL';
export type IntelligenceAudience = 'EDUCATOR' | 'FAMILY' | 'LEARNER';

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

export interface UserProfile {
  id: string;
  email: string;
  xp_total: number;
}

export interface IntentResult {
  intent: 'PRACTICE' | 'ANALYZE' | 'HISTORY' | 'TUTORIAL' | 'UNKNOWN';
  subject?: string;
  topic?: string;
  count?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  message?: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
}

export interface Submission {
  id: string;
  user_id?: string;
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
  user_id?: string;
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
  observationalStatement: string; 
  status: ValidationStatus;
  mode: EduvaneMode;
  impactLevel: 'HIGH' | 'AMBER' | 'LOW';
}


export type EduvaneMode = 'STANDALONE' | 'INSTITUTIONAL';

export interface UserProfile {
  id: string;
  email: string;
  xp_total: number;
}

export interface IntentResult {
  intent: 'PRACTICE' | 'ANALYZE' | 'HISTORY' | 'CHAT' | 'UNKNOWN';
  subject: string;
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
  score: number | null; // Nullable for keyless mode
  feedback: string;
  improvementSteps: string[];
  imageUrl?: string;
  confidenceScore: number;
  reasoningType: 'LOCAL' | 'AI';
  rawText?: string;
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

// Added missing validation and intelligence types for domain logic
export type ValidationStatus = 'RELEASED' | 'PENDING_REVIEW' | 'FLAGGED';

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
  status: 'VALIDATED' | 'PENDING_REVIEW';
  mode: EduvaneMode;
  impactLevel: 'HIGH' | 'AMBER' | 'LOW';
}

export interface TranslatedIntelligence {
  audience: IntelligenceAudience;
  headline: string;
  narrative: string;
  actionableStep: string;
}

export type IntelligenceAudience = 'EDUCATOR' | 'FAMILY' | 'LEARNER';

export interface PresentationContent {
  headline: string;
  narrative: string;
  actionableStep: string;
}

export type EduvaneRole = "TEACHER" | "STUDENT" | "UNKNOWN";
export type EduvaneIntent =
  | "ANALYSIS"
  | "QUESTION_GENERATION"
  | "CONVERSATIONAL";

export interface UploadArtifact {
  fileName: string;
  mimeType: string;
  base64Data: string;
}

export interface GatewayChatRequest {
  sessionId: string;
  message: string;
  uploads: UploadArtifact[];
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIEngineRequest {
  userId: string;
  role: EduvaneRole;
  sessionId: string;
  message: string;
  uploads: UploadArtifact[];
  history: ConversationTurn[];
}

export interface HandwritingFeedback {
  legibility: string;
  lineConsistency: string;
  characterSpacing: string;
  meaningImpact: string;
  suggestions: string[];
}

export interface AIEngineResponse {
  sessionId: string;
  intent: EduvaneIntent;
  role: EduvaneRole;
  responseText: string;
  followUpSuggestion?: string;
  generatedQuestions?: string[];
  handwritingFeedback?: HandwritingFeedback;
}

export interface ConversationSummary {
  sessionId: string;
  title: string;
  updatedAt: string;
}

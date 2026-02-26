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

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  sessionId: string;
  title: string;
  updatedAt: string;
}

export interface StoredConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface HandwritingFeedback {
  legibility: string;
  lineConsistency: string;
  characterSpacing: string;
  meaningImpact: string;
  suggestions: string[];
}

export interface GatewayChatRequest {
  sessionId: string;
  message: string;
  uploads: UploadArtifact[];
}

export interface GatewayChatResponse {
  sessionId: string;
  intent: EduvaneIntent;
  role: EduvaneRole;
  responseText: string;
  followUpSuggestion?: string;
  handwritingFeedback?: HandwritingFeedback;
  generatedQuestions?: string[];
}

export interface SessionIdentity {
  userId: string;
  role: EduvaneRole;
}

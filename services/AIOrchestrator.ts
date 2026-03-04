/**
 * Overview: AIOrchestrator.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { IntentResult, Question, Submission } from "../types.ts";

const gatewayUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

interface GatewayResponse {
  sessionId: string;
  intent: "ANALYSIS" | "QUESTION_GENERATION" | "CONVERSATIONAL";
  role: "TEACHER" | "STUDENT" | "UNKNOWN";
  responseText: string;
  followUpSuggestion?: string;
  generatedQuestions?: string[];
  handwritingFeedback?: {
    suggestions?: string[];
  };
}

interface GatewayIntentResponse {
  intent: "ANALYSIS" | "QUESTION_GENERATION" | "CONVERSATIONAL";
  role: "TEACHER" | "STUDENT" | "UNKNOWN";
}

async function callGateway(input: {
  sessionId: string;
  message: string;
  uploads: Array<{ fileName: string; mimeType: string; base64Data: string }>;
}): Promise<GatewayResponse> {
  const response = await fetch(`${gatewayUrl}/api/v1/chat/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Gateway request failed.");
  }

  return (await response.json()) as GatewayResponse;
}

async function callGatewayIntent(input: {
  message: string;
  uploads: Array<{ fileName: string; mimeType: string; base64Data: string }>;
}): Promise<GatewayIntentResponse> {
  const response = await fetch(`${gatewayUrl}/api/v1/chat/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Gateway intent request failed.");
  }

  return (await response.json()) as GatewayIntentResponse;
}

function mapIntent(intent: GatewayIntentResponse["intent"]): IntentResult["intent"] {
  if (intent === "QUESTION_GENERATION") {
    return "PRACTICE";
  }
  if (intent === "ANALYSIS") {
    return "ANALYZE";
  }
  return "CHAT";
}

/**
 * Compatibility shim. Intelligence orchestration now runs in Python AI Engine.
 * Frontend calls are routed through the backend gateway.
 */
export const AIOrchestrator = {
  perception: {
    extractText: async () => {
      return { text: "", confidence: 0 };
    }
  },

  interpretation: {
    parseIntent: async (input: string): Promise<IntentResult> => {
      try {
        const response = await callGatewayIntent({
          message: input,
          uploads: []
        });
        return {
          intent: mapIntent(response.intent),
          subject: "Academic",
          topic: input || "Academic"
        };
      } catch (error) {
        return {
          intent: "CHAT",
          subject: "Academic",
          topic: input || "Academic",
          message: "Intent service unavailable."
        };
      }
    }
  },

  evaluateWorkFlow: async (
    imageBuffer: string,
    mimeType: string,
    onProgress?: (msg: string) => void
  ): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> => {
    onProgress?.("Sending to Eduvane intelligence engine...");

    const response = await callGateway({
      sessionId: `legacy-${Date.now()}`,
      message: "Analyze this student submission.",
      uploads: [
        {
          fileName: "submission",
          mimeType,
          base64Data: imageBuffer
        }
      ]
    });

    const suggestions = response.handwritingFeedback?.suggestions || [];
    const improvementSteps =
      suggestions.length > 0
        ? suggestions
        : [response.followUpSuggestion || "Upload a revised attempt for comparison."];

    return {
      subject: "Academic Work",
      topic: "Feedback Review",
      score: null,
      feedback: response.responseText,
      improvementSteps,
      confidenceScore: 0.8,
      reasoningType: "AI",
      rawText: ""
    };
  },

  generatePracticeFlow: async (prompt: string): Promise<Question[]> => {
    const response = await callGateway({
      sessionId: `legacy-${Date.now()}`,
      message: prompt,
      uploads: []
    });

    const generated = response.generatedQuestions || [];
    return generated.map((text, index) => ({
      id: `Q-${index + 1}`,
      text,
      type: "PRACTICE"
    }));
  }
};


import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * EDUVANE CORE - PRODUCTION ORCHESTRATOR
 * Switched to stable 'gemini-flash-latest' to ensure Vercel compatibility.
 */

const STABLE_MODEL = 'gemini-flash-latest';

/**
 * Factory for Gemini Client.
 * Ensures we pull process.env.API_KEY at the moment of the request.
 */
const getEngine = () => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("EDUVANE_CORE: API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export const AIOrchestrator = {
  interpretation: {
    parseIntent: async (input: string): Promise<IntentResult> => {
      const ai = getEngine();
      const response = await ai.models.generateContent({
        model: STABLE_MODEL,
        contents: [{ parts: [{ text: `Identify intent, subject, and topic for: "${input}"` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              count: { type: Type.NUMBER }
            },
            required: ["intent", "subject"]
          }
        }
      });

      try {
        const data = JSON.parse(response.text || "{}");
        return {
          intent: (data.intent?.toUpperCase() as any) || "UNKNOWN",
          subject: data.subject || "General",
          topic: data.topic || "General",
          difficulty: (data.difficulty as any) || "Medium",
          count: data.count || 5
        };
      } catch (e) {
        console.error("Intent Error:", e);
        return { intent: "UNKNOWN", subject: "General" };
      }
    }
  },

  evaluateWorkFlow: async (imageBuffer: string, mimeType: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> => {
    const ai = getEngine();
    
    // Perception & Reasoning in a single high-context call for stability
    const response = await ai.models.generateContent({
      model: STABLE_MODEL,
      contents: [{
        parts: [
          { inlineData: { data: imageBuffer, mimeType: mimeType } },
          { text: "ANALYZE WORK: Perform OCR on this image. Then, evaluate the accuracy, provide pedagogical feedback, and list 3 concrete growth steps. Return as JSON." }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback", "improvementSteps"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      subject: result.subject || "Detected Subject",
      topic: "Diagnostic",
      score: result.score || 0,
      feedback: result.feedback || "Work signal processed.",
      improvementSteps: result.improvementSteps || ["Review core concepts"],
      confidenceScore: 0.9
    };
  },

  generatePracticeFlow: async (prompt: string): Promise<Question[]> => {
    const ai = getEngine();
    const context = await AIOrchestrator.interpretation.parseIntent(prompt);

    const response = await ai.models.generateContent({
      model: STABLE_MODEL,
      contents: [{ 
        parts: [{ text: `Generate ${context.count} ${context.difficulty} questions for ${context.subject}. Topic: ${context.topic}` }] 
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["id", "text", "type"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  }
};

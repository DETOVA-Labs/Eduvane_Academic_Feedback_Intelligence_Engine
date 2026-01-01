
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";
import Tesseract from 'tesseract.js';

/**
 * EDUVANE CORE - PRODUCTION ORCHESTRATOR
 * Design Mandate: Keyless primary perception with optional AI reasoning.
 */

const STABLE_MODEL = 'gemini-3-flash-preview';

const getEngine = () => {
  const key = process.env.API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

export const AIOrchestrator = {
  // Local Perception Engine (Truly Keyless)
  perception: {
    extractText: async (imageSource: string): Promise<{ text: string; confidence: number }> => {
      try {
        const result = await Tesseract.recognize(imageSource, 'eng');
        return {
          text: result.data.text,
          confidence: result.data.confidence / 100
        };
      } catch (e) {
        console.error("Local OCR Failed:", e);
        return { text: "", confidence: 0 };
      }
    }
  },

  interpretation: {
    parseIntent: async (input: string): Promise<IntentResult> => {
      const ai = getEngine();
      if (!ai) {
        // Deterministic Fallback for Keyless Mode
        const low = input.toLowerCase();
        if (low.includes("practice") || low.includes("question") || low.includes("test")) {
          return { intent: "PRACTICE", subject: "General", topic: input };
        }
        if (low.includes("analyze") || low.includes("upload") || low.includes("check")) {
          return { intent: "ANALYZE", subject: "General" };
        }
        return { intent: "UNKNOWN", subject: "General" };
      }

      try {
        const response = await ai.models.generateContent({
          model: STABLE_MODEL,
          contents: [{ parts: [{ text: `Identify intent, subject, and topic for: "${input}"` }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                intent: { type: Type.STRING, enum: ["PRACTICE", "ANALYZE", "HISTORY", "CHAT", "UNKNOWN"] },
                subject: { type: Type.STRING },
                topic: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                count: { type: Type.NUMBER }
              },
              required: ["intent", "subject"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}");
        return {
          intent: (data.intent as any) || "UNKNOWN",
          subject: data.subject || "General",
          topic: data.topic || "General",
          difficulty: (data.difficulty as any) || "Medium",
          count: data.count || 5
        };
      } catch (e) {
        return { intent: "UNKNOWN", subject: "General" };
      }
    }
  },

  evaluateWorkFlow: async (imageBuffer: string, mimeType: string, onProgress?: (msg: string) => void): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> => {
    onProgress?.("Running Local Perception...");
    const localSignal = await AIOrchestrator.perception.extractText(`data:${mimeType};base64,${imageBuffer}`);
    
    const ai = getEngine();
    if (!ai) {
      // Return Keyless Signal Summary - No authoritative grade
      return {
        subject: "Detected Artifact",
        topic: "Local Scan",
        score: null,
        feedback: "Local perception captured text signal. Full pedagogical reasoning requires an AI bridge.",
        improvementSteps: ["Manually review extracted text", "Connect reasoning engine for grading"],
        confidenceScore: localSignal.confidence,
        reasoningType: 'LOCAL',
        rawText: localSignal.text
      };
    }

    onProgress?.("Synthesizing Intelligence...");
    try {
      const response = await ai.models.generateContent({
        model: STABLE_MODEL,
        contents: [{
          parts: [
            { inlineData: { data: imageBuffer, mimeType: mimeType } },
            { text: `ANALYZE STUDENT WORK. OCR SIGNAL: "${localSignal.text}". Identify subject, topic, grade (0-100), and feedback.` }
          ]
        }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
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
        subject: result.subject || "Academic Work",
        topic: result.topic || "Diagnostic",
        score: result.score,
        feedback: result.feedback,
        improvementSteps: result.improvementSteps,
        confidenceScore: localSignal.confidence,
        reasoningType: 'AI',
        rawText: localSignal.text
      };
    } catch (e) {
      return {
        subject: "Detected Artifact",
        topic: "Diagnostic",
        score: null,
        feedback: "Reasoning layer failed to respond. Falling back to perception signal.",
        improvementSteps: ["Retry with stable connection"],
        confidenceScore: localSignal.confidence,
        reasoningType: 'LOCAL',
        rawText: localSignal.text
      };
    }
  },

  generatePracticeFlow: async (prompt: string): Promise<Question[]> => {
    const ai = getEngine();
    if (!ai) {
      return [{ 
        id: "DEMO-1", 
        text: "Intelligence Key Required: Practice generation is a reasoning-only feature. Please provide a Gemini API Key to continue.", 
        type: "LOCKED" 
      }];
    }

    const context = await AIOrchestrator.interpretation.parseIntent(prompt);
    try {
      const response = await ai.models.generateContent({
        model: STABLE_MODEL,
        contents: [{ parts: [{ text: `Generate questions for ${context.subject}. Topic: ${context.topic}.` }] }],
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
    } catch (e) {
      return [{ id: "ERR-1", text: "Reasoning engine unavailable.", type: "ERROR" }];
    }
  }
};

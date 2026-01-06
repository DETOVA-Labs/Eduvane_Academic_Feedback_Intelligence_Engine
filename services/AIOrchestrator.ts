
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";
import Tesseract from 'tesseract.js';

/**
 * EDUVANE CORE - PRODUCTION ORCHESTRATOR
 * Design Mandate: Support, pedagogical precision, and keyless resilience.
 */

const STABLE_MODEL = 'gemini-3-flash-preview';

const getEngine = () => {
  const key = process.env.API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

export const AIOrchestrator = {
  perception: {
    extractText: async (imageSource: string): Promise<{ text: string; confidence: number }> => {
      try {
        const result = await Tesseract.recognize(imageSource, 'eng');
        return {
          text: result.data.text,
          confidence: result.data.confidence / 100
        };
      } catch (e) {
        console.error("OCR Error:", e);
        return { text: "", confidence: 0 };
      }
    }
  },

  interpretation: {
    parseIntent: async (input: string): Promise<IntentResult> => {
      const ai = getEngine();
      if (!ai) {
        const low = input.toLowerCase();
        if (low.includes("practice") || low.includes("question") || low.includes("test")) {
          return { intent: "PRACTICE", subject: "Academic", topic: input };
        }
        if (low.includes("analyze") || low.includes("upload") || low.includes("check")) {
          return { intent: "ANALYZE", subject: "Academic" };
        }
        return { intent: "UNKNOWN", subject: "Academic" };
      }

      try {
        const response = await ai.models.generateContent({
          model: STABLE_MODEL,
          contents: [{ parts: [{ text: `Identify the learning intent for: "${input}". Provide subject and topic.` }] }],
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
          subject: data.subject || "Academic",
          topic: data.topic || "Academic",
          difficulty: (data.difficulty as any) || "Medium",
          count: data.count || 5
        };
      } catch (e) {
        return { intent: "UNKNOWN", subject: "Academic" };
      }
    }
  },

  evaluateWorkFlow: async (imageBuffer: string, mimeType: string, onProgress?: (msg: string) => void): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> => {
    onProgress?.("Reading the work...");
    const localSignal = await AIOrchestrator.perception.extractText(`data:${mimeType};base64,${imageBuffer}`);
    
    const ai = getEngine();
    if (!ai) {
      return {
        subject: "Detected Work",
        topic: "Preview Mode",
        score: null,
        feedback: "We've captured your work. Full pedagogical feedback requires an active connection to our reasoning engine.",
        improvementSteps: ["Review your answers manually for now", "Connect to the full engine for detailed grading"],
        confidenceScore: localSignal.confidence,
        reasoningType: 'LOCAL',
        rawText: localSignal.text
      };
    }

    onProgress?.("Identifying areas for improvement...");
    try {
      const response = await ai.models.generateContent({
        model: STABLE_MODEL,
        contents: [{
          parts: [
            { inlineData: { data: imageBuffer, mimeType: mimeType } },
            { text: `As a supportive teacher, analyze this work. OCR hint: "${localSignal.text}". Output a score (0-100), a short paragraph of encouraging pedagogical feedback, and 3 specific steps for improvement.` }
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
        subject: result.subject || "Subject Detected",
        topic: result.topic || "Review",
        score: result.score,
        feedback: result.feedback,
        improvementSteps: result.improvementSteps,
        confidenceScore: localSignal.confidence,
        reasoningType: 'AI',
        rawText: localSignal.text
      };
    } catch (e) {
      return {
        subject: "Academic Work",
        topic: "Review",
        score: null,
        feedback: "Our reasoning engine is momentarily unavailable. We can still see your work, but we'll need to wait for a connection to grade it.",
        improvementSteps: ["Please try again in a few moments"],
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
        text: "Please connect your reasoning engine to generate custom practice sets.", 
        type: "LOCKED" 
      }];
    }

    try {
      const response = await ai.models.generateContent({
        model: STABLE_MODEL,
        contents: [{ parts: [{ text: `Generate clear, academic practice questions based on: ${prompt}. Return a list of objects with text and type.` }] }],
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
      return [{ id: "ERR-1", text: "We're having trouble reaching the learning engine. Please try again soon.", type: "ERROR" }];
    }
  }
};

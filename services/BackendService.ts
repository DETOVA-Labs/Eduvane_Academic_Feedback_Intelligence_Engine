
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * EDUVANE BACKEND EMULATOR
 * This service acts as our server-side layer. 
 * The Frontend only triggers these "endpoints".
 */
export const BackendService = {
  /**
   * Endpoint: /api/intent/route
   * Model: gemini-3-flash-preview (Basic classification)
   */
  async routeIntent(input: string): Promise<IntentResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      System: Act as the Eduvane Intelligence Intent Router.
      User Input: "${input}"
      
      Extract and infer:
      1. intent: "PRACTICE" (for questions), "ANALYZE" (for evaluation), "HISTORY" (for progress), "TUTORIAL" (for guidance).
      2. subject: Academic discipline (e.g. Biology, Math).
      3. topic: Specific core concept(s).
      4. count: Number of items requested (parse text numbers to integers).
      5. difficulty: Easy, Medium, Hard.
      6. message: A brief confirmation message.
      
      Return valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            count: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["intent", "message"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return {
        ...data,
        intent: data.intent?.toUpperCase().includes("PRACTICE") ? "PRACTICE" : 
                data.intent?.toUpperCase().includes("ANALYZE") ? "ANALYZE" : 
                data.intent?.toUpperCase().includes("HISTORY") ? "HISTORY" : 
                data.intent?.toUpperCase().includes("TUTORIAL") ? "TUTORIAL" : "UNKNOWN"
      };
    } catch (e) {
      console.error("Backend Error: Failed to parse intent response", e);
      throw new Error("Intelligence parsing failed.");
    }
  },

  /**
   * Endpoint: /api/practice/generate
   * Model: gemini-3-pro-preview (Complex task: Pedagogical generation)
   */
  async generateQuestions(config: { subject: string; topic: string; difficulty: string; count: number }): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Role: Expert Curriculum Designer in ${config.subject}.
      Task: Create ${config.count} ${config.difficulty}-level practice items for "${config.topic}".
      Requirements: High academic rigor, clear phrasing, diverse item types (conceptual, procedural, application).
      Output: JSON array of objects.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
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
  },

  /**
   * Endpoint: /api/analysis/work
   * Model: gemini-3-pro-preview (Complex task: Image OCR + Reasoning)
   */
  async analyzeWork(imageBuffer: string, metadata?: { subject?: string }): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Eduvane Advanced Intelligence Analysis.
      Context: ${metadata?.subject || 'Identify subject from work'}.
      
      Perform:
      1. Full content extraction (OCR).
      2. Identify conceptual vs procedural errors.
      3. Mastery score calculation (0-100).
      4. Narrative feedback for student growth.
      5. 3 specific, actionable improvement steps.
      
      Return as valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["subject", "topic", "score", "feedback", "improvementSteps", "confidenceScore"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      subject: data.subject || metadata?.subject || "General Study",
      topic: data.topic,
      score: data.score,
      feedback: data.feedback,
      improvementSteps: data.improvementSteps,
      confidenceScore: data.confidenceScore
    };
  }
};

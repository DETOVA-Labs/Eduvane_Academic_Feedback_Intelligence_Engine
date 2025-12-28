
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const AIOrchestrator = {
  async generateQuestions(config: { subject: string; topic: string; difficulty: string; count: number }): Promise<Question[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${config.count} ${config.difficulty} level practice questions for ${config.subject} on the topic of "${config.topic}".`,
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
  },

  async analyzeWork(imageBuffer: string, metadata: { subject?: string }): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const prompt = `
      Act as an encouraging AI learning assistant. 
      1. OCR the handwritten text in this image.
      2. Score the work out of 100.
      3. Identify specific conceptual or procedural errors.
      4. Provide conversational, encouraging feedback.
      5. List 3 clear, actionable improvement steps.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["score", "feedback", "improvementSteps", "confidenceScore"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      subject: metadata.subject || "General",
      score: result.score,
      feedback: result.feedback,
      improvementSteps: result.improvementSteps,
      confidenceScore: result.confidenceScore
    };
  }
};

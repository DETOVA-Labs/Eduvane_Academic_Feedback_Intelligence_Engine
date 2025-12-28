
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

export const AIOrchestrator = {
  /**
   * Routes user free-text intent to a specific platform flow.
   * Logic: START_PRACTICE, ANALYZE_REQUEST, TUTORIAL_GUIDANCE.
   */
  async routeIntent(input: string): Promise<IntentResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Act as the Eduvane Intelligence Intent Router.
      Process this user text: "${input}"
      
      Extract:
      1. Intent: 
         - "PRACTICE" if they want questions/exercises (Maps to START_PRACTICE).
         - "ANALYZE" if they want to evaluate work (Maps to ANALYZE_REQUEST).
         - "HISTORY" if they want to see progress.
         - "TUTORIAL" if they need guidance (Maps to TUTORIAL_GUIDANCE).
      2. Metadata:
         - subject: The academic discipline (e.g., Physics, Chemistry).
         - topic: The specific area(s) - combine multiple into one string (e.g., "Mole concept, Atom, Electrolysis").
         - count: Numeric quantity (e.g., if user says "twenty-five", return 25). Default to 5.
         - difficulty: "Easy", "Medium", or "Hard". Default to "Medium".
      3. Message: A concise, supportive response starting with "Eduvane Intel-Link: [Action]...".
      
      Return a JSON object.
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

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      intent: result.intent.includes("PRACTICE") ? "PRACTICE" : 
              result.intent.includes("ANALYZE") ? "ANALYZE" : 
              result.intent.includes("HISTORY") ? "HISTORY" : 
              result.intent.includes("TUTORIAL") ? "TUTORIAL" : "UNKNOWN"
    };
  },

  async generateQuestions(config: { subject: string; topic: string; difficulty: string; count: number }): Promise<Question[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Expert Educator Role: ${config.subject}.
      Generate exactly ${config.count} ${config.difficulty} level items for the topics: "${config.topic}".
      Items should be high-rigor, convention-appropriate.
      Return as a JSON array of objects.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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

  async analyzeWork(imageBuffer: string, metadata?: { subject?: string }): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Eduvane Intelligence Engine Evaluation.
      ${metadata?.subject ? `Context: ${metadata.subject}.` : 'Identify the subject and topic from the image content.'}
      1. OCR the work.
      2. Infer Subject and Topic.
      3. Mastery score (0-100).
      4. Growth feedback.
      5. 3 improvement steps.
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

    const result = JSON.parse(response.text || "{}");
    return {
      subject: result.subject || metadata?.subject || "General Analysis",
      topic: result.topic,
      score: result.score,
      feedback: result.feedback,
      improvementSteps: result.improvementSteps,
      confidenceScore: result.confidenceScore
    };
  }
};

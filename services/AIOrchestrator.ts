
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Question, Submission, IntentResult } from "../types.ts";

/**
 * ARCHITECTURAL PROVIDER INTERFACE
 * Decouples model identity from architectural role.
 * Providers can be swapped (e.g., LLaMA 3, Qwen) without changing service logic.
 */
interface AIProvider {
  generate(params: GenerateContentParameters): Promise<{ text: string | undefined }>;
}

/**
 * GEMINI PROVIDER ADAPTER
 * Temporarily implements the AIProvider interface.
 * Accesses credentials via the platform-provided API_KEY environment variable.
 */
class GeminiProvider implements AIProvider {
  private modelName: string;

  constructor(model: string) {
    this.modelName = model;
  }

  async generate(params: any) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY is not defined.");
    
    const ai = new GoogleGenAI({ apiKey });
    return await ai.models.generateContent({
      model: this.modelName,
      ...params
    });
  }
}

/**
 * ROLE: PERCEPTION SERVICE
 * Responsibility: Mechanical OCR / Verbatim text extraction.
 * Constraint: No inference, no correction, no grading. Purely mechanical.
 */
class PerceptionService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new GeminiProvider("gemini-3-flash-preview");
  }

  async extractVerbatim(imageBuffer: string): Promise<string> {
    const response = await this.provider.generate({
      contents: {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: "OCR TASK: VERBATIM EXTRACTION. Return every character and word exactly as it appears. Do not format. Do not fix errors. Do not interpret meaning. Return raw text only." }
        ]
      }
    });
    return response.text || "";
  }
}

/**
 * ROLE: INTERPRETATION SERVICE
 * Responsibility: Structured Context & Intent Routing.
 * Constraint: Outputs strict machine-readable JSON context. Subject-agnostic.
 */
class InterpretationService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new GeminiProvider("gemini-3-flash-preview");
  }

  async parseIntent(input: string): Promise<IntentResult> {
    const prompt = `
      TASK: ANALYZE SIGNAL FOR CONTEXTUAL ROUTING.
      INPUT: "${input}"
      
      INSTRUCTIONS:
      Identify intent, subject, topic, and parameters. 
      Output MUST be valid JSON conforming to the following schema:
      {
        "intent": "ANALYZE" | "PRACTICE" | "HISTORY" | "CHAT",
        "subject": string,
        "topic": string,
        "difficulty": "Easy" | "Medium" | "Hard",
        "count": number
      }
    `;

    const response = await this.provider.generate({
      contents: prompt,
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
        intent: data.intent as any || "CHAT",
        subject: data.subject || "General",
        topic: data.topic || "Undetermined",
        difficulty: data.difficulty as any || "Medium",
        count: data.count || 5
      };
    } catch (e) {
      return { intent: "CHAT", subject: "General" };
    }
  }
}

/**
 * ROLE: PRIMARY REASONING SERVICE
 * Responsibility: THE SINGLE VOICE.
 * Constraint: The ONLY layer permitted to generate user-facing narrative text.
 */
class PrimaryReasoningService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new GeminiProvider("gemini-3-pro-preview");
  }

  async generateEvaluation(rawText: string, context: IntentResult): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    const prompt = `
      ROLE: EDUVANE REASONING CORE.
      VOICE: Encouraging, non-authoritative, conversational.
      CONTEXT: Subject: ${context.subject}, Topic: ${context.topic}.
      SIGNAL DATA: ${rawText}
      
      TASK:
      1. Provide a Mastery Score (0-100).
      2. Provide narrative feedback. 
      3. Provide 3 actionable growth steps.
      
      RULES:
      - Feedback must be the "Voice of Eduvane".
      - Encouraging tone.
      - Focus on conceptual gaps identified in the signal.
    `;

    const response = await this.provider.generate({
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            improvementSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["score", "feedback", "improvementSteps"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      subject: context.subject,
      topic: context.topic,
      score: result.score,
      feedback: result.feedback,
      improvementSteps: result.improvementSteps,
      confidenceScore: result.confidenceScore || 0.95
    };
  }

  async generateContent(context: IntentResult): Promise<Question[]> {
    const prompt = `
      ROLE: EDUVANE REASONING CORE.
      TASK: Create ${context.count} ${context.difficulty} practice items for ${context.subject}.
      TOPIC: ${context.topic}.
      
      FORMAT:
      - Plain text.
      - Ordered (1., 2., 3...).
      - No interactive UI markers.
      - Rigorous academic standards.
    `;

    const response = await this.provider.generate({
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
  }
}

/**
 * CENTRAL AI ORCHESTRATOR
 * Deterministic Conductor of Role-Based Services.
 */
export const AIOrchestrator = {
  perception: new PerceptionService(),
  interpretation: new InterpretationService(),
  reasoning: new PrimaryReasoningService(),

  async validateConfiguration(): Promise<boolean> {
    if (!process.env.API_KEY) {
      console.error("CRITICAL: API_KEY is not defined in the environment.");
      return false;
    }
    return true;
  },

  /**
   * FLOW: EVALUATION PIPELINE
   * Sequential Orchestration: Perception (OCR) -> Interpretation (Context) -> Primary Reasoning (Voice)
   */
  async evaluateWorkFlow(imageBuffer: string): Promise<Omit<Submission, "id" | "timestamp" | "imageUrl">> {
    // 1. Mechanical Extraction
    const rawText = await this.perception.extractVerbatim(imageBuffer);
    
    // 2. Structural Interpretation
    const context = await this.interpretation.parseIntent(rawText);
    
    // 3. Primary Reasoning (Voice Generation)
    // Programmer Guarantee: Narrative strings originate here.
    return await this.reasoning.generateEvaluation(rawText, context);
  },

  /**
   * FLOW: GENERATION PIPELINE
   * Sequential Orchestration: Interpretation (Intent) -> Primary Reasoning (Content)
   */
  async generatePracticeFlow(prompt: string): Promise<Question[]> {
    // 1. Intent Detection
    const context = await this.interpretation.parseIntent(prompt);
    
    // 2. Content Reasoning
    // Programmer Guarantee: Question text originates here.
    return await this.reasoning.generateContent(context);
  }
};

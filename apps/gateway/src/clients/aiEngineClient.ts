import { env } from "../config/env.js";
import { AIEngineRequest, AIEngineResponse } from "../contracts.js";

export async function requestAIEngine(
  payload: AIEngineRequest
): Promise<AIEngineResponse> {
  const response = await fetch(`${env.AI_ENGINE_URL}/v1/intelligence/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-eduvane-shared-secret": env.AI_ENGINE_SHARED_SECRET
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "AI engine request failed.");
  }

  return (await response.json()) as AIEngineResponse;
}

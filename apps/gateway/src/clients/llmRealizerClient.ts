/**
 * Overview: llmRealizerClient.ts
 * Purpose: Calls a gateway-managed LLM provider for linguistic realization rewrites.
 * Notes: Keeps provider interaction isolated from route and orchestration logic.
 */

import { env } from "../config/env.js";

export interface LLMRealizerInput {
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
}

export interface LLMRealizerOutput {
  content: string;
}

function withTimeout(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort("timeout"), timeoutMs);
  return controller;
}

export async function callLLMRealizer(
  input: LLMRealizerInput
): Promise<LLMRealizerOutput> {
  if (env.REALIZATION_PROVIDER !== "openai_compatible") {
    throw new Error(`Unsupported realization provider: ${env.REALIZATION_PROVIDER}`);
  }
  if (!env.REALIZATION_API_KEY) {
    throw new Error("REALIZATION_API_KEY_MISSING");
  }

  const controller = withTimeout(input.timeoutMs);
  const response = await fetch(`${env.REALIZATION_API_BASE_URL}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.REALIZATION_API_KEY}`
    },
    body: JSON.stringify({
      model: env.REALIZATION_MODEL,
      temperature: 0.8,
      max_tokens: 220,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "LLM realizer request failed.");
  }

  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("LLM_REALIZER_EMPTY_OUTPUT");
  }

  return { content };
}


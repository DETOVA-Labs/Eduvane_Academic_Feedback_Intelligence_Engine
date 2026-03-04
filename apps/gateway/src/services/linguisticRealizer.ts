/**
 * Overview: linguisticRealizer.ts
 * Purpose: Realizes deterministic AI-engine output into fresh human-like language with strict guardrails.
 * Notes: Falls back safely to deterministic text on timeout/provider/validation errors.
 */

import { callLLMRealizer } from "../clients/llmRealizerClient.js";
import { env } from "../config/env.js";
import {
  EduvaneRole,
  RealizationFallbackReason,
  RealizationRequest,
  RealizationResult
} from "../contracts.js";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function toRecentSet(recentOutputs: string[]): Set<string> {
  return new Set(recentOutputs.map(normalize));
}

function parseRealizerJSON(raw: string): {
  responseText: string;
  followUpSuggestion?: string;
} | null {
  const trimmed = raw.trim();
  const firstCurly = trimmed.indexOf("{");
  const lastCurly = trimmed.lastIndexOf("}");
  if (firstCurly < 0 || lastCurly < 0 || lastCurly <= firstCurly) {
    return null;
  }
  const jsonText = trimmed.slice(firstCurly, lastCurly + 1);
  try {
    const parsed = JSON.parse(jsonText) as any;
    if (typeof parsed.responseText !== "string" || parsed.responseText.trim().length === 0) {
      return null;
    }
    if (
      parsed.followUpSuggestion !== undefined &&
      typeof parsed.followUpSuggestion !== "string"
    ) {
      return null;
    }
    return {
      responseText: parsed.responseText.trim(),
      followUpSuggestion:
        typeof parsed.followUpSuggestion === "string"
          ? parsed.followUpSuggestion.trim()
          : undefined
    };
  } catch {
    return null;
  }
}

function lengthWithinBounds(original: string, rewritten: string): boolean {
  const base = Math.max(1, original.length);
  const delta = Math.abs(rewritten.length - base);
  return delta / base <= 0.2;
}

function roleGuard(role: EduvaneRole, rewritten: string): boolean {
  const text = rewritten.toLowerCase();
  if (role === "STUDENT" && text.includes("the student")) {
    return false;
  }
  if (role === "TEACHER" && text.startsWith("you ")) {
    return false;
  }
  return true;
}

function duplicateGuard(text: string, recentSet: Set<string>): boolean {
  return recentSet.has(normalize(text));
}

function buildSystemPrompt(): string {
  return [
    "You are Eduvane linguistic realization layer.",
    "Rewrite text with fresh natural language while preserving exact educational intent.",
    "Do not change diagnostic meaning, severity, instructional boundaries, or requested action.",
    "Role constraints:",
    "- STUDENT: warm, direct, second-person framing.",
    "- TEACHER: professional, calm, observational framing.",
    "- UNKNOWN: neutral exploratory framing.",
    "No slang. No humor injection. No policy drift. No added claims.",
    "Keep length near original (within +/-20%).",
    "Output only valid JSON with keys: responseText, followUpSuggestion."
  ].join("\n");
}

function buildUserPrompt(input: RealizationRequest): string {
  return JSON.stringify(
    {
      task: "Rewrite with controlled linguistic variability.",
      intent: input.intent,
      role: input.role,
      userMessage: input.userMessage,
      baseResponseText: input.baseResponseText,
      baseFollowUpSuggestion: input.baseFollowUpSuggestion || null,
      avoidExactOutputs: input.recentOutputs.slice(-8)
    },
    null,
    2
  );
}

function fallback(
  input: RealizationRequest,
  reason: RealizationFallbackReason
): RealizationResult {
  return {
    responseText: input.baseResponseText,
    followUpSuggestion: input.baseFollowUpSuggestion,
    applied: false,
    fallbackReason: reason
  };
}

async function tryRewriteOnce(
  input: RealizationRequest,
  timeoutMs: number
): Promise<{ responseText: string; followUpSuggestion?: string } | null> {
  const raw = await callLLMRealizer({
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(input),
    timeoutMs
  });
  return parseRealizerJSON(raw.content);
}

function isSafeRewrite(
  input: RealizationRequest,
  rewritten: { responseText: string; followUpSuggestion?: string },
  recentSet: Set<string>
): boolean {
  if (!lengthWithinBounds(input.baseResponseText, rewritten.responseText)) {
    return false;
  }
  if (!roleGuard(input.role, rewritten.responseText)) {
    return false;
  }
  if (duplicateGuard(rewritten.responseText, recentSet)) {
    return false;
  }
  if (rewritten.followUpSuggestion && input.baseFollowUpSuggestion) {
    if (!lengthWithinBounds(input.baseFollowUpSuggestion, rewritten.followUpSuggestion)) {
      return false;
    }
    if (duplicateGuard(rewritten.followUpSuggestion, recentSet)) {
      return false;
    }
  }
  return true;
}

export async function realizeLinguisticResponse(
  input: RealizationRequest
): Promise<RealizationResult> {
  if (!env.LINGUISTIC_REALIZATION_ENABLED) {
    return fallback(input, "disabled");
  }
  if (!env.REALIZATION_API_KEY) {
    return fallback(input, "missing_config");
  }

  const timeoutMs = Math.max(100, env.LINGUISTIC_REALIZATION_TIMEOUT_MS);
  const start = Date.now();
  const recentSet = toRecentSet(input.recentOutputs);

  try {
    const first = await tryRewriteOnce(input, timeoutMs);
    if (first && isSafeRewrite(input, first, recentSet)) {
      return {
        responseText: first.responseText,
        followUpSuggestion: first.followUpSuggestion,
        applied: true
      };
    }

    const elapsed = Date.now() - start;
    const remaining = timeoutMs - elapsed;
    if (remaining > 120) {
      const secondInput: RealizationRequest = {
        ...input,
        recentOutputs: [...input.recentOutputs, first?.responseText || ""]
      };
      const second = await tryRewriteOnce(secondInput, remaining);
      if (second && isSafeRewrite(input, second, recentSet)) {
        return {
          responseText: second.responseText,
          followUpSuggestion: second.followUpSuggestion,
          applied: true
        };
      }
    }

    return fallback(input, "duplicate_output");
  } catch (error: any) {
    const message = String(error?.message || error || "");
    if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("abort")) {
      return fallback(input, "timeout");
    }
    if (message.includes("LLM_REALIZER_EMPTY_OUTPUT")) {
      return fallback(input, "invalid_output");
    }
    return fallback(input, "provider_error");
  }
}

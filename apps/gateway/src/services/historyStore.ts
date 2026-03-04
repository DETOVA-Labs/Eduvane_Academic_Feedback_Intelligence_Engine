/**
 * Overview: historyStore.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import {
  ConversationSummary,
  ConversationTurn
} from "../contracts.js";
import { supabaseAdminClient } from "../lib/supabase.js";

interface HistoryRecord {
  userId: string;
  sessionId: string;
  title: string;
  updatedAt: string;
  messages: ConversationTurn[];
}

const memoryHistory = new Map<string, HistoryRecord>();

function key(userId: string, sessionId: string): string {
  return `${userId}::${sessionId}`;
}

function fallbackTitle(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return "Upload analysis";
  }
  return trimmed.slice(0, 64);
}

function mapSummary(record: HistoryRecord): ConversationSummary {
  return {
    sessionId: record.sessionId,
    title: record.title,
    updatedAt: record.updatedAt
  };
}

function memorySummaries(userId: string): ConversationSummary[] {
  return Array.from(memoryHistory.values())
    .filter((item) => item.userId === userId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map(mapSummary);
}

export async function listConversationSummaries(
  userId: string
): Promise<ConversationSummary[]> {
  if (!supabaseAdminClient) {
    return memorySummaries(userId);
  }

  const { data, error } = await supabaseAdminClient
    .from("workspace_history")
    .select("session_id,title,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error || !data) {
    return memorySummaries(userId);
  }

  return data.map((item: any) => ({
    sessionId: item.session_id,
    title: item.title || "Eduvane Session",
    updatedAt: item.updated_at || new Date().toISOString()
  }));
}

export async function getConversationHistory(
  userId: string,
  sessionId: string
): Promise<ConversationTurn[]> {
  if (!supabaseAdminClient) {
    return memoryHistory.get(key(userId, sessionId))?.messages || [];
  }

  const { data, error } = await supabaseAdminClient
    .from("workspace_history")
    .select("messages")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error || !data || !Array.isArray(data.messages)) {
    return memoryHistory.get(key(userId, sessionId))?.messages || [];
  }

  return data.messages as ConversationTurn[];
}

export async function saveConversationExchange(input: {
  userId: string;
  sessionId: string;
  userMessage: string;
  assistantMessage: string;
}) {
  const now = new Date().toISOString();
  const existingMessages = await getConversationHistory(input.userId, input.sessionId);
  const nextMessages: ConversationTurn[] = [
    ...existingMessages,
    { role: "user", content: input.userMessage, timestamp: now },
    { role: "assistant", content: input.assistantMessage, timestamp: now }
  ];

  const nextRecord: HistoryRecord = {
    userId: input.userId,
    sessionId: input.sessionId,
    title: fallbackTitle(input.userMessage),
    updatedAt: now,
    messages: nextMessages
  };
  memoryHistory.set(key(input.userId, input.sessionId), nextRecord);

  if (!supabaseAdminClient) {
    return;
  }

  await supabaseAdminClient.from("workspace_history").upsert(
    {
      user_id: input.userId,
      session_id: input.sessionId,
      title: nextRecord.title,
      updated_at: now,
      messages: nextMessages
    },
    { onConflict: "user_id,session_id" }
  );
}

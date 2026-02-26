import {
  ConversationSummary,
  GatewayChatRequest,
  GatewayChatResponse,
  SessionIdentity,
  StoredConversationTurn
} from "../types";

const baseUrl = import.meta.env.VITE_GATEWAY_BASE_URL || "http://localhost:8080";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export const apiClient = {
  async getSessionIdentity(): Promise<SessionIdentity> {
    const response = await fetch(`${baseUrl}/api/v1/session/me`, {
      credentials: "include"
    });
    return parseJson<SessionIdentity>(response);
  },

  async listHistory(): Promise<ConversationSummary[]> {
    const response = await fetch(`${baseUrl}/api/v1/chat/history`, {
      credentials: "include"
    });
    return parseJson<ConversationSummary[]>(response);
  },

  async sendMessage(payload: GatewayChatRequest): Promise<GatewayChatResponse> {
    const response = await fetch(`${baseUrl}/api/v1/chat/respond`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<GatewayChatResponse>(response);
  },

  async getConversation(sessionId: string): Promise<StoredConversationTurn[]> {
    const response = await fetch(`${baseUrl}/api/v1/chat/history/${sessionId}`, {
      credentials: "include"
    });
    return parseJson<StoredConversationTurn[]>(response);
  },

  async setRole(role: SessionIdentity["role"]): Promise<SessionIdentity> {
    const response = await fetch(`${baseUrl}/api/v1/session/role`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role })
    });
    return parseJson<SessionIdentity>(response);
  }
};

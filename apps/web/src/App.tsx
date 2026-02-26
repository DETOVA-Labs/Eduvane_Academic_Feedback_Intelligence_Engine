/**
 * Overview: App.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { useEffect, useMemo, useState } from "react";
import { ChatComposer } from "./components/ChatComposer";
import { ChatThread } from "./components/ChatThread";
import { Sidebar } from "./components/Sidebar";
import { apiClient } from "./lib/apiClient";
import {
  ConversationMessage,
  ConversationSummary,
  EduvaneRole,
  GatewayChatRequest,
  UploadArtifact
} from "./types";

// Converts an uploaded file into the base64 payload expected by gateway APIs.
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(",");
      resolve(parts[1] || "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Creates a standardized chat message object for consistent rendering and history.
function createMessage(role: "user" | "assistant", content: string): ConversationMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function App() {
  // Application state tracks user role, sessions, conversation messages, and UX indicators.
  const [role, setRole] = useState<EduvaneRole>("UNKNOWN");
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(crypto.randomUUID());
  const [messagesBySession, setMessagesBySession] = useState<
    Record<string, ConversationMessage[]>
  >({});
  const [isThinking, setIsThinking] = useState(false);
  const [rolePromptDismissed, setRolePromptDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active messages are derived from the current session id.
  const activeMessages = useMemo(
    () => messagesBySession[activeSessionId] || [],
    [messagesBySession, activeSessionId]
  );

  useEffect(() => {
    let mounted = true;

    // Initial bootstrap fetches role identity and session history.
    async function bootstrap() {
      try {
        const [identity, sessions] = await Promise.all([
          apiClient.getSessionIdentity(),
          apiClient.listHistory()
        ]);
        if (!mounted) {
          return;
        }
        setRole(identity.role);
        setHistory(sessions);
        if (sessions.length > 0) {
          setActiveSessionId(sessions[0].sessionId);
        }
      } catch (requestError) {
        if (!mounted) {
          return;
        }
        setError("Unable to load workspace state. Check gateway availability.");
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const inHistory = history.some((item) => item.sessionId === activeSessionId);
    if (!inHistory || messagesBySession[activeSessionId]) {
      return;
    }

    // Lazy-loads historical turns only when the selected session is not in memory.
    async function loadConversation() {
      try {
        const turns = await apiClient.getConversation(activeSessionId);
        if (!mounted) {
          return;
        }
        setMessagesBySession((current) => ({
          ...current,
          [activeSessionId]: turns.map((turn) => ({
            id: crypto.randomUUID(),
            role: turn.role,
            content: turn.content,
            createdAt: turn.timestamp
          }))
        }));
      } catch (requestError) {
        if (!mounted) {
          return;
        }
        setError("Unable to load conversation history for this session.");
      }
    }

    loadConversation();
    return () => {
      mounted = false;
    };
  }, [activeSessionId, history, messagesBySession]);

  // Central helper to append a single message to a given session transcript.
  const appendMessage = (sessionId: string, message: ConversationMessage) => {
    setMessagesBySession((current) => ({
      ...current,
      [sessionId]: [...(current[sessionId] || []), message]
    }));
  };

  // Submits user text/files, forwards to gateway, and appends the assistant response.
  const sendMessage = async (messageText: string, files: File[]) => {
    setError(null);
    const userDisplay = messageText || "Uploaded student work for review.";
    appendMessage(activeSessionId, createMessage("user", userDisplay));
    setIsThinking(true);

    try {
      const uploads: UploadArtifact[] = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          base64Data: await toBase64(file)
        }))
      );

      const payload: GatewayChatRequest = {
        sessionId: activeSessionId,
        message: messageText,
        uploads
      };

      const response = await apiClient.sendMessage(payload);

      const responseParts: string[] = [response.responseText];
      if (response.followUpSuggestion) {
        responseParts.push(`\n${response.followUpSuggestion}`);
      }

      appendMessage(
        response.sessionId,
        createMessage("assistant", responseParts.join("\n").trim())
      );

      setActiveSessionId(response.sessionId);
      setRole(response.role);

      setHistory((current) => {
        const titleSeed = messageText.trim() || "Upload analysis";
        const title = titleSeed.slice(0, 48);
        const existing = current.filter((item) => item.sessionId !== response.sessionId);
        return [
          {
            sessionId: response.sessionId,
            title: title.length > 0 ? title : "Eduvane Session",
            updatedAt: new Date().toISOString()
          },
          ...existing
        ];
      });
    } catch (requestError) {
      appendMessage(
        activeSessionId,
        createMessage(
          "assistant",
          "I could not process that request right now. Please try again."
        )
      );
      setError("Request failed. Verify gateway and AI engine services are running.");
    } finally {
      setIsThinking(false);
    }
  };

  // Starts a brand-new local session id for a fresh conversation.
  const handleNewSession = () => {
    const newSessionId = crypto.randomUUID();
    setActiveSessionId(newSessionId);
  };

  // Persists role preference and clears the role prompt for the current browser session.
  const handleRolePick = async (picked: Exclude<EduvaneRole, "UNKNOWN">) => {
    try {
      const updated = await apiClient.setRole(picked);
      setRole(updated.role);
      setRolePromptDismissed(true);
    } catch (requestError) {
      setError("Unable to store role. Please try again.");
    }
  };

  // Main workspace layout: navigation sidebar, transcript body, and bottom composer.
  return (
    <div className="workspace">
      <Sidebar
        history={history}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
      />

      <main className="chat-pane">
        {role === "UNKNOWN" && !rolePromptDismissed && (
          <div className="role-prompt" role="dialog" aria-live="assertive">
            <p>Select your role to personalize Eduvane responses.</p>
            <div className="role-actions">
              <button type="button" onClick={() => handleRolePick("STUDENT")}>
                Student
              </button>
              <button type="button" onClick={() => handleRolePick("TEACHER")}>
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setRolePromptDismissed(true)}
                className="ghost-button"
              >
                Ask me later
              </button>
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <ChatThread messages={activeMessages} isThinking={isThinking} />

        <div className="composer-dock">
          <ChatComposer disabled={isThinking} onSubmit={sendMessage} />
        </div>
      </main>
    </div>
  );
}

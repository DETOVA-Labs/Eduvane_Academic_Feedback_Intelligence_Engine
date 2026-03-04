/**
 * Overview: Sidebar.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { ConversationSummary } from "../types";

interface SidebarProps {
  history: ConversationSummary[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

export function Sidebar({
  history,
  activeSessionId,
  onSelectSession,
  onNewSession
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Eduvane</h1>
        <button className="ghost-button" type="button" onClick={onNewSession}>
          New Chat
        </button>
      </div>
      <div className="sidebar-list">
        {history.length === 0 && (
          <p className="empty-note">No conversations yet. Start with a message.</p>
        )}
        {history.map((item) => (
          <button
            className={item.sessionId === activeSessionId ? "session-item active" : "session-item"}
            key={item.sessionId}
            type="button"
            onClick={() => onSelectSession(item.sessionId)}
          >
            <span className="session-title">{item.title}</span>
            <span className="session-time">
              {new Date(item.updatedAt).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

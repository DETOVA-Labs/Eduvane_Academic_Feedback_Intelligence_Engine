/**
 * Overview: ChatThread.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { ConversationMessage } from "../types";

interface ChatThreadProps {
  messages: ConversationMessage[];
  isThinking: boolean;
}

export function ChatThread({ messages, isThinking }: ChatThreadProps) {
  return (
    <section className="chat-thread" aria-live="polite">
      {messages.length === 0 && (
        <div className="empty-chat">
          <p>Share student work or ask for guided practice when ready.</p>
        </div>
      )}

      {messages.map((message) => (
        <article
          key={message.id}
          className={message.role === "assistant" ? "bubble assistant" : "bubble user"}
        >
          <p>{message.content}</p>
          <time dateTime={message.createdAt}>
            {new Date(message.createdAt).toLocaleTimeString()}
          </time>
        </article>
      ))}

      {isThinking && (
        <article className="bubble assistant thinking">
          <p>Eduvane is thinking...</p>
        </article>
      )}
    </section>
  );
}

/**
 * Overview: Dashboard.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Menu, Plus, Paperclip, Send, X, Loader2 } from 'lucide-react';
import { AIOrchestrator } from '../../services/AIOrchestrator.ts';
import { SupabaseService } from '../../services/SupabaseService.ts';
import { PracticeSet, Submission, UserProfile } from '../../types.ts';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  attachmentName?: string;
};

type WorkspaceSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

interface DashboardProps {
  userId: string;
  profile: UserProfile | null;
  submissions: Submission[];
  practiceSets: PracticeSet[];
  onSaveSubmission: (sub: Submission) => Promise<void>;
  onSavePracticeSet: (set: PracticeSet) => Promise<void>;
}

const createAssistantMessage = (content: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role: 'assistant',
  content,
  createdAt: new Date().toISOString()
});

const createUserMessage = (content: string, attachmentName?: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role: 'user',
  content,
  createdAt: new Date().toISOString(),
  attachmentName
});

export const Dashboard: React.FC<DashboardProps> = ({
  userId,
  profile,
  submissions,
  practiceSets,
  onSaveSubmission,
  onSavePracticeSet
}) => {
  const firstName = profile?.first_name?.trim();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sessions, setSessions] = useState<WorkspaceSession[]>([
    {
      id: crypto.randomUUID(),
      title: 'New Workspace',
      updatedAt: new Date().toISOString(),
      messages: [
        createAssistantMessage(
          firstName
            ? `Hi ${firstName} - I am ready when you are. Type anything or upload work to analyze.`
            : 'Hi - I am ready when you are. Type anything or upload work to analyze.'
        )
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || crypto.randomUUID());

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  const setSessionMessages = (sessionId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== sessionId) return session;
        const nextMessages = updater(session.messages);
        return {
          ...session,
          messages: nextMessages,
          updatedAt: new Date().toISOString(),
          title:
            session.messages.length <= 1
              ? nextMessages[0]?.content.slice(0, 40) || session.title
              : session.title
        };
      })
    );
  };

  const handleNewWorkspace = () => {
    const freshId = crypto.randomUUID();
    const newSession: WorkspaceSession = {
      id: freshId,
      title: 'New Workspace',
      updatedAt: new Date().toISOString(),
      messages: [
        createAssistantMessage(
          firstName
            ? `Hi ${firstName} - start a prompt or upload a file.`
            : 'Start a prompt or upload a file.'
        )
      ]
    };
    setSessions((current) => [newSession, ...current]);
    setActiveSessionId(freshId);
    setSidebarOpen(false);
  };

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = reader.result as string;
        resolve((raw.split(',')[1] || '').trim());
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeSession || isSending) return;
    if (!inputText.trim() && !selectedFile) return;

    const userText = inputText.trim() || 'Please analyze this uploaded work.';
    const userMessage = createUserMessage(userText, selectedFile?.name);
    const currentSessionId = activeSession.id;

    setSessionMessages(currentSessionId, (messages) => [...messages, userMessage]);
    setInputText('');
    setSelectedFile(null);
    setIsSending(true);

    try {
      if (selectedFile) {
        const mimeType = selectedFile.type || 'image/jpeg';
        const base64 = await fileToBase64(selectedFile);
        const imageUrl = await SupabaseService.storage.upload(userId, base64);
        const analysis = await AIOrchestrator.evaluateWorkFlow(base64, mimeType);
        const submission: Submission = {
          ...analysis,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          imageUrl
        };
        await onSaveSubmission(submission);
        const assistantReply = createAssistantMessage(
          `${analysis.feedback}\n\nNext steps:\n${analysis.improvementSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`
        );
        setSessionMessages(currentSessionId, (messages) => [...messages, assistantReply]);
        return;
      }

      const intent = await AIOrchestrator.interpretation.parseIntent(userText);
      if (intent.intent === 'PRACTICE') {
        const questions = await AIOrchestrator.generatePracticeFlow(userText);
        const newSet: PracticeSet = {
          id: `SET-${Date.now()}`,
          subject: intent.subject || 'Academic',
          topic: intent.topic || intent.subject || 'Practice',
          difficulty: 'Dynamic',
          questions,
          timestamp: new Date().toISOString()
        };
        await onSavePracticeSet(newSet);
        const assistantReply = createAssistantMessage(
          `Generated ${questions.length} practice questions for ${newSet.topic}:\n\n${questions
            .map((question, index) => `${index + 1}. ${question.text}`)
            .join('\n')}`
        );
        setSessionMessages(currentSessionId, (messages) => [...messages, assistantReply]);
      } else if (intent.intent === 'HISTORY') {
        const assistantReply = createAssistantMessage(
          `You currently have ${submissions.length} submission review(s) and ${practiceSets.length} saved practice set(s).`
        );
        setSessionMessages(currentSessionId, (messages) => [...messages, assistantReply]);
      } else {
        const assistantReply = createAssistantMessage(
          'I can help you analyze student work, generate targeted questions, or summarize your workspace history. Upload a file or ask directly.'
        );
        setSessionMessages(currentSessionId, (messages) => [...messages, assistantReply]);
      }
    } catch (error) {
      setSessionMessages(currentSessionId, (messages) => [
        ...messages,
        createAssistantMessage('I could not complete that request right now. Please try again.')
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 gap-4 md:gap-6">
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static inset-y-0 left-0 z-40 w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200`}
      >
        <div className="h-full flex flex-col p-4">
          <button
            type="button"
            onClick={handleNewWorkspace}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] text-white py-3 font-bold text-sm hover:bg-[#152a46] transition-colors"
          >
            <Plus size={16} />
            New Workspace
          </button>

          <div className="mt-4 space-y-2 overflow-y-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(session.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left rounded-xl px-3 py-3 border transition-colors ${
                  session.id === activeSessionId
                    ? 'border-[#1FA2A6] bg-[#1FA2A6]/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-[#1FA2A6]/50'
                }`}
              >
                <p className="text-sm font-semibold text-[#1E3A5F] dark:text-slate-100 truncate">{session.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {new Date(session.updatedAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <section className="flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 pb-3">
          <button
            type="button"
            className="md:hidden inline-flex items-center gap-2 text-xs font-bold text-slate-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={16} />
            Workspaces
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-y-contain px-1">
          <div className="max-w-3xl mx-auto py-3 space-y-4">
            {activeSession?.messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#1E3A5F] text-white ml-6'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1E3A5F] dark:text-slate-100 mr-6'
                }`}
              >
                {message.attachmentName && (
                  <p className="text-[11px] mb-1 opacity-80">Attached: {message.attachmentName}</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="shrink-0 pt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#F7F9FC] via-[#F7F9FC]/95 to-transparent dark:from-slate-950 dark:via-slate-950/95">
          <form
            onSubmit={handleSend}
            className="max-w-3xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-2 flex items-end gap-2"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-[#1FA2A6] transition-colors"
            >
              <Paperclip size={16} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />

            <div className="flex-1">
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="truncate">Attached: {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="h-5 w-5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <input
                type="text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="Type anything, or upload work to analyze."
                className="w-full h-10 bg-transparent px-2 outline-none text-sm text-[#1E3A5F] dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !selectedFile)}
              className="h-10 w-10 shrink-0 rounded-xl bg-[#1FA2A6] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#188b8e] transition-colors"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

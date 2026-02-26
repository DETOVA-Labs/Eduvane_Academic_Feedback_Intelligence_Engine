import { FormEvent, useMemo, useRef, useState } from "react";

interface ChatComposerProps {
  disabled: boolean;
  onSubmit: (message: string, files: File[]) => Promise<void>;
}

export function ChatComposer({ disabled, onSubmit }: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSend = useMemo(
    () => !disabled && (message.trim().length > 0 || files.length > 0),
    [disabled, message, files.length]
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    await onSubmit(message.trim(), files);
    setMessage("");
    setFiles([]);
  };

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer-input-wrap">
        <button
          className="upload-button"
          type="button"
          aria-label="Upload work"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </button>
        <textarea
          className="composer-input"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={disabled}
          rows={2}
          placeholder="Describe what you want reviewed or ask for guided practice."
        />
        <button className="send-button" type="submit" disabled={!canSend}>
          Send
        </button>
      </div>

      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={(event) => setFiles(Array.from(event.target.files || []))}
      />

      {files.length > 0 && (
        <ul className="upload-list">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </form>
  );
}

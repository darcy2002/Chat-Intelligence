import { useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

type Props = {
  onSend: (content: string) => void;
  disabled: boolean;
};

export default function InputBox({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="py-4">
      <div
        className="glass-input flex items-end gap-3 rounded-2xl px-4 py-3 focus-within:border-accent transition-colors"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask me anything…"
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm t-text placeholder:t-text-muted focus:outline-none leading-relaxed disabled:opacity-50"
          style={{ color: "var(--text)" }}
        />
        <button
          onClick={submit}
          disabled={!canSend}
          title="Send message"
          aria-label="Send message"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center disabled:opacity-35 transition-opacity"
        >
          <ArrowUp size={16} color="white" strokeWidth={2.5} />
        </button>
      </div>
      <p className="text-center text-[11px] t-text-muted mt-2">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}

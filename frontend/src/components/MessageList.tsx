import { useEffect, useRef } from "react";
import type { UIMessage } from "./ChatContainer";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

type Props = {
  messages: UIMessage[];
  loading: boolean;
  error: string | null;
  showInsights: boolean;
};

export default function MessageList({ messages, loading, error, showInsights }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-full min-h-[160px]">
          <p className="text-sm text-zinc-400 text-center">
            Start the conversation by typing a message below.
          </p>
        </div>
      )}

      {messages.map((m, i) => (
        <MessageItem key={i} message={m} showInsights={showInsights} />
      ))}

      {loading && <TypingIndicator />}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

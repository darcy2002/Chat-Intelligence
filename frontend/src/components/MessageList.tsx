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
    <div className="flex-1 overflow-y-auto py-4 space-y-3">
      {messages.length === 0 && !loading && (
        <div className="text-center text-gray-400 text-sm mt-8">
          Send a message to start the conversation.
        </div>
      )}
      {messages.map((m, i) => (
        <MessageItem key={i} message={m} showInsights={showInsights} />
      ))}
      {loading && <TypingIndicator />}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

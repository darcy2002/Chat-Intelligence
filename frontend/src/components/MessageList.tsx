import { useEffect, useRef } from "react";
import type { UIMessage } from "./ChatContainer";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";
import PulseLogo from "./PulseLogo";

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
    <div className="flex-1 overflow-y-auto py-6 space-y-6 flex flex-col">
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[240px] gap-4 text-center px-6">
          <PulseLogo size={56} />
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold t-text">Hi there 👋</p>
            <p className="text-base t-text">How can I help you today?</p>
          </div>
          <p className="text-sm t-text-muted max-w-xs">
            Ask me anything — I'll reply and classify the intent and sentiment of your message.
          </p>
        </div>
      )}

      {messages.map((m, i) => (
        <MessageItem key={i} message={m} showInsights={showInsights} />
      ))}

      {loading && <TypingIndicator />}

      {error && (
        <div className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

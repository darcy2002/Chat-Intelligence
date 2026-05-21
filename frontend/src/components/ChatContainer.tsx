import { useState } from "react";
import type { Insights, Message } from "../types";
import { sendMessage } from "../api/chat";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import InsightsPanel from "./InsightsPanel";

export type UIMessage = Message & { id: string; insights?: Insights; timestamp: Date };

type Props = {
  showInsights: boolean;
  showPanel: boolean;
  onClosePanel: () => void;
};

export default function ChatContainer({ showInsights, showPanel, onClosePanel }: Props) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(content: string) {
    const userMessage: UIMessage = { id: crypto.randomUUID(), role: "user", content, timestamp: new Date() };
    const historyToSend: Message[] = messages.map(({ role, content }) => ({ role, content }));
    const indexOfUserMessage = messages.length;

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const res = await sendMessage({ message: content, history: historyToSend });
      setMessages((prev) => {
        const next = [...prev];
        if (next[indexOfUserMessage]) {
          next[indexOfUserMessage] = { ...next[indexOfUserMessage], insights: res.insights };
        }
        next.push({ id: crypto.randomUUID(), role: "assistant", content: res.reply, timestamp: new Date() });
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Chat column — fills available space, content capped + centered inside */}
      <section className="flex-1 flex justify-center px-4 min-w-0">
        <div className="flex flex-col w-full max-w-[760px] min-h-0">
          <MessageList
            messages={messages}
            loading={loading}
            error={error}
            showInsights={showInsights}
          />
          <InputBox onSend={handleSend} disabled={loading} />
        </div>
      </section>

      {/* Desktop panel — docked to right edge */}
      {showPanel && (
        <aside className="hidden lg:flex py-4 pr-4 flex-shrink-0">
          <InsightsPanel messages={messages} onClose={onClosePanel} />
        </aside>
      )}

      {/* Mobile panel — overlay with backdrop */}
      {showPanel && (
        <div
          className="lg:hidden fixed inset-0 z-20 flex justify-end"
          onClick={onClosePanel}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-[min(380px,100vw)] h-full p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <InsightsPanel messages={messages} onClose={onClosePanel} />
          </div>
        </div>
      )}
    </div>
  );
}

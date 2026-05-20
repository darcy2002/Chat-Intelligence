import { useState } from "react";
import type { Insights, Message } from "../types";
import { sendMessage } from "../api/chat";
import MessageList from "./MessageList";
import InputBox from "./InputBox";

export type UIMessage = Message & { insights?: Insights };

type Props = {
  showInsights: boolean;
};

export default function ChatContainer({ showInsights }: Props) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(content: string) {
    const userMessage: UIMessage = { role: "user", content };
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
        next.push({ role: "assistant", content: res.reply });
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        showInsights={showInsights}
      />
      <InputBox onSend={handleSend} disabled={loading} />
    </div>
  );
}

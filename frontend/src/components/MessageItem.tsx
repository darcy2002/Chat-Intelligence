import { User, Bot } from "lucide-react";
import type { Sentiment } from "../types";
import type { UIMessage } from "./ChatContainer";

type Props = {
  message: UIMessage;
  showInsights: boolean;
};

function sentimentChip(s: Sentiment): string {
  if (s === "positive") return "chip-pos";
  if (s === "negative") return "chip-neg";
  return "chip-neu";
}

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageItem({ message, showInsights }: Props) {
  const isUser = message.role === "user";

  const avatar = isUser ? (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
      <User size={15} color="white" strokeWidth={2} />
    </div>
  ) : (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
      <Bot size={15} color="white" strokeWidth={2} />
    </div>
  );

  const senderName = isUser ? "You" : "Pulse";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {avatar}

      <div
        className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Sender + time */}
        <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs font-semibold t-text">{senderName}</span>
          <span className="text-[11px] t-text-muted">{fmt(message.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words t-text ${
            isUser ? "glass-bubble-user" : "glass-bubble-ai"
          }`}
        >
          {message.content}
        </div>

        {/* Insight chips */}
        {isUser && showInsights && message.insights && (
          <div className="flex gap-2.5 flex-wrap">
            <span className="chip-intent inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full">
              <span className="chip-dot" />
              {message.insights.intent}
            </span>
            <span
              className={`${sentimentChip(message.insights.sentiment)} inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full`}
            >
              <span className="chip-dot" />
              {message.insights.sentiment}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

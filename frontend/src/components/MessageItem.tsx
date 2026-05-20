import type { Sentiment } from "../types";
import type { UIMessage } from "./ChatContainer";

type Props = {
  message: UIMessage;
  showInsights: boolean;
};

function sentimentBg(s: Sentiment): string {
  if (s === "positive") return "bg-sentiment-positive";
  if (s === "negative") return "bg-sentiment-negative";
  return "bg-sentiment-neutral";
}

export default function MessageItem({ message, showInsights }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm shadow-xs"
        }`}
      >
        {message.content}
      </div>

      {isUser && showInsights && message.insights && (
        <div className="flex gap-1.5 flex-wrap">
          <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-intent text-white">
            {message.insights.intent}
          </span>
          <span
            className={`inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full text-white ${sentimentBg(
              message.insights.sentiment
            )}`}
          >
            {message.insights.sentiment}
          </span>
        </div>
      )}
    </div>
  );
}

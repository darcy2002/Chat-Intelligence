import type { Sentiment } from "../types";
import type { UIMessage } from "./ChatContainer";

type Props = {
  message: UIMessage;
  showInsights: boolean;
};

function sentimentClass(s: Sentiment): string {
  if (s === "positive") return "bg-sentiment-positive";
  if (s === "negative") return "bg-sentiment-negative";
  return "bg-sentiment-neutral";
}

export default function MessageItem({ message, showInsights }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        {message.content}
      </div>
      {isUser && showInsights && message.insights && (
        <div className="mt-1 flex gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-intent text-white">
            {message.insights.intent}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${sentimentClass(message.insights.sentiment)}`}>
            {message.insights.sentiment}
          </span>
        </div>
      )}
    </div>
  );
}

import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
        <Bot size={15} color="white" strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold t-text">Pulse</span>
        <div className="glass-bubble-ai rounded-2xl px-4 py-3 flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full t-text-muted animate-bounce"
              style={{ backgroundColor: "var(--text-muted)", animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

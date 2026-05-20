import { X } from "lucide-react";
import type { Sentiment } from "../types";
import type { UIMessage } from "./ChatContainer";

type Props = {
  messages: UIMessage[];
  onClose: () => void;
};

type SentCounts = Record<Sentiment, number>;

function computeStats(messages: UIMessage[]) {
  const classified = messages.filter((m) => m.role === "user" && m.insights);
  const total = classified.length;

  const sentiment: SentCounts = { positive: 0, neutral: 0, negative: 0 };
  const intents = new Map<string, number>();

  for (const m of classified) {
    const s = m.insights!.sentiment;
    sentiment[s] += 1;
    const intent = m.insights!.intent;
    intents.set(intent, (intents.get(intent) ?? 0) + 1);
  }

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  let mood: "Positive" | "Neutral" | "Negative" | "—" = "—";
  if (total > 0) {
    const max = Math.max(sentiment.positive, sentiment.neutral, sentiment.negative);
    if (max === sentiment.positive) mood = "Positive";
    else if (max === sentiment.negative) mood = "Negative";
    else mood = "Neutral";
  }

  const intentList = [...intents.entries()].sort((a, b) => b[1] - a[1]);

  return {
    total,
    sentiment,
    pct: {
      positive: pct(sentiment.positive),
      neutral: pct(sentiment.neutral),
      negative: pct(sentiment.negative),
    },
    mood,
    intentList,
  };
}

function StatCard({
  label,
  value,
  chipClass,
}: {
  label: string;
  value: number | string;
  chipClass?: string;
}) {
  return (
    <div className="glass-bubble-ai rounded-xl px-4 py-3 flex flex-col gap-1">
      <span className="text-2xl font-bold t-text leading-none">{value}</span>
      <span className={`text-xs font-medium ${chipClass ?? "t-text-muted"}`}>{label}</span>
    </div>
  );
}

export default function InsightsPanel({ messages, onClose }: Props) {
  const stats = computeStats(messages);

  return (
    <aside
      className="glass-panel rounded-2xl flex flex-col gap-5 p-5 w-full sm:w-[360px] flex-shrink-0 overflow-y-auto"
      aria-label="Insights panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-base font-bold t-text">Insights</span>
          <span className="text-xs t-text-muted">Live from this conversation</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center t-text-muted hover:opacity-70 transition-opacity"
          aria-label="Close insights panel"
          title="Close insights panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Empty state */}
      {stats.total === 0 ? (
        <div className="glass-bubble-ai rounded-xl px-4 py-6 text-center">
          <p className="text-sm t-text-muted">
            Send a message to see real-time sentiment and intent stats here.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Total messages" value={stats.total} />
            <StatCard
              label="Positive"
              value={stats.sentiment.positive}
              chipClass="text-green-600 dark:text-green-400"
            />
            <StatCard
              label="Neutral"
              value={stats.sentiment.neutral}
              chipClass="t-text-muted"
            />
            <StatCard
              label="Negative"
              value={stats.sentiment.negative}
              chipClass="text-red-600 dark:text-red-400"
            />
          </div>

          {/* Overall mood */}
          <div className="glass-bubble-ai rounded-xl px-4 py-3">
            <div className="text-xs t-text-muted mb-1">Overall mood</div>
            <div className="text-lg font-bold t-text">{stats.mood}</div>
          </div>

          {/* Sentiment distribution */}
          <div>
            <div className="text-xs t-text-muted mb-2">Sentiment distribution</div>
            <div className="flex w-full h-2.5 rounded-full overflow-hidden glass-bubble-ai">
              {stats.pct.positive > 0 && (
                <div
                  style={{
                    width: `${stats.pct.positive}%`,
                    backgroundColor: "var(--chip-pos-dot)",
                  }}
                  title={`Positive ${stats.pct.positive}%`}
                />
              )}
              {stats.pct.neutral > 0 && (
                <div
                  style={{
                    width: `${stats.pct.neutral}%`,
                    backgroundColor: "var(--chip-neu-dot)",
                  }}
                  title={`Neutral ${stats.pct.neutral}%`}
                />
              )}
              {stats.pct.negative > 0 && (
                <div
                  style={{
                    width: `${stats.pct.negative}%`,
                    backgroundColor: "var(--chip-neg-dot)",
                  }}
                  title={`Negative ${stats.pct.negative}%`}
                />
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="flex items-center gap-1.5 t-text-muted">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--chip-pos-dot)" }}
                />
                {stats.pct.positive}%
              </span>
              <span className="flex items-center gap-1.5 t-text-muted">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--chip-neu-dot)" }}
                />
                {stats.pct.neutral}%
              </span>
              <span className="flex items-center gap-1.5 t-text-muted">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--chip-neg-dot)" }}
                />
                {stats.pct.negative}%
              </span>
            </div>
          </div>

          {/* Intent breakdown */}
          <div>
            <div className="text-xs t-text-muted mb-2">Intent breakdown</div>
            <ul className="flex flex-col gap-1.5">
              {stats.intentList.map(([intent, count]) => {
                const maxCount = stats.intentList[0][1];
                const width = Math.round((count / maxCount) * 100);
                return (
                  <li key={intent} className="flex items-center gap-3 text-sm">
                    <span className="capitalize t-text flex-shrink-0 w-24">{intent}</span>
                    <div className="flex-1 h-1.5 rounded-full glass-bubble-ai overflow-hidden">
                      <div
                        style={{
                          width: `${width}%`,
                          backgroundColor: "var(--chip-intent-dot)",
                        }}
                        className="h-full"
                      />
                    </div>
                    <span className="t-text-muted text-xs font-medium tabular-nums w-6 text-right">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
}

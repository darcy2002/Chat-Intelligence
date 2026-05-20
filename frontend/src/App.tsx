import { useState } from "react";
import ChatContainer from "./components/ChatContainer";
import PulseLogo from "./components/PulseLogo";

export default function App() {
  const [showInsights, setShowInsights] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <PulseLogo size={36} />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-zinc-900">Pulse</span>
            <span className="text-xs text-zinc-500">Conversation Intelligence</span>
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <span className="text-sm text-zinc-600">Show insights</span>
          <button
            role="switch"
            aria-checked={showInsights}
            onClick={() => setShowInsights((v) => !v)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              showInsights ? "bg-indigo-600" : "bg-zinc-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                showInsights ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </label>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-[768px] mx-auto px-4 py-4 min-h-0">
        <ChatContainer showInsights={showInsights} />
      </main>
    </div>
  );
}

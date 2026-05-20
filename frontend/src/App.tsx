import { useState } from "react";
import ChatContainer from "./components/ChatContainer";

export default function App() {
  const [showInsights, setShowInsights] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Conversation Intelligence</h1>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <span>Show insights</span>
          <input
            type="checkbox"
            checked={showInsights}
            onChange={(e) => setShowInsights(e.target.checked)}
            className="h-4 w-4"
          />
        </label>
      </header>
      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-4">
        <ChatContainer showInsights={showInsights} />
      </main>
    </div>
  );
}

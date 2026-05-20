import { useEffect, useState } from "react";
import { Sun, Moon, BarChart3 } from "lucide-react";
import ChatContainer from "./components/ChatContainer";
import PulseLogo from "./components/PulseLogo";

const THEME_KEY = "pulse-theme";

export default function App() {
  const [showInsights, setShowInsights] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "dark") return true;
      if (stored === "light") return false;
    } catch {
      // ignore (private mode, etc.)
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  // Close the insights panel when global insights are turned off.
  useEffect(() => {
    if (!showInsights) setShowPanel(false);
  }, [showInsights]);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="t-bg min-h-screen flex flex-col transition-colors duration-200"
    >
      {/* ── Header ── */}
      <header
        className="t-surface t-border border-b flex items-center justify-between px-5 py-3"
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        <div className="flex items-center gap-3">
          <PulseLogo size={34} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold t-text">Pulse</span>
            <span className="text-[11px] t-text-muted">Conversation Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Insights panel toggle — only available when insights are on */}
          {showInsights && (
            <button
              onClick={() => setShowPanel((v) => !v)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-opacity ${
                showPanel
                  ? "bg-accent text-white"
                  : "t-surface-2 t-text-muted hover:opacity-80"
              }`}
              aria-label={showPanel ? "Hide insights panel" : "Show insights panel"}
              title={showPanel ? "Hide insights panel" : "Show insights panel"}
              aria-pressed={showPanel}
            >
              <BarChart3 size={16} />
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full t-surface-2 t-text-muted hover:opacity-80 transition-opacity"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Show insights toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs t-text-muted">Show insights</span>
            <button
              role="switch"
              aria-checked={showInsights}
              title={showInsights ? "Hide insights" : "Show insights"}
              onClick={() => setShowInsights((v) => !v)}
              className={`relative inline-flex h-[26px] w-[46px] flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                showInsights ? "bg-accent" : "t-surface-2"
              }`}
            >
              <span
                className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showInsights ? "translate-x-[23px]" : "translate-x-[3px]"
                }`}
              />
            </button>
          </label>
        </div>
      </header>

      {/* ── Chat ── */}
      <main className="flex-1 flex flex-col w-full min-h-0">
        <ChatContainer
          showInsights={showInsights}
          showPanel={showPanel}
          onClosePanel={() => setShowPanel(false)}
        />
      </main>
    </div>
  );
}

import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";
import { claudeProvider } from "./claude.js";

let cached: LLMProvider | null = null;

export function getProvider(): LLMProvider {
  if (cached) return cached;

  const choice = (process.env.LLM_PROVIDER ?? "logic").toLowerCase();

  switch (choice) {
    case "logic":
      cached = logicProvider;
      break;
    case "claude":
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('LLM_PROVIDER="claude" but ANTHROPIC_API_KEY is missing; falling back to logic.');
        cached = logicProvider;
      } else {
        cached = claudeProvider;
      }
      break;
    case "openai":
    case "grok":
      console.warn(`LLM_PROVIDER="${choice}" not yet implemented; falling back to logic.`);
      cached = logicProvider;
      break;
    default:
      console.warn(`Unknown LLM_PROVIDER="${choice}"; falling back to logic.`);
      cached = logicProvider;
  }

  console.log(`[llm] using provider: ${cached.name}`);
  return cached;
}

import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";

let cached: LLMProvider | null = null;

export function getProvider(): LLMProvider {
  if (cached) return cached;

  const choice = (process.env.LLM_PROVIDER ?? "logic").toLowerCase();

  switch (choice) {
    case "logic":
      cached = logicProvider;
      break;
    case "claude":
    case "openai":
    case "grok":
      console.warn(`LLM_PROVIDER="${choice}" not yet implemented; falling back to logic.`);
      cached = logicProvider;
      break;
    default:
      console.warn(`Unknown LLM_PROVIDER="${choice}"; falling back to logic.`);
      cached = logicProvider;
  }

  return cached;
}

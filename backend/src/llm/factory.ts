import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";
import { claudeProvider } from "./claude.js";
import { openaiProvider } from "./openai.js";
import { grokProvider } from "./grok.js";
import { groqProvider } from "./groq.js";

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
      if (!process.env.OPENAI_API_KEY) {
        console.warn('LLM_PROVIDER="openai" but OPENAI_API_KEY is missing; falling back to logic.');
        cached = logicProvider;
      } else {
        cached = openaiProvider;
      }
      break;
    case "grok":
      if (!process.env.XAI_API_KEY) {
        console.warn('LLM_PROVIDER="grok" but XAI_API_KEY is missing; falling back to logic.');
        cached = logicProvider;
      } else {
        cached = grokProvider;
      }
      break;
    case "groq":
      if (!process.env.GROQ_API_KEY) {
        console.warn('LLM_PROVIDER="groq" but GROQ_API_KEY is missing; falling back to logic.');
        cached = logicProvider;
      } else {
        cached = groqProvider;
      }
      break;
    default:
      console.warn(`Unknown LLM_PROVIDER="${choice}"; falling back to logic.`);
      cached = logicProvider;
  }

  console.log(`[llm] using provider: ${cached.name}`);
  return cached;
}

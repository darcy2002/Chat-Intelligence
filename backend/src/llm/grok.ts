import { createOpenAICompatibleProvider } from "./openai-compatible.js";

export const grokProvider = createOpenAICompatibleProvider({
  name: "grok",
  model: "grok-4.3",
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

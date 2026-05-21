import { createOpenAICompatibleProvider } from "./openai-compatible.js";

// meta-llama/llama-4-scout-17b-16e-instruct is listed under Groq's structured-outputs supported models
export const groqProvider = createOpenAICompatibleProvider({
  name: "groq",
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

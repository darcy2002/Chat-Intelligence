import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { Message } from "../shared/types.js";
import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";
import { ChatOutputSchema, SYSTEM_PROMPT } from "./shared.js";

// meta-llama/llama-4-scout-17b-16e-instruct is listed under Groq's structured-outputs supported models
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const BASE_URL = "https://api.groq.com/openai/v1";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: BASE_URL,
    });
  }
  return client;
}

function tryParseJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export const groqProvider: LLMProvider = {
  name: "groq",
  async chat(message: string, history: Message[]) {
    try {
      // Preferred path: structured outputs
      try {
        const completion = await getClient().chat.completions.parse({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user" as const, content: message },
          ],
          response_format: zodResponseFormat(ChatOutputSchema, "chat_output"),
        });

        const parsed = completion.choices[0]?.message.parsed;
        if (parsed) {
          return {
            reply: parsed.reply,
            insights: { intent: parsed.intent, sentiment: parsed.sentiment },
          };
        }
        throw new Error("Groq returned no parsed message");
      } catch (structuredErr) {
        console.warn(
          `[groq] structured outputs failed (${
            structuredErr instanceof Error ? structuredErr.message : String(structuredErr)
          }); retrying with prompt-based JSON.`
        );

        const completion = await getClient().chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_PROMPT}\n\nRespond ONLY with a single JSON object matching this shape: {"reply": string, "intent": one of [complaint, query, request, appreciation, feedback, greeting, other], "sentiment": one of [positive, neutral, negative]}. No prose, no code fences.`,
            },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user" as const, content: message },
          ],
        });

        const text = completion.choices[0]?.message.content ?? "";
        const obj = tryParseJson(text);
        const parsed = ChatOutputSchema.parse(obj);

        return {
          reply: parsed.reply,
          insights: { intent: parsed.intent, sentiment: parsed.sentiment },
        };
      }
    } catch (err) {
      console.error(
        `[groq] error, falling back to logic: ${err instanceof Error ? err.message : String(err)}`
      );
      return logicProvider.chat(message, history);
    }
  },
};

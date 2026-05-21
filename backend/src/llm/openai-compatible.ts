import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { Message } from "../shared/types.js";
import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";
import { ChatOutputSchema, SYSTEM_PROMPT } from "./shared.js";

const FALLBACK_SYSTEM_PROMPT =
  `${SYSTEM_PROMPT}\n\nRespond ONLY with a single JSON object matching this shape: ` +
  `{"reply": string, "intent": one of [complaint, query, request, appreciation, feedback, greeting, other], ` +
  `"sentiment": one of [positive, neutral, negative]}. No prose, no code fences.`;

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

interface OpenAICompatibleConfig {
  name: string;
  model: string;
  baseURL: string;
  apiKey: string | undefined;
}

export function createOpenAICompatibleProvider(config: OpenAICompatibleConfig): LLMProvider {
  const { name, model, baseURL, apiKey } = config;
  let client: OpenAI | null = null;

  function getClient(): OpenAI {
    if (!client) {
      client = new OpenAI({ apiKey, baseURL });
    }
    return client;
  }

  return {
    name,
    async chat(message: string, history: Message[]) {
      const messages = [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ];

      try {
        try {
          const completion = await getClient().chat.completions.parse({
            model,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            response_format: zodResponseFormat(ChatOutputSchema, "chat_output"),
          });

          const parsed = completion.choices[0]?.message.parsed;
          if (parsed) {
            return {
              reply: parsed.reply,
              insights: { intent: parsed.intent, sentiment: parsed.sentiment },
            };
          }
          throw new Error(`${name} returned no parsed message`);
        } catch (structuredErr) {
          console.warn(
            `[${name}] structured outputs failed (${
              structuredErr instanceof Error ? structuredErr.message : String(structuredErr)
            }); retrying with prompt-based JSON.`
          );

          const completion = await getClient().chat.completions.create({
            model,
            messages: [{ role: "system", content: FALLBACK_SYSTEM_PROMPT }, ...messages],
          });

          const text = completion.choices[0]?.message.content ?? "";
          const parsed = ChatOutputSchema.parse(tryParseJson(text));
          return {
            reply: parsed.reply,
            insights: { intent: parsed.intent, sentiment: parsed.sentiment },
          };
        }
      } catch (err) {
        console.error(
          `[${name}] error, falling back to logic: ${err instanceof Error ? err.message : String(err)}`
        );
        return logicProvider.chat(message, history);
      }
    },
  };
}

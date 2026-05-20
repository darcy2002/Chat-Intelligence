import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { Message } from "../shared/types.js";
import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";
import { ChatOutputSchema, SYSTEM_PROMPT } from "./shared.js";

const MODEL = "gpt-5.4-mini";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI();
  return client;
}

export const openaiProvider: LLMProvider = {
  name: "openai",
  async chat(message: string, history: Message[]) {
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
      if (!parsed) throw new Error("OpenAI returned no parsed message");

      return {
        reply: parsed.reply,
        insights: { intent: parsed.intent, sentiment: parsed.sentiment },
      };
    } catch (err) {
      console.error(
        `[openai] error, falling back to logic: ${err instanceof Error ? err.message : String(err)}`
      );
      return logicProvider.chat(message, history);
    }
  },
};

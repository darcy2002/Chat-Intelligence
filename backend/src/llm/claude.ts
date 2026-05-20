import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Message } from "../shared/types.js";
import type { LLMProvider } from "./types.js";
import { logicProvider } from "./logic.js";
import { ChatOutputSchema, SYSTEM_PROMPT } from "./shared.js";

const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export const claudeProvider: LLMProvider = {
  name: "claude",
  async chat(message: string, history: Message[]) {
    try {
      const response = await getClient().messages.parse({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: message },
        ],
        output_config: {
          format: zodOutputFormat(ChatOutputSchema),
        },
      });

      const parsed = response.parsed_output;
      if (!parsed) throw new Error("Claude returned no parsed_output");

      return {
        reply: parsed.reply,
        insights: { intent: parsed.intent, sentiment: parsed.sentiment },
      };
    } catch (err) {
      console.error(
        `[claude] error, falling back to logic: ${err instanceof Error ? err.message : String(err)}`
      );
      return logicProvider.chat(message, history);
    }
  },
};

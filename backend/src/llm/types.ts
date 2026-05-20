import type { Insights, Message } from "../shared/types.js";

export interface LLMProvider {
  name: string;
  chat(
    message: string,
    history: Message[]
  ): Promise<{
    reply: string;
    insights: Insights;
  }>;
}

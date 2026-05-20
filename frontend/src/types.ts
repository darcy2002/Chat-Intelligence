// Duplicated intentionally in frontend/src/types.ts and backend/src/shared/types.ts.
// Two type files do not justify a shared package.

export type Role = "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type Sentiment = "positive" | "neutral" | "negative";

export type Insights = {
  intent: string;
  sentiment: Sentiment;
};

export type ChatRequest = {
  message: string;
  history: Message[];
};

export type ChatResponse = {
  reply: string;
  insights: Insights;
};

export type ChatError = {
  error: string;
};

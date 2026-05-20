import type { Insights, Message, Sentiment } from "../shared/types.js";
import type { LLMProvider } from "./types.js";

type Intent =
  | "complaint"
  | "appreciation"
  | "request"
  | "query"
  | "greeting"
  | "feedback"
  | "other";

const INTENT_PATTERNS: Array<{ intent: Intent; pattern: RegExp }> = [
  { intent: "appreciation", pattern: /\b(thank|thanks|great|amazing|love|perfect|awesome|impressed|excellent)\b/i },
  { intent: "complaint", pattern: /\b(problem|issue|trouble|disappoint|fail|failed|broken|error|wrong|bad|terrible|awful|never)\b/i },
  { intent: "greeting", pattern: /^\s*(hi|hello|hey|good morning|good evening|good afternoon)\b/i },
  { intent: "request", pattern: /\b(can you|could you|please|help|want|need|enable|add|would like)\b/i },
  { intent: "feedback", pattern: /\b(suggest|suggestion|think|better|improve|feedback|opinion)\b/i },
  { intent: "query", pattern: /(^\s*(what|how|when|where|why|which|who)\b|\?\s*$)/i },
];

const POSITIVE_PATTERN = /\b(thank|thanks|great|amazing|love|perfect|awesome|impressed|excellent|happy|good|nice)\b/i;
const NEGATIVE_PATTERN = /\b(problem|issue|trouble|disappoint|fail|failed|broken|error|wrong|bad|terrible|awful|never|hate|angry|upset)\b/i;

const REPLY_TEMPLATES: Record<Intent, string[]> = {
  complaint: [
    "I'm sorry to hear you're having trouble. Could you share a bit more about what went wrong?",
    "That sounds frustrating — I'd like to help. Can you describe the issue in more detail?",
  ],
  appreciation: [
    "Thank you — that's really kind of you to say!",
    "I appreciate that! Let me know if there's anything else I can help with.",
  ],
  request: [
    "Happy to help. Could you give me a bit more detail about what you're looking for?",
    "Sure — tell me a little more and I'll do my best.",
  ],
  query: [
    "Good question. Based on what you've shared, here's what I'd consider…",
    "Let me think about that. Could you share any extra context that might be relevant?",
  ],
  greeting: [
    "Hi there! How can I help you today?",
    "Hello! What can I do for you?",
  ],
  feedback: [
    "Thanks for the feedback — I'd love to hear more about what you'd improve.",
    "Appreciate you sharing that. What would the ideal experience look like for you?",
  ],
  other: [
    "Got it. Could you tell me a bit more so I can help?",
    "Thanks for sharing. What would you like to do next?",
  ],
};

function classifyIntent(message: string): Intent {
  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(message)) return intent;
  }
  return "other";
}

function classifySentiment(message: string, intent: Intent): Sentiment {
  if (intent === "appreciation") return "positive";
  if (intent === "complaint") return "negative";
  if (NEGATIVE_PATTERN.test(message)) return "negative";
  if (POSITIVE_PATTERN.test(message)) return "positive";
  return "neutral";
}

function pickReply(intent: Intent, message: string): string {
  const templates = REPLY_TEMPLATES[intent];
  const idx = Math.abs(hash(message)) % templates.length;
  return templates[idx];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export const logicProvider: LLMProvider = {
  name: "logic",
  async chat(message: string, _history: Message[]) {
    const intent = classifyIntent(message);
    const sentiment = classifySentiment(message, intent);
    const insights: Insights = { intent, sentiment };
    return { reply: pickReply(intent, message), insights };
  },
};

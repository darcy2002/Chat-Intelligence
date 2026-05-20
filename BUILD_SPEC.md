# Build Spec — AI Chat with Conversation Intelligence

This is the locked specification for an AI Engineer assignment submission. **Read this entire document before writing any code.** Stay strictly within scope. The brief explicitly asks for simplicity; over-engineering will be penalized.

> **All version numbers, model IDs, and API patterns below are verified current as of May 2026.** Do not "modernize" or "update" them — they are already current. If you think one is wrong, ask before changing it.

---

## What this project is

A chat interface where a user converses with an AI, and each user message is classified with `intent` and `sentiment`. Insights are shown as chips below user messages and can be toggled off via a header switch.

That is the entire scope. Anything beyond this is out of bounds.

---

## DO NOT INCLUDE

Before listing what to build, here is what NOT to build. These are explicit non-goals — do not add them even if they "would improve" the project:

- ❌ Multi-conversation sidebar, conversation list, search, history persistence
- ❌ Authentication, users, sessions, accounts
- ❌ Database, ORM, migrations
- ❌ Theme switcher, dark mode toggle, accent color customization
- ❌ Emoji picker, message reactions, voice input, file attachments
- ❌ Streaming responses (SSE, `text/event-stream`)
- ❌ WebSockets, real-time updates beyond request/response
- ❌ Confidence scores in the insights output
- ❌ Stats dashboard, analytics, charts, sentiment distribution bars
- ❌ Per-message detail cards, message editing, message deletion
- ❌ Component libraries (shadcn/ui, MUI, Chakra, Mantine, Ant Design)
- ❌ Redux, Zustand, Jotai, MobX, Recoil, React Query, SWR, TanStack Query, Context API
- ❌ Docker, docker-compose
- ❌ Monorepo tooling (turborepo, nx, lerna, npm/pnpm workspaces)
- ❌ CI/CD configs, GitHub Actions
- ❌ ESLint/Prettier configs beyond Vite defaults
- ❌ Husky, lint-staged, pre-commit hooks
- ❌ Animations beyond the typing indicator dots
- ❌ Avatars, gradients, drop shadows, glass effects
- ❌ Tailwind plugins (`@tailwindcss/forms`, `typography`, `aspect-ratio`, etc.)
- ❌ Multiple routes, React Router, navigation
- ❌ Error boundaries (one try/catch in the fetch wrapper is enough)
- ❌ Logging frameworks (winston, pino) — `console.log/error` is fine
- ❌ Rate limiting, retries with backoff, circuit breakers
- ❌ `tailwind.config.js` / `tailwind.config.ts` (Tailwind v4 is CSS-first; use `@theme` block in CSS)
- ❌ `postcss.config.js` / `autoprefixer` (`@tailwindcss/vite` handles it)
- ❌ Tests beyond the one specified below

---

## Versions & runtime requirements

Use Node.js v22 or v24. Both are LTS-current. Do not assume Node 18 or 20.

**Backend dependencies (exact versions to install):**
- `express` — install `^5.2.1` (NOT 4.x; Express 5 is current and has native async error handling)
- `@anthropic-ai/sdk` — install latest (`^0.40.0` or whatever resolves to current)
- `openai` — install latest (used for both OpenAI and Grok since Grok is OpenAI-compatible)
- `dotenv` — install latest
- `zod` — install latest (used for structured outputs schema)

**Backend dev dependencies:**
- `typescript` — install `^5.6.0` or later
- `tsx` — install latest (this replaces ts-node, nodemon, ts-node-dev; do NOT use any of those)
- `vitest` — install latest
- `@types/express`, `@types/node`

**Frontend dependencies:**
- `react` `^19.0.0`, `react-dom` `^19.0.0`

**Frontend dev dependencies:**
- `@vitejs/plugin-react` latest
- `vite` latest
- `typescript` `^5.6.0` or later
- `tailwindcss` `^4.0.0` (this is critical — v4, not v3)
- `@tailwindcss/vite` latest (this is the v4 Vite plugin, replaces PostCSS+Autoprefixer)
- `@types/react`, `@types/react-dom`

---

## LLM model IDs (verified current, May 2026)

- **Anthropic Claude:** use `claude-sonnet-4-6` (Sonnet 4.6, Feb 2026, stable, cost-effective for chat workloads). Do NOT use `claude-sonnet-4-5` (superseded), `claude-3-*` (retired), or `claude-sonnet-4-20250514` (retired). Opus 4.7 also exists but is overkill and more expensive.
- **OpenAI:** use `gpt-5.4-mini` (cost-effective with structured outputs support). `gpt-5.5` is flagship but expensive; `gpt-5.4` is the cheaper frontier tier. Avoid `gpt-4o`/`gpt-4-turbo` references in tutorials — they're superseded.
- **Grok (xAI):** use `grok-4.3` (current general-purpose model). xAI base URL is `https://api.x.ai/v1` and is OpenAI-SDK-compatible — use the `openai` package with `baseURL` override; do not install a separate xAI SDK.

If model availability changes between writing this and running, the factory's fallback to the logic provider will keep things working. Don't hardcode a "try newer model first" loop — just pick one and document it in the README.

---

## Repository structure

```
chat-intelligence/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── chat.ts
│   │   ├── components/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── InputBox.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .gitignore
├── backend/
│   ├── src/
│   │   ├── llm/
│   │   │   ├── types.ts
│   │   │   ├── factory.ts
│   │   │   ├── claude.ts
│   │   │   ├── openai.ts
│   │   │   ├── grok.ts
│   │   │   ├── logic.ts
│   │   │   └── logic.test.ts
│   │   ├── routes/
│   │   │   └── chat.ts
│   │   ├── shared/
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── README.md
└── .gitignore
```

No other files. No `docs/`, no `scripts/`, no `infra/`. No `tailwind.config.*` file.

---

## API contract

Single source of truth. Both frontend and backend use these types.

```ts
// Duplicated intentionally in frontend/src/types.ts and backend/src/shared/types.ts.
// Two type files do not justify a shared package.

export type Role = "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type Sentiment = "positive" | "neutral" | "negative";

export type Insights = {
  intent: string;       // e.g. "complaint" | "query" | "request" | "appreciation" | "greeting" | "feedback" | "other"
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
```

### Endpoint

```
POST /api/chat
Content-Type: application/json

Request body: ChatRequest
Response 200: ChatResponse
Response 400: ChatError
Response 500: ChatError
```

Backend is stateless. History sent on every request.

---

## Backend implementation

### Module system
Use ESM (`"type": "module"` in package.json) with `tsconfig.json` `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`. This is the 2026 standard. Import paths in `.ts` files should include the `.js` extension (TypeScript will resolve them correctly) — e.g. `import { foo } from './bar.js'`.

### `backend/package.json`
```json
{
  "name": "backend",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  }
}
```
Do not add nodemon, ts-node, or ts-node-dev.

### `backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `backend/src/index.ts`
Express bootstrap. Listen on `process.env.PORT || 3001`. Body parser JSON. Mount `/api/chat` route. No CORS (Vite proxies in dev; in prod they'd share an origin).

Express 5 handles async errors natively — async route handlers throwing errors are caught automatically and forwarded to the error middleware. Do NOT wrap routes in `try/catch` for the purpose of forwarding to next(err); that's a v4 idiom.

Add a final error-handling middleware:
```ts
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal error" });
});
```

### `backend/src/routes/chat.ts`
One handler. Validates `req.body` shape (manual checks; do not pull in zod for this — zod is used for the LLM schema, not request validation in this project). Calls `provider.chat(message, history)`. Returns `ChatResponse`.

### `backend/src/llm/types.ts`
```ts
export interface LLMProvider {
  name: string;
  chat(message: string, history: Message[]): Promise<{
    reply: string;
    insights: Insights;
  }>;
}
```

### `backend/src/llm/factory.ts`
Reads `process.env.LLM_PROVIDER`. Returns matching provider as a singleton. If the chosen provider's API key is missing, logs a warning and returns the logic provider. If `LLM_PROVIDER` is unset or unrecognized, returns logic.

### `backend/src/llm/claude.ts`

**Use Anthropic's GA Structured Outputs feature** (no beta header needed as of 2026). The TypeScript SDK exposes `zodOutputFormat()` for Zod schemas. Single call returns guaranteed schema-compliant JSON.

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const ChatOutputSchema = z.object({
  reply: z.string(),
  intent: z.enum(["complaint", "query", "request", "appreciation", "feedback", "greeting", "other"]),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

const client = new Anthropic();

async function chat(message: string, history: Message[]) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ],
    output_config: {
      format: zodOutputFormat(ChatOutputSchema, "chat_output"),
    },
  });

  // Response text is guaranteed valid JSON matching the schema
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = ChatOutputSchema.parse(JSON.parse(text));

  return {
    reply: parsed.reply,
    insights: { intent: parsed.intent, sentiment: parsed.sentiment },
  };
}
```

If `zodOutputFormat` import path doesn't resolve in the installed SDK version, fall back to passing `output_config.format` with a raw JSON schema:
```ts
output_config: {
  format: {
    type: "json_schema",
    schema: {
      type: "object",
      properties: {
        reply: { type: "string" },
        intent: { type: "string", enum: ["complaint", "query", "request", "appreciation", "feedback", "greeting", "other"] },
        sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
      },
      required: ["reply", "intent", "sentiment"],
      additionalProperties: false,
    },
  },
},
```

**System prompt:**
```
You are a helpful conversational assistant. Respond naturally to the user's message, using conversation history for context. Classify the user's most recent message by intent and sentiment.

Intents: complaint, query, request, appreciation, feedback, greeting, other
Sentiments: positive, neutral, negative
```

**Error fallback:** Wrap the API call in `try/catch`. On any error (network, schema refusal, JSON parse failure, schema mismatch), fall back to calling `logicProvider.chat(message, history)` and return its result. Log the error.

### `backend/src/llm/openai.ts`

Use OpenAI's `chat.completions.parse()` with `zodResponseFormat()` helper:
```ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const ChatOutputSchema = z.object({
  reply: z.string(),
  intent: z.enum([...]),
  sentiment: z.enum([...]),
});

const client = new OpenAI();

async function chat(message: string, history: Message[]) {
  const completion = await client.chat.completions.parse({
    model: "gpt-5.4-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ],
    response_format: zodResponseFormat(ChatOutputSchema, "chat_output"),
  });

  const parsed = completion.choices[0].message.parsed;
  return {
    reply: parsed.reply,
    insights: { intent: parsed.intent, sentiment: parsed.sentiment },
  };
}
```

Same fallback-to-logic on any error.

### `backend/src/llm/grok.ts`

Grok uses the **same OpenAI SDK** with a `baseURL` override and `XAI_API_KEY`. Mirrors openai.ts almost line-for-line — share the schema and prompt constants, just instantiate the client differently:

```ts
const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

// then use model: "grok-4.3"
```

Grok supports structured outputs via OpenAI compatibility. If `response_format` with zod helper doesn't work on a specific Grok endpoint, fall back to prompt-based JSON with manual `JSON.parse` and validation — same fallback-to-logic pattern on failure.

### `backend/src/llm/logic.ts`

Rule-based provider. No external API calls. Returns:
- `reply`: pick from ~6 generic but contextual templates based on detected intent
- `intent`: regex-match the message against keyword sets
- `sentiment`: regex-match positive/negative keywords, default neutral

Keyword sets (starting point):
- complaint: `problem|issue|trouble|disappoint|fail|broken|error|wrong|bad|terrible|awful|never`
- appreciation: `thank|great|amazing|love|perfect|awesome|impressed|excellent`
- request: `can you|please|help|want|need|enable|add|would like`
- query: `^(what|how|when|where|why|which|who)|\?$`
- greeting: `^(hi|hello|hey|good morning|good evening)`
- feedback: `suggest|think|better|improve|feedback|opinion`

Default intent: `other`. Default sentiment: `neutral` (flip positive on appreciation, negative on complaint).

### `backend/src/llm/logic.test.ts`

Vitest. Five to eight test cases covering:
- "Thank you so much!" → intent: appreciation, sentiment: positive
- "My order never arrived" → intent: complaint, sentiment: negative
- "Can you help me with my account?" → intent: request
- "What time do you open?" → intent: query
- "Hello" → intent: greeting
- Empty string → still returns valid insights (default intent: other, sentiment: neutral)

Pure function testing only. No mocking, no HTTP, no setup/teardown.

### `backend/vitest.config.ts`
Minimal:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({});
```

### `backend/.env.example`
```
# LLM Provider: claude | openai | grok | logic
# Default: logic (works without any API keys)
LLM_PROVIDER=logic

# Required only if LLM_PROVIDER matches:
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
XAI_API_KEY=

# Server
PORT=3001
```

---

## Frontend implementation

### `frontend/vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

### `frontend/src/index.css`

Tailwind v4 is CSS-first. The entire setup is two lines plus the optional `@theme` block:

```css
@import "tailwindcss";

@theme {
  --color-sentiment-positive: #10b981;
  --color-sentiment-neutral: #6b7280;
  --color-sentiment-negative: #ef4444;
  --color-intent: #4f46e5;
}
```

The `@theme` variables become Tailwind utility classes automatically: `bg-sentiment-positive`, `text-sentiment-negative`, etc. **Do not create a `tailwind.config.js/ts` file.** v4 does not need it.

### `frontend/src/types.ts`
Exact copy of backend's shared types. Comment at top noting intentional duplication.

### `frontend/src/api/chat.ts`
Single function `sendMessage(req: ChatRequest): Promise<ChatResponse>`. Uses `fetch('/api/chat', { method: 'POST', ... })`. Throws on non-2xx with a meaningful error message. Only file in frontend that talks to the network.

### `frontend/src/App.tsx`
Root. State: `showInsights: boolean` (default `true`). Renders header (title + toggle) and `<ChatContainer showInsights={showInsights} />`.

Header:
- Left: app title "AI Chat" or "Conversation Intelligence"
- Right: toggle switch labeled "Show insights"

### `frontend/src/components/ChatContainer.tsx`
Owns conversation state:
- `messages: UIMessage[]` (starts empty OR with a single assistant greeting — pick one and be consistent)
- `loading: boolean`
- `error: string | null`

Local extended message type:
```ts
type UIMessage = Message & { insights?: Insights };
```

`handleSend(content: string)`:
1. Append user message (without insights yet) to state
2. Set `loading: true`, clear `error`
3. Call `sendMessage({ message: content, history: messages })`
4. On success: attach `insights` to the user message we just sent, append assistant message
5. On failure: set `error`, do not append anything new
6. Always set `loading: false`

Renders `<MessageList>` and `<InputBox>`. Passes loading, error, showInsights props.

### `frontend/src/components/MessageList.tsx`
Maps over messages → `<MessageItem>`. Renders `<TypingIndicator>` when `loading`. Auto-scrolls via `useRef` + `scrollIntoView({ behavior: 'smooth' })` in `useEffect` triggered on messages.length change. Renders error message inline if `error` is set.

### `frontend/src/components/MessageItem.tsx`
- User messages: right-aligned, primary-colored bubble
- Assistant messages: left-aligned, neutral bubble
- Below user messages (only when `showInsights` is true AND insights exist): two pills — intent (uses `intent` token color) and sentiment (uses semantic color based on sentiment value)

### `frontend/src/components/InputBox.tsx`
Controlled `<textarea>`. Send button. Behavior:
- Enter sends (no Shift)
- Shift+Enter inserts newline
- Send disabled when input empty or `loading`
- Clears input on send

### `frontend/src/components/TypingIndicator.tsx`
Three bouncing dots. Tailwind classes for animation. ~10 lines.

### `frontend/package.json`
Scripts: standard Vite (`dev`, `build`, `preview`).

---

## README structure

Required sections in this order:

1. **Title + one-line description**
2. **Quick start** — three blocks: clone, backend setup, frontend setup. Include note that it works with zero API keys (logic provider default).
3. **Architecture** — short paragraph + simple ASCII diagram of the three layers
4. **Design decisions** — bullets on the choices that matter:
   - Pluggable LLM via interface + factory (why)
   - Single structured-output API call (why one not two)
   - Native structured outputs (Anthropic's `output_config.format`, OpenAI's `zodResponseFormat`) — why over prompt-and-parse
   - Stateless backend (why no DB)
   - Logic provider as fallback (enables zero-config running + runtime resilience)
   - Vite proxy over CORS (why)
   - Insights toggle (why default on, why exists at all)
5. **API contract** — show the request/response types
6. **Switching LLM providers** — env var + which keys each needs
7. **Out of scope (would add for production)** — persistence + multi-conversation, auth + rate limiting, streaming responses, observability, admin/analytics view for insights
8. **Project structure** — abbreviated tree

Keep under 300 lines. Write for skimming.

---

## Build phases

Execute one at a time. Commit after each. Each ends with something runnable.

**Phase 1 — Skeleton:** Both apps scaffolded. Frontend sends a message; backend returns hardcoded `{ reply, insights }`. Full round-trip works.

**Phase 2 — Logic provider:** `LLMProvider` interface, factory, `logic.ts`. Route uses provider. Real classifications.

**Phase 3 — Claude provider:** Structured outputs with `output_config.format`. Fallback to logic on any error. Test by setting `LLM_PROVIDER=claude` with a key.

**Phase 4 — OpenAI + Grok providers:** Mirror Claude's structure. Share schema + system prompt constants between openai.ts and grok.ts (Grok is OpenAI-compatible).

**Phase 5 — UI polish:** Chips with semantic colors via `@theme` tokens. Header + toggle. Typing indicator. Auto-scroll. Error display. Empty-state if no messages yet.

**Phase 6 — Test + README:** logic.test.ts. Write README. Final read-through and prune drift.

---

## Scope check (run after every phase)

For each file created:
1. Is it in the file list above?
2. Is every dependency in the explicit dependency list?
3. Did you add anything from the DO NOT INCLUDE section?

If any answer is wrong, revert.

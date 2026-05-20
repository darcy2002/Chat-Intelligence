# Chat Intelligence

A chat interface where every user message is classified with **intent** and **sentiment** in real time. Insights appear as color-coded chips beneath each message and can be toggled off via a header switch.

---

## Quick start

Works with zero API keys — the logic provider runs entirely offline.

**1. Clone**
```bash
git clone https://github.com/darcy2002/Chat-Intelligence.git
cd Chat-Intelligence
```

**2. Backend**
```bash
cd backend
cp .env.example .env       # edit LLM_PROVIDER and API key if desired
npm install
npm run dev                # starts on http://localhost:3001
```

**3. Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

Open http://localhost:5173, type a message, see the reply and insight chips.

> No API key required. `LLM_PROVIDER` defaults to `logic` — a rule-based classifier that runs locally with no external calls.

---

## Architecture

Three layers: browser → Express API → LLM provider.

```
┌─────────────────────────────┐
│  React 19 + Vite frontend   │  http://localhost:5173
│  - ChatContainer (state)    │
│  - MessageList + MessageItem│
│  - InputBox + TypingIndicator│
└────────────┬────────────────┘
             │ POST /api/chat (proxied by Vite)
┌────────────▼────────────────┐
│  Express 5 backend          │  http://localhost:3001
│  - /api/chat route          │
│  - LLMProvider interface    │
│  - factory (singleton)      │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│  LLM Provider (pluggable)   │
│  claude / openai / grok /   │
│  groq / logic               │
└─────────────────────────────┘
```

The backend is stateless — the frontend sends the full conversation history on every request.

---

## Design decisions

**Pluggable LLM via interface + factory**
`LLMProvider` is a simple interface (`name`, `chat()`). The factory reads one env var and returns a singleton. Adding a new provider means creating one file — no changes to the route or frontend.

**Single structured-output API call**
One call returns `{ reply, intent, sentiment }` together. Splitting it into two calls (one for reply, one for classification) would double latency and cost, and introduce the risk of the two calls disagreeing on context.

**Native structured outputs over prompt-and-parse**
Anthropic's `output_config.format` (with `zodOutputFormat`) and OpenAI's `zodResponseFormat` guarantee schema-compliant JSON at the API level. Prompt-engineered "please return JSON" approaches can hallucinate structure or add prose — native structured outputs eliminate that class of failure entirely.

**Stateless backend**
The frontend owns conversation history and sends it on every request. This avoids a database, session management, and the complexity of reconciling client and server state — all out of scope for this project and unnecessary for a single-user demo.

**Logic provider as fallback**
Every real provider wraps its API call in try/catch and falls back to the rule-based logic provider on any error. The chat never breaks due to a network blip or API hiccup. The logic provider also means the project runs with zero configuration.

**Environment-based API URLs**
The frontend reads `VITE_API_BASE_URL` from the environment (defaults to `http://localhost:3001`). This allows the frontend to point to any backend — local dev, staging, or production — without code changes. The Vite dev server does not proxy `/api`; the frontend makes direct HTTP calls with the configured base URL.

**Insights toggle**
Default on — the classification is the point of the project. The toggle exists so a reviewer can verify the UI degrades gracefully and so a real user can declutter the view mid-conversation.

**Production-grade system prompt**
The system prompt encodes domain knowledge: support-seeking messages (e.g. "I want customer care") are classified as `negative` because reaching out to support is itself a friction signal, even without explicit negative words. This is backed by how Zendesk, Intercom, and similar platforms define implicit negative sentiment.

---

## API contract

```ts
// POST /api/chat
type ChatRequest  = { message: string; history: Message[] };
type ChatResponse = { reply: string; insights: Insights };
type ChatError    = { error: string };

type Message   = { role: "user" | "assistant"; content: string };
type Insights  = { intent: string; sentiment: "positive" | "neutral" | "negative" };
```

`400` on malformed request body. `500` on unhandled server error. Both return `ChatError`.

---

## Deployment

This project is designed for split deployment: **frontend on Vercel**, **backend on Railway/Render/other Node.js hosts**.

### Frontend Deployment (Vercel)

1. **Connect to Vercel**  
   Push code to GitHub. In Vercel dashboard, create a new project and select the GitHub repo.

2. **Configure build settings**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `frontend/dist`
   - Install command: `npm install`

3. **Set environment variables**  
   In Vercel project settings → Environment Variables, add:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```
   Replace `your-backend-domain.com` with your backend's deployed URL (e.g., `https://chat-backend.railway.app`).

4. **Deploy**  
   Vercel auto-deploys on each push to `main`. The frontend will be live at `your-vercel-app.vercel.app`.

### Backend Deployment (Railway, Render, or Heroku)

The backend is a standard Node.js/Express server. Steps vary by platform:

**Railway:**
1. Connect GitHub repo
2. Select `backend/` as root directory
3. Add environment variables:
   - `LLM_PROVIDER` (e.g., `groq`)
   - `GROQ_API_KEY` (or whichever provider's key you're using)
4. Railway auto-detects Node.js and runs `npm run build` + `npm start`
5. Copy the public railway.app URL and add it to frontend's `VITE_API_BASE_URL`

**Render:**
1. New → Web Service, select GitHub repo
2. Set root directory to `backend/`
3. Build command: `npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables (same as Railway)
6. Deploy and copy the render.com URL to frontend config

**Heroku:**
1. Create app: `heroku create your-app-name`
2. Set buildpack: `heroku buildpacks:set heroku/nodejs`
3. Set env vars: `heroku config:set LLM_PROVIDER=groq GROQ_API_KEY=xxx`
4. Deploy: `git push heroku main` (from backend/ directory or adjust Procfile)
5. Copy Heroku app URL to frontend config

### Local Development

After cloning, set `VITE_API_BASE_URL` for local dev:

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:3001
```

This file is already created and git-ignored. Then:

```bash
# Terminal 1
cd backend && npm run dev      # backend on :3001

# Terminal 2
cd frontend && npm run dev     # frontend on :5173
```

Open http://localhost:5173. The frontend will call http://localhost:3001/api/chat.

---

## Switching LLM providers

Set `LLM_PROVIDER` in `backend/.env`. Restart the backend after changes.

| `LLM_PROVIDER` | Required env var     | Model used                              |
|----------------|----------------------|-----------------------------------------|
| `logic`        | none                 | rule-based, offline                     |
| `claude`       | `ANTHROPIC_API_KEY`  | `claude-sonnet-4-6`                     |
| `openai`       | `OPENAI_API_KEY`     | `gpt-5.4-mini`                          |
| `grok`         | `XAI_API_KEY`        | `grok-4.3` via xAI (OpenAI-compatible) |
| `groq`         | `GROQ_API_KEY`       | `meta-llama/llama-4-scout-17b-16e-instruct` via Groq |

Missing key → warning logged → falls back to `logic` automatically.

---

## Out of scope (would add for production)

**Persistence + multi-conversation**
Currently history lives in React state and is lost on refresh. A production build would persist conversations in a database (Postgres), with a sidebar to browse and resume past sessions.

**Auth + rate limiting**
No authentication means anyone with the URL can use any configured API key. Production would add auth (JWT or session), per-user rate limiting, and API key scoping.

**Streaming responses**
Replies appear only after the full response is received. Streaming (`text/event-stream` / SSE) would make long replies feel instant, dramatically improving perceived latency.

**Observability**
`console.log/error` is the only instrumentation. Production would add structured logging (pino), distributed tracing, and a metrics layer to track provider error rates, fallback frequency, and per-intent volume.

**Admin / analytics view**
The insights data is thrown away after render. A production build would store `{ intent, sentiment, timestamp }` per message and surface it in an admin view — sentiment trend over time, most common intents, escalation rate — which is the actual business value of the classification.

---

## Project structure

```
chat-intelligence/
├── frontend/
│   ├── src/
│   │   ├── api/chat.ts
│   │   ├── components/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── InputBox.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── llm/
│   │   │   ├── claude.ts
│   │   │   ├── factory.ts
│   │   │   ├── grok.ts
│   │   │   ├── groq.ts
│   │   │   ├── logic.ts
│   │   │   ├── logic.test.ts
│   │   │   ├── openai.ts
│   │   │   ├── shared.ts
│   │   │   └── types.ts
│   │   ├── routes/chat.ts
│   │   ├── shared/types.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── package.json
└── README.md
```

import { Router, type Request, type Response } from "express";
import type { ChatRequest, ChatResponse, ChatError, Message } from "../shared/types.js";
import { getProvider } from "../llm/factory.js";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 50;

const router = Router();

function isMessage(m: unknown): m is Message {
  if (typeof m !== "object" || m === null) return false;
  const obj = m as Record<string, unknown>;
  return (
    (obj.role === "user" || obj.role === "assistant") &&
    typeof obj.content === "string" &&
    (obj.content as string).length <= MAX_MESSAGE_LENGTH
  );
}

router.post("/", async (req: Request, res: Response<ChatResponse | ChatError>) => {
  const body = req.body as Partial<ChatRequest>;

  if (typeof body?.message !== "string") {
    return res.status(400).json({ error: "Invalid request body" });
  }
  if (body.message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} character limit` });
  }
  if (!Array.isArray(body?.history) || !body.history.every(isMessage)) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  if (body.history.length > MAX_HISTORY_TURNS) {
    return res.status(400).json({ error: `History exceeds ${MAX_HISTORY_TURNS} message limit` });
  }

  const provider = getProvider();
  const { reply, insights } = await provider.chat(body.message, body.history);
  res.json({ reply, insights });
});

export default router;

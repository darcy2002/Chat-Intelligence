import { Router, type Request, type Response } from "express";
import type { ChatRequest, ChatResponse, ChatError, Message } from "../shared/types.js";

const router = Router();

function isMessage(m: unknown): m is Message {
  if (typeof m !== "object" || m === null) return false;
  const obj = m as Record<string, unknown>;
  return (
    (obj.role === "user" || obj.role === "assistant") &&
    typeof obj.content === "string"
  );
}

router.post("/", (req: Request, res: Response<ChatResponse | ChatError>) => {
  const body = req.body as Partial<ChatRequest>;

  if (typeof body?.message !== "string" || !Array.isArray(body?.history) || !body.history.every(isMessage)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const response: ChatResponse = {
    reply: `Echo: ${body.message}`,
    insights: { intent: "query", sentiment: "neutral" },
  };

  res.json(response);
});

export default router;

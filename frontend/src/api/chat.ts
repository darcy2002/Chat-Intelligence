import type { ChatRequest, ChatResponse } from "../types";

export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ?? "";
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<ChatResponse>;
}

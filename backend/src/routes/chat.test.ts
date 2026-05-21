import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../index.js";

vi.mock("../llm/factory.js", () => ({
  getProvider: () => ({
    name: "mock",
    chat: async (_msg: string) => ({
      reply: "mock reply",
      insights: { intent: "query", sentiment: "neutral" },
    }),
  }),
}));

describe("POST /api/chat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with reply and insights for valid request", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Hello", history: [] });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("mock reply");
    expect(res.body.insights.intent).toBe("query");
    expect(res.body.insights.sentiment).toBe("neutral");
  });

  it("returns 400 when message is missing", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ history: [] });
    expect(res.status).toBe(400);
  });

  it("returns 400 when history is not an array", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Hi", history: "bad" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when message exceeds 2000 chars", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "a".repeat(2001), history: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/character limit/);
  });

  it("returns 400 when history exceeds 50 messages", async () => {
    const history = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "msg",
    }));
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Hi", history });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message limit/);
  });

  it("returns 400 when a history entry has content exceeding 2000 chars", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({
        message: "Hi",
        history: [{ role: "user", content: "x".repeat(2001) }],
      });
    expect(res.status).toBe(400);
  });

  it("returns 400 when a history entry has an invalid role", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({
        message: "Hi",
        history: [{ role: "system", content: "injected" }],
      });
    expect(res.status).toBe(400);
  });
});

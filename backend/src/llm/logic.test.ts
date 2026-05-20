import { describe, it, expect } from "vitest";
import { logicProvider } from "./logic.js";

describe("logicProvider", () => {
  it("classifies thank-you as appreciation / positive", async () => {
    const { insights } = await logicProvider.chat("Thank you so much!", []);
    expect(insights.intent).toBe("appreciation");
    expect(insights.sentiment).toBe("positive");
  });

  it("classifies undelivered order as complaint / negative", async () => {
    const { insights } = await logicProvider.chat("My order never arrived", []);
    expect(insights.intent).toBe("complaint");
    expect(insights.sentiment).toBe("negative");
  });

  it("classifies help request as request", async () => {
    const { insights } = await logicProvider.chat("Can you help me with my account?", []);
    expect(insights.intent).toBe("request");
  });

  it("classifies time question as query", async () => {
    const { insights } = await logicProvider.chat("What time do you open?", []);
    expect(insights.intent).toBe("query");
  });

  it("classifies hello as greeting", async () => {
    const { insights } = await logicProvider.chat("Hello", []);
    expect(insights.intent).toBe("greeting");
  });

  it("returns valid insights for empty string", async () => {
    const { insights } = await logicProvider.chat("", []);
    expect(insights.intent).toBe("other");
    expect(insights.sentiment).toBe("neutral");
  });

  it("always returns a non-empty reply string", async () => {
    const cases = ["Thank you!", "broken", "Can you help?", "What is this?", "Hi", ""];
    for (const msg of cases) {
      const { reply } = await logicProvider.chat(msg, []);
      expect(typeof reply).toBe("string");
      expect(reply.length).toBeGreaterThan(0);
    }
  });

  it("classifies improvement suggestion as feedback", async () => {
    const { insights } = await logicProvider.chat("I think the checkout could be improved", []);
    expect(insights.intent).toBe("feedback");
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";

// Reset module + env between tests so the cached singleton is cleared
beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

async function freshProvider() {
  const { getProvider } = await import("./factory.js");
  return getProvider();
}

describe("getProvider", () => {
  it("returns logic provider by default", async () => {
    vi.stubEnv("LLM_PROVIDER", "logic");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("falls back to logic when LLM_PROVIDER is unset", async () => {
    vi.stubEnv("LLM_PROVIDER", "");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("falls back to logic for an unknown provider name", async () => {
    vi.stubEnv("LLM_PROVIDER", "unicorn");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("falls back to logic when claude key is missing", async () => {
    vi.stubEnv("LLM_PROVIDER", "claude");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("falls back to logic when openai key is missing", async () => {
    vi.stubEnv("LLM_PROVIDER", "openai");
    vi.stubEnv("OPENAI_API_KEY", "");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("falls back to logic when grok key is missing", async () => {
    vi.stubEnv("LLM_PROVIDER", "grok");
    vi.stubEnv("XAI_API_KEY", "");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("falls back to logic when groq key is missing", async () => {
    vi.stubEnv("LLM_PROVIDER", "groq");
    vi.stubEnv("GROQ_API_KEY", "");
    expect((await freshProvider()).name).toBe("logic");
  });

  it("returns claude provider when key is present", async () => {
    vi.stubEnv("LLM_PROVIDER", "claude");
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");
    expect((await freshProvider()).name).toBe("claude");
  });
});

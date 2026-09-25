import { describe, expect, it, vi } from "vitest";
import { createLeadsHandler } from "./leads-handler";
import type { LeadSink, LeadSummarizer } from "./types";

const validBody = {
  name: "Sam",
  email: "sam@example.com",
  message: "Hello",
  turnstileToken: "token",
};

function fakeDeps(
  overrides?: Partial<{
    verifyTurnstile: (token: string) => Promise<boolean>;
    summarizer: LeadSummarizer;
    sink: LeadSink;
  }>,
) {
  return {
    verifyTurnstile: overrides?.verifyTurnstile ?? (async () => true),
    summarizer:
      overrides?.summarizer ??
      ({
        summarize: vi.fn(async () => ({
          summary: "ok",
          needs: [],
          suggestedPattern: "x",
          urgency: "low",
          followUpQuestions: [],
        })),
      } as LeadSummarizer),
    sink: overrides?.sink ?? ({ submit: vi.fn(async () => undefined) } as LeadSink),
  };
}

describe("createLeadsHandler (route integration)", () => {
  it("returns 201 on success", async () => {
    const POST = createLeadsHandler(() => fakeDeps());
    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    );
    expect(response.status).toBe(201);
  });

  it("returns 400 for invalid JSON", async () => {
    const POST = createLeadsHandler(() => fakeDeps());
    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid body", async () => {
    const POST = createLeadsHandler(() => fakeDeps());
    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Sam" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 500 when pipeline config is missing", async () => {
    const POST = createLeadsHandler(() => {
      throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
    });
    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    );
    expect(response.status).toBe(500);
  });
});

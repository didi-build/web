import { afterEach, describe, expect, it, vi } from "vitest";
import { __setLeadPipelineTestOverrides } from "@/lib/leads/composition";
import type { LeadSink, LeadSummarizer } from "@/lib/leads/types";
import { POST } from "./route";

describe("POST /api/leads (route integration)", () => {
  afterEach(() => {
    __setLeadPipelineTestOverrides(null);
  });

  it("returns 201 on success", async () => {
    __setLeadPipelineTestOverrides({
      verifyTurnstile: async () => true,
      summarizer: {
        summarize: vi.fn(async () => ({
          summary: "ok",
          needs: [],
          suggestedPattern: "x",
          urgency: "low",
          followUpQuestions: [],
        })),
      } as LeadSummarizer,
      sink: { submit: vi.fn(async () => undefined) } as LeadSink,
    });

    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Sam",
          email: "sam@example.com",
          message: "Hello",
          turnstileToken: "token",
        }),
      }),
    );

    expect(response.status).toBe(201);
  });
});

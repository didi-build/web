import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClaudeLeadSummarizer,
  formatAnthropicHttpError,
  isRetryableAnthropicError,
} from "./claude-lead-summarizer";
import type { LeadRecord } from "./types";

const lead: LeadRecord = {
  name: "Sam",
  email: "sam@example.com",
  message: "Need help with email triage.",
};

function mockResponse(init: { ok: boolean; status: number; body?: string; json?: unknown }) {
  return {
    ok: init.ok,
    status: init.status,
    text: async () => init.body ?? "",
    json: async () => init.json,
  };
}

describe("formatAnthropicHttpError", () => {
  it("includes status, error type, and message", () => {
    const err = formatAnthropicHttpError(
      400,
      JSON.stringify({
        type: "error",
        error: {
          type: "invalid_request_error",
          message: "`temperature` is deprecated for this model.",
        },
      }),
    );
    expect(err.message).toBe(
      "anthropic_http_400 invalid_request_error: `temperature` is deprecated for this model.",
    );
  });
});

describe("isRetryableAnthropicError", () => {
  it("does not retry 400", () => {
    expect(
      isRetryableAnthropicError(new Error("anthropic_http_400 invalid_request_error: bad")),
    ).toBe(false);
  });

  it("retries 500", () => {
    expect(isRetryableAnthropicError(new Error("anthropic_http_500"))).toBe(true);
  });
});

describe("ClaudeLeadSummarizer", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects with detailed message on Anthropic 400", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 400,
        body: JSON.stringify({
          type: "error",
          error: {
            type: "invalid_request_error",
            message: "`temperature` is deprecated for this model.",
          },
        }),
      }),
    );

    const summarizer = new ClaudeLeadSummarizer({ apiKey: "test-key" });
    await expect(summarizer.summarize(lead)).rejects.toThrow(
      /anthropic_http_400 invalid_request_error:.*temperature/,
    );
  });

  it("calls fetch once on 400 (no retry)", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        body: JSON.stringify({
          type: "error",
          error: { type: "invalid_request_error", message: "bad request" },
        }),
      }),
    );

    const summarizer = new ClaudeLeadSummarizer({ apiKey: "test-key" });
    await expect(summarizer.summarize(lead)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once on 500", async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse({ ok: false, status: 500, body: "" }))
      .mockResolvedValueOnce(mockResponse({ ok: false, status: 500, body: "" }));

    const summarizer = new ClaudeLeadSummarizer({ apiKey: "test-key" });
    await expect(summarizer.summarize(lead)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries once when model output is not valid JSON", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          status: 200,
          json: { content: [{ type: "text", text: "not json at all" }] },
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          status: 200,
          json: {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  summary: "Email triage help.",
                  needs: ["Faster replies"],
                  suggestedPattern: "Inbox triage",
                  urgency: "medium",
                  followUpQuestions: ["Volume?"],
                }),
              },
            ],
          },
        }),
      );

    const summarizer = new ClaudeLeadSummarizer({ apiKey: "test-key" });
    const result = await summarizer.summarize(lead);
    expect(result.summary).toBe("Email triage help.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not send temperature in the request body", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({
        ok: true,
        status: 200,
        json: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                summary: "Email triage help.",
                needs: ["Faster replies"],
                suggestedPattern: "Inbox triage",
                urgency: "medium",
                followUpQuestions: ["Volume?"],
              }),
            },
          ],
        },
      }),
    );

    const summarizer = new ClaudeLeadSummarizer({ apiKey: "test-key" });
    await summarizer.summarize(lead);

    const init = fetchMock.mock.calls[0]?.[1] as { body: string };
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body).not.toHaveProperty("temperature");
  });
});

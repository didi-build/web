import { afterEach, describe, expect, it, vi } from "vitest";
import { __setLeadPipelineTestOverrides } from "./composition";
import { processLeadSubmission } from "./process-lead";
import type { LeadRecord, LeadSummary, LeadSink, LeadSummarizer } from "./types";

const basePayload = {
  name: "Sam Rivera",
  email: "sam@riverabakery.ca",
  message: "We need help with repetitive catering emails.",
  turnstileToken: "test-token",
};

function makeDeps(overrides: {
  verifyTurnstile?: (token: string) => Promise<boolean>;
  summarizer?: LeadSummarizer;
  sink?: LeadSink;
}) {
  const summary: LeadSummary = {
    summary: "Bakery needs catering email support.",
    needs: ["Less manual email"],
    suggestedPattern: "Inbox triage",
    urgency: "medium",
    followUpQuestions: ["How many emails per week?"],
  };

  return {
    verifyTurnstile: overrides.verifyTurnstile ?? (async () => true),
    summarizer:
      overrides.summarizer ??
      ({
        summarize: vi.fn(async () => summary),
      } as LeadSummarizer),
    sink:
      overrides.sink ??
      ({
        submit: vi.fn(async () => undefined),
      } as LeadSink),
  };
}

afterEach(() => {
  __setLeadPipelineTestOverrides(null);
});

describe("processLeadSubmission (API pipeline integration)", () => {
  it("happy path submits summarized lead", async () => {
    const submit = vi.fn(async (_lead: LeadRecord, sum: LeadSummary | null) => {
      expect(sum?.summary).toContain("Bakery");
    });
    const result = await processLeadSubmission(basePayload, makeDeps({ sink: { submit } }));
    expect(result).toEqual({ status: 201 });
    expect(submit).toHaveBeenCalledOnce();
  });

  it("rejects when Turnstile fails", async () => {
    const result = await processLeadSubmission(
      basePayload,
      makeDeps({ verifyTurnstile: async () => false }),
    );
    expect(result.status).toBe(403);
  });

  it("still submits when summarizer fails", async () => {
    const submit = vi.fn(async (_lead: LeadRecord, sum: LeadSummary | null) => {
      expect(sum).toBeNull();
    });
    const result = await processLeadSubmission(
      basePayload,
      makeDeps({
        summarizer: {
          summarize: vi.fn(async () => {
            throw new Error("timeout");
          }),
        },
        sink: { submit },
      }),
    );
    expect(result).toEqual({ status: 201 });
    expect(submit).toHaveBeenCalledOnce();
  });

  it("returns error when sink fails", async () => {
    const result = await processLeadSubmission(
      basePayload,
      makeDeps({
        sink: {
          submit: vi.fn(async () => {
            throw new Error("linear down");
          }),
        },
      }),
    );
    expect(result.status).toBe(500);
  });
});

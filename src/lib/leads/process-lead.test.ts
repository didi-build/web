import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearReportCache } from "../visibility/report-cache";
import { processLeadSubmission } from "./process-lead";
import type { LeadRecord, LeadSummary, LeadSink, LeadSummarizer } from "./types";
import type { VisibilityReport } from "../visibility/types";
import type { GenerateVisibilityReportDeps } from "../visibility/generate-visibility-report";

const basePayload = {
  name: "Sam Rivera",
  email: "sam@riverabakery.ca",
  message: "We need help with repetitive catering emails.",
  turnstileToken: "test-token",
};

const sampleReport: VisibilityReport = {
  url: "https://riverabakery.ca/",
  checkedAt: "2026-09-28T12:00:00.000Z",
  score: 80,
  summary: "Looks good overall.",
  topFixes: ["Add llms.txt"],
  findings: [
    {
      id: "llms",
      label: "llms.txt",
      status: "warn",
      detail: "Missing llms.txt",
      whyItMatters: "Helps AI crawlers.",
    },
  ],
};

function makeDeps(overrides: {
  verifyTurnstile?: (token: string) => Promise<boolean>;
  summarizer?: LeadSummarizer;
  sink?: LeadSink;
  visibility?: GenerateVisibilityReportDeps;
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
    visibility: overrides.visibility,
  };
}

describe("processLeadSubmission (API pipeline integration)", () => {
  beforeEach(() => {
    clearReportCache();
  });

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

  it("rejects when Turnstile verifier throws", async () => {
    const result = await processLeadSubmission(
      basePayload,
      makeDeps({
        verifyTurnstile: async () => {
          throw new Error("turnstile_unreachable");
        },
      }),
    );
    expect(result).toEqual({ status: 403, message: "Spam verification failed." });
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

  it("includes visibility report when website is provided", async () => {
    const submit = vi.fn(
      async (_lead: LeadRecord, _sum: LeadSummary | null, visibility: VisibilityReport | null) => {
        expect(visibility?.url).toBe(sampleReport.url);
      },
    );

    const checker = {
      check: vi.fn(async () => sampleReport.findings),
    };
    const explainer = {
      explain: vi.fn(async () => ({
        summary: sampleReport.summary,
        topFixes: sampleReport.topFixes,
      })),
    };

    const result = await processLeadSubmission(
      { ...basePayload, website: "riverabakery.ca" },
      makeDeps({
        sink: { submit },
        visibility: { checker, explainer },
      }),
    );

    expect(result).toEqual({ status: 201 });
    expect(submit).toHaveBeenCalledOnce();
  });

  it("submits with null visibility when checker fails", async () => {
    const submit = vi.fn(
      async (_lead: LeadRecord, _sum: LeadSummary | null, visibility: VisibilityReport | null) => {
        expect(visibility).toBeNull();
      },
    );

    const checker = {
      check: vi.fn(async () => {
        throw new Error("unreachable");
      }),
    };
    const explainer = {
      explain: vi.fn(async () => ({
        summary: "unused",
        topFixes: ["fix"],
      })),
    };

    const result = await processLeadSubmission(
      { ...basePayload, website: "riverabakery.ca" },
      makeDeps({
        sink: { submit },
        visibility: { checker, explainer },
      }),
    );

    expect(result).toEqual({ status: 201 });
  });

  it("skips visibility check when website is omitted", async () => {
    const submit = vi.fn(
      async (_lead: LeadRecord, _sum: LeadSummary | null, visibility: VisibilityReport | null) => {
        expect(visibility).toBeNull();
      },
    );
    const checker = { check: vi.fn(async () => []) };

    const result = await processLeadSubmission(
      basePayload,
      makeDeps({
        sink: { submit },
        visibility: { checker, explainer: { explain: vi.fn() } },
      }),
    );

    expect(result).toEqual({ status: 201 });
    expect(checker.check).not.toHaveBeenCalled();
  });
});

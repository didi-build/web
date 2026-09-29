import { describe, expect, it } from "vitest";
import { computeScore, visibilityReportSchema } from "./schemas";

describe("visibilityReportSchema", () => {
  it("accepts a valid report", () => {
    const parsed = visibilityReportSchema.safeParse({
      url: "https://example.com",
      checkedAt: new Date().toISOString(),
      score: 80,
      findings: [
        {
          id: "title",
          label: "Page title",
          status: "pass",
          detail: "ok",
          whyItMatters: "Because titles matter.",
        },
      ],
      summary: "Looks good.",
      topFixes: ["Keep it up."],
    });
    expect(parsed.success).toBe(true);
  });
});

describe("computeScore", () => {
  it("ignores unknown findings in the denominator", () => {
    const score = computeScore([
      {
        id: "a",
        label: "A",
        status: "pass",
        detail: "x",
        whyItMatters: "y",
      },
      {
        id: "b",
        label: "B",
        status: "unknown",
        detail: "x",
        whyItMatters: "y",
      },
    ]);
    expect(score).toBe(100);
  });

  it("weights warn at half credit", () => {
    const score = computeScore([
      {
        id: "a",
        label: "A",
        status: "pass",
        detail: "x",
        whyItMatters: "y",
      },
      {
        id: "b",
        label: "B",
        status: "warn",
        detail: "x",
        whyItMatters: "y",
      },
    ]);
    expect(score).toBe(75);
  });
});

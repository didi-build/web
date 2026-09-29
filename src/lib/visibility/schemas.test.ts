import { describe, expect, it } from "vitest";
import { computeScore, resolveVisibilityScore, visibilityReportSchema } from "./schemas";
import type { VisibilityFinding } from "./schemas";

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

describe("resolveVisibilityScore", () => {
  it("returns undefined when fewer than half of findings are scorable", () => {
    const findings: VisibilityFinding[] = [
      {
        id: "https",
        label: "HTTPS",
        status: "pass",
        detail: "ok",
        whyItMatters: "y",
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `unknown-${i}`,
        label: "Check",
        status: "unknown" as const,
        detail: "blocks automated",
        whyItMatters: "y",
      })),
    ];
    expect(resolveVisibilityScore(findings)).toBeUndefined();
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

import { describe, expect, it, vi } from "vitest";
import { clearReportCache } from "./report-cache";
import { createVisibilityCheckHandler } from "./visibility-handler";
import type { VisibilityChecker, VisibilityExplainer } from "./types";

const validBody = {
  url: "https://example.com",
  turnstileToken: "token",
};

function fakeDeps(
  overrides?: Partial<{
    verifyTurnstile: (token: string) => Promise<boolean>;
    checker: VisibilityChecker;
    explainer: VisibilityExplainer;
  }>,
) {
  return {
    verifyTurnstile: overrides?.verifyTurnstile ?? (async () => true),
    checker:
      overrides?.checker ??
      ({
        check: vi.fn(async () => [
          {
            id: "title",
            label: "Page title",
            status: "pass",
            detail: "Found title.",
            whyItMatters: "Titles help search.",
          },
        ]),
      } as VisibilityChecker),
    explainer:
      overrides?.explainer ??
      ({
        explain: vi.fn(async () => ({
          summary: "Your site looks solid.",
          topFixes: ["Add llms.txt", "Refresh meta description", "Monitor rankings"],
        })),
      } as VisibilityExplainer),
  };
}

describe("createVisibilityCheckHandler", () => {
  it("returns 200 with a report on success", async () => {
    clearReportCache();
    const POST = createVisibilityCheckHandler(() => fakeDeps());
    const response = await POST(
      new Request("http://localhost/api/visibility-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { summary: string; findings: unknown[] };
    expect(json.summary).toContain("solid");
    expect(json.findings.length).toBeGreaterThan(0);
  });

  it("returns 400 for invalid body", async () => {
    const POST = createVisibilityCheckHandler(() => fakeDeps());
    const response = await POST(
      new Request("http://localhost/api/visibility-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 403 when Turnstile fails", async () => {
    const POST = createVisibilityCheckHandler(() =>
      fakeDeps({ verifyTurnstile: async () => false }),
    );
    const response = await POST(
      new Request("http://localhost/api/visibility-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("still returns findings when explainer fails", async () => {
    clearReportCache();
    const POST = createVisibilityCheckHandler(() =>
      fakeDeps({
        explainer: {
          explain: vi.fn(async () => {
            throw new Error("boom");
          }),
        },
      }),
    );
    const response = await POST(
      new Request("http://localhost/api/visibility-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...validBody, url: "https://another-example.org" }),
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { summary: string };
    expect(json.summary.toLowerCase()).toContain("unavailable");
  });
});

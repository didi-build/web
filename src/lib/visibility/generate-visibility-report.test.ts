import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { formatLeadEmailSubject } from "../leads/format-lead-email";
import { runDeterministicChecks } from "./checks";
import { clearReportCache } from "./report-cache";
import { generateVisibilityReport } from "./generate-visibility-report";
import { VisibilityCheckError } from "./visibility-checker";
import type { FetchResult, SiteResources, VisibilityChecker, VisibilityExplainer } from "./types";

const fixturesDir = join(__dirname, "__fixtures__");

describe("generateVisibilityReport", () => {
  it("returns cached report without calling checker", async () => {
    clearReportCache();
    const checker: VisibilityChecker = {
      check: vi.fn(async () => {
        throw new Error("should not run");
      }),
    };
    const explainer: VisibilityExplainer = {
      explain: vi.fn(async () => ({
        summary: "cached",
        topFixes: ["a", "b", "c"],
      })),
    };

    const first = await generateVisibilityReport("https://example.com", {
      checker: {
        check: vi.fn(async () => [
          {
            id: "title",
            label: "Page title",
            status: "pass" as const,
            detail: "ok",
            whyItMatters: "Titles matter.",
          },
        ]),
      },
      explainer,
    });
    expect(first.ok).toBe(true);

    const second = await generateVisibilityReport("example.com", { checker, explainer });
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.report.summary).toBe(first.ok ? first.report.summary : "");
    }
    expect(checker.check).not.toHaveBeenCalled();
  });

  it("maps unreachable sites to 404", async () => {
    clearReportCache();
    const result = await generateVisibilityReport("https://example.com", {
      checker: {
        check: vi.fn(async () => {
          throw new VisibilityCheckError("unreachable", "We could not reach that website.");
        }),
      },
      explainer: { explain: vi.fn() },
    });
    expect(result).toEqual({
      ok: false,
      status: 404,
      message: "We could not reach that website.",
    });
  });

  it("omits score for host-blocked challenge reports", async () => {
    clearReportCache();
    const challengeHtml = readFileSync(join(fixturesDir, "siteground-challenge.html"), "utf8");
    const fetchOk = (
      body: string,
      status = 200,
      headers?: Record<string, string>,
    ): FetchResult => ({
      ok: true,
      status,
      body,
      finalUrl: "https://thrivehivestudio.ca/",
      headers,
    });
    const resources: SiteResources = {
      normalizedUrl: "https://thrivehivestudio.ca/",
      origin: "https://thrivehivestudio.ca",
      homepage: fetchOk(challengeHtml, 202, { "sg-captcha": "challenge" }),
      robotsTxt: fetchOk(challengeHtml, 202, { "sg-captcha": "challenge" }),
      sitemapXml: fetchOk(challengeHtml, 202, { "sg-captcha": "challenge" }),
      llmsTxt: fetchOk(challengeHtml, 202, { "sg-captcha": "challenge" }),
    };
    const findings = runDeterministicChecks(resources);

    const result = await generateVisibilityReport("https://thrivehivestudio.ca/", {
      checker: { check: vi.fn(async () => findings) },
      explainer: {
        explain: vi.fn(async () => ({
          summary: "Host blocked our check.",
          topFixes: ["Try again later", "Confirm HTTPS", "Review robots when readable"],
        })),
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.report.score).toBeUndefined();
      const subject = formatLeadEmailSubject(
        {
          name: "Test",
          email: "test@example.com",
          message: "Hi",
        },
        result.report,
      );
      expect(subject).not.toContain("visibility");
    }
  });

  it("returns findings when explainer fails", async () => {
    clearReportCache();
    const result = await generateVisibilityReport("https://cache-miss.example", {
      checker: {
        check: vi.fn(async () => [
          {
            id: "title",
            label: "Page title",
            status: "pass" as const,
            detail: "Found title.",
            whyItMatters: "Titles help search.",
          },
        ]),
      },
      explainer: {
        explain: vi.fn(async () => {
          throw new Error("claude down");
        }),
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.report.summary.toLowerCase()).toContain("unavailable");
      expect(result.report.findings).toHaveLength(1);
    }
  });
});

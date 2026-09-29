import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveVisibilityScore } from "./schemas";
import { runDeterministicChecks } from "./checks";
import type { FetchResult, SiteResources } from "./types";

const fixturesDir = join(__dirname, "__fixtures__");

function fetchOk(
  body: string,
  status = 200,
  extra?: Partial<Extract<FetchResult, { ok: true }>>,
): FetchResult {
  return {
    ok: true,
    status,
    body,
    finalUrl: "https://thrivehivestudio.ca/",
    ...extra,
  };
}

describe("visibility checker regressions (DIDI-467)", () => {
  const challengeHtml = readFileSync(join(fixturesDir, "siteground-challenge.html"), "utf8");
  const thriveHtml = readFileSync(join(fixturesDir, "thrivehive-homepage.html"), "utf8");

  it("treats SiteGround bot challenge as blocked with no false fails or passes on HTML checks", () => {
    const resources: SiteResources = {
      normalizedUrl: "https://thrivehivestudio.ca/",
      origin: "https://thrivehivestudio.ca",
      homepage: fetchOk(challengeHtml, 202, {
        headers: { "sg-captcha": "challenge" },
        finalUrl: "https://thrivehivestudio.ca/",
      }),
      robotsTxt: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
      sitemapXml: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
      llmsTxt: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
    };

    const findings = runDeterministicChecks(resources);
    const htmlIds = [
      "title",
      "metaDescription",
      "h1",
      "viewport",
      "openGraph",
      "structuredData",
      "contactInfo",
    ];

    for (const id of htmlIds) {
      expect(findings.find((f) => f.id === id)?.status).toBe("unknown");
    }
    expect(findings.find((f) => f.id === "contactInfo")?.status).not.toBe("pass");
    expect(findings.find((f) => f.id === "robotsTxt")?.status).toBe("unknown");
    expect(findings.find((f) => f.id === "sitemap")?.status).toBe("unknown");
    expect(findings.find((f) => f.id === "https")?.status).toBe("pass");
  });

  it("scores real Thrive Hive HTML correctly including JSON-LD @graph", () => {
    const sitemapIndex =
      '<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>';
    const resources: SiteResources = {
      normalizedUrl: "https://thrivehivestudio.ca/",
      origin: "https://thrivehivestudio.ca",
      homepage: fetchOk(thriveHtml),
      robotsTxt: fetchOk("User-agent: *\nAllow: /\n"),
      sitemapXml: fetchOk(sitemapIndex),
      llmsTxt: { ok: false, error: "fetch_failed" },
    };

    const findings = runDeterministicChecks(resources);
    const byId = new Map(findings.map((f) => [f.id, f]));

    expect(byId.get("title")?.status).toBe("pass");
    expect(byId.get("metaDescription")?.status).toBe("pass");
    expect(byId.get("viewport")?.status).toBe("pass");
    expect(byId.get("openGraph")?.status).toBe("pass");
    expect(byId.get("structuredData")?.status).toBe("pass");
    expect(byId.get("h1")?.status).toBe("warn");
    expect(byId.get("sitemap")?.status).toBe("pass");
  });

  it("does not match phone numbers inside captcha refresh URLs", () => {
    const resources: SiteResources = {
      normalizedUrl: "https://thrivehivestudio.ca/",
      origin: "https://thrivehivestudio.ca",
      homepage: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
      robotsTxt: fetchOk("User-agent: *\n"),
      sitemapXml: { ok: false, error: "fetch_failed" },
      llmsTxt: { ok: false, error: "fetch_failed" },
    };
    const findings = runDeterministicChecks(resources);
    expect(findings.find((f) => f.id === "contactInfo")?.status).toBe("unknown");
  });

  it("omits visibility score when the host blocks automated checks", () => {
    const resources: SiteResources = {
      normalizedUrl: "https://thrivehivestudio.ca/",
      origin: "https://thrivehivestudio.ca",
      homepage: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
      robotsTxt: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
      sitemapXml: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
      llmsTxt: fetchOk(challengeHtml, 202, { headers: { "sg-captcha": "challenge" } }),
    };
    const findings = runDeterministicChecks(resources);
    expect(resolveVisibilityScore(findings)).toBeUndefined();
  });

  it("does not block a normal page that mentions 'just a moment' in body copy", () => {
    const body = readFileSync(join(fixturesDir, "page-with-just-a-moment-copy.html"), "utf8");
    const resources: SiteResources = {
      normalizedUrl: "https://calmspa.example/",
      origin: "https://calmspa.example",
      homepage: fetchOk(body),
      robotsTxt: fetchOk("User-agent: *\nAllow: /\n"),
      sitemapXml: { ok: false, error: "fetch_failed" },
      llmsTxt: { ok: false, error: "fetch_failed" },
    };
    const findings = runDeterministicChecks(resources);
    expect(findings.find((f) => f.id === "title")?.status).toBe("pass");
    expect(resolveVisibilityScore(findings)).toBeDefined();
  });

  it("parses truncated large homepages instead of failing", () => {
    const padded = `<!doctype html><html><head><title>Big Shop</title><meta name="viewport" content="width=device-width"><meta name="description" content="Shop"><meta property="og:title" content="a"><meta property="og:description" content="b"><meta property="og:image" content="c"><script type="application/ld+json">{"@type":"Organization","name":"Big"}</script></head><body><h1>Big</h1><p>Call 416-555-0199</p>${"x".repeat(600_000)}</body></html>`;
    const truncatedBody = padded.slice(0, 512 * 1024);
    const resources: SiteResources = {
      normalizedUrl: "https://big.example/",
      origin: "https://big.example",
      homepage: fetchOk(truncatedBody, 200, { truncated: true }),
      robotsTxt: fetchOk("User-agent: *\n"),
      sitemapXml: { ok: false, error: "fetch_failed" },
      llmsTxt: { ok: false, error: "fetch_failed" },
    };
    const findings = runDeterministicChecks(resources);
    expect(findings.find((f) => f.id === "title")?.status).toBe("pass");
    expect(findings.find((f) => f.id === "title")?.detail).toContain("512 KB");
  });
});

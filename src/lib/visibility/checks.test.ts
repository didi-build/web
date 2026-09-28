import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runDeterministicChecks } from "./checks";
import type { FetchResult, SiteResources } from "./types";

const fixturesDir = join(__dirname, "__fixtures__");

function fetchOk(body: string, status = 200): FetchResult {
  return { ok: true, status, body, finalUrl: "https://example.com/" };
}

function fetchFail(): FetchResult {
  return { ok: false, error: "fetch_failed" };
}

describe("runDeterministicChecks", () => {
  const goodHtml = readFileSync(join(fixturesDir, "homepage-good.html"), "utf8");
  const robotsBlocks = readFileSync(join(fixturesDir, "robots-blocks-ai.txt"), "utf8");

  it("marks a well-formed homepage as passing core HTML checks", () => {
    const resources: SiteResources = {
      normalizedUrl: "https://example.com/",
      origin: "https://example.com",
      homepage: fetchOk(goodHtml),
      robotsTxt: fetchOk("User-agent: *\nAllow: /\n"),
      sitemapXml: fetchOk(
        '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      ),
      llmsTxt: fetchOk("# Acme\n\nWe fix pipes.\n"),
    };

    const findings = runDeterministicChecks(resources);
    const byId = new Map(findings.map((f) => [f.id, f]));

    expect(byId.get("https")?.status).toBe("pass");
    expect(byId.get("title")?.status).toBe("pass");
    expect(byId.get("metaDescription")?.status).toBe("pass");
    expect(byId.get("h1")?.status).toBe("pass");
    expect(byId.get("viewport")?.status).toBe("pass");
    expect(byId.get("openGraph")?.status).toBe("pass");
    expect(byId.get("structuredData")?.status).toBe("pass");
    expect(byId.get("contactInfo")?.status).toBe("pass");
    expect(byId.get("aiCrawlers")?.status).toBe("pass");
    expect(byId.get("sitemap")?.status).toBe("pass");
    expect(byId.get("llmsTxt")?.status).toBe("pass");
  });

  it("flags AI crawler blocks in robots.txt", () => {
    const resources: SiteResources = {
      normalizedUrl: "https://example.com/",
      origin: "https://example.com",
      homepage: fetchOk(goodHtml),
      robotsTxt: fetchOk(robotsBlocks),
      sitemapXml: fetchFail(),
      llmsTxt: fetchFail(),
    };

    const findings = runDeterministicChecks(resources);
    expect(findings.find((f) => f.id === "aiCrawlers")?.status).toBe("fail");
  });

  it("fails HTML checks when homepage is unreachable", () => {
    const resources: SiteResources = {
      normalizedUrl: "https://example.com/",
      origin: "https://example.com",
      homepage: fetchFail(),
      robotsTxt: fetchFail(),
      sitemapXml: fetchFail(),
      llmsTxt: fetchFail(),
    };

    const findings = runDeterministicChecks(resources);
    expect(findings.find((f) => f.id === "title")?.status).toBe("fail");
    expect(findings.find((f) => f.id === "https")?.status).toBe("fail");
  });
});

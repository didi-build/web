import { registryEntryFor } from "./registry";
import type { FindingStatus, VisibilityFinding } from "./schemas";
import type { FetchResult, SiteResources } from "./types";

const AI_CRAWLER_NAMES = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "ChatGPT-User",
  "anthropic-ai",
];

function makeFinding(id: string, status: FindingStatus, detail: string): VisibilityFinding {
  const entry = registryEntryFor(id);
  return {
    id: entry.id,
    label: entry.label,
    status,
    detail,
    whyItMatters: entry.whyItMatters,
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string | null {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match) {
    return null;
  }
  const value = decodeHtmlEntities(match[1]);
  return value.length > 0 ? value : null;
}

function extractMetaContent(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match) {
      const value = decodeHtmlEntities(match[1]);
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

function extractOgTag(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match) {
      const value = decodeHtmlEntities(match[1]);
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

function countH1(html: string): number {
  const matches = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi);
  return matches?.length ?? 0;
}

function hasJsonLdBusinessType(html: string): boolean {
  const scripts = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  if (!scripts) {
    return false;
  }
  for (const block of scripts) {
    const inner = /<script[^>]*>([\s\S]*?)<\/script>/i.exec(block)?.[1];
    if (!inner) {
      continue;
    }
    try {
      const data = JSON.parse(inner.trim()) as unknown;
      const types = collectSchemaTypes(data);
      if (
        types.some(
          (t) =>
            t.includes("LocalBusiness") ||
            t.includes("Organization") ||
            t.includes("Store") ||
            t.includes("ProfessionalService"),
        )
      ) {
        return true;
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }
  return false;
}

function collectSchemaTypes(data: unknown): string[] {
  const types: string[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      types.push(...collectSchemaTypes(item));
    }
    return types;
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record["@type"] === "string") {
      types.push(record["@type"]);
    } else if (Array.isArray(record["@type"])) {
      for (const t of record["@type"]) {
        if (typeof t === "string") {
          types.push(t);
        }
      }
    }
    if (record["@graph"]) {
      types.push(...collectSchemaTypes(record["@graph"]));
    }
  }
  return types;
}

const PHONE_PATTERN =
  /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const ADDRESS_HINT =
  /\b\d{1,5}\s+\w+(\s+\w+){0,4}\s+(st|street|ave|avenue|rd|road|blvd|drive|dr|lane|ln|way|court|ct)\b/i;

function hasContactSignals(text: string): boolean {
  const lower = text.toLowerCase();
  if (PHONE_PATTERN.test(text)) {
    return true;
  }
  if (EMAIL_PATTERN.test(text)) {
    return true;
  }
  if (ADDRESS_HINT.test(text)) {
    return true;
  }
  if (lower.includes("service area") || lower.includes("serving ")) {
    return true;
  }
  return false;
}

function parseRobotsBlocksAi(robotsBody: string): string[] {
  const blocked: string[] = [];
  const lines = robotsBody.split(/\r?\n/);
  let activeAgents = new Set<string>(["*"]);

  for (const rawLine of lines) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    if (!line) {
      continue;
    }
    const userAgentMatch = /^user-agent:\s*(.+)$/i.exec(line);
    if (userAgentMatch) {
      const agent = userAgentMatch[1].trim();
      activeAgents = new Set([agent]);
      continue;
    }
    const disallowMatch = /^disallow:\s*(\S*)/i.exec(line);
    if (disallowMatch) {
      const path = disallowMatch[1].trim();
      if (path === "/" || path === "/*") {
        for (const agent of activeAgents) {
          if (
            agent === "*" ||
            AI_CRAWLER_NAMES.some((name) => agent.toLowerCase().includes(name.toLowerCase()))
          ) {
            blocked.push(agent);
          }
        }
      }
    }
  }

  return blocked;
}

function checkHttps(resources: SiteResources): VisibilityFinding {
  const home = resources.homepage;
  if (!home?.ok) {
    return makeFinding(
      "https",
      "fail",
      "We could not load your homepage, so we could not confirm HTTPS.",
    );
  }
  const final = home.finalUrl;
  if (final.startsWith("https://")) {
    return makeFinding("https", "pass", "Your site loads over HTTPS.");
  }
  if (final.startsWith("http://")) {
    return makeFinding("https", "fail", "Your homepage loaded over plain HTTP instead of HTTPS.");
  }
  return makeFinding("https", "warn", "We could not confirm whether your site uses HTTPS.");
}

function homepageHtml(resources: SiteResources): string | null {
  const home = resources.homepage;
  if (!home?.ok || home.status < 200 || home.status >= 400) {
    return null;
  }
  return home.body;
}

export function runDeterministicChecks(resources: SiteResources): VisibilityFinding[] {
  const findings: VisibilityFinding[] = [];
  findings.push(checkHttps(resources));

  const html = homepageHtml(resources);
  if (!html) {
    const home = resources.homepage;
    const detail =
      home && !home.ok
        ? "We could not fetch your homepage (timeout, blocked, or connection error)."
        : home && home.ok
          ? `Your homepage returned HTTP status ${home.status}.`
          : "We could not fetch your homepage.";
    findings.push(
      makeFinding("title", "fail", detail),
      makeFinding("metaDescription", "fail", "We could not read your homepage HTML."),
      makeFinding("h1", "fail", "We could not read your homepage HTML."),
      makeFinding("viewport", "fail", "We could not read your homepage HTML."),
      makeFinding("openGraph", "fail", "We could not read your homepage HTML."),
      makeFinding("structuredData", "fail", "We could not read your homepage HTML."),
      makeFinding("contactInfo", "fail", "We could not read your homepage HTML."),
    );
  } else {
    const title = extractTitle(html);
    findings.push(
      title
        ? makeFinding("title", "pass", `Found page title: "${title.slice(0, 120)}".`)
        : makeFinding("title", "fail", "No <title> tag found on your homepage."),
    );

    const description = extractMetaContent(html, "description");
    findings.push(
      description
        ? makeFinding(
            "metaDescription",
            "pass",
            `Found meta description (${description.length} characters).`,
          )
        : makeFinding("metaDescription", "warn", "No meta description tag found on your homepage."),
    );

    const h1Count = countH1(html);
    if (h1Count === 1) {
      findings.push(makeFinding("h1", "pass", "Your homepage has one H1 heading."));
    } else if (h1Count === 0) {
      findings.push(makeFinding("h1", "fail", "No H1 heading found on your homepage."));
    } else {
      findings.push(
        makeFinding("h1", "warn", `Found ${h1Count} H1 headings. One clear H1 is best.`),
      );
    }

    const viewport = extractMetaContent(html, "viewport");
    findings.push(
      viewport
        ? makeFinding("viewport", "pass", "Viewport meta tag is present for mobile layouts.")
        : makeFinding("viewport", "fail", "Missing viewport meta tag for mobile devices."),
    );

    const ogTitle = extractOgTag(html, "og:title");
    const ogDescription = extractOgTag(html, "og:description");
    const ogImage = extractOgTag(html, "og:image");
    const ogCount = [ogTitle, ogDescription, ogImage].filter(Boolean).length;
    if (ogCount >= 2) {
      findings.push(
        makeFinding("openGraph", "pass", "Key Open Graph tags are present for link previews."),
      );
    } else if (ogCount === 1) {
      findings.push(
        makeFinding(
          "openGraph",
          "warn",
          "Some Open Graph tags are missing (title, description, and image work best together).",
        ),
      );
    } else {
      findings.push(
        makeFinding("openGraph", "fail", "No Open Graph tags found for social link previews."),
      );
    }

    findings.push(
      hasJsonLdBusinessType(html)
        ? makeFinding(
            "structuredData",
            "pass",
            "Found JSON-LD structured data for a business or organization.",
          )
        : makeFinding(
            "structuredData",
            "warn",
            "No LocalBusiness or Organization JSON-LD found on your homepage.",
          ),
    );

    findings.push(
      hasContactSignals(html)
        ? makeFinding(
            "contactInfo",
            "pass",
            "Contact clues (phone, email, address, or service area) appear on the homepage.",
          )
        : makeFinding(
            "contactInfo",
            "warn",
            "We did not spot obvious phone, email, or address text on the homepage.",
          ),
    );
  }

  findings.push(checkRobots(resources.robotsTxt));
  findings.push(checkAiCrawlers(resources.robotsTxt));
  findings.push(checkSitemap(resources.sitemapXml));
  findings.push(checkLlmsTxt(resources.llmsTxt));

  return findings;
}

function checkRobots(result: FetchResult | null): VisibilityFinding {
  if (!result) {
    return makeFinding("robotsTxt", "warn", "Could not check robots.txt.");
  }
  if (!result.ok) {
    if (result.error === "timeout") {
      return makeFinding("robotsTxt", "warn", "robots.txt timed out.");
    }
    return makeFinding(
      "robotsTxt",
      "warn",
      "No robots.txt found or it could not be loaded (this is common and usually fine).",
    );
  }
  if (result.status >= 200 && result.status < 300 && result.body.trim().length > 0) {
    return makeFinding("robotsTxt", "pass", "robots.txt is present at your site root.");
  }
  return makeFinding(
    "robotsTxt",
    "warn",
    `robots.txt returned HTTP ${result.status} or was empty.`,
  );
}

function checkAiCrawlers(result: FetchResult | null): VisibilityFinding {
  if (!result?.ok || result.status < 200 || result.status >= 400) {
    return makeFinding(
      "aiCrawlers",
      "pass",
      "No robots.txt rules were found that block AI crawlers.",
    );
  }
  const blocked = parseRobotsBlocksAi(result.body);
  if (blocked.length === 0) {
    return makeFinding("aiCrawlers", "pass", "AI crawlers are not broadly blocked in robots.txt.");
  }
  return makeFinding(
    "aiCrawlers",
    "fail",
    `robots.txt appears to block crawlers (${blocked.slice(0, 3).join(", ")}).`,
  );
}

function checkSitemap(result: FetchResult | null): VisibilityFinding {
  if (!result?.ok) {
    return makeFinding("sitemap", "warn", "sitemap.xml was missing or could not be loaded.");
  }
  if (result.status >= 200 && result.status < 300 && result.body.includes("<urlset")) {
    return makeFinding("sitemap", "pass", "sitemap.xml is present and looks like a valid sitemap.");
  }
  if (result.status >= 200 && result.status < 300) {
    return makeFinding(
      "sitemap",
      "warn",
      "sitemap.xml exists but did not look like a standard XML sitemap.",
    );
  }
  return makeFinding("sitemap", "warn", `sitemap.xml returned HTTP ${result.status}.`);
}

function checkLlmsTxt(result: FetchResult | null): VisibilityFinding {
  if (!result?.ok) {
    return makeFinding("llmsTxt", "warn", "No llms.txt file found at your site root yet.");
  }
  if (result.status >= 200 && result.status < 300 && result.body.trim().length > 10) {
    return makeFinding("llmsTxt", "pass", "llms.txt is present with readable content.");
  }
  return makeFinding("llmsTxt", "warn", "llms.txt is missing or nearly empty.");
}

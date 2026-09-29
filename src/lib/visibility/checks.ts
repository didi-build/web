import {
  HOST_BLOCKS_AUTOMATED_DETAIL,
  classifyHomepageForChecks,
  isBotChallengeFetch,
  isHtmlLikeBody,
  isValidSitemapXml,
  looksLikeRobotsTxt,
} from "./challenge-detection";
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

const HTML_CHECK_IDS = [
  "title",
  "metaDescription",
  "h1",
  "viewport",
  "openGraph",
  "structuredData",
  "contactInfo",
] as const;

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

function walkJsonLdNodes(data: unknown, visit: (node: Record<string, unknown>) => void): void {
  if (Array.isArray(data)) {
    for (const item of data) {
      walkJsonLdNodes(item, visit);
    }
    return;
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    visit(record);
    if (record["@graph"]) {
      walkJsonLdNodes(record["@graph"], visit);
    }
  }
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

const PHONE_PATTERN =
  /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const ADDRESS_HINT =
  /\b\d{1,5}\s+\w+(\s+\w+){0,4}\s+(st|street|ave|avenue|rd|road|blvd|drive|dr|lane|ln|way|court|ct)\b/i;

function stripScriptsAndUrlAttributes(html: string): string {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/\s(?:href|src|content|url)=["'][^"']*["']/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function hasJsonLdContact(html: string): boolean {
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
      let found = false;
      walkJsonLdNodes(data, (node) => {
        if (typeof node.telephone === "string" && node.telephone.trim()) {
          found = true;
        }
        if (typeof node.email === "string" && node.email.trim()) {
          found = true;
        }
      });
      if (found) {
        return true;
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }
  return false;
}

function hasContactSignals(html: string): boolean {
  if (/href=["']tel:/i.test(html)) {
    return true;
  }
  if (/href=["']mailto:/i.test(html)) {
    return true;
  }
  if (hasJsonLdContact(html)) {
    return true;
  }

  const text = stripScriptsAndUrlAttributes(html);
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

function htmlChecksBlockedByHost(): VisibilityFinding[] {
  return HTML_CHECK_IDS.map((id) => makeFinding(id, "unknown", HOST_BLOCKS_AUTOMATED_DETAIL));
}

function htmlChecksUnfetchable(detail: string): VisibilityFinding[] {
  return HTML_CHECK_IDS.map((id) => makeFinding(id, "fail", detail));
}

function runHtmlChecks(html: string, truncated: boolean): VisibilityFinding[] {
  const findings: VisibilityFinding[] = [];
  const truncationNote = truncated
    ? " (We analyzed the first 512 KB of your homepage; the rest was not loaded.)"
    : "";

  const title = extractTitle(html);
  findings.push(
    title
      ? makeFinding("title", "pass", `Found page title: "${title.slice(0, 120)}".${truncationNote}`)
      : makeFinding("title", "fail", `No <title> tag found on your homepage.${truncationNote}`),
  );

  const description = extractMetaContent(html, "description");
  findings.push(
    description
      ? makeFinding(
          "metaDescription",
          "pass",
          `Found meta description (${description.length} characters).${truncationNote}`,
        )
      : makeFinding(
          "metaDescription",
          "warn",
          `No meta description tag found on your homepage.${truncationNote}`,
        ),
  );

  const h1Count = countH1(html);
  if (h1Count === 1) {
    findings.push(makeFinding("h1", "pass", `Your homepage has one H1 heading.${truncationNote}`));
  } else if (h1Count === 0) {
    findings.push(
      makeFinding("h1", "fail", `No H1 heading found on your homepage.${truncationNote}`),
    );
  } else {
    findings.push(
      makeFinding(
        "h1",
        "warn",
        `Found ${h1Count} H1 headings. One clear H1 is best.${truncationNote}`,
      ),
    );
  }

  const viewport = extractMetaContent(html, "viewport");
  findings.push(
    viewport
      ? makeFinding(
          "viewport",
          "pass",
          `Viewport meta tag is present for mobile layouts.${truncationNote}`,
        )
      : makeFinding(
          "viewport",
          "fail",
          `Missing viewport meta tag for mobile devices.${truncationNote}`,
        ),
  );

  const ogTitle = extractOgTag(html, "og:title");
  const ogDescription = extractOgTag(html, "og:description");
  const ogImage = extractOgTag(html, "og:image");
  const ogCount = [ogTitle, ogDescription, ogImage].filter(Boolean).length;
  if (ogCount >= 2) {
    findings.push(
      makeFinding(
        "openGraph",
        "pass",
        `Key Open Graph tags are present for link previews.${truncationNote}`,
      ),
    );
  } else if (ogCount === 1) {
    findings.push(
      makeFinding(
        "openGraph",
        "warn",
        `Some Open Graph tags are missing (title, description, and image work best together).${truncationNote}`,
      ),
    );
  } else {
    findings.push(
      makeFinding(
        "openGraph",
        "fail",
        `No Open Graph tags found for social link previews.${truncationNote}`,
      ),
    );
  }

  findings.push(
    hasJsonLdBusinessType(html)
      ? makeFinding(
          "structuredData",
          "pass",
          `Found JSON-LD structured data for a business or organization.${truncationNote}`,
        )
      : makeFinding(
          "structuredData",
          "warn",
          `No LocalBusiness or Organization JSON-LD found on your homepage.${truncationNote}`,
        ),
  );

  findings.push(
    hasContactSignals(html)
      ? makeFinding(
          "contactInfo",
          "pass",
          `Contact clues (phone, email, address, or service area) appear on the homepage.${truncationNote}`,
        )
      : makeFinding(
          "contactInfo",
          "warn",
          `We did not spot obvious phone, email, or address text on the homepage.${truncationNote}`,
        ),
  );

  return findings;
}

export function runDeterministicChecks(resources: SiteResources): VisibilityFinding[] {
  const findings: VisibilityFinding[] = [];
  findings.push(checkHttps(resources));

  const readiness = classifyHomepageForChecks(resources.homepage);
  const hostBlocksAutomated = readiness.kind === "bot_challenge";

  if (readiness.kind === "readable") {
    findings.push(...runHtmlChecks(readiness.html, readiness.truncated));
  } else if (readiness.kind === "bot_challenge") {
    findings.push(...htmlChecksBlockedByHost());
  } else if (readiness.kind === "unexpected_status") {
    const detail = `Your homepage returned HTTP ${readiness.status} instead of 200, so we could not analyze the HTML.`;
    findings.push(...htmlChecksUnfetchable(detail));
  } else {
    findings.push(...htmlChecksUnfetchable(readiness.detail));
  }

  findings.push(checkRobots(resources.robotsTxt, hostBlocksAutomated));
  findings.push(checkAiCrawlers(resources.robotsTxt, hostBlocksAutomated));
  findings.push(checkSitemap(resources.sitemapXml, hostBlocksAutomated));
  findings.push(checkLlmsTxt(resources.llmsTxt, hostBlocksAutomated));

  return findings;
}

function auxiliaryUnknownDetail(fileLabel: string): string {
  return `This site's host blocks automated checks, so we could not verify ${fileLabel}.`;
}

function checkRobots(result: FetchResult | null, hostBlocksAutomated: boolean): VisibilityFinding {
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
  if (hostBlocksAutomated && isBotChallengeFetch(result)) {
    return makeFinding("robotsTxt", "unknown", auxiliaryUnknownDetail("robots.txt"));
  }
  if (result.status >= 200 && result.status < 300 && looksLikeRobotsTxt(result.body)) {
    return makeFinding("robotsTxt", "pass", "robots.txt is present at your site root.");
  }
  if (isHtmlLikeBody(result.body) || isBotChallengeFetch(result)) {
    return makeFinding(
      "robotsTxt",
      "warn",
      "robots.txt did not look like a valid robots file (got HTML or a bot challenge instead).",
    );
  }
  if (result.status >= 200 && result.status < 300 && result.body.trim().length > 0) {
    return makeFinding(
      "robotsTxt",
      "warn",
      "robots.txt exists but did not include recognizable User-agent rules.",
    );
  }
  return makeFinding(
    "robotsTxt",
    "warn",
    `robots.txt returned HTTP ${result.status} or was empty.`,
  );
}

function checkAiCrawlers(
  result: FetchResult | null,
  hostBlocksAutomated: boolean,
): VisibilityFinding {
  if (!result?.ok || result.status < 200 || result.status >= 400) {
    return makeFinding(
      "aiCrawlers",
      "pass",
      "No robots.txt rules were found that block AI crawlers.",
    );
  }
  if (hostBlocksAutomated && isBotChallengeFetch(result)) {
    return makeFinding(
      "aiCrawlers",
      "unknown",
      auxiliaryUnknownDetail("AI crawler rules in robots.txt"),
    );
  }
  if (!looksLikeRobotsTxt(result.body)) {
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

function checkSitemap(result: FetchResult | null, hostBlocksAutomated: boolean): VisibilityFinding {
  if (!result?.ok) {
    return makeFinding("sitemap", "warn", "sitemap.xml was missing or could not be loaded.");
  }
  if (hostBlocksAutomated && isBotChallengeFetch(result)) {
    return makeFinding("sitemap", "unknown", auxiliaryUnknownDetail("your XML sitemap"));
  }
  if (result.status >= 200 && result.status < 300 && isValidSitemapXml(result.body)) {
    const isIndex = result.body.includes("<sitemapindex");
    return makeFinding(
      "sitemap",
      "pass",
      isIndex
        ? "A valid XML sitemap index is present."
        : "sitemap.xml is present and looks like a valid sitemap.",
    );
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

function checkLlmsTxt(result: FetchResult | null, hostBlocksAutomated: boolean): VisibilityFinding {
  if (!result?.ok) {
    return makeFinding("llmsTxt", "warn", "No llms.txt file found at your site root yet.");
  }
  if (hostBlocksAutomated && isBotChallengeFetch(result)) {
    return makeFinding("llmsTxt", "unknown", auxiliaryUnknownDetail("llms.txt"));
  }
  if (isHtmlLikeBody(result.body) || isBotChallengeFetch(result)) {
    return makeFinding(
      "llmsTxt",
      "warn",
      "llms.txt was missing or returned HTML instead of plain text.",
    );
  }
  if (result.status >= 200 && result.status < 300 && result.body.trim().length > 10) {
    return makeFinding("llmsTxt", "pass", "llms.txt is present with readable content.");
  }
  return makeFinding("llmsTxt", "warn", "llms.txt is missing or nearly empty.");
}

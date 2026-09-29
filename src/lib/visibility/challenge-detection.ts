import type { FetchResult, FetchSuccess } from "./types";

function headerValue(
  headers: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }
  return undefined;
}

export function isTinyMetaRefreshChallenge(html: string): boolean {
  if (html.length >= 1024) {
    return false;
  }
  const hasRefresh = /<meta[^>]+http-equiv=["']refresh["']/i.test(html);
  if (!hasRefresh) {
    return false;
  }
  const textOnly = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return textOnly.length < 200;
}

function hasCloudflareChallengeMarker(body: string): boolean {
  const lower = body.toLowerCase();
  return (
    lower.includes("cf-chl") || lower.includes("cf_chl_opt") || lower.includes("challenge-platform")
  );
}

function isCloudflareInterstitialChallenge(
  body: string,
  headers?: Record<string, string>,
): boolean {
  const cfMitigated = headerValue(headers, "cf-mitigated");
  if (cfMitigated?.toLowerCase() === "challenge") {
    return true;
  }
  if (!hasCloudflareChallengeMarker(body)) {
    return false;
  }
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body);
  const titleText = titleMatch?.[1] ?? "";
  return titleText.toLowerCase().includes("just a moment");
}

export function isBotChallengeBody(body: string, headers?: Record<string, string>): boolean {
  const sgCaptcha = headerValue(headers, "sg-captcha");
  if (sgCaptcha?.toLowerCase().includes("challenge")) {
    return true;
  }

  if (isCloudflareInterstitialChallenge(body, headers)) {
    return true;
  }
  if (body.includes("/.well-known/sgcaptcha")) {
    return true;
  }
  if (isTinyMetaRefreshChallenge(body)) {
    return true;
  }
  return false;
}

export function isBotChallengeFetch(result: FetchResult): boolean {
  if (!result.ok) {
    return false;
  }
  return isBotChallengeBody(result.body, result.headers);
}

export function isHtmlLikeBody(body: string): boolean {
  const trimmed = body.trim().toLowerCase();
  if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
    return true;
  }
  return trimmed.includes("<html") && trimmed.includes("<head");
}

export function looksLikeRobotsTxt(body: string): boolean {
  if (!body.trim()) {
    return false;
  }
  if (isHtmlLikeBody(body) || isBotChallengeBody(body)) {
    return false;
  }
  return /^user-agent:/im.test(body);
}

export function isValidSitemapXml(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed || isHtmlLikeBody(trimmed) || isBotChallengeBody(trimmed)) {
    return false;
  }
  return trimmed.includes("<urlset") || trimmed.includes("<sitemapindex");
}

export function parseRobotsSitemapUrls(robotsBody: string): string[] {
  const urls: string[] = [];
  for (const rawLine of robotsBody.split(/\r?\n/)) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    const match = /^sitemap:\s*(.+)$/i.exec(line);
    if (match) {
      urls.push(match[1].trim());
    }
  }
  return urls;
}

export function resolveSitemapUrl(sitemapLine: string, origin: string): string {
  try {
    return new URL(sitemapLine, origin).toString();
  } catch {
    return sitemapLine;
  }
}

export type HomepageReadiness =
  | { kind: "readable"; html: string; truncated: boolean }
  | { kind: "bot_challenge" }
  | { kind: "unexpected_status"; status: number }
  | { kind: "unfetchable"; detail: string };

export function classifyHomepageForChecks(home: FetchResult | null): HomepageReadiness {
  if (!home) {
    return { kind: "unfetchable", detail: "We could not fetch your homepage." };
  }
  if (!home.ok) {
    const detail =
      home.error === "timeout"
        ? "We could not fetch your homepage (timeout)."
        : "We could not fetch your homepage (timeout, blocked, or connection error).";
    return { kind: "unfetchable", detail };
  }

  const success = home as FetchSuccess;
  if (isBotChallengeFetch(success)) {
    return { kind: "bot_challenge" };
  }

  if (success.status !== 200) {
    if (success.status >= 200 && success.status < 300) {
      return { kind: "unexpected_status", status: success.status };
    }
    return {
      kind: "unfetchable",
      detail: `Your homepage returned HTTP status ${success.status}.`,
    };
  }

  return {
    kind: "readable",
    html: success.body,
    truncated: success.truncated === true,
  };
}

export const HOST_BLOCKS_AUTOMATED_DETAIL =
  "This site's host blocks automated checks, so we could not read your homepage HTML.";

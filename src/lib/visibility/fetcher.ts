import {
  isValidSitemapXml,
  parseRobotsSitemapUrls,
  resolveSitemapUrl,
} from "./challenge-detection";
import type { FetchResult, FetchUrlOptions, VisibilityFetcher } from "./types";
import { precheckHostnameDns, validatePublicHttpUrl } from "./url-validation";

const DEFAULT_TIMEOUT_MS = 12_000;
const AUXILIARY_TIMEOUT_MS = 6_000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 5;

export type SafeFetcherConfig = {
  timeoutMs?: number;
  maxBytes?: number;
};

type ReadBodyResult = { body: string; truncated: boolean };

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<ReadBodyResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (text.length > maxBytes) {
      return { body: text.slice(0, maxBytes), truncated: true };
    }
    return { body: text, truncated: false };
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      const nextTotal = total + value.byteLength;
      if (nextTotal > maxBytes) {
        const remaining = maxBytes - total;
        if (remaining > 0) {
          chunks.push(value.subarray(0, remaining));
          total = maxBytes;
        }
        truncated = true;
        await reader.cancel();
        break;
      }
      total = nextTotal;
      chunks.push(value);
    }
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return {
    body: new TextDecoder("utf-8", { fatal: false }).decode(combined),
    truncated,
  };
}

function collectHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

export function createSafeVisibilityFetcher(config?: SafeFetcherConfig): VisibilityFetcher {
  const defaultTimeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = config?.maxBytes ?? MAX_BYTES;

  return {
    async fetchUrl(url: string, options?: FetchUrlOptions): Promise<FetchResult> {
      const timeoutMs = options?.timeoutMs ?? defaultTimeoutMs;
      const validated = validatePublicHttpUrl(url);
      if (!validated.ok) {
        return { ok: false, error: "blocked" };
      }

      const dnsPrecheck = await precheckHostnameDns(validated.hostname);
      if (dnsPrecheck === "blocked_private") {
        return { ok: false, error: "blocked" };
      }
      if (dnsPrecheck === "unresolvable") {
        return { ok: false, error: "fetch_failed", message: "dns_unresolvable" };
      }

      let currentUrl = validated.normalized;
      for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
        const nextValidated = validatePublicHttpUrl(currentUrl);
        if (!nextValidated.ok) {
          return { ok: false, error: "blocked" };
        }

        try {
          const response = await fetch(currentUrl, {
            method: "GET",
            redirect: "manual",
            headers: {
              accept: "text/html,text/plain,application/xml,text/xml,*/*;q=0.8",
              "user-agent": "DidiBuildVisibilityChecker/1.0 (+https://didi.build)",
            },
            signal: AbortSignal.timeout(timeoutMs),
          });

          if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location");
            if (!location || redirect === MAX_REDIRECTS) {
              return { ok: false, error: "fetch_failed", message: "too_many_redirects" };
            }
            currentUrl = new URL(location, currentUrl).toString();
            continue;
          }

          const { body, truncated } = await readBodyWithLimit(response, maxBytes);

          return {
            ok: true,
            status: response.status,
            body,
            finalUrl: response.url || currentUrl,
            headers: collectHeaders(response),
            truncated,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            (error.name === "TimeoutError" || error.name === "AbortError")
          ) {
            return { ok: false, error: "timeout" };
          }
          return { ok: false, error: "fetch_failed" };
        }
      }

      return { ok: false, error: "fetch_failed" };
    },
  };
}

export async function fetchSiteResources(
  fetcher: VisibilityFetcher,
  normalizedUrl: string,
): Promise<import("./types").SiteResources> {
  const originUrl = new URL(normalizedUrl);
  const origin = originUrl.origin;

  const homepage = await fetcher.fetchUrl(normalizedUrl);
  const [robotsTxt, defaultSitemap, llmsTxt] = await Promise.all([
    fetcher.fetchUrl(`${origin}/robots.txt`, { timeoutMs: AUXILIARY_TIMEOUT_MS }),
    fetcher.fetchUrl(`${origin}/sitemap.xml`, { timeoutMs: AUXILIARY_TIMEOUT_MS }),
    fetcher.fetchUrl(`${origin}/llms.txt`, { timeoutMs: AUXILIARY_TIMEOUT_MS }),
  ]);

  let sitemapXml = defaultSitemap;
  const robotsBody = robotsTxt?.ok ? robotsTxt.body : "";
  const robotsSitemaps = parseRobotsSitemapUrls(robotsBody);
  if (!isValidSitemapXml(sitemapXml?.ok ? sitemapXml.body : "") && robotsSitemaps.length > 0) {
    const fallbackUrl = resolveSitemapUrl(robotsSitemaps[0], origin);
    sitemapXml = await fetcher.fetchUrl(fallbackUrl, { timeoutMs: AUXILIARY_TIMEOUT_MS });
  }

  return {
    normalizedUrl,
    origin,
    homepage,
    robotsTxt,
    sitemapXml,
    llmsTxt,
  };
}

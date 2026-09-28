import type { FetchResult, VisibilityFetcher } from "./types";
import { assertHostnameResolvesToPublicIps, validatePublicHttpUrl } from "./url-validation";

const DEFAULT_TIMEOUT_MS = 12_000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 5;

export type SafeFetcherConfig = {
  timeoutMs?: number;
  maxBytes?: number;
};

async function readBodyWithLimit(
  response: Response,
  maxBytes: number,
): Promise<string | "too_large"> {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (text.length > maxBytes) {
      return "too_large";
    }
    return text;
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return "too_large";
      }
      chunks.push(value);
    }
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(combined);
}

export function createSafeVisibilityFetcher(config?: SafeFetcherConfig): VisibilityFetcher {
  const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = config?.maxBytes ?? MAX_BYTES;

  return {
    async fetchUrl(url: string): Promise<FetchResult> {
      const validated = validatePublicHttpUrl(url);
      if (!validated.ok) {
        return { ok: false, error: "blocked" };
      }

      const resolvesPublic = await assertHostnameResolvesToPublicIps(validated.hostname);
      if (!resolvesPublic) {
        return { ok: false, error: "blocked" };
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

          const body = await readBodyWithLimit(response, maxBytes);
          if (body === "too_large") {
            return { ok: false, error: "too_large" };
          }

          return {
            ok: true,
            status: response.status,
            body,
            finalUrl: response.url || currentUrl,
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
  const robotsTxt = await fetcher.fetchUrl(`${origin}/robots.txt`);
  const sitemapXml = await fetcher.fetchUrl(`${origin}/sitemap.xml`);
  const llmsTxt = await fetcher.fetchUrl(`${origin}/llms.txt`);

  return {
    normalizedUrl,
    origin,
    homepage,
    robotsTxt,
    sitemapXml,
    llmsTxt,
  };
}

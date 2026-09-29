import { describe, expect, it, vi } from "vitest";
import { fetchSiteResources } from "./fetcher";
import type { FetchResult, VisibilityFetcher } from "./types";

const SITEMAP_INDEX =
  '<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>';

describe("fetchSiteResources", () => {
  it("fetches auxiliary files concurrently after the homepage", async () => {
    const order: string[] = [];
    const fetcher: VisibilityFetcher = {
      fetchUrl: vi.fn(async (url: string, options?: { timeoutMs?: number }) => {
        order.push(url);
        if (url.includes("robots") || url.includes("sitemap") || url.includes("llms")) {
          expect(options?.timeoutMs).toBe(6000);
        }
        const result: FetchResult = {
          ok: true,
          status: 200,
          body: "ok",
          finalUrl: url,
        };
        return result;
      }),
    };

    await fetchSiteResources(fetcher, "https://example.com/");
    expect(order[0]).toBe("https://example.com/");
    const aux = order.slice(1);
    expect(aux).toHaveLength(3);
    expect(aux).toContain("https://example.com/robots.txt");
    expect(aux).toContain("https://example.com/sitemap.xml");
    expect(aux).toContain("https://example.com/llms.txt");
  });

  it("follows Sitemap in robots.txt when default sitemap.xml is not valid XML", async () => {
    const fetcher: VisibilityFetcher = {
      fetchUrl: vi.fn(async (url: string): Promise<FetchResult> => {
        if (url.endsWith("/robots.txt")) {
          return {
            ok: true,
            status: 200,
            body: "User-agent: *\nSitemap: https://example.com/sitemap_index.xml\n",
            finalUrl: url,
          };
        }
        if (url.endsWith("/sitemap.xml")) {
          return { ok: true, status: 404, body: "not found", finalUrl: url };
        }
        if (url.endsWith("/sitemap_index.xml")) {
          return { ok: true, status: 200, body: SITEMAP_INDEX, finalUrl: url };
        }
        return { ok: true, status: 200, body: "<html></html>", finalUrl: url };
      }),
    };

    const resources = await fetchSiteResources(fetcher, "https://example.com/");
    expect(resources.sitemapXml?.ok).toBe(true);
    if (resources.sitemapXml?.ok) {
      expect(resources.sitemapXml.body).toContain("<sitemapindex");
      expect(resources.sitemapXml.finalUrl).toContain("sitemap_index.xml");
    }
  });
});

import { describe, expect, it, vi } from "vitest";
import { fetchSiteResources } from "./fetcher";
import type { FetchResult, VisibilityFetcher } from "./types";

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
});

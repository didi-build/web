import { describe, expect, it } from "vitest";
import { DefaultVisibilityChecker, VisibilityCheckError } from "./visibility-checker";
import type { FetchResult, VisibilityFetcher } from "./types";

function mockFetcher(map: Record<string, FetchResult>): VisibilityFetcher {
  return {
    fetchUrl: async (url: string) => {
      const key = Object.keys(map).find((k) => url.startsWith(k) || url === k);
      if (!key) {
        return { ok: false, error: "fetch_failed" };
      }
      return map[key];
    },
  };
}

describe("DefaultVisibilityChecker", () => {
  it("throws on invalid URL", async () => {
    const checker = new DefaultVisibilityChecker(mockFetcher({}));
    await expect(checker.check("http://127.0.0.1")).rejects.toBeInstanceOf(VisibilityCheckError);
  });

  it("returns findings for a reachable homepage", async () => {
    const checker = new DefaultVisibilityChecker(
      mockFetcher({
        "https://shop.example": {
          ok: true,
          status: 200,
          finalUrl: "https://shop.example/",
          body: "<html><head><title>Shop</title></head><body><h1>Shop</h1></body></html>",
        },
      }),
    );
    const findings = await checker.check("https://shop.example");
    expect(findings.some((f) => f.id === "title" && f.status === "pass")).toBe(true);
  });
});

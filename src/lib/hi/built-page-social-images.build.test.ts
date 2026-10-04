import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractOgImageUrl, extractTwitterImageUrl } from "@/lib/hi/extract-social-image-urls";

const builtAppDir = join(import.meta.dirname, "../../../.next/server/app");

function readBuiltPageHtml(route: "index" | "hi"): string {
  return readFileSync(join(builtAppDir, `${route}.html`), "utf8");
}

describe("built page social images", () => {
  it("gives /hi the same og:image and twitter:image URLs as the home page (file-based OG asset)", () => {
    const homeHtml = readBuiltPageHtml("index");
    const hiHtml = readBuiltPageHtml("hi");

    const homeOg = extractOgImageUrl(homeHtml);
    const hiOg = extractOgImageUrl(hiHtml);
    const homeTwitter = extractTwitterImageUrl(homeHtml);
    const hiTwitter = extractTwitterImageUrl(hiHtml);

    expect(homeOg).toBeDefined();
    expect(hiOg).toBe(homeOg);
    expect(homeTwitter).toBe(homeOg);
    expect(hiTwitter).toBe(homeOg);
    expect(homeOg).toMatch(/opengraph-image\.png\?[a-f0-9]+$/);

    const hiTitle = hiHtml.match(/property="og:title"\s+content="([^"]+)"/)?.[1];
    expect(hiTitle).toBe("Hi, I&#x27;m Didi");
    const hiUrl = hiHtml.match(/property="og:url"\s+content="([^"]+)"/)?.[1];
    expect(hiUrl).toBe("https://didi.build/hi");
  });
});

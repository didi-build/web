import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractMetaName, extractOgProperty } from "@/lib/hi/extract-built-meta";
import { extractOgImageUrl, extractTwitterImageUrl } from "@/lib/hi/extract-social-image-urls";

const builtAppDir = join(import.meta.dirname, "../../../.next/server/app");

function readBuiltPageHtml(route: "index" | "hi"): string {
  return readFileSync(join(builtAppDir, `${route}.html`), "utf8");
}

const SHARED_OG_PROPERTIES = ["og:site_name", "og:type", "og:locale", "og:description"] as const;
const SHARED_META_NAMES = ["twitter:card", "twitter:description"] as const;

describe("built page social images", () => {
  it("gives /hi the same shared OG/Twitter fields as the home page (file-based OG asset)", () => {
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

    for (const property of SHARED_OG_PROPERTIES) {
      expect(extractOgProperty(hiHtml, property)).toBe(extractOgProperty(homeHtml, property));
    }

    for (const name of SHARED_META_NAMES) {
      expect(extractMetaName(hiHtml, name)).toBe(extractMetaName(homeHtml, name));
    }

    expect(extractMetaName(homeHtml, "twitter:card")).toBe("summary_large_image");

    const hiTitle = extractOgProperty(hiHtml, "og:title");
    expect(hiTitle).toBe("Hi, I&#x27;m Didi");
    const hiUrl = extractOgProperty(hiHtml, "og:url");
    expect(hiUrl).toBe("https://didi.build/hi");
  });
});

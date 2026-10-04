import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { OPEN_GRAPH_IMAGE_PATH, sharedOpenGraphDescription } from "@/lib/site-metadata";
import { hiPageMetadata } from "@/lib/hi/page-metadata";

describe("hiPageMetadata", () => {
  it("reuses the base Open Graph image and description", () => {
    const metadata = hiPageMetadata();

    expect(metadata.description).toBe(sharedOpenGraphDescription);
    expect(metadata.description).toBe(siteContent.meta.description);

    const images = metadata.openGraph?.images;
    const ogImage = Array.isArray(images) ? images[0] : images;
    expect(ogImage).toMatchObject({
      url: OPEN_GRAPH_IMAGE_PATH,
      alt: siteContent.meta.ogImageAlt,
    });
  });

  it("sets page-specific title, url, and noindex", () => {
    const metadata = hiPageMetadata();

    expect(metadata.title).toBe(siteContent.hi.pageTitle);
    expect(metadata.openGraph?.title).toBe(siteContent.hi.pageTitle);
    expect(metadata.openGraph?.url).toBe(`${siteContent.meta.siteUrl}/hi`);
    expect(metadata.twitter?.title).toBe(siteContent.hi.pageTitle);
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});

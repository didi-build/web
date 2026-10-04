import type { ResolvingMetadata } from "next";
import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { resolveHiPageMetadata } from "@/lib/hi/page-metadata";

describe("resolveHiPageMetadata", () => {
  it("inherits parent openGraph images while setting page title and URL", async () => {
    const parentImages = [
      {
        url: "https://didi.build/opengraph-image.png?099e94a028321a0b",
        width: 1200,
        height: 630,
        alt: siteContent.meta.ogImageAlt,
      },
    ];

    const parent: ResolvingMetadata = Promise.resolve({
      openGraph: { images: parentImages },
      twitter: { images: ["https://didi.build/opengraph-image.png?099e94a028321a0b"] },
    } as unknown as Awaited<ResolvingMetadata>);

    const metadata = await resolveHiPageMetadata(parent);

    expect(metadata.title).toBe(siteContent.hi.pageTitle);
    expect(metadata.openGraph?.title).toBe(siteContent.hi.pageTitle);
    expect(metadata.openGraph?.url).toBe(`${siteContent.meta.siteUrl}/hi`);
    expect(metadata.openGraph?.images).toEqual(parentImages);
    expect(metadata.twitter?.title).toBe(siteContent.hi.pageTitle);
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});

import type { Metadata, ResolvingMetadata } from "next";
import { siteContent } from "@/content/site";

const { hi, meta } = siteContent;

/**
 * Page-specific metadata for /hi. Inherits openGraph.images from the parent layout
 * (file-based `app/opengraph-image.png`) via the metadata resolver.
 */
export async function resolveHiPageMetadata(parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent;
  const inheritedImages = parentMetadata.openGraph?.images;
  const pageUrl = `${meta.siteUrl}/hi`;

  return {
    title: hi.pageTitle,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: "/hi",
    },
    openGraph: {
      title: hi.pageTitle,
      url: pageUrl,
      ...(inheritedImages ? { images: inheritedImages } : {}),
    },
    twitter: {
      title: hi.pageTitle,
      ...(parentMetadata.twitter?.images ? { images: parentMetadata.twitter.images } : {}),
    },
  };
}

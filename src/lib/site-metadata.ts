import type { Metadata } from "next";
import { siteContent } from "@/content/site";

/** Path served by Next.js file-based `opengraph-image.png` metadata route. */
export const OPEN_GRAPH_IMAGE_PATH = "/opengraph-image.png";

export const OPEN_GRAPH_IMAGE_WIDTH = 1200;
export const OPEN_GRAPH_IMAGE_HEIGHT = 630;

const { meta, brand } = siteContent;

export const sharedOpenGraphImage = {
  url: OPEN_GRAPH_IMAGE_PATH,
  width: OPEN_GRAPH_IMAGE_WIDTH,
  height: OPEN_GRAPH_IMAGE_HEIGHT,
  alt: meta.ogImageAlt,
};

export const sharedOpenGraphDescription = meta.description;

export function baseOpenGraphFields(): NonNullable<Metadata["openGraph"]> {
  return {
    description: sharedOpenGraphDescription,
    siteName: brand,
    locale: "en_CA",
    type: "website",
    images: [sharedOpenGraphImage],
  };
}

export function baseTwitterCardFields(): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    description: sharedOpenGraphDescription,
  };
}

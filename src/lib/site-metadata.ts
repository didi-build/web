import type { Metadata } from "next";
import { siteContent } from "@/content/site";

const { meta, brand } = siteContent;

export const sharedOpenGraphDescription = meta.description;

/** Open Graph fields shared by routes. Image comes from `app/opengraph-image.png` metadata file. */
export function baseOpenGraphFields(): NonNullable<Metadata["openGraph"]> {
  return {
    description: sharedOpenGraphDescription,
    siteName: brand,
    locale: "en_CA",
    type: "website",
  };
}

export function baseTwitterCardFields(): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    description: sharedOpenGraphDescription,
  };
}

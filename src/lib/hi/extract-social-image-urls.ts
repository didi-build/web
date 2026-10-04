import { extractMetaName, extractOgProperty } from "@/lib/hi/extract-built-meta";

export function extractOgImageUrl(html: string): string | undefined {
  return extractOgProperty(html, "og:image");
}

export function extractTwitterImageUrl(html: string): string | undefined {
  return extractMetaName(html, "twitter:image");
}

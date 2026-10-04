const OG_IMAGE_RE = /property="og:image"\s+content="([^"]+)"/;
const TWITTER_IMAGE_RE = /name="twitter:image"\s+content="([^"]+)"/;

export function extractOgImageUrl(html: string): string | undefined {
  return html.match(OG_IMAGE_RE)?.[1];
}

export function extractTwitterImageUrl(html: string): string | undefined {
  return html.match(TWITTER_IMAGE_RE)?.[1];
}

export function extractOgProperty(html: string, property: string): string | undefined {
  const re = new RegExp(`property="${property}"\\s+content="([^"]+)"`);
  return html.match(re)?.[1];
}

export function extractMetaName(html: string, name: string): string | undefined {
  const re = new RegExp(`name="${name}"\\s+content="([^"]+)"`);
  return html.match(re)?.[1];
}

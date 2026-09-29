export type HtmlMetrics = {
  byteLength: number;
  visibleTextLength: number;
  title: string | null;
  h1Count: number;
  jsonLdPresent: boolean;
};

export function measureHtml(body: string): HtmlMetrics {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim().slice(0, 500) || null : null;

  const h1Count = (body.match(/<h1\b/gi) ?? []).length;
  const jsonLdPresent = /<script[^>]+type=["']application\/ld\+json["']/i.test(body);

  let withoutScripts = body.replace(/<script[\s\S]*?<\/script>/gi, " ");
  withoutScripts = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, " ");
  withoutScripts = withoutScripts.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const visibleText = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    byteLength: Buffer.byteLength(body, "utf8"),
    visibleTextLength: visibleText.length,
    title,
    h1Count,
    jsonLdPresent,
  };
}

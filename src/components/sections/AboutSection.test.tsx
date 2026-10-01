import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AboutSection } from "./AboutSection";

const ABOUT_CTA_SENTENCE =
  "See what I'm building on GitHub, browse my portfolio, or connect on LinkedIn.";

function collapseHtmlText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

describe("AboutSection", () => {
  it("renders the founder profile CTA with correct spacing", () => {
    const html = renderToStaticMarkup(<AboutSection />);
    const text = collapseHtmlText(html);
    expect(text).toContain(ABOUT_CTA_SENTENCE);
  });
});

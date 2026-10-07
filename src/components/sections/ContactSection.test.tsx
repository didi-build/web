import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { ContactSection } from "./ContactSection";

describe("ContactSection booking CTA", () => {
  it("links the primary button to the shared booking path", () => {
    const html = renderToStaticMarkup(<ContactSection />);
    expect(html).toContain(`href="${siteContent.bookingPath}"`);
    expect(html).toContain(siteContent.contact.bookCta);
    expect(html).toContain(siteContent.contact.email);
  });
});

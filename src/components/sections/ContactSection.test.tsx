import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { ContactSection } from "./ContactSection";

describe("ContactSection prefer-email line", () => {
  it("links book a time directly to the shared booking path", () => {
    const html = renderToStaticMarkup(<ContactSection />);
    expect(html).toContain(`href="${siteContent.bookingPath}"`);
    expect(html).toContain(siteContent.contact.bookDirectLinkLabel);
    const bookLinkPattern = `<a href="${siteContent.bookingPath}"`;
    expect(html).toContain(bookLinkPattern);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildHiFollowUpEmailHtml,
  buildHiFollowUpEmailPlain,
  formatHiFollowUpEmailSubject,
} from "./format-follow-up-email";
import { HI_FOLLOW_UP_SIGNATURE_PLAIN } from "./hi-follow-up-signature-and-footer";

describe("hi follow-up email", () => {
  it("uses the approved subject line", () => {
    expect(formatHiFollowUpEmailSubject("Alex")).toBe("Great connecting with you, Alex");
  });

  it("includes the book CTA, approved signature, and footer in HTML", () => {
    const html = buildHiFollowUpEmailHtml("Alex");
    expect(html).toContain("Book a time");
    expect(html).toContain("https://didi.build/book");
    expect(html).toContain("https://didi.build/email-logo.png");
    expect(html).toContain('width="80" height="80"');
    expect(html).toContain("Founder, Didi Build");
    expect(html).toContain("Book a call");
    expect(html).toContain("border-left:4px solid #166534");
    expect(html).toContain("only email you'll get from this exchange unless you reply");
    expect(html).toContain("Didi Build, Toronto, Ontario");
    expect(html).not.toContain("today");
  });

  it("includes approved signature and footer in plain text", () => {
    const plain = buildHiFollowUpEmailPlain("Alex");
    expect(plain).toContain(HI_FOLLOW_UP_SIGNATURE_PLAIN);
    expect(plain).toContain("Book a time");
    expect(plain).toContain("only email you'll get from this exchange unless you reply");
    expect(plain).toContain("Didi Build, Toronto, Ontario");
  });
});

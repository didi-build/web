import { describe, expect, it } from "vitest";
import {
  buildHiFollowUpEmailHtml,
  buildHiFollowUpEmailPlain,
  formatHiFollowUpEmailSubject,
} from "./format-follow-up-email";

describe("hi follow-up email", () => {
  it("uses the approved subject line", () => {
    expect(formatHiFollowUpEmailSubject("Alex")).toBe("Great connecting with you, Alex");
  });

  it("includes the book CTA, signature logo, and footer in HTML", () => {
    const html = buildHiFollowUpEmailHtml("Alex");
    expect(html).toContain("Book a time");
    expect(html).toContain("https://didi.build/book");
    expect(html).toContain("https://didi.build/email-logo.png");
    expect(html).toContain("didi.build/hi");
    expect(html).not.toContain("today");
  });

  it("includes signature and footer in plain text", () => {
    const plain = buildHiFollowUpEmailPlain("Alex");
    expect(plain).toContain("Diadem (Didi) Shoukralla");
    expect(plain).toContain("didi.build/hi");
    expect(plain).toContain("Book a time");
  });
});

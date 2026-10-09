import { describe, expect, it } from "vitest";
import {
  buildHiFollowUpEmailHtml,
  buildHiFollowUpEmailPlain,
  formatHiFollowUpEmailSubject,
} from "./format-follow-up-email";
import {
  HI_FOLLOW_UP_SIGNATURE_HTML,
  HI_FOLLOW_UP_SIGNATURE_PLAIN,
} from "./hi-follow-up-signature-and-footer";

describe("hi follow-up email", () => {
  it("uses the approved subject line", () => {
    expect(formatHiFollowUpEmailSubject("Alex")).toBe("Great connecting with you, Alex");
  });

  it("embeds the approved signature HTML and footer", () => {
    const html = buildHiFollowUpEmailHtml("Alex");
    expect(html).toContain(HI_FOLLOW_UP_SIGNATURE_HTML);
    expect(html).toContain("Book a time");
    expect(html).toContain("only email you'll get from this exchange unless you reply");
    expect(html).toContain("Didi Build, Toronto, Ontario");
    expect(html).not.toContain("today");
    expect(html).not.toContain("diadem@didi.build");
  });

  it("embeds the approved signature plain text and footer", () => {
    const plain = buildHiFollowUpEmailPlain("Alex");
    expect(plain).toContain(HI_FOLLOW_UP_SIGNATURE_PLAIN);
    expect(plain).toContain("Book a time");
    expect(plain).toContain("only email you'll get from this exchange unless you reply");
    expect(plain).toContain("Didi Build, Toronto, Ontario");
    expect(plain).not.toContain("diadem@didi.build");
  });
});

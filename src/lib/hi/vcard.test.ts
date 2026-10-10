import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { HI_HEADSHOT_PNG_BASE64 } from "@/content/hi-headshot-base64";
import { buildVCard, escapeVCardValue, foldVCardLine } from "@/lib/hi/vcard";

describe("escapeVCardValue", () => {
  it("escapes vCard special characters", () => {
    expect(escapeVCardValue("a;b,c\\n")).toBe("a\\;b\\,c\\\\n");
  });
});

describe("buildVCard", () => {
  const contact = siteContent.hi.contact;

  it("uses CRLF line endings and required fields", () => {
    const vcard = buildVCard(contact, siteContent.meta.siteUrl);

    expect(vcard).toContain("\r\n");
    expect(vcard.startsWith("BEGIN:VCARD\r\n")).toBe(true);
    expect(vcard.endsWith("END:VCARD\r\n")).toBe(true);
    expect(vcard).toContain("N:Shoukralla;Diadem;;;");
    expect(vcard).toContain("FN:Diadem (Didi) Shoukralla");
    expect(vcard).toContain("NICKNAME:Didi");
    expect(vcard).toContain("ORG:Didi Build");
    expect(vcard).toContain("TITLE:Software Engineer and Technical Advisor");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET,WORK:diadem@didi.build");
    expect(vcard).toContain("TEL;TYPE=CELL:+1-647-716-7756");
    expect(vcard).toContain(`URL:${siteContent.meta.siteUrl}`);
    expect(vcard).toContain("URL;TYPE=LinkedIn:https://www.linkedin.com/in/diadem-shoukralla/");
    expect(vcard).toContain("URL;TYPE=GitHub:https://github.com/DiademShoukralla/");
    expect(vcard).toContain("NOTE:Met at an event. Free 30-min consult.");
    expect(vcard).toContain("PHOTO;ENCODING=b;TYPE=PNG:");
    expect(vcard).toContain(HI_HEADSHOT_PNG_BASE64.slice(0, 40));
  });

  it("folds long lines and keeps CRLF endings", () => {
    const vcard = buildVCard(contact, siteContent.meta.siteUrl);
    for (const line of vcard.split("\r\n")) {
      if (line.startsWith(" ")) {
        continue;
      }
      expect(line.length).toBeLessThanOrEqual(75);
    }
    const longLine = "A".repeat(120);
    const folded = foldVCardLine(longLine);
    expect(
      folded
        .split("\r\n")
        .every((segment, index) => (index === 0 ? true : segment.startsWith(" "))),
    ).toBe(true);
    const photoLines = vcard
      .split("\r\n")
      .filter((line) => line.includes("PHOTO;ENCODING=b") || line.startsWith(" "));
    const photoPayload = photoLines.map((line) => line.replace(/^\s/, "")).join("");
    expect(photoPayload).toContain(HI_HEADSHOT_PNG_BASE64);
    expect(() => atob(HI_HEADSHOT_PNG_BASE64)).not.toThrow();
  });
});

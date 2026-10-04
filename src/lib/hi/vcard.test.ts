import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { buildVCard, escapeVCardValue } from "@/lib/hi/vcard";

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
    expect(vcard.endsWith("END:VCARD")).toBe(true);
    expect(vcard).toContain("N:Shoukralla;Diadem;;;");
    expect(vcard).toContain("FN:Diadem (Didi) Shoukralla");
    expect(vcard).toContain("NICKNAME:Didi");
    expect(vcard).toContain("ORG:Didi Build");
    expect(vcard).toContain("TITLE:AI Integrations Consultant and Engineer");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET,WORK:diadem@didi.build");
    expect(vcard).toContain("TEL;TYPE=CELL:+1-647-716-7756");
    expect(vcard).toContain(`URL:${siteContent.meta.siteUrl}`);
    expect(vcard).toContain("URL;TYPE=LinkedIn:https://www.linkedin.com/in/diadem-shoukralla/");
    expect(vcard).toContain("URL;TYPE=GitHub:https://github.com/DiademShoukralla/");
    expect(vcard).toContain("NOTE:Met at an event. Free 30-min consult.");
  });
});

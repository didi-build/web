import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import {
  buildRawEmailMessage,
  buildRawEmailWithVCardAttachment,
  formatEmailFromHeader,
  parseServiceAccountJson,
} from "./gmail-auth";

function decodeRawEmail(raw: string): string {
  const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

describe("formatEmailFromHeader", () => {
  it("quotes ASCII display names", () => {
    expect(formatEmailFromHeader("diadem@didi.build", "Diadem at Didi Build")).toBe(
      '"Diadem at Didi Build" <diadem@didi.build>',
    );
  });
});

describe("buildRawEmailMessage", () => {
  it("sets From with display name and keeps bare address for impersonation config", () => {
    const sender = "diadem@didi.build";
    const raw = buildRawEmailMessage({
      from: sender,
      fromDisplayName: siteContent.hi.emailFromName,
      to: "lead@example.com",
      subject: "Hello",
      textPlain: "plain",
      textHtml: "<p>html</p>",
      replyTo: "lead@example.com",
    });
    const mime = decodeRawEmail(raw);
    expect(mime).toContain('From: "Diadem at Didi Build" <diadem@didi.build>');
    expect(mime).toContain("Reply-To: lead@example.com");

    const account = parseServiceAccountJson(
      JSON.stringify({
        client_email: "svc@example.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIB\n-----END PRIVATE KEY-----\n",
      }),
    );
    expect(account.client_email).toBe("svc@example.com");
    expect(sender).toBe("diadem@didi.build");
  });
});

describe("buildRawEmailWithVCardAttachment", () => {
  it("includes display name on visitor follow-up messages", () => {
    const raw = buildRawEmailWithVCardAttachment({
      from: "diadem@didi.build",
      fromDisplayName: siteContent.hi.emailFromName,
      to: "visitor@example.com",
      subject: "Hi",
      textPlain: "plain",
      textHtml: "<p>html</p>",
      vcardFilename: "card.vcf",
      vcardBody: "BEGIN:VCARD",
    });
    const mime = decodeRawEmail(raw);
    expect(mime).toContain('From: "Diadem at Didi Build" <diadem@didi.build>');
  });
});

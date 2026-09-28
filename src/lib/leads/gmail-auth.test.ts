import { describe, expect, it } from "vitest";
import {
  buildRawEmailMessage,
  encodeEmailSubject,
  parseServiceAccountJson,
  sanitizeEmailHeaderValue,
} from "./gmail-auth";

function decodeRawEmailMessage(raw: string): string {
  const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

describe("gmail-auth helpers", () => {
  it("parses service account JSON", () => {
    const parsed = parseServiceAccountJson(
      JSON.stringify({
        client_email: "svc@project.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
      }),
    );
    expect(parsed.client_email).toContain("gserviceaccount.com");
  });

  it("builds a base64url-encoded raw MIME message", () => {
    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: "Lead: Sam",
      body: "Test body",
    });
    expect(raw).not.toContain("+");
    expect(raw).not.toContain("/");
    expect(raw.length).toBeGreaterThan(10);
  });

  it("prevents header injection in Subject from user-controlled title text", () => {
    const maliciousSubject = `Lead: Bob\r\nBcc: attacker@example.com`;
    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: maliciousSubject,
      body: "Body",
    });

    const decoded = decodeRawEmailMessage(raw);
    const [headerBlock] = decoded.split("\r\n\r\n");
    const headerLines = headerBlock.split("\r\n");

    expect(headerLines).toEqual([
      "From: diadem@didi.build",
      "To: hello@didi.build",
      "Subject: Lead: Bob Bcc: attacker@example.com",
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
    ]);
    expect(headerLines.some((line) => line.startsWith("Bcc:"))).toBe(false);
  });

  it("encodes non-ASCII subjects as RFC 2047 UTF-8 base64 words", () => {
    expect(encodeEmailSubject("Lead: José")).toMatch(/^=\?UTF-8\?B\?/);
    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: "Lead: José",
      body: "Body",
    });
    const decoded = decodeRawEmailMessage(raw);
    expect(decoded).toContain("Subject: =?UTF-8?B?");
    expect(decoded).not.toContain("Subject: Lead: José");
  });

  it("strips control characters from header values", () => {
    expect(sanitizeEmailHeaderValue("a\u0000b\nc")).toBe("a b c");
  });
});

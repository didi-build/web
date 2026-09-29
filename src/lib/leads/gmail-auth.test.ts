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

function decodeMimePartBase64(encoded: string): string {
  const compact = encoded.replace(/\r\n/g, "");
  const binary = atob(compact);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function extractMimePartBodies(decoded: string, boundary: string): { plain: string; html: string } {
  const parts = decoded.split(`--${boundary}`);
  let plain = "";
  let html = "";
  for (const part of parts) {
    if (!part.includes("Content-Type:")) {
      continue;
    }
    const [, bodyBlock = ""] = part.split("\r\n\r\n");
    const body = bodyBlock.replace(/\r\n--$/, "").trimEnd();
    if (part.includes("text/plain")) {
      plain = decodeMimePartBase64(body);
    } else if (part.includes("text/html")) {
      html = decodeMimePartBase64(body);
    }
  }
  return { plain, html };
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
      textPlain: "Plain body",
      textHtml: "<p>HTML body</p>",
      boundary: "test-boundary-1234",
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
      textPlain: "Body",
      textHtml: "<p>Body</p>",
      boundary: "test-boundary-inject",
    });

    const decoded = decodeRawEmailMessage(raw);
    const [headerBlock] = decoded.split("\r\n\r\n");
    const headerLines = headerBlock.split("\r\n");

    expect(headerLines).toEqual([
      "From: diadem@didi.build",
      "To: hello@didi.build",
      "Subject: Lead: Bob Bcc: attacker@example.com",
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="test-boundary-inject"',
    ]);
    expect(headerLines.some((line) => line.startsWith("Bcc:"))).toBe(false);
  });

  it("encodes non-ASCII subjects as RFC 2047 UTF-8 base64 words", () => {
    expect(encodeEmailSubject("Lead: José")).toMatch(/^=\?UTF-8\?B\?/);
    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: "Lead: José",
      textPlain: "Body",
      textHtml: "<p>Body</p>",
    });
    const decoded = decodeRawEmailMessage(raw);
    expect(decoded).toContain("Subject: =?UTF-8?B?");
    expect(decoded).not.toContain("Subject: Lead: José");
  });

  it("strips control characters from header values", () => {
    expect(sanitizeEmailHeaderValue("a\u0000b\nc")).toBe("a b c");
  });

  it("builds multipart/alternative with plain and HTML UTF-8 parts", () => {
    const boundary = "boundary-demo-466";
    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: "New lead: Sam",
      textPlain: "Plain fallback",
      textHtml: "<p>HTML part</p>",
      boundary,
    });

    const decoded = decodeRawEmailMessage(raw);
    expect(decoded).toContain(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    expect(decoded).toContain(`--${boundary}`);
    expect(decoded).toContain("Content-Type: text/plain; charset=utf-8");
    expect(decoded).toContain("Content-Transfer-Encoding: base64");
    expect(decoded).toContain("Content-Type: text/html; charset=utf-8");
    expect(decoded).toContain(`--${boundary}--`);

    const { plain, html } = extractMimePartBodies(decoded, boundary);
    expect(plain).toBe("Plain fallback");
    expect(html).toBe("<p>HTML part</p>");
  });

  it("base64-encodes MIME parts so no line exceeds 998 characters and bodies round-trip", () => {
    const boundary = "boundary-long-lines-468";
    const message = "x".repeat(2000);
    const textPlain = `Message:\n\n${message}`;
    const textHtml = `<p>${message}</p>`;

    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: "New lead: Long message",
      textPlain,
      textHtml,
      boundary,
    });

    const decoded = decodeRawEmailMessage(raw);
    const lines = decoded.split("\r\n");
    const longestLine = Math.max(...lines.map((line) => line.length));
    expect(longestLine).toBeLessThanOrEqual(998);

    const { plain, html } = extractMimePartBodies(decoded, boundary);
    expect(plain).toBe(textPlain);
    expect(html).toBe(textHtml);
  });
});

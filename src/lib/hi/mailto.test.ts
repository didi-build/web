import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { buildMailtoUrl, formatEmailCopyText } from "@/lib/hi/mailto";

const BODY_PARAM = "&body=";

function parseMailtoSubjectAndBody(url: string): { subject: string; body: string } {
  const query = url.split("?")[1] ?? "";
  const bodyStart = query.indexOf(BODY_PARAM);
  if (bodyStart === -1) {
    throw new Error("mailto URL missing body parameter");
  }
  const subjectEncoded = query.slice("subject=".length, bodyStart);
  const bodyEncoded = query.slice(bodyStart + BODY_PARAM.length);
  return {
    subject: decodeURIComponent(subjectEncoded),
    body: decodeURIComponent(bodyEncoded),
  };
}

describe("buildMailtoUrl", () => {
  it("percent-encodes subject and body for mailto (no form-style + for spaces)", () => {
    const { email, mailSubject, mailBody } = siteContent.hi.contact;
    const url = buildMailtoUrl(email, mailSubject, mailBody);

    expect(url).toMatch(/^mailto:diadem@didi\.build\?/);
    expect(url).not.toContain("+");
    expect(url).toContain("%20");

    const { subject, body } = parseMailtoSubjectAndBody(url);
    expect(subject).toBe(mailSubject);
    expect(body).toBe(mailBody);
  });

  it("encodes special characters so decoding returns the original strings", () => {
    const subject = "Hi there & welcome?";
    const body = "Line one\nLine two! It's a test.";
    const url = buildMailtoUrl("test@example.com", subject, body);

    expect(url).not.toContain("+");
    const { subject: decodedSubject, body: decodedBody } = parseMailtoSubjectAndBody(url);
    expect(decodedSubject).toBe(subject);
    expect(decodedBody).toBe(body);
  });
});

describe("formatEmailCopyText", () => {
  it("formats the clipboard payload", () => {
    const { email, mailSubject, mailBody } = siteContent.hi.contact;
    const text = formatEmailCopyText(email, mailSubject, mailBody);

    expect(text).toBe(`To: ${email}\nSubject: ${mailSubject}\n\n${mailBody}`);
  });
});

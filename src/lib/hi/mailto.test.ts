import { describe, expect, it } from "vitest";
import { siteContent } from "@/content/site";
import { buildMailtoUrl, formatEmailCopyText } from "@/lib/hi/mailto";

describe("buildMailtoUrl", () => {
  it("encodes subject and body for mailto links", () => {
    const { email, mailSubject, mailBody } = siteContent.hi.contact;
    const url = buildMailtoUrl(email, mailSubject, mailBody);

    expect(url).toMatch(/^mailto:diadem@didi\.build\?/);
    const query = url.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    expect(params.get("subject")).toBe(mailSubject);
    expect(params.get("body")).toBe(mailBody);
  });
});

describe("formatEmailCopyText", () => {
  it("formats the clipboard payload", () => {
    const { email, mailSubject, mailBody } = siteContent.hi.contact;
    const text = formatEmailCopyText(email, mailSubject, mailBody);

    expect(text).toBe(`To: ${email}\nSubject: ${mailSubject}\n\n${mailBody}`);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildOwnerDetailsEmailHtml,
  buildOwnerLeadEmailHtml,
  buildOwnerLeadEmailPlain,
  formatOwnerDetailsEmailSubject,
  formatOwnerLeadEmailSubject,
} from "./format-owner-notification-email";

describe("owner notification email formatting", () => {
  it("sanitizes subject names for headers", () => {
    expect(formatOwnerLeadEmailSubject("Sam\nEvil")).toBe("New lead added: Sam Evil");
    expect(formatOwnerDetailsEmailSubject("Sam")).toBe("Details added: Sam");
  });

  it("escapes visitor fields in lead HTML", () => {
    const html = buildOwnerLeadEmailHtml({
      name: `<script>alert(1)</script>`,
      email: `a"b@c.com`,
      phone: undefined,
      linearIdentifier: "DIDI-1",
      linearUrl: "https://linear.app/didi/issue/DIDI-1",
      receivedAtIso: "2026-10-10T12:00:00.000Z",
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("mailto:a&quot;b@c.com");
  });

  it("includes optional phone dash in plain text", () => {
    const plain = buildOwnerLeadEmailPlain({
      name: "Sam",
      email: "sam@example.com",
      linearIdentifier: "DIDI-2",
      linearUrl: "https://linear.app/didi/issue/DIDI-2",
      receivedAtIso: "2026-10-10T12:00:00.000Z",
    });
    expect(plain).toContain("Phone: —");
    expect(plain).toContain("Business card");
  });

  it("only includes provided detail fields in HTML", () => {
    const html = buildOwnerDetailsEmailHtml({
      name: "Sam",
      jobTitle: "Founder",
      linearIdentifier: "DIDI-3",
      linearUrl: "https://linear.app/didi/issue/DIDI-3",
    });
    expect(html).toContain("Job title");
    expect(html).not.toContain("Company:");
    expect(html).not.toContain("Note:");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildLeadEmailHtml,
  buildLeadEmailPlainText,
  formatLeadEmailSubject,
  safeWebsiteHref,
} from "./format-lead-email";
import type { VisibilityReport } from "../visibility/types";

const baseLead = {
  name: "Sam Rivera",
  email: "sam@riverabakery.ca",
  businessName: "Rivera Bakery",
  website: "riverabakery.ca",
  message: "We spend hours on catering questions.",
};

const summary = {
  summary: "Catering inbox is the bottleneck.",
  needs: ["Faster replies"],
  suggestedPattern: "Triage + drafts",
  urgency: "high" as const,
  followUpQuestions: ["Weekly volume?"],
};

const sampleReport: VisibilityReport = {
  url: "https://riverabakery.ca/",
  checkedAt: "2026-09-28T12:00:00.000Z",
  score: 72,
  summary: "The site is reachable but missing structured data.",
  topFixes: ["Add JSON-LD for the business"],
  findings: [
    {
      id: "structured-data",
      label: "Structured data",
      status: "fail",
      detail: "No JSON-LD found.",
      whyItMatters: "Helps AI and search understand the business.",
    },
  ],
};

describe("buildLeadEmailHtml", () => {
  it("escapes script tags in name and message", () => {
    const html = buildLeadEmailHtml(
      {
        ...baseLead,
        name: '<script>alert("x")</script>',
        message: '"><img onerror=alert(1) src=x>',
      },
      summary,
      null,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;&gt;&lt;img onerror=alert(1)");
  });

  it("does not link unsafe website protocols", () => {
    const html = buildLeadEmailHtml({ ...baseLead, website: "javascript:alert(1)" }, summary, null);
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain("javascript:alert(1)");
  });

  it("shows muted copy when visibility report is unavailable", () => {
    const html = buildLeadEmailHtml(baseLead, summary, null);
    expect(html).toContain("Visibility report unavailable");
  });
});

describe("buildLeadEmailPlainText", () => {
  it("contains no markdown heading or bold markers", () => {
    const text = buildLeadEmailPlainText(baseLead, summary, sampleReport);
    expect(text).not.toMatch(/\*\*/);
    expect(text).not.toMatch(/^##/m);
  });
});

const hostBlockedReport: VisibilityReport = {
  url: "https://thrivehivestudio.ca/",
  checkedAt: "2026-09-29T12:00:00.000Z",
  score: 100,
  summary:
    "This site's host blocks automated checks from our servers, so we could not read the homepage HTML or some auxiliary files.",
  topFixes: [
    "Keep HTTPS enabled",
    "Monitor when the host allows checks",
    "Review robots.txt later",
  ],
  findings: [
    {
      id: "https",
      label: "Secure HTTPS connection",
      status: "pass",
      detail: "Your site loads over HTTPS.",
      whyItMatters: "HTTPS builds trust.",
    },
    {
      id: "title",
      label: "Page title",
      status: "unknown",
      detail: "This site's host blocks automated checks, so we could not read your homepage HTML.",
      whyItMatters: "Titles help search.",
    },
    {
      id: "robotsTxt",
      label: "robots.txt file",
      status: "unknown",
      detail: "This site's host blocks automated checks, so we could not verify robots.txt.",
      whyItMatters: "robots.txt guides crawlers.",
    },
  ],
};

describe("host-blocked visibility report email", () => {
  it("omits visibility score from subject and shows blocked-host copy in HTML and plain text", () => {
    const subject = formatLeadEmailSubject(baseLead, hostBlockedReport);
    expect(subject).toBe("New lead: Sam Rivera (Rivera Bakery)");
    expect(subject).not.toContain("visibility");

    const html = buildLeadEmailHtml(baseLead, summary, hostBlockedReport);
    expect(html).toContain("Couldn&#39;t check");
    expect(html).toContain("blocks automated checks, so we couldn&#39;t read the page.");
    expect(html).not.toContain("100 <span");

    const text = buildLeadEmailPlainText(baseLead, summary, hostBlockedReport);
    expect(text).toContain("Couldn't check");
    expect(text).toContain("blocks automated checks, so we couldn't read the page.");
    expect(text).not.toContain("Score: 100");
    expect(text).toContain("Page title (Couldn't check)");
  });
});

describe("safeWebsiteHref", () => {
  it("returns https href for bare domains", () => {
    expect(safeWebsiteHref("riverabakery.ca")).toBe("https://riverabakery.ca/");
  });

  it("returns null for non-http(s) schemes", () => {
    expect(safeWebsiteHref("javascript:alert(1)")).toBeNull();
    expect(safeWebsiteHref("ftp://files.example.com")).toBeNull();
  });
});

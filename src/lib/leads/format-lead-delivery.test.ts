import { describe, expect, it } from "vitest";
import { formatLeadDeliveryBody } from "./format-lead-delivery";
import type { VisibilityReport } from "../visibility/types";

const lead = {
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
  topFixes: ["Add JSON-LD for the business", "Publish llms.txt"],
  findings: [
    {
      id: "structured-data",
      label: "Structured data",
      status: "fail",
      detail: "No JSON-LD found.",
      whyItMatters: "Helps AI and search understand the business.",
    },
    {
      id: "https",
      label: "HTTPS",
      status: "pass",
      detail: "Site uses HTTPS.",
      whyItMatters: "Trust and security.",
    },
  ],
};

describe("formatLeadDeliveryBody", () => {
  it("includes visibility report with top fixes before detailed findings", () => {
    const body = formatLeadDeliveryBody(lead, summary, sampleReport);
    const topFixesIndex = body.indexOf("### Top fixes");
    const findingsIndex = body.indexOf("### Findings");
    expect(topFixesIndex).toBeGreaterThan(-1);
    expect(findingsIndex).toBeGreaterThan(topFixesIndex);
    expect(body).toContain("Add JSON-LD for the business");
    expect(body).toContain("Structured data");
    expect(body.indexOf("Structured data")).toBeLessThan(body.indexOf("HTTPS"));
  });

  it("notes when visibility report is unavailable for leads with a website", () => {
    const body = formatLeadDeliveryBody(lead, summary, null);
    expect(body).toContain("Visibility report unavailable");
  });

  it("omits visibility section when no website was provided", () => {
    const body = formatLeadDeliveryBody({ ...lead, website: undefined }, summary, null);
    expect(body).not.toContain("Website visibility");
  });
});

import { describe, expect, it } from "vitest";
import { formatLinearIssueDescription, formatLinearIssueTitle } from "./format-linear-issue";

describe("Linear issue formatting", () => {
  const lead = {
    name: "Sam Rivera",
    email: "sam@riverabakery.ca",
    businessName: "Rivera Bakery",
    website: "riverabakery.ca",
    message: "We spend hours on catering questions.",
  };

  it("formats the issue title with business name", () => {
    expect(formatLinearIssueTitle(lead)).toBe("Lead: Sam Rivera - Rivera Bakery");
  });

  it("includes contact details and summary in the body", () => {
    const body = formatLinearIssueDescription(lead, {
      summary: "Catering inbox is the bottleneck.",
      needs: ["Faster replies"],
      suggestedPattern: "Triage + drafts",
      urgency: "high",
      followUpQuestions: ["Weekly volume?"],
    });
    expect(body).toContain("sam@riverabakery.ca");
    expect(body).toContain("Catering inbox is the bottleneck.");
    expect(body).toContain("Weekly volume?");
  });

  it("notes when summary is unavailable", () => {
    const body = formatLinearIssueDescription(lead, null);
    expect(body).toContain("Summary unavailable");
  });
});

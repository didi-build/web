import { describe, expect, it } from "vitest";
import {
  formatHiCardLinearIssueDescription,
  formatHiCardLinearIssueTitle,
  parseLeadNameFromLinearIssueTitle,
} from "./format-linear-card-issue";

describe("formatHiCardLinearIssue", () => {
  it("formats the card lead title", () => {
    expect(formatHiCardLinearIssueTitle({ name: "Sam", email: "sam@example.com" })).toBe(
      "Lead: Sam (card)",
    );
  });

  it("parses lead name from issue title", () => {
    expect(parseLeadNameFromLinearIssueTitle("Lead: Sam Rivera (card)")).toBe("Sam Rivera");
    expect(parseLeadNameFromLinearIssueTitle("Other title")).toBeNull();
  });

  it("includes contact fields in the description", () => {
    const body = formatHiCardLinearIssueDescription({
      name: "Sam",
      email: "sam@example.com",
      phone: "+1 416-555-0100",
    });
    expect(body).toContain("sam@example.com");
    expect(body).toContain("Business card");
    expect(body).toContain("+1 416-555-0100");
  });
});

import { describe, expect, it } from "vitest";
import { leadSummarySchema, parseLeadRequest, parseLeadSummaryJson } from "./schemas";

describe("parseLeadRequest (input schema validation)", () => {
  it("accepts a valid payload", () => {
    const result = parseLeadRequest({
      name: "Sam Rivera",
      email: "sam@riverabakery.ca",
      businessName: "Rivera Bakery",
      website: "https://riverabakery.ca",
      message: "We need help with email triage.",
      turnstileToken: "token",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("sam@riverabakery.ca");
    }
  });

  it("rejects oversized messages", () => {
    const result = parseLeadRequest({
      name: "Sam",
      email: "sam@example.com",
      message: "x".repeat(2001),
      turnstileToken: "token",
    });
    expect(result.ok).toBe(false);
  });
});

describe("parseLeadSummaryJson (summary output validation)", () => {
  it("parses valid model JSON", () => {
    const parsed = parseLeadSummaryJson(
      JSON.stringify({
        summary: "Bakery wants catering email help.",
        needs: ["Reduce repetitive email replies"],
        suggestedPattern: "Inbox triage with draft replies",
        urgency: "medium",
        followUpQuestions: ["How many catering emails per week?"],
      }),
    );
    expect(parsed.ok).toBe(true);
    expect(leadSummarySchema.parse(parsed.ok ? parsed.data : null)).toBeTruthy();
  });

  it("rejects invalid urgency", () => {
    const parsed = parseLeadSummaryJson(
      JSON.stringify({
        summary: "Test",
        needs: ["a"],
        suggestedPattern: "b",
        urgency: "urgent",
        followUpQuestions: [],
      }),
    );
    expect(parsed.ok).toBe(false);
  });
});

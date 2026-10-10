import { describe, expect, it, vi } from "vitest";
import { createHiLeadToken } from "./token";
import { processHiDetails } from "./process-details";

const secret = "unit-test-secret-key-32-bytes-min";

function fakeRequest(): Request {
  return new Request("https://didi.build/api/hi/details", {
    method: "POST",
    headers: { "cf-connecting-ip": "198.51.100.4" },
  });
}

describe("processHiDetails", () => {
  it("returns 429 when rate limited", async () => {
    const result = await processHiDetails({ token: "bad" }, fakeRequest(), {
      linear: {
        createCardLead: async () => ({
          issueId: "x",
          identifier: "DIDI-0",
          url: "https://linear.app/didi/issue/DIDI-0",
        }),
        appendDetails: async () => {},
        addIssueComment: async () => {},
        getIssueLeadNotificationContext: async () => ({
          identifier: "DIDI-0",
          url: "https://linear.app/didi/issue/DIDI-0",
          leadName: "Sam",
        }),
      },
      tokenSecret: secret,
      rateLimiter: { limit: async () => ({ success: false }) },
    });
    expect(result.status).toBe(429);
  });

  it("appends details when token is valid", async () => {
    const appendDetails = vi.fn();
    const now = Math.floor(Date.now() / 1000);
    const token = await createHiLeadToken("issue-42", secret, now);
    const result = await processHiDetails({ token, jobTitle: "Founder" }, fakeRequest(), {
      linear: {
        createCardLead: async () => ({
          issueId: "issue-42",
          identifier: "DIDI-42",
          url: "https://linear.app/didi/issue/DIDI-42",
        }),
        appendDetails,
        addIssueComment: async () => {},
        getIssueLeadNotificationContext: async () => ({
          identifier: "DIDI-42",
          url: "https://linear.app/didi/issue/DIDI-42",
          leadName: "Sam",
        }),
      },
      tokenSecret: secret,
    });
    expect(result).toEqual({ status: 200 });
    expect(appendDetails).toHaveBeenCalledWith("issue-42", { jobTitle: "Founder" });
  });

  it("returns 200 when owner notify enqueue fails after comment saved", async () => {
    const appendDetails = vi.fn();
    const now = Math.floor(Date.now() / 1000);
    const token = await createHiLeadToken("issue-42", secret, now);
    const result = await processHiDetails({ token, company: "Acme" }, fakeRequest(), {
      linear: {
        createCardLead: async () => ({
          issueId: "issue-42",
          identifier: "DIDI-42",
          url: "https://linear.app/didi/issue/DIDI-42",
        }),
        appendDetails,
        addIssueComment: async () => {},
        getIssueLeadNotificationContext: async () => ({
          identifier: "DIDI-42",
          url: "https://linear.app/didi/issue/DIDI-42",
          leadName: "Sam Rivera",
        }),
      },
      followUpQueue: {
        enqueue: async () => {
          throw new Error("queue_down");
        },
        enqueueRequired: async () => {},
      },
      tokenSecret: secret,
    });
    expect(result).toEqual({ status: 200 });
    expect(appendDetails).toHaveBeenCalledOnce();
  });
});

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
        createCardLead: async () => ({ issueId: "x" }),
        appendDetails: async () => {},
        addIssueComment: async () => {},
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
        createCardLead: async () => ({ issueId: "issue-42" }),
        appendDetails,
        addIssueComment: async () => {},
      },
      tokenSecret: secret,
    });
    expect(result).toEqual({ status: 200 });
    expect(appendDetails).toHaveBeenCalledWith("issue-42", { jobTitle: "Founder" });
  });
});

import { describe, expect, it } from "vitest";
import { createHiLeadToken, verifyHiLeadToken } from "./token";

const secret = "unit-test-secret-key-32-bytes-min";

describe("hi lead token", () => {
  it("round-trips issue ids", async () => {
    const token = await createHiLeadToken("linear-issue-id", secret, 1_700_000_000);
    const payload = await verifyHiLeadToken(token, secret, 1_700_000_000);
    expect(payload).toEqual({
      v: 1,
      issueId: "linear-issue-id",
      exp: 1_700_000_000 + 7 * 24 * 60 * 60,
    });
  });

  it("rejects tampered tokens", async () => {
    const token = await createHiLeadToken("issue-1", secret);
    const payload = await verifyHiLeadToken(`${token}x`, secret);
    expect(payload).toBeNull();
  });
});

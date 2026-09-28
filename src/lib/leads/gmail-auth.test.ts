import { describe, expect, it } from "vitest";
import { buildRawEmailMessage, parseServiceAccountJson } from "./gmail-auth";

describe("gmail-auth helpers", () => {
  it("parses service account JSON", () => {
    const parsed = parseServiceAccountJson(
      JSON.stringify({
        client_email: "svc@project.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
      }),
    );
    expect(parsed.client_email).toContain("gserviceaccount.com");
  });

  it("builds a base64url-encoded raw MIME message", () => {
    const raw = buildRawEmailMessage({
      from: "diadem@didi.build",
      to: "hello@didi.build",
      subject: "Lead: Sam",
      body: "Test body",
    });
    expect(raw).not.toContain("+");
    expect(raw).not.toContain("/");
    expect(raw.length).toBeGreaterThan(10);
  });
});

import { describe, expect, it } from "vitest";
import { isBlockedHostname, isPrivateOrLocalIp, validatePublicHttpUrl } from "./url-validation";

describe("validatePublicHttpUrl", () => {
  it("normalizes bare domains to https", () => {
    const result = validatePublicHttpUrl("example.com");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized).toBe("https://example.com/");
    }
  });

  it("rejects non-http protocols", () => {
    expect(validatePublicHttpUrl("ftp://example.com").ok).toBe(false);
  });

  it("blocks localhost", () => {
    expect(validatePublicHttpUrl("http://localhost").ok).toBe(false);
    expect(validatePublicHttpUrl("http://127.0.0.1").ok).toBe(false);
  });
});

describe("isPrivateOrLocalIp", () => {
  it("detects private IPv4 ranges", () => {
    expect(isPrivateOrLocalIp("10.0.0.1")).toBe(true);
    expect(isPrivateOrLocalIp("192.168.1.1")).toBe(true);
    expect(isPrivateOrLocalIp("8.8.8.8")).toBe(false);
  });
});

describe("isBlockedHostname", () => {
  it("blocks metadata hostnames", () => {
    expect(isBlockedHostname("metadata.google.internal")).toBe(true);
    expect(isBlockedHostname("app.local")).toBe(true);
  });
});

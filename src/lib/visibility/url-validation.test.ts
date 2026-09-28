import { lookup } from "node:dns/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isBlockedHostname,
  isPrivateOrLocalIp,
  precheckHostnameDns,
  resetDnsPrecheckStateForTests,
  validatePublicHttpUrl,
} from "./url-validation";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

const lookupMock = vi.mocked(lookup);

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

describe("precheckHostnameDns", () => {
  afterEach(() => {
    lookupMock.mockReset();
    resetDnsPrecheckStateForTests();
  });

  it("blocks when lookup returns a private address", async () => {
    lookupMock.mockResolvedValue([{ address: "192.168.0.5", family: 4 }] as never);
    await expect(precheckHostnameDns("evil.example")).resolves.toBe("blocked_private");
  });

  it("skips when node:dns is unsupported in the runtime", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    lookupMock.mockRejectedValue(
      Object.assign(new Error("not implemented"), { code: "ERR_UNSUPPORTED_NODE_API" }),
    );
    await expect(precheckHostnameDns("example.com")).resolves.toBe("skipped");
    expect(infoSpy).toHaveBeenCalledWith("visibility_dns_precheck_skipped", "node_dns_unavailable");
    infoSpy.mockRestore();
  });

  it("treats NXDOMAIN as unresolvable, not blocked", async () => {
    lookupMock.mockRejectedValue(
      Object.assign(new Error("getaddrinfo ENOTFOUND"), { code: "ENOTFOUND" }),
    );
    await expect(precheckHostnameDns("does-not-exist.example")).resolves.toBe("unresolvable");
  });

  it("allows public addresses from lookup", async () => {
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as never);
    await expect(precheckHostnameDns("example.com")).resolves.toBe("allowed");
  });
});

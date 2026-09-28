import { isIP } from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

const BLOCKED_SUFFIXES = [".local", ".internal", ".localhost"];

function isPrivateIpv4(octets: number[]): boolean {
  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;
  return false;
}

export function isPrivateOrLocalIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      return true;
    }
    return isPrivateIpv4(parts);
  }
  if (version === 6) {
    return isPrivateIpv6(ip);
  }
  return true;
}

export function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(lower)) {
    return true;
  }
  if (lower.endsWith(".arpa")) {
    return true;
  }
  for (const suffix of BLOCKED_SUFFIXES) {
    if (lower.endsWith(suffix) || lower === suffix.slice(1)) {
      return true;
    }
  }
  const ipVersion = isIP(lower);
  if (ipVersion === 4 || ipVersion === 6) {
    return isPrivateOrLocalIp(lower);
  }
  return false;
}

export type UrlValidationResult =
  | { ok: true; normalized: string; hostname: string }
  | { ok: false; reason: "invalid" | "protocol" | "blocked" };

export function validatePublicHttpUrl(raw: string): UrlValidationResult {
  const trimmed = raw.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return { ok: false, reason: "protocol" };
  }

  let parsed: URL;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "protocol" };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: "invalid" };
  }

  const hostname = parsed.hostname;
  if (!hostname || isBlockedHostname(hostname)) {
    return { ok: false, reason: "blocked" };
  }

  parsed.hash = "";
  parsed.search = parsed.search;

  return { ok: true, normalized: parsed.toString(), hostname };
}

export async function assertHostnameResolvesToPublicIps(hostname: string): Promise<boolean> {
  if (isIP(hostname)) {
    return !isPrivateOrLocalIp(hostname);
  }

  try {
    const { lookup } = await import("node:dns/promises");
    const results = await lookup(hostname, { all: true, verbatim: true });
    if (results.length === 0) {
      return false;
    }
    for (const entry of results) {
      if (isPrivateOrLocalIp(entry.address)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

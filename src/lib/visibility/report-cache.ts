import type { VisibilityReport } from "./schemas";

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

type CacheEntry = {
  expiresAt: number;
  report: VisibilityReport;
};

const cache = new Map<string, CacheEntry>();

function cacheKey(url: string): string {
  return url.trim().toLowerCase();
}

export function getCachedReport(url: string): VisibilityReport | null {
  const key = cacheKey(url);
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.report;
}

export function setCachedReport(url: string, report: VisibilityReport): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
  cache.set(cacheKey(url), {
    report,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearReportCache(): void {
  cache.clear();
}

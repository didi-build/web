import type { VisibilityFinding } from "./schemas";

export type { FindingStatus, VisibilityFinding, VisibilityReport } from "./schemas";

export type ExplainerInput = {
  url: string;
  findings: VisibilityFinding[];
};

export type ExplainerOutput = {
  summary: string;
  topFixes: string[];
};

export interface VisibilityExplainer {
  explain(input: ExplainerInput): Promise<ExplainerOutput>;
}

export type FetchSuccess = {
  ok: true;
  status: number;
  body: string;
  finalUrl: string;
};

export type FetchFailure = {
  ok: false;
  error: "timeout" | "too_large" | "fetch_failed" | "blocked";
  message?: string;
};

export type FetchResult = FetchSuccess | FetchFailure;

export type FetchUrlOptions = {
  timeoutMs?: number;
};

export interface VisibilityFetcher {
  fetchUrl(url: string, options?: FetchUrlOptions): Promise<FetchResult>;
}

export type SiteResources = {
  normalizedUrl: string;
  origin: string;
  homepage: FetchResult | null;
  robotsTxt: FetchResult | null;
  sitemapXml: FetchResult | null;
  llmsTxt: FetchResult | null;
};

export interface VisibilityChecker {
  check(url: string): Promise<VisibilityFinding[]>;
}

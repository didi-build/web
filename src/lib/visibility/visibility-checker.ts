import { runDeterministicChecks } from "./checks";
import { fetchSiteResources } from "./fetcher";
import type { VisibilityChecker, VisibilityFetcher, VisibilityFinding } from "./types";
import { validatePublicHttpUrl } from "./url-validation";

export class DefaultVisibilityChecker implements VisibilityChecker {
  constructor(private readonly fetcher: VisibilityFetcher) {}

  async check(url: string): Promise<VisibilityFinding[]> {
    const validated = validatePublicHttpUrl(url);
    if (!validated.ok) {
      throw new VisibilityCheckError(
        validated.reason === "blocked" ? "blocked_url" : "invalid_url",
        "That URL is not allowed. Please use a public http or https website address.",
      );
    }

    const resources = await fetchSiteResources(this.fetcher, validated.normalized);
    const home = resources.homepage;
    if (!home) {
      throw new VisibilityCheckError("unreachable", "We could not reach that website.");
    }
    if (!home.ok) {
      const message =
        home.error === "timeout"
          ? "That website took too long to respond."
          : home.error === "blocked"
            ? "That URL is not allowed."
            : "We could not reach that website.";
      throw new VisibilityCheckError("unreachable", message);
    }
    if (home.status >= 400) {
      throw new VisibilityCheckError(
        "unreachable",
        `That website returned an error (HTTP ${home.status}).`,
      );
    }

    return runDeterministicChecks(resources);
  }
}

export class VisibilityCheckError extends Error {
  readonly code: "invalid_url" | "blocked_url" | "unreachable";

  constructor(code: "invalid_url" | "blocked_url" | "unreachable", message: string) {
    super(message);
    this.name = "VisibilityCheckError";
    this.code = code;
  }
}

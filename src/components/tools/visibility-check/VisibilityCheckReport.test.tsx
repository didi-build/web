import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { visibilityToolContent } from "@/content/visibility-tool";
import type { VisibilityReport } from "@/lib/visibility/schemas";
import { VisibilityCheckReport } from "./VisibilityCheckReport";

const hostBlockedReport: VisibilityReport = {
  url: "https://thrivehivestudio.ca/",
  checkedAt: "2026-09-29T12:00:00.000Z",
  summary: "Host blocked automated checks.",
  topFixes: ["Keep HTTPS enabled", "Retry later", "Check robots.txt when readable"],
  findings: [
    {
      id: "https",
      label: "Secure HTTPS connection",
      status: "pass",
      detail: "Your site loads over HTTPS.",
      whyItMatters: "HTTPS builds trust.",
    },
    {
      id: "title",
      label: "Page title",
      status: "unknown",
      detail: "This site's host blocks automated checks, so we could not read your homepage HTML.",
      whyItMatters: "Titles help search.",
    },
  ],
};

describe("VisibilityCheckReport", () => {
  it("shows host-blocked notice instead of a score when score is omitted", () => {
    const html = renderToStaticMarkup(<VisibilityCheckReport report={hostBlockedReport} />);
    expect(html).toContain("host blocks automated checks");
    expect(html).toContain("fully read your page");
    expect(html).not.toContain("/100");
  });
});

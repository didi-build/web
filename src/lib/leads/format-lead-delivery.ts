import type { LeadRecord, LeadSummary } from "./types";
import type { VisibilityReport } from "../visibility/types";

const FINDING_STATUS_ORDER: Record<string, number> = { fail: 0, warn: 1, pass: 2 };

export function formatLeadDeliveryBody(
  lead: LeadRecord,
  summary: LeadSummary | null,
  visibilityReport: VisibilityReport | null,
): string {
  const lines: string[] = [
    "## Contact",
    "",
    `- **Name:** ${lead.name}`,
    `- **Email:** ${lead.email}`,
  ];

  if (lead.businessName) {
    lines.push(`- **Business:** ${lead.businessName}`);
  }
  if (lead.website) {
    lines.push(`- **Website:** ${lead.website}`);
  }

  lines.push("", "## Message", "", lead.message, "");

  if (summary) {
    lines.push(
      "## AI summary",
      "",
      summary.summary,
      "",
      "### Needs",
      ...summary.needs.map((need) => `- ${need}`),
      "",
      `**Suggested pattern:** ${summary.suggestedPattern}`,
      `**Urgency:** ${summary.urgency}`,
      "",
      "### Follow-up questions",
      ...summary.followUpQuestions.map((q) => `- ${q}`),
    );
  } else {
    lines.push("## AI summary", "", "_Summary unavailable (summarizer failed or timed out)._");
  }

  if (lead.website?.trim()) {
    lines.push("", ...formatVisibilitySection(visibilityReport));
  }

  return lines.join("\n");
}

function formatVisibilitySection(report: VisibilityReport | null): string[] {
  const lines: string[] = ["## Website visibility", ""];

  if (!report) {
    lines.push("_Visibility report unavailable (check failed, timed out, or URL invalid)._");
    return lines;
  }

  lines.push(`- **Checked URL:** ${report.url}`);
  if (report.score !== undefined) {
    lines.push(`- **Score:** ${report.score}/100`);
  }
  lines.push(`- **Checked at:** ${report.checkedAt}`, "", report.summary, "", "### Top fixes");
  for (const fix of report.topFixes) {
    lines.push(`- ${fix}`);
  }

  const sortedFindings = [...report.findings].sort(
    (a, b) => (FINDING_STATUS_ORDER[a.status] ?? 3) - (FINDING_STATUS_ORDER[b.status] ?? 3),
  );

  lines.push("", "### Findings");
  for (const finding of sortedFindings) {
    lines.push(
      `- **${finding.label}** (${finding.status}): ${finding.detail}`,
      `  - Why it matters: ${finding.whyItMatters}`,
    );
  }

  return lines;
}

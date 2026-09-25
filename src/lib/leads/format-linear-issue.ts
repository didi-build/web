import type { LeadRecord, LeadSummary } from "./types";

export function formatLinearIssueTitle(lead: LeadRecord): string {
  const business = lead.businessName?.trim();
  if (business) {
    return `Lead: ${lead.name} - ${business}`;
  }
  return `Lead: ${lead.name}`;
}

export function formatLinearIssueDescription(
  lead: LeadRecord,
  summary: LeadSummary | null,
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

  return lines.join("\n");
}

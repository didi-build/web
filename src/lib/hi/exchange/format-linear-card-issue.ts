import type { HiCardLead, HiLeadDetails } from "./types";

export function formatHiCardLinearIssueTitle(lead: HiCardLead): string {
  return `Lead: ${lead.name} (card)`;
}

export function formatHiCardLinearIssueDescription(lead: HiCardLead): string {
  const lines = [
    "## Contact",
    "",
    `- **Name:** ${lead.name}`,
    `- **Email:** ${lead.email}`,
    `- **Phone:** ${lead.phone?.trim() ? lead.phone : "—"}`,
    `- **Source:** Business card (\`/hi\`)`,
  ];
  return lines.join("\n");
}

export function formatHiCardLinearDetailsComment(details: HiLeadDetails): string {
  const lines = ["## Additional details", ""];
  if (details.jobTitle?.trim()) {
    lines.push(`- **Job title:** ${details.jobTitle.trim()}`);
  }
  if (details.company?.trim()) {
    lines.push(`- **Company:** ${details.company.trim()}`);
  }
  if (details.note?.trim()) {
    lines.push(`- **Note:** ${details.note.trim()}`);
  }
  if (lines.length === 2) {
    lines.push("_No extra fields provided._");
  }
  return lines.join("\n");
}

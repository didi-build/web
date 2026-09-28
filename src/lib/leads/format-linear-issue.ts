import { formatLeadDeliveryBody } from "./format-lead-delivery";
import type { LeadRecord, LeadSummary } from "./types";
import type { VisibilityReport } from "../visibility/types";

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
  visibilityReport: VisibilityReport | null = null,
): string {
  return formatLeadDeliveryBody(lead, summary, visibilityReport);
}

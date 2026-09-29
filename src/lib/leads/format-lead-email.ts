import type { LeadRecord, LeadSummary } from "./types";
import type { FindingStatus, VisibilityFinding, VisibilityReport } from "../visibility/types";

const FINDING_STATUS_ORDER: Record<FindingStatus, number> = { fail: 0, warn: 1, pass: 2 };

export type LeadEmailMeta = {
  linearIssueUrl?: string;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Returns an http(s) href or null when the value must not be linked. */
export function safeWebsiteHref(website: string): string | null {
  const trimmed = website.trim();
  if (!trimmed) {
    return null;
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);

  let parsed: URL;
  try {
    parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  return parsed.href;
}

export function formatLeadEmailSubject(
  lead: LeadRecord,
  visibilityReport: VisibilityReport | null,
): string {
  const business = lead.businessName?.trim();
  const base = business ? `New lead: ${lead.name} (${business})` : `New lead: ${lead.name}`;

  if (visibilityReport?.score !== undefined) {
    return `${base} · visibility ${visibilityReport.score}/100`;
  }

  return base;
}

function sortFindings(findings: VisibilityFinding[]): VisibilityFinding[] {
  return [...findings].sort(
    (a, b) => FINDING_STATUS_ORDER[a.status] - FINDING_STATUS_ORDER[b.status],
  );
}

function groupFindingsByStatus(findings: VisibilityFinding[]): {
  fails: VisibilityFinding[];
  warnings: VisibilityFinding[];
  passed: VisibilityFinding[];
} {
  const sorted = sortFindings(findings);
  return {
    fails: sorted.filter((f) => f.status === "fail"),
    warnings: sorted.filter((f) => f.status === "warn"),
    passed: sorted.filter((f) => f.status === "pass"),
  };
}

function formatCheckedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-CA", {
      timeZone: "America/Toronto",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function urgencyChipColor(urgency: LeadSummary["urgency"]): { bg: string; text: string } {
  switch (urgency) {
    case "high":
      return { bg: "#fde8e8", text: "#9b1c1c" };
    case "medium":
      return { bg: "#fef3c7", text: "#92400e" };
    default:
      return { bg: "#e8f4ec", text: "#166534" };
  }
}

function sectionHeading(title: string): string {
  return `<tr><td style="padding:24px 20px 8px 20px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">${escapeHtml(title)}</td></tr>`;
}

function renderWebsiteBlock(lead: LeadRecord, visibilityReport: VisibilityReport | null): string {
  if (!lead.website?.trim()) {
    return "";
  }

  const rows: string[] = [sectionHeading("Website visibility")];

  if (!visibilityReport) {
    rows.push(
      `<tr><td style="padding:0 20px 20px 20px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#6b7280;">Visibility report unavailable (check failed, timed out, or URL invalid).</td></tr>`,
    );
    return rows.join("");
  }

  const scoreBlock =
    visibilityReport.score !== undefined
      ? `<div style="font-size:32px;font-weight:700;line-height:1.1;color:#111827;margin-bottom:8px;">${visibilityReport.score} <span style="font-size:16px;font-weight:500;color:#6b7280;">/ 100</span></div>`
      : "";

  const topFixes = visibilityReport.topFixes
    .map(
      (fix, index) =>
        `<tr><td style="padding:4px 0 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#374151;vertical-align:top;width:24px;">${index + 1}.</td><td style="padding:4px 0 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(fix)}</td></tr>`,
    )
    .join("");

  rows.push(
    `<tr><td style="padding:0 20px 16px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <tr><td style="padding:16px;">
          ${scoreBlock}
          <p style="margin:0 0 12px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#374151;">${escapeHtml(visibilityReport.summary)}</p>
          <p style="margin:0 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Top fixes</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${topFixes}</table>
        </td></tr>
      </table>
    </td></tr>`,
  );

  return rows.join("");
}

function renderFindingRow(finding: VisibilityFinding, compact: boolean): string {
  const statusLabel =
    finding.status === "fail" ? "Fail" : finding.status === "warn" ? "Warning" : "Passed";
  const statusColor =
    finding.status === "fail" ? "#b91c1c" : finding.status === "warn" ? "#b45309" : "#15803d";

  const whyBlock = compact
    ? ""
    : `<div style="margin-top:4px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.45;color:#9ca3af;">Why it matters: ${escapeHtml(finding.whyItMatters)}</div>`;

  return `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.45;color:#111827;">
      <strong>${escapeHtml(finding.label)}</strong>
      <span style="margin-left:8px;font-size:12px;font-weight:600;color:${statusColor};">${statusLabel}</span>
    </div>
    <div style="margin-top:4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.45;color:#374151;">${escapeHtml(finding.detail)}</div>
    ${whyBlock}
  </td></tr>`;
}

function renderFindingsSection(report: VisibilityReport | null): string {
  if (!report || report.findings.length === 0) {
    return "";
  }

  const { fails, warnings, passed } = groupFindingsByStatus(report.findings);
  const groups: { title: string; items: VisibilityFinding[]; compact: boolean }[] = [
    { title: "Fails", items: fails, compact: false },
    { title: "Warnings", items: warnings, compact: false },
    { title: "Passed", items: passed, compact: true },
  ];

  const groupHtml = groups
    .filter((g) => g.items.length > 0)
    .map((group) => {
      const rows = group.items.map((f) => renderFindingRow(f, group.compact)).join("");
      return `<p style="margin:16px 0 8px 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">${escapeHtml(group.title)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>`;
    })
    .join("");

  return `${sectionHeading("All findings")}<tr><td style="padding:0 20px 20px 20px;">${groupHtml}</td></tr>`;
}

function renderAtAGlance(lead: LeadRecord, summary: LeadSummary | null): string {
  const business = lead.businessName?.trim();
  const nameLine = business
    ? `${escapeHtml(lead.name)} · ${escapeHtml(business)}`
    : escapeHtml(lead.name);

  let chipsAndPattern = "";
  if (summary) {
    const chip = urgencyChipColor(summary.urgency);
    chipsAndPattern = `<div style="margin-top:12px;">
      <span style="display:inline-block;padding:4px 10px;border-radius:999px;background-color:${chip.bg};color:${chip.text};font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;text-transform:capitalize;">${escapeHtml(summary.urgency)} urgency</span>
      <div style="margin-top:10px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;">Suggested pattern</div>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#111827;">${escapeHtml(summary.suggestedPattern)}</div>
    </div>`;
  }

  const summaryLine = summary
    ? `<p style="margin:14px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#374151;">${escapeHtml(summary.summary)}</p>`
    : `<p style="margin:14px 0 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#6b7280;">Summary unavailable (summarizer failed or timed out).</p>`;

  return `<tr><td style="padding:20px 20px 16px 20px;background-color:#ffffff;border-bottom:1px solid #e5e7eb;">
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">At a glance</div>
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;line-height:1.25;color:#111827;">${nameLine}</div>
    ${chipsAndPattern}
    ${summaryLine}
  </td></tr>`;
}

function renderContact(lead: LeadRecord): string {
  const business = lead.businessName?.trim();
  const website = lead.website?.trim();
  const websiteHref = website ? safeWebsiteHref(website) : null;

  const websiteRow = website
    ? websiteHref
      ? `<tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b7280;width:88px;vertical-align:top;">Website</td><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;"><a href="${escapeHtml(websiteHref)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(website)}</a></td></tr>`
      : `<tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b7280;width:88px;vertical-align:top;">Website</td><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#374151;">${escapeHtml(website)}</td></tr>`
    : "";

  const businessRow = business
    ? `<tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b7280;width:88px;vertical-align:top;">Business</td><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#374151;">${escapeHtml(business)}</td></tr>`
    : "";

  return `${sectionHeading("Contact")}<tr><td style="padding:0 20px 16px 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b7280;width:88px;vertical-align:top;">Name</td><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#374151;">${escapeHtml(lead.name)}</td></tr>
      <tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b7280;width:88px;vertical-align:top;">Email</td><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(lead.email)}</a></td></tr>
      ${businessRow}
      ${websiteRow}
    </table>
  </td></tr>`;
}

function renderMessage(lead: LeadRecord): string {
  const messageHtml = escapeHtml(lead.message).replace(/\r\n|\r|\n/g, "<br />");
  return `${sectionHeading("Their message")}<tr><td style="padding:0 20px 20px 20px;">
    <div style="padding:14px 16px;background-color:#f3f4f6;border-left:3px solid #d1d5db;border-radius:4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#374151;">${messageHtml}</div>
  </td></tr>`;
}

function renderFollowUp(summary: LeadSummary | null): string {
  if (!summary || summary.followUpQuestions.length === 0) {
    return "";
  }

  const items = summary.followUpQuestions
    .map(
      (q, i) =>
        `<tr><td style="padding:6px 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#374151;vertical-align:top;width:28px;">${i + 1}.</td><td style="padding:6px 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(q)}</td></tr>`,
    )
    .join("");

  return `${sectionHeading("Follow-up questions")}<tr><td style="padding:0 20px 16px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${items}</table></td></tr>`;
}

function renderNeeds(summary: LeadSummary | null): string {
  if (!summary || summary.needs.length === 0) {
    return "";
  }

  const items = summary.needs
    .map(
      (need) =>
        `<li style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#374151;">${escapeHtml(need)}</li>`,
    )
    .join("");

  return `${sectionHeading("Needs")}<tr><td style="padding:0 20px 20px 20px;"><ul style="margin:0;padding-left:20px;">${items}</ul></td></tr>`;
}

function renderFooter(
  lead: LeadRecord,
  visibilityReport: VisibilityReport | null,
  meta: LeadEmailMeta,
): string {
  const parts: string[] = [];

  if (visibilityReport) {
    parts.push(
      `Checked ${escapeHtml(visibilityReport.url)} at ${escapeHtml(formatCheckedAt(visibilityReport.checkedAt))}`,
    );
  } else if (lead.website?.trim()) {
    parts.push(`Website on file: ${escapeHtml(lead.website.trim())}`);
  }

  const linearUrl = meta.linearIssueUrl?.trim();
  const linearLink =
    linearUrl && /^https:\/\/linear\.app\//i.test(linearUrl)
      ? ` · <a href="${escapeHtml(linearUrl)}" style="color:#2563eb;text-decoration:none;">Open in Linear</a>`
      : "";

  const footerText = parts.length > 0 ? parts.join("") : "Lead from didi.build contact form";

  return `<tr><td style="padding:20px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#9ca3af;border-top:1px solid #e5e7eb;">${footerText}${linearLink}</td></tr>`;
}

export function buildLeadEmailHtml(
  lead: LeadRecord,
  summary: LeadSummary | null,
  visibilityReport: VisibilityReport | null,
  meta: LeadEmailMeta = {},
): string {
  const findingsSection = visibilityReport ? renderFindingsSection(visibilityReport) : "";

  const body = [
    renderAtAGlance(lead, summary),
    renderContact(lead),
    renderMessage(lead),
    renderWebsiteBlock(lead, visibilityReport),
    renderFollowUp(summary),
    renderNeeds(summary),
    findingsSection,
    renderFooter(lead, visibilityReport, meta),
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;">
<tr><td align="center" style="padding:16px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function buildLeadEmailPlainText(
  lead: LeadRecord,
  summary: LeadSummary | null,
  visibilityReport: VisibilityReport | null,
  meta: LeadEmailMeta = {},
): string {
  const lines: string[] = [];

  lines.push("AT A GLANCE", "----------");
  const business = lead.businessName?.trim();
  if (business) {
    lines.push(`${lead.name} · ${business}`);
  } else {
    lines.push(lead.name);
  }

  if (summary) {
    lines.push(`Urgency: ${summary.urgency}`);
    lines.push(`Suggested pattern: ${summary.suggestedPattern}`);
    lines.push("");
    lines.push(summary.summary);
  } else {
    lines.push("");
    lines.push("Summary unavailable (summarizer failed or timed out).");
  }

  lines.push("", "CONTACT", "-------");
  lines.push(`Name: ${lead.name}`);
  lines.push(`Email: ${lead.email}`);
  if (business) {
    lines.push(`Business: ${business}`);
  }
  if (lead.website?.trim()) {
    lines.push(`Website: ${lead.website.trim()}`);
  }

  lines.push("", "THEIR MESSAGE", "-------------", lead.message, "");

  if (lead.website?.trim()) {
    lines.push("WEBSITE VISIBILITY", "------------------");
    if (!visibilityReport) {
      lines.push("Visibility report unavailable (check failed, timed out, or URL invalid).");
    } else {
      if (visibilityReport.score !== undefined) {
        lines.push(`Score: ${visibilityReport.score} / 100`);
      }
      lines.push(visibilityReport.summary, "", "Top fixes:");
      visibilityReport.topFixes.forEach((fix, index) => {
        lines.push(`  ${index + 1}. ${fix}`);
      });

      const { fails, warnings, passed } = groupFindingsByStatus(visibilityReport.findings);
      lines.push("", "ALL FINDINGS", "------------");

      const appendGroup = (title: string, items: VisibilityFinding[], compact: boolean) => {
        if (items.length === 0) {
          return;
        }
        lines.push("", title);
        for (const finding of items) {
          const status =
            finding.status === "fail" ? "Fail" : finding.status === "warn" ? "Warning" : "Passed";
          lines.push(`  ${finding.label} (${status})`);
          lines.push(`    ${finding.detail}`);
          if (!compact) {
            lines.push(`    Why it matters: ${finding.whyItMatters}`);
          }
        }
      };

      appendGroup("Fails", fails, false);
      appendGroup("Warnings", warnings, false);
      appendGroup("Passed", passed, true);
    }
    lines.push("");
  }

  if (summary && summary.followUpQuestions.length > 0) {
    lines.push("FOLLOW-UP QUESTIONS", "-------------------");
    summary.followUpQuestions.forEach((q, i) => {
      lines.push(`  ${i + 1}. ${q}`);
    });
    lines.push("");
  }

  if (summary && summary.needs.length > 0) {
    lines.push("NEEDS", "-----");
    for (const need of summary.needs) {
      lines.push(`  - ${need}`);
    }
    lines.push("");
  }

  if (visibilityReport) {
    lines.push(`Checked ${visibilityReport.url} at ${formatCheckedAt(visibilityReport.checkedAt)}`);
  } else if (lead.website?.trim()) {
    lines.push(`Website on file: ${lead.website.trim()}`);
  } else {
    lines.push("Lead from didi.build contact form");
  }

  const linearUrl = meta.linearIssueUrl?.trim();
  if (linearUrl && /^https:\/\/linear\.app\//i.test(linearUrl)) {
    lines.push(`Linear: ${linearUrl}`);
  }

  return lines.join("\n").trimEnd() + "\n";
}

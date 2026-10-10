import { siteContent } from "@/content/site";
import { sanitizeEmailHeaderValue } from "../gmail-auth";

const HI_PAGE_URL = "https://didi.build/hi";

export function escapeHtmlForEmail(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatOwnerLeadEmailSubject(name: string): string {
  const safeName = sanitizeEmailHeaderValue(name);
  return sanitizeEmailHeaderValue(`New lead added: ${safeName}`);
}

export function formatOwnerDetailsEmailSubject(name: string): string {
  const safeName = sanitizeEmailHeaderValue(name);
  return sanitizeEmailHeaderValue(`Details added: ${safeName}`);
}

export function formatReceivedAtToronto(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export type OwnerLeadEmailContentInput = {
  name: string;
  email: string;
  phone?: string;
  linearIdentifier: string;
  linearUrl: string;
  receivedAtIso: string;
};

export function buildOwnerLeadEmailPlain(input: OwnerLeadEmailContentInput): string {
  const lines = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone?.trim() ? input.phone : "—"}`,
    `Source: Business card, ${HI_PAGE_URL}`,
    `Received: ${formatReceivedAtToronto(input.receivedAtIso)} (America/Toronto)`,
    `Linear: ${input.linearIdentifier} (${input.linearUrl})`,
  ];
  return lines.join("\n");
}

export function buildOwnerLeadEmailHtml(input: OwnerLeadEmailContentInput): string {
  const name = escapeHtmlForEmail(input.name);
  const email = escapeHtmlForEmail(input.email);
  const phone = escapeHtmlForEmail(input.phone?.trim() ? input.phone : "—");
  const received = escapeHtmlForEmail(formatReceivedAtToronto(input.receivedAtIso));
  const linearId = escapeHtmlForEmail(input.linearIdentifier);
  const linearUrl = escapeHtmlForEmail(input.linearUrl);
  const hiUrl = escapeHtmlForEmail(HI_PAGE_URL);

  return [
    "<p><strong>Name:</strong> " + name + "</p>",
    `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>`,
    "<p><strong>Phone:</strong> " + phone + "</p>",
    `<p><strong>Source:</strong> Business card, <a href="${hiUrl}">didi.build/hi</a></p>`,
    "<p><strong>Received:</strong> " + received + " (America/Toronto)</p>",
    `<p><strong>Linear:</strong> <a href="${linearUrl}">${linearId}</a></p>`,
  ].join("\n");
}

export type OwnerDetailsEmailContentInput = {
  name: string;
  jobTitle?: string;
  company?: string;
  note?: string;
  linearIdentifier: string;
  linearUrl: string;
};

export function buildOwnerDetailsEmailPlain(input: OwnerDetailsEmailContentInput): string {
  const lines = [`Lead: ${input.name}`];
  if (input.jobTitle?.trim()) {
    lines.push(`Job title: ${input.jobTitle.trim()}`);
  }
  if (input.company?.trim()) {
    lines.push(`Company: ${input.company.trim()}`);
  }
  if (input.note?.trim()) {
    lines.push(`Note: ${input.note.trim()}`);
  }
  lines.push(`Linear: ${input.linearIdentifier} (${input.linearUrl})`);
  return lines.join("\n");
}

export function buildOwnerDetailsEmailHtml(input: OwnerDetailsEmailContentInput): string {
  const parts = [`<p><strong>Lead:</strong> ${escapeHtmlForEmail(input.name)}</p>`];
  if (input.jobTitle?.trim()) {
    parts.push(`<p><strong>Job title:</strong> ${escapeHtmlForEmail(input.jobTitle.trim())}</p>`);
  }
  if (input.company?.trim()) {
    parts.push(`<p><strong>Company:</strong> ${escapeHtmlForEmail(input.company.trim())}</p>`);
  }
  if (input.note?.trim()) {
    parts.push(`<p><strong>Note:</strong> ${escapeHtmlForEmail(input.note.trim())}</p>`);
  }
  const linearId = escapeHtmlForEmail(input.linearIdentifier);
  const linearUrl = escapeHtmlForEmail(input.linearUrl);
  parts.push(`<p><strong>Linear:</strong> <a href="${linearUrl}">${linearId}</a></p>`);
  return parts.join("\n");
}

export function readHiEmailFromName(): string {
  return siteContent.hi.emailFromName;
}

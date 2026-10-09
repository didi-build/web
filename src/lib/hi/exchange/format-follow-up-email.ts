import { siteContent } from "@/content/site";
import { sanitizeEmailHeaderValue } from "../gmail-auth";
import {
  HI_FOLLOW_UP_BOOKING_URL,
  HI_FOLLOW_UP_EMAIL_LOGO_URL,
  HI_FOLLOW_UP_FOOTER_HTML,
  HI_FOLLOW_UP_FOOTER_PLAIN,
  HI_FOLLOW_UP_HI_PAGE_URL,
  HI_FOLLOW_UP_SIGNATURE_HTML,
  HI_FOLLOW_UP_SIGNATURE_PLAIN,
} from "./hi-follow-up-signature-and-footer";

export function firstNameForHiEmail(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return "there";
  }
  return trimmed.split(/\s+/)[0] ?? "there";
}

export function formatHiFollowUpEmailSubject(firstName: string): string {
  const copy = siteContent.hi.followUpEmail;
  const safeFirst = sanitizeEmailHeaderValue(firstName);
  return sanitizeEmailHeaderValue(copy.subjectTemplate.replace("{firstName}", safeFirst));
}

export function buildHiFollowUpEmailPlain(firstName: string): string {
  const copy = siteContent.hi.followUpEmail;
  const greeting = copy.greetingTemplate.replace("{firstName}", firstName);
  const lines = [
    greeting,
    "",
    ...copy.bodyParagraphs,
    "",
    copy.attachmentLine,
    "",
    `${copy.bookCtaLabel}: ${HI_FOLLOW_UP_BOOKING_URL}`,
    "",
    copy.closingLine,
    "",
    HI_FOLLOW_UP_SIGNATURE_PLAIN,
    "",
    HI_FOLLOW_UP_FOOTER_PLAIN,
  ];
  return lines.join("\n");
}

export function buildHiFollowUpEmailHtml(firstName: string): string {
  const copy = siteContent.hi.followUpEmail;
  const greeting = escapeHtml(copy.greetingTemplate.replace("{firstName}", firstName));
  const paragraphs = copy.bodyParagraphs.map((p) => escapeHtml(p)).join("<br><br>");
  const attachment = escapeHtml(copy.attachmentLine);
  const closing = escapeHtml(copy.closingLine);
  const footer = HI_FOLLOW_UP_FOOTER_HTML;
  const signature = HI_FOLLOW_UP_SIGNATURE_HTML;
  const bookLabel = escapeHtml(copy.bookCtaLabel);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Helvetica,Arial,sans-serif;color:#1f3d2c;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f7f4;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;background:#ffffff;border:1px solid #d7e5dc;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 24px 12px 24px;font-size:17px;line-height:1.65;color:#2f4f3f;">
          <p style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#166534;">${greeting}</p>
          <p style="margin:0 0 16px 0;">${paragraphs}</p>
          <p style="margin:0 0 20px 0;">${attachment}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
            <tr><td style="border-radius:999px;background:#166534;">
              <a href="${HI_FOLLOW_UP_BOOKING_URL}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">${bookLabel}</a>
            </td></tr>
          </table>
          <p style="margin:0 0 24px 0;">${closing}</p>
          ${signature}
        </td></tr>
        <tr><td style="padding:16px 24px 24px 24px;border-top:1px solid #e2ebe4;font-size:12px;line-height:1.55;color:#6b7f72;">${footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildHiFollowUpSignatureHtml(): string {
  return HI_FOLLOW_UP_SIGNATURE_HTML;
}

export {
  HI_FOLLOW_UP_BOOKING_URL as BOOKING_URL,
  HI_FOLLOW_UP_HI_PAGE_URL as HI_PAGE_URL,
  HI_FOLLOW_UP_EMAIL_LOGO_URL as LOGO_URL,
};

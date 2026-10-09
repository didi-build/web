import { siteContent } from "@/content/site";
import { sanitizeEmailHeaderValue } from "../gmail-auth";

export function formatHiFollowUpEmailSubject(firstName: string): string {
  const copy = siteContent.hi.followUpEmail;
  return sanitizeEmailHeaderValue(copy.subjectTemplate.replace("{firstName}", firstName));
}

export function buildHiFollowUpEmailPlain(firstName: string): string {
  const copy = siteContent.hi.followUpEmail;
  const bookingUrl = siteContent.meta.siteUrl + siteContent.bookingPath;
  return [
    copy.greetingTemplate.replace("{firstName}", firstName),
    "",
    copy.bodyParagraph,
    "",
    copy.bookingLine.replace("{bookingUrl}", bookingUrl),
    "",
    copy.signOff,
    copy.senderName,
    copy.senderOrg,
  ].join("\n");
}

export function buildHiFollowUpEmailHtml(firstName: string): string {
  const copy = siteContent.hi.followUpEmail;
  const bookingUrl = siteContent.meta.siteUrl + siteContent.bookingPath;
  const greeting = escapeHtml(copy.greetingTemplate.replace("{firstName}", firstName));
  const body = escapeHtml(copy.bodyParagraph);
  const bookingLine = escapeHtml(copy.bookingLine.replace("{bookingUrl}", bookingUrl));
  const signOff = escapeHtml(copy.signOff);
  const senderName = escapeHtml(copy.senderName);
  const senderOrg = escapeHtml(copy.senderOrg);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Helvetica,Arial,sans-serif;color:#1f3d2c;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f7f4;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;background:#ffffff;border:1px solid #d7e5dc;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:24px 22px 8px 22px;font-size:22px;font-weight:700;line-height:1.25;color:#166534;">${greeting}</td></tr>
        <tr><td style="padding:0 22px 16px 22px;font-size:16px;line-height:1.6;color:#2f4f3f;">${body}</td></tr>
        <tr><td style="padding:0 22px 20px 22px;font-size:16px;line-height:1.6;color:#2f4f3f;">${bookingLine}</td></tr>
        <tr><td style="padding:0 22px 24px 22px;font-size:15px;line-height:1.5;color:#3d5c4a;">
          ${signOff}<br>
          <strong style="color:#166534;">${senderName}</strong><br>
          ${senderOrg}
        </td></tr>
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

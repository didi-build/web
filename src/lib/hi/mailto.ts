export function buildMailtoUrl(email: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);
  return `mailto:${email}?${params.toString()}`;
}

export function formatEmailCopyText(email: string, subject: string, body: string): string {
  return `To: ${email}\nSubject: ${subject}\n\n${body}`;
}

export function buildMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatEmailCopyText(email: string, subject: string, body: string): string {
  return `To: ${email}\nSubject: ${subject}\n\n${body}`;
}

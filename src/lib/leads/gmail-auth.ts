import { z } from "zod";

const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";

const serviceAccountKeySchema = z.object({
  client_email: z.string().min(1),
  private_key: z.string().min(1),
});

export type GmailServiceAccountConfig = {
  serviceAccountJson: string;
  senderEmail: string;
};

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

function base64UrlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToPkcs8Der(pem: string): ArrayBuffer {
  const normalized = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function signJwt(
  payload: Record<string, string | number>,
  privateKeyPem: string,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8Der(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export function parseServiceAccountJson(raw: string): z.infer<typeof serviceAccountKeySchema> {
  const parsed = JSON.parse(raw) as unknown;
  const result = serviceAccountKeySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("gmail_invalid_service_account_json");
  }
  return result.data;
}

export function resetGmailTokenCacheForTests(): void {
  tokenCache = null;
}

export async function getGmailAccessToken(config: GmailServiceAccountConfig): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 60_000) {
    return tokenCache.accessToken;
  }

  const account = parseServiceAccountJson(config.serviceAccountJson);
  const issuedAt = Math.floor(now / 1000);
  const jwt = await signJwt(
    {
      iss: account.client_email,
      sub: config.senderEmail,
      scope: GMAIL_SEND_SCOPE,
      aud: TOKEN_AUDIENCE,
      iat: issuedAt,
      exp: issuedAt + 3600,
    },
    account.private_key,
  );

  const response = await fetch(TOKEN_AUDIENCE, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`gmail_token_http_${response.status}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("gmail_token_missing_access_token");
  }

  const expiresInSec = payload.expires_in ?? 3600;
  tokenCache = {
    accessToken: payload.access_token,
    expiresAtMs: now + expiresInSec * 1000,
  };

  return payload.access_token;
}

const CONTROL_CHAR_PATTERN = /[\u0000-\u001f\u007f]/g;

function isAsciiOnly(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}

function base64EncodeUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** Base64-encode UTF-8 content for MIME bodies (RFC 2045, 76-char lines). */
function base64EncodeMimeBody(value: string): string {
  const base64 = base64EncodeUtf8(value);
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 76) {
    lines.push(base64.slice(i, i + 76));
  }
  return lines.join("\r\n");
}

/** Strip control characters and collapse whitespace for MIME header values. */
export function sanitizeEmailHeaderValue(value: string): string {
  const withoutControls = value.replace(CONTROL_CHAR_PATTERN, " ");
  return withoutControls.replace(/\s+/g, " ").trim();
}

/** Encode Subject per RFC 2047 when non-ASCII characters are present. */
export function encodeEmailSubject(subject: string): string {
  const sanitized = sanitizeEmailHeaderValue(subject);
  if (isAsciiOnly(sanitized)) {
    return sanitized;
  }
  return `=?UTF-8?B?${base64EncodeUtf8(sanitized)}?=`;
}

function createMimeBoundary(): string {
  return `----=_Part_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function buildRawEmailMessage(options: {
  from: string;
  to: string;
  subject: string;
  textPlain: string;
  textHtml: string;
  boundary?: string;
}): string {
  const from = sanitizeEmailHeaderValue(options.from);
  const to = sanitizeEmailHeaderValue(options.to);
  const subject = encodeEmailSubject(options.subject);
  const boundary = options.boundary ?? createMimeBoundary();

  const mimeBody = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64EncodeMimeBody(options.textPlain),
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64EncodeMimeBody(options.textHtml),
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    mimeBody,
  ];
  return base64UrlEncode(lines.join("\r\n"));
}

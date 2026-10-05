import { getCloudflareContext } from "@opennextjs/cloudflare";

export function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) {
    return fromProcess;
  }
  try {
    const env = getCloudflareContext().env as Record<string, unknown>;
    const value = env[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  } catch {
    // Outside Cloudflare Workers runtime (e.g. unit tests, static analysis).
  }
  return undefined;
}

export function requireEnv(name: string, logEvent: string): string {
  const value = readEnv(name);
  if (!value) {
    const message = `Missing required environment variable: ${name}`;
    console.error(logEvent, message);
    throw new Error(message);
  }
  return value;
}

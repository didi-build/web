import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Strips design-tool metadata and returns a base64 SVG data URI for Satori. */
export function loadOgVinesDataUri(): string {
  const raw = readFileSync(join(process.cwd(), "design/og-vines.svg"), "utf8");
  const stripped = raw.replace(/<metadata>[\s\S]*?<\/metadata>/, "");
  const encoded = Buffer.from(stripped).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

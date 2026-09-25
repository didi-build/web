import { ogVinesSvg } from "@/lib/og-assets.generated";

/** Returns a base64 SVG data URI for Satori (metadata stripped in src/assets copy). */
export function getOgVinesDataUri(): string {
  return `data:image/svg+xml;base64,${Buffer.from(ogVinesSvg, "utf8").toString("base64")}`;
}

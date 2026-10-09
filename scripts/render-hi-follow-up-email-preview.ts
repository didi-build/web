import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildHiFollowUpEmailHtml,
  buildHiFollowUpEmailPlain,
} from "../src/lib/hi/exchange/format-follow-up-email";

const outDir = join(process.cwd(), "artifacts", "hi-email-preview");
const html = buildHiFollowUpEmailHtml("Alex");
const plain = buildHiFollowUpEmailPlain("Alex");

writeFileSync(join(outDir, "follow-up.html"), html, "utf8");
writeFileSync(join(outDir, "follow-up.txt"), plain, "utf8");
writeFileSync(
  join(outDir, "follow-up-dark.html"),
  html.replace("#f4f7f4", "#0f1712").replace("#ffffff", "#1a2420").replace("#2f4f3f", "#d5e5da"),
  "utf8",
);

console.log(`Wrote ${outDir}/follow-up.html`);

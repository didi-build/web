import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = join(import.meta.dirname, "..");
const iconSvgPath = join(root, "src/app/icon.svg");

/** Raster-friendly SVG from icon.svg (sharp does not apply CSS classes or oklch). */
function loadLeafSvgForRaster() {
  const raw = readFileSync(iconSvgPath, "utf8");
  return raw
    .replace(/<style>[\s\S]*?<\/style>/, "")
    .replace(/\s*role="[^"]*"/, "")
    .replace(/\s*aria-label="[^"]*"/, "")
    .replace(/class="mark"/, 'fill="#3a7559"');
}

const leafSvg = loadLeafSvgForRaster();

async function pngFromSvg(size) {
  return sharp(Buffer.from(leafSvg)).resize(size, size).png().toBuffer();
}

const icon192 = await pngFromSvg(192);
writeFileSync(join(root, "src/app/icon.png"), icon192);

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(sizes.map((size) => pngFromSvg(size)));
const ico = await pngToIco(pngBuffers);
writeFileSync(join(root, "src/app/favicon.ico"), ico);

console.log("Wrote src/app/icon.png and src/app/favicon.ico from src/app/icon.svg");

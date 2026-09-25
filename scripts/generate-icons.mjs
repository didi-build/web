import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(import.meta.dirname, "..");
const leafSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
  <path fill="#3a7559" d="M0 7A7 7 0 0 1 7 0h5a2 2 0 0 1 2 2v5a7 7 0 0 1-7 7H2a2 2 0 0 1-2-2V7Z"/>
</svg>`;

async function pngFromSvg(size) {
  return sharp(Buffer.from(leafSvg)).resize(size, size).png().toBuffer();
}

const icon192 = await pngFromSvg(192);
writeFileSync(join(root, "src/app/icon.png"), icon192);

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(sizes.map((size) => pngFromSvg(size)));
const ico = await toIco(pngBuffers);
writeFileSync(join(root, "src/app/favicon.ico"), ico);

console.log("Wrote src/app/icon.png and src/app/favicon.ico");

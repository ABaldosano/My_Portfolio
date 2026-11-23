/* ==========================================================================
   tools/make-icons.mjs
   Regenerates the PNG icon fallbacks from ../favicon.svg so they always match
   the SVG logo. Output goes to assets/images/:
     favicon-32.png, icon-192.png, icon-512.png   circular, transparent corners
     apple-touch-icon.png                         square, opaque (iOS rounds it itself)
   Usage (from the tools folder):  node make-icons.mjs
   ========================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = path.join(ROOT, 'assets', 'images');
const svg  = await fs.readFile(path.join(ROOT, 'favicon.svg'), 'utf8');

// Default (no media query match) = black tile, white mark.
const round  = Buffer.from(svg);
const square = Buffer.from(svg.replace(/<circle[^>]*\/>/, '<rect class="bg" width="1254" height="1254"/>'));

const png = (buf, size) => sharp(buf, { density: 300 })
  .resize(size, size, { kernel: 'lanczos3' })
  .png({ palette: true, quality: 95, compressionLevel: 9, effort: 10 })
  .toBuffer();

await fs.mkdir(OUT, { recursive: true });
for (const [name, buf, size] of [
  ['favicon-32.png',       round,  32],
  ['icon-192.png',         round, 192],
  ['icon-512.png',         round, 512],
  ['apple-touch-icon.png', square, 180],
]) {
  const out = await png(buf, size);
  await fs.writeFile(path.join(OUT, name), out);
  console.log(name.padEnd(22), `${size}x${size}`.padEnd(9), (out.length / 1024).toFixed(1) + ' KB');
}
console.log('\nDone. Hard refresh (Ctrl+F5) to see the new icon.');

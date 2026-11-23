/* ==========================================================================
   tools/optimize-images.mjs
   Converts every PNG/JPG in assets/images to WebP (resized + compressed) and
   builds a tiny favicon/icon set. Local-only. Never deployed.

   Usage (from the tools folder):
     node optimize-images.mjs              dry run, prints the size report only
     node optimize-images.mjs --write      converts, then moves originals OUT of
                                           the repo to ..\images_original_backup
     node optimize-images.mjs --write --keep   converts, leaves originals in place

   Options:
     --quality=80      WebP quality (lower = smaller). Try 75 if still too big.
     --max-width=1600  OPTIONAL downscale. Off by default: output is the exact
                       same pixel width and height as the original.

   Rules:
   - og-cover.jpg stays a JPEG (social crawlers are unreliable with WebP),
     same dimensions, just re-encoded.
   - favicon.png is turned into favicon-32.png, apple-touch-icon.png,
     icon-192.png, icon-512.png (palette PNG, a few KB each).
   - Every PNG/JPG becomes a WebP. If one comes out larger than its source,
     the report warns you (lower --quality for that run).
   ========================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE   = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(HERE, '..');
const IMGDIR = path.join(ROOT, 'assets', 'images');
const BACKUP = path.resolve(ROOT, '..', 'images_original_backup');

const WRITE = process.argv.includes('--write');
const KEEP  = process.argv.includes('--keep');

// Default is 1:1: same pixel width and height as the original, only re-encoded.
// Opt in to downscaling with --max-width=1600 (never enlarges, keeps aspect ratio).
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const MAX_WIDTH_ARG = arg('max-width', 0);          // 0 = no resizing
const WEBP_QUALITY  = arg('quality', 80);
const KEEP_AS_JPEG = new Set(['og-cover']);
const ICON_NAMES = new Set(['favicon-32', 'apple-touch-icon', 'icon-192', 'icon-512']);

const kb = (n) => (n / 1024).toFixed(1).padStart(9) + ' KB';

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function backupThenRemove(file) {
  if (!WRITE || KEEP) return;
  const rel  = path.relative(ROOT, file);
  const dest = path.join(BACKUP, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(file, dest);
  await fs.unlink(file);
}

async function main() {
  try { await fs.access(IMGDIR); }
  catch { console.error(`Cannot find ${IMGDIR}. Run this from the tools folder inside the repo.`); process.exit(1); }

  console.log(WRITE ? 'MODE: WRITE' : 'MODE: DRY RUN (add --write to apply)');
  console.log(`Images: ${IMGDIR}\n`);

  let before = 0, after = 0;
  const rows = [];
  const skipped = [];

  for await (const file of walk(IMGDIR)) {
    const ext  = path.extname(file).toLowerCase();
    const base = path.basename(file, path.extname(file));
    const rel  = path.relative(IMGDIR, file).replaceAll('\\', '/');

    if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
      if (ext !== '.webp' && ext !== '.svg') skipped.push(rel);
      continue;
    }
    if (base === 'favicon' || ICON_NAMES.has(base)) continue;   // handled below

    const srcSize = (await fs.stat(file)).size;
    const maxW = MAX_WIDTH_ARG;

    if (KEEP_AS_JPEG.has(base)) {
      const buf = await sharp(file).rotate()
        .jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      if (buf.length < srcSize) {
        rows.push([rel, srcSize, buf.length, 'jpg (kept as JPEG)']);
        before += srcSize; after += buf.length;
        if (WRITE) { await backupThenRemove(file); await fs.writeFile(file, buf); }
      } else {
        rows.push([rel, srcSize, srcSize, 'jpg (already small)']);
        before += srcSize; after += srcSize;
      }
      continue;
    }

    let pipeline = sharp(file).rotate();
    if (maxW > 0) pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
    const buf = await pipeline.webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer();

    rows.push([rel, srcSize, buf.length, buf.length >= srcSize ? 'webp (WARNING: larger than source, try --quality=70)' : 'webp']);
    before += srcSize; after += buf.length;
    if (WRITE) {
      await fs.writeFile(path.join(path.dirname(file), base + '.webp'), buf);
      await backupThenRemove(file);
    }
  }

  // favicon -> tiny palette PNG set
  const fav = path.join(IMGDIR, 'favicon.png');
  let favExists = true;
  try { await fs.access(fav); } catch { favExists = false; }
  if (favExists) {
    const favSize = (await fs.stat(fav)).size;
    const icons = [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]];
    let iconTotal = 0;
    for (const [name, size] of icons) {
      const buf = await sharp(fav)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 }).toBuffer();
      iconTotal += buf.length;
      rows.push([`(icon) ${name}`, 0, buf.length, `${size}x${size} png`]);
      if (WRITE) await fs.writeFile(path.join(IMGDIR, name), buf);
    }
    before += favSize; after += iconTotal;
    rows.push(['favicon.png', favSize, 0, 'replaced by the icon set above']);
    if (WRITE) await backupThenRemove(fav);
  } else {
    console.log('NOTE: assets/images/favicon.png not found, icon set skipped.');
  }

  console.log('source'.padEnd(34) + '     before' + '      after   result');
  console.log('-'.repeat(86));
  for (const [name, a, b, note] of rows) {
    console.log(name.padEnd(34) + (a ? kb(a) : ' '.repeat(12)) + kb(b) + '   ' + note);
  }
  console.log('-'.repeat(86));
  console.log('TOTAL'.padEnd(34) + kb(before) + kb(after) + `   saved ${(100 - (after / before) * 100).toFixed(0)}%`);
  if (skipped.length) console.log('\nIgnored (not png/jpg/webp/svg):', skipped.join(', '));
  if (WRITE && !KEEP) console.log(`\nOriginals moved to: ${BACKUP}`);
  if (!WRITE) console.log('\nNothing was changed. Re-run with --write to apply.');
  else console.log('\nNext: node update-refs.mjs   (dry run), then node update-refs.mjs --write');
}

main().catch((e) => { console.error(e); process.exit(1); });

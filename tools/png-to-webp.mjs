/* ==========================================================================
   tools/png-to-webp.mjs
   One command: finds every .png in assets/images, converts each to a .webp
   with the EXACT same pixel width and height (no resize, no crop, no stretch),
   moves the original PNG to ..\images_original_backup (outside the repo),
   then rewires every reference in the html/css/json/md files.

   Run from the repo root (the folder that has index.html):
     node tools\png-to-webp.mjs              convert + move originals + rewire refs
     node tools\png-to-webp.mjs --dry        show what would happen, change nothing
     node tools\png-to-webp.mjs --quality=85 WebP quality (default 80)
     node tools\png-to-webp.mjs --lossless   pixel-perfect WebP (bigger files)
     node tools\png-to-webp.mjs --keep       do not move the originals

   Never touched: the PNG icon set the site needs (favicon-32, apple-touch-icon,
   icon-192, icon-512). If no convertible PNG exists it prints
   "No PNG files found. Nothing converted." and exits.
   ========================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE   = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(HERE, '..');
const IMGDIR = path.join(ROOT, 'assets', 'images');
const BACKUP = path.resolve(ROOT, '..', 'images_original_backup');

const has = (f) => process.argv.includes(f);
const num = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : fallback;
};
const DRY      = has('--dry');
const KEEP     = has('--keep');
const LOSSLESS = has('--lossless');
const QUALITY  = num('quality', 80);

// PNGs the site must keep as PNG (browsers/iOS/manifest need them)
const KEEP_PNG = new Set(['favicon-32', 'apple-touch-icon', 'icon-192', 'icon-512']);

const kb = (n) => (n / 1024).toFixed(1).padStart(9) + ' KB';
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function uniqueBackupPath(rel) {
  let dest = path.join(BACKUP, rel);
  if (!(await exists(dest))) return dest;
  const ext = path.extname(dest);
  const stem = dest.slice(0, -ext.length);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${stem}__${stamp}${ext}`;
}

async function main() {
  if (!(await exists(IMGDIR))) {
    console.error(`Cannot find ${IMGDIR}\nRun this from the repo root (the folder that contains index.html).`);
    process.exit(1);
  }

  const pngs = [];
  for await (const f of walk(IMGDIR)) {
    if (path.extname(f).toLowerCase() !== '.png') continue;
    if (KEEP_PNG.has(path.basename(f, path.extname(f)))) continue;
    pngs.push(f);
  }

  if (!pngs.length) {
    console.log('No PNG files found. Nothing converted.');
    return;
  }

  console.log(DRY ? `DRY RUN: ${pngs.length} PNG file(s) found, nothing will change.\n`
                  : `Found ${pngs.length} PNG file(s). Converting...\n`);

  let before = 0, after = 0, converted = 0;
  const problems = [];

  for (const file of pngs) {
    const rel  = path.relative(ROOT, file);
    const out  = file.slice(0, -path.extname(file).length) + '.webp';
    const srcSize = (await fs.stat(file)).size;

    if (await exists(out)) {
      problems.push(`${rel}: ${path.basename(out)} already exists, skipped (rename or delete one of them)`);
      continue;
    }

    try {
      const srcMeta = await sharp(file).metadata();
      // no .resize() anywhere: output keeps the original pixel dimensions
      const buf = await sharp(file)
        .webp(LOSSLESS ? { lossless: true, effort: 5 } : { quality: QUALITY, effort: 5, alphaQuality: 100 })
        .toBuffer();

      // safety check: same width and height, or we refuse to touch the original
      const outMeta = await sharp(buf).metadata();
      if (outMeta.width !== srcMeta.width || outMeta.height !== srcMeta.height) {
        problems.push(`${rel}: size mismatch (${srcMeta.width}x${srcMeta.height} -> ${outMeta.width}x${outMeta.height}), original left untouched`);
        continue;
      }

      console.log(`${rel.padEnd(44)} ${String(srcMeta.width).padStart(5)}x${String(srcMeta.height).padEnd(5)}` +
                  `${kb(srcSize)} ->${kb(buf.length)}${buf.length >= srcSize ? '  (larger than PNG, try --quality=70)' : ''}`);
      before += srcSize; after += buf.length; converted++;

      if (!DRY) {
        await fs.writeFile(out, buf);
        if (!KEEP) {
          const dest = await uniqueBackupPath(rel.replace(/^assets[\\/]/, 'assets/'));
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await fs.copyFile(file, dest);
          await fs.unlink(file);
        }
      }
    } catch (e) {
      problems.push(`${rel}: ${e.message}`);
    }
  }

  console.log('-'.repeat(100));
  console.log(`${converted} converted. ${kb(before)} -> ${kb(after)}` +
              (before ? `  (saved ${(100 - (after / before) * 100).toFixed(0)}%)` : ''));
  if (problems.length) { console.log('\nNOT converted:'); problems.forEach((p) => console.log('  ' + p)); }

  if (DRY) { console.log('\nNothing was changed. Run without --dry to apply.'); return; }
  if (!converted) return;
  if (!KEEP) console.log(`\nOriginal PNGs moved to: ${BACKUP}`);

  console.log('\nUpdating references in html/css/json/md...\n');
  const r = spawnSync(process.execPath, [path.join(HERE, 'update-refs.mjs'), '--write'], { stdio: 'inherit', cwd: HERE });
  if (r.status !== 0) console.log('\nupdate-refs.mjs reported a problem, see above.');
  console.log('\nDone. Test the site (Ctrl+F5), then commit.');
}

main().catch((e) => { console.error(e); process.exit(1); });

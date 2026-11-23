/* ==========================================================================
   tools/update-refs.mjs
   Run AFTER optimize-images.mjs --write. Rewires the codebase:
   1. .png/.jpg references under images/ -> .webp when the .webp exists
      (og-cover.jpg is deliberately left alone).
   2. Favicon <head> lines in every .html -> dynamic /favicon.svg (your A.BJr
      logo, flips black/white with the browser theme) + small PNG fallbacks.
   3. manifest.json icons -> icon-192.png / icon-512.png.
   4. <img> tags: adds loading="lazy" decoding="async" (hero photo gets
      fetchpriority="high"). width/height are NOT added unless you pass --dims,
      because they can stretch an image when CSS only sets one dimension.
   5. Reports every images/ reference whose file does not exist (broken links).

   Usage (from the tools folder):
     node update-refs.mjs             dry run, lists changes
     node update-refs.mjs --write     applies them
     node update-refs.mjs --write --dims  also adds width/height (only if CSS already sizes every side)
     node update-refs.mjs --write --no-svg   skip the dynamic /favicon.svg link (PNG icons only)
   Safe to run twice. Skips worker/, tools/, node_modules/, .git/.
   ========================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE  = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.resolve(HERE, '..');
const WRITE = process.argv.includes('--write');
const SVG   = !process.argv.includes('--no-svg');   // dynamic /favicon.svg is on by default
const DIMS  = process.argv.includes('--dims');   // opt-in: width/height attrs can stretch images if CSS sets only one side

const SKIP_DIRS = new Set(['node_modules', '.git', 'worker', 'tools', '.vscode', '.wrangler']);
const TEXT_EXT  = new Set(['.html', '.css', '.js', '.json', '.md', '.xml', '.txt']);
const KEEP_BASENAMES = new Set(['og-cover']);          // stay as JPEG
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* walk(path.join(dir, e.name)); }
    else yield path.join(dir, e.name);
  }
}

const dimCache = new Map();
async function dims(rel) {
  if (dimCache.has(rel)) return dimCache.get(rel);
  let d = null;
  try { const m = await sharp(path.join(ROOT, rel)).metadata(); d = { w: m.width, h: m.height }; } catch {}
  dimCache.set(rel, d);
  return d;
}

const broken = [];
const log = [];

/* ---- 1. extension swap ------------------------------------------------- */
async function swapExtensions(text, file) {
  const re = /(\bimages\/[^"'()\s?#<>]+?)\.(png|jpe?g)\b/gi;
  const jobs = [];
  text.replace(re, (m, stem, ext, offset) => { jobs.push({ m, stem, ext, offset }); return m; });

  let out = '', last = 0, count = 0;
  for (const { m, stem, ext, offset } of jobs) {
    const tokenStart = Math.max(
      text.lastIndexOf('"', offset), text.lastIndexOf("'", offset),
      text.lastIndexOf('(', offset), text.lastIndexOf(' ', offset), text.lastIndexOf('\n', offset));
    const token = text.slice(tokenStart + 1, offset + m.length);
    out += text.slice(last, offset);
    last = offset + m.length;

    if (/^(https?:)?\/\//i.test(token) && !/arthurr\.gt\.tc/i.test(token)) { out += m; continue; }   // external URL (own domain is fine)
    const base = path.basename(stem);
    if (base === 'favicon') { out += m; continue; }                      // handled by the favicon step
    const relStem = 'assets/' + stem.replace(/^.*?\bimages\//, 'images/');
    if (KEEP_BASENAMES.has(base)) {
      if (!(await exists(path.join(ROOT, relStem + '.' + ext)))) broken.push([file, m]);
      out += m; continue;
    }
    if (await exists(path.join(ROOT, relStem + '.webp'))) { out += stem + '.webp'; count++; }
    else {
      if (!(await exists(path.join(ROOT, relStem + '.' + ext)))) broken.push([file, m]);
      out += m;
    }
  }
  out += text.slice(last);
  if (count) log.push(`${path.relative(ROOT, file)}: ${count} image ref(s) -> .webp`);
  return out;
}

/* ---- 2. favicon head --------------------------------------------------- */
function faviconBlock(indent) {
  const lines = [];
  if (SVG) lines.push('<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />');
  lines.push('<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png" />');
  lines.push('<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" />');
  return lines.map((l) => indent + l).join('\n');
}

function rewriteFaviconHead(text, file) {
  if (!/favicon\.png/.test(text)) return text;
  const before = text;
  // drop the pointless preload of the favicon
  text = text.replace(/^[ \t]*<link[^>]*rel="preload"[^>]*favicon\.png[^>]*>\s*\n/gim, '');
  // drop old icon/apple-touch lines, remembering where the first one was
  let indent = '  ', placed = false;
  text = text.replace(/^([ \t]*)<link[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>\s*\n/gim, (m, ind) => {
    if (!placed) { placed = true; indent = ind; return '@@FAVICON@@\n'; }
    return '';
  });
  if (placed) text = text.replace('@@FAVICON@@', faviconBlock(indent).trimStart().replace(/^/, indent));
  // msapplication tile image
  text = text.replace(/(<meta name="msapplication-TileImage" content=")[^"]*(")/i, '$1/assets/images/icon-192.png$2');
  // manifest-style leftovers
  if (text !== before) log.push(`${path.relative(ROOT, file)}: favicon <head> lines rewritten`);
  return text;
}

/* ---- 3. <img> attributes ------------------------------------------------ */
async function patchImgTags(text, file) {
  const tags = [...text.matchAll(/<img\b[^>]*>/gi)];
  let out = '', last = 0, n = 0;
  for (const t of tags) {
    const tag = t[0];
    out += text.slice(last, t.index);
    last = t.index + tag.length;

    const src = (tag.match(/\bsrc="([^"]+)"/i) || [])[1];
    if (!src || /^https?:|^data:/i.test(src) || /favicon|icon/i.test(src)) { out += tag; continue; }

    const add = [];
    const isHero = /class="[^"]*\bhero-photo\b/i.test(tag);
    if (DIMS && !/\bwidth=/i.test(tag) && !/\bheight=/i.test(tag)) {
      const rel = 'assets/' + src.replace(/^.*?\bimages\//, 'images/');
      const d = await dims(rel);
      if (d) add.push(`width="${d.w}"`, `height="${d.h}"`);
    }
    if (isHero) { if (!/fetchpriority=/i.test(tag)) add.push('fetchpriority="high"'); }
    else if (!/\bloading=/i.test(tag)) add.push('loading="lazy"');
    if (!isHero && !/\bdecoding=/i.test(tag)) add.push('decoding="async"');

    if (!add.length) { out += tag; continue; }
    const selfClose = tag.endsWith('/>');
    const body = tag.slice(0, selfClose ? -2 : -1).trimEnd();
    out += `${body} ${add.join(' ')}${selfClose ? ' />' : '>'}`;
    n++;
  }
  out += text.slice(last);
  if (n) log.push(`${path.relative(ROOT, file)}: ${n} <img> tag(s) got loading/decoding attributes`);
  return out;
}

/* ---- main ---------------------------------------------------------------- */
async function main() {
  console.log(WRITE ? 'MODE: WRITE\n' : 'MODE: DRY RUN (add --write to apply)\n');

  for await (const file of walk(ROOT)) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXT.has(ext)) continue;
    const name = path.basename(file);
    let text = await fs.readFile(file, 'utf8');
    const original = text;

    if (name === 'manifest.json') {
      const j = JSON.parse(text);
      let changed = false;
      for (const icon of j.icons || []) {
        const want = icon.sizes === '512x512' ? '/assets/images/icon-512.png' : '/assets/images/icon-192.png';
        if (icon.src !== want) { icon.src = want; changed = true; }
        if (icon.purpose !== 'any') { icon.purpose = 'any'; changed = true; }
      }
      if (changed) { text = JSON.stringify(j, null, 2) + '\n'; log.push('manifest.json: icons -> icon-192 / icon-512 (purpose "any")'); }
    } else if (name === 'README.md') {
      text = text.replaceAll('/assets/images/favicon.png', SVG ? '/favicon.svg' : '/assets/images/icon-192.png');
      if (text !== original) log.push('README.md: logo path updated');
      text = await swapExtensions(text, file);
    } else {
      text = await swapExtensions(text, file);
      if (ext === '.html') {
        text = rewriteFaviconHead(text, file);
        text = await patchImgTags(text, file);
      }
    }

    if (text !== original && WRITE) await fs.writeFile(file, text, 'utf8');
  }

  console.log(log.length ? log.join('\n') : 'No changes needed.');
  if (broken.length) {
    console.log('\nBROKEN IMAGE REFERENCES (file not found on disk):');
    for (const [f, m] of broken) console.log(`  ${path.relative(ROOT, f)}  ->  ${m}`);
    console.log('GitHub Pages is case-sensitive: check spelling and capitalization.');
  } else {
    console.log('\nNo broken image references found.');
  }
  if (!WRITE) console.log('\nNothing was changed. Re-run with --write to apply.');
}

main().catch((e) => { console.error(e); process.exit(1); });

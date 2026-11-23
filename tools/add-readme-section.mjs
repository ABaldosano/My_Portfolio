/* One-time helper: inserts the "Adding Images" section into the root README.md
   (just before "## License"). Safe to run twice, it checks first.
   Run from the repo root:  node tools\add-readme-section.mjs */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'README.md');
const MARK = '## Adding Images (PNG to WebP)';

const SECTION = `${MARK}

Every image on the site is WebP (except \`og-cover.jpg\`, which stays a JPEG for social previews, and the small PNG icon set). To add a new image:

1. Drop the new \`.png\` into \`assets/images/\` and reference it in your HTML as normal, for example \`assets/images/my-shot.png\`.
2. From the repo root (the folder containing \`index.html\`), run:

\`\`\`bash
node tools\\png-to-webp.mjs
\`\`\`

That single command:

- finds every \`.png\` in \`assets/images/\` (the icon PNGs are skipped on purpose)
- converts each one to \`.webp\` at the **exact same pixel width and height** (no resize, no crop, no stretching)
- checks the output size matches before it touches the original
- moves the original PNG to \`../images_original_backup/\` (outside the repo, so it never bloats a zip)
- rewrites every \`.png\` reference in the HTML, CSS, JSON and Markdown files to \`.webp\`
- prints \`No PNG files found. Nothing converted.\` when there is nothing left to convert

Options:

| Command | Effect |
| --- | --- |
| \`node tools\\png-to-webp.mjs --dry\` | Preview only, changes nothing |
| \`node tools\\png-to-webp.mjs --quality=70\` | Smaller files (default quality is 80) |
| \`node tools\\png-to-webp.mjs --lossless\` | Pixel-perfect WebP, bigger files |
| \`node tools\\png-to-webp.mjs --keep\` | Convert but leave the original PNGs in place |

First-time setup on a new machine: \`cd tools && npm install\` (installs \`sharp\`, local only, never deployed). Requires Node 18+.

---

`;

let text = await fs.readFile(file, 'utf8');
if (text.includes(MARK)) { console.log('README already has the section. Nothing changed.'); process.exit(0); }
const i = text.indexOf('## License');
if (i === -1) { text = text.trimEnd() + '\n\n---\n\n' + SECTION.replace(/\n---\n\n$/, '\n'); }
else text = text.slice(0, i) + SECTION + text.slice(i);
await fs.writeFile(file, text, 'utf8');
console.log('README.md updated: added "Adding Images (PNG to WebP)" section.');

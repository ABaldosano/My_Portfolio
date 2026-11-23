# tools (local only, never deployed)

Image shrink + reference rewiring. Needs Node 18+.

Run these from the `tools` folder, in this order:

    npm install
    node optimize-images.mjs                dry run, shows the size report
    node optimize-images.mjs --write        converts, moves originals to ..\images_original_backup
    node update-refs.mjs                    dry run, shows what would change
    node update-refs.mjs --write            rewires html/css/json/README, favicon <head>, manifest

The dynamic SVG favicon (..\favicon.svg, your A.BJr logo) is linked automatically.
Use `node update-refs.mjs --write --no-svg` to skip it and use PNG icons only.

Notes
- Output WebP has the exact same pixel width and height as the original. Resizing is opt-in: `--max-width=1600`. Lower size via `--quality=75`.
- og-cover.jpg stays a JPEG on purpose (social crawlers), same dimensions, just re-encoded.
- favicon.png becomes favicon-32 / apple-touch-icon / icon-192 / icon-512 (palette PNGs, a few KB).
- Both scripts are safe to run twice.
- After a successful run, `git status` should show only .webp/.png additions, deleted originals and edited html/json/md.
- If you re-add a big PNG/JPG later, just run the two --write commands again.
- width/height attributes are not added by default (they can stretch images). Opt in with `update-refs.mjs --write --dims`.
- The icon PNGs are regenerated from favicon.svg with `node make-icons.mjs` (circular, transparent corners; apple-touch-icon stays an opaque square because iOS rounds it itself).

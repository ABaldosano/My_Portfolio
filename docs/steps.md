# Portfolio Update Steps

Read `docs/plan.md` first. It holds the decisions (D-1 to D-7), the exact copy, the ATLAS definition, and the image specs. This file is the ordered work list. No tests anywhere in this update.

## Status board (the agent ticks these in this file and returns the file in the zip)

- [x] H-1 Decisions settled (you)
- [ ] H-2 Screenshots captured (you)
- [x] H-2b Event photos picked (you): `capstone-event-1..6.jpg` are in the folder, uncropped (1 to 4 are portrait 1536x2048, 5 and 6 are landscape 2048x1536)
- [x] H-3 Images generated (you): `atlas-cover.png`, `atlas-logo.png`, `og-cover.jpg` are in the folder
- [ ] H-4 Converted to WebP (you)
- [x] A-01 index ATLAS card
- [x] A-02 projects ATLAS card and schema
- [x] A-03 featured.html case study page
- [x] A-04 research page: ATLAS paper
- [x] A-05 featured.html event gallery and team photo (after H-2b and H-4)
- [x] A-06 featured.html og:image size (after H-4)
- [x] B-01 index head and schema
- [x] B-02 index body
- [x] B-03 other pages meta
- [x] B-04 certifications and projects schema fixes
- [x] C-01 chatbot.js terminal knowledge
- [x] C-02 Worker files: knowledge.js and index.js (separate session, targeted edits)
- [x] D-01 sitemap, manifest, dates
- [x] D-02 README
- [x] D-03 final sweep

## Agent rules (paste this block at the top of every prompt)

```
STRICT RULES
1. RETURN THE WHOLE REPO AS repository.zip FIRST. As soon as this step's edits are in place, build the zip of the entire repo and return it before doing anything else, including checks. Prioritize returning the zip over everything.
   Exclude: .git, node_modules, worker/, .env, *.log, .DS_Store. Keep docs/. The zip must stay under 30 MB.
2. If you change anything after returning the zip, return another full repository.zip.
3. If you are running low on tokens, stop, tick only the finished boxes in docs/steps.md, put a short HANDOFF note at the bottom of docs/steps.md (what is done, what is next, anything half-edited), and return the zip with that file included. Handoffs live in the file, not in chat.
4. DO NOT WRITE TESTS. No test files, no test frameworks, no test scripts. Verify only with the single search commands given in the step.
5. Conserve tokens. Read only the files and ranges the step names. Search by string, not by line number. After the zip, reply with a list of modified files with their paths and nothing else.
6. Copy comes from docs/plan.md. Do not invent facts, numbers, awards, metrics, or claims. If something is missing, leave the existing text and list it in your reply.
7. Style: no em dashes, no en dashes, no emojis, no gradients, no decorative additions. Use commas, colons, or "to". Match the existing code style, tokens (var(--gold), var(--muted), etc.), and class names. Do not add dependencies.
8. Do not touch: assets/js/compiler.js, assets/js/consent-*.js, assets/js/functions.js, assets/css/chatbot.css, assets/css/compiler.css, assets/css/consent.css, tools/, .gitignore, CNAME.
9. External links keep target="_blank" rel="noopener noreferrer".
```

My extraction command after each zip: `tar -xf "%USERPROFILE%\Downloads\repository.zip"`

---

## Phase 0: You (no agent)

### H-1 Settle decisions
Open `docs/plan.md` section 3. D-1, D-2, D-3, D-6 are already settled. If you change any open default (D-4, D-5, D-7, D-8, D-9), or if you supply the other team members' full names and roles, tell the agent in the prompt for A-01 and write it here.

Decision overrides (2026-11-24):
- D-1: awards are 1st Place Award, Most Innovative Study Award, Best Presenter Award.
- D-2: the page is `pages/featured.html` (renamed from capstone.html, and atlas-psu.html before that). Links to it read "Featured Page".

Corrections (2026-11-24, made after A-01 to C-01 were run; they override anything older in this file or in plan.md):
- C-1: The ATLAS PSU paper is a CASE STUDY paper. It was submitted and defended as a case study. It is NOT Arthur's capstone. A capstone is only planned for the future, and ATLAS may be pursued as that capstone title later. Never write "BSIT capstone", "capstone paper", or "capstone work" about ATLAS PSU anywhere (site, README, chatbot, knowledge.js, schema). Use "case study".
- C-2: Page file is `pages/featured.html`. Page header label is "Case Study", page title starts "Case Study: ATLAS PSU ...", breadcrumb name is "Case Study". All links to it from index, projects, and research read "Featured Page". The source comment says to review it if the study is pursued as a capstone (reminder: Nov 2027).
- C-3: Sitemap, README, chatbot, and knowledge.js use `featured.html` and the words "featured page" and "case study". Image files keep their names (`capstone-event-N`, `atlas-*`).
- C-4: Done by the agent on request, not in the plan: the "What kind of systems has Arthur built?" FAQ answer on index now names ATLAS PSU (CP-SAT and genetic algorithm), and the skills grid and schema follow plan.md section 4 (16 items, no C#). Chatbot `projects` lists IARMS by name only, with Portfolio Website and PostgreSQL CRUD Dashboard descriptors written by the agent.
- C-5: SETTLED 2026-11-24, "Featured" nav item added (desktop and mobile) after Projects on index and the six pages. plan.md D-8 asks for a nav item on all six pages, but A-03 says no nav item and none was added. Decide before D-03.
- C-6: At the time of A-01 to A-04, `atlas-cover.webp`, `atlas-shot-1..6.webp`, and all `capstone-event-N.webp` were not in `assets/images/`. The event gallery was left out of featured.html until the photos exist. Pages already reference `atlas-cover.webp` and the six shots.
- C-8 (2026-11-24): `atlas-og.jpg` is dropped, so A-06 uses `atlas-cover.webp` only (1448x1086, so width 1448 and height 1086). The ATLAS logo is the one from the ATLAS repo (`atlas-logo.png`, 1119x1119). `og-cover.jpg` was regenerated (1200x630, stays JPG). Screenshots `atlas-shot-1..6` and event photos are still pending.
- C-9 (2026-11-24): event photos are JPG and not cropped. The gallery CSS must handle mixed portrait and landscape (fixed aspect ratio with object-fit cover, object-position center, so nothing is distorted). Photo 3 is portrait, so show it as a single figure with a max-width, not stretched. `atlas-shot-1..6` are still pending.
- C-10 (2026-11-24): the research page paper card now uses `atlas-paper-cover.webp` (cover page of the paper, alt "Cover page of the ATLAS PSU case study paper"). Already edited in pages/research.html. Do not change it back to atlas-cover.webp. The paper card on index or projects pages keep their own images.
- C-11 (2026-11-24): fixed in assets/js/functions.js: the nav active state now knows the Featured page (it used to highlight Home on featured.html). Already edited. Leave it as is.
- C-7 (2026-11-24, later): H-2, H-2b, H-3, H-4 were ticked by mistake and are reopened. The images are still missing. New steps A-05 (event gallery) and A-06 (og:image size) run only after H-4 is done.
- D-3: Jestone Jaranilla and VJ Diamante are named as co-programmers; all 13 authors from the Zenodo citation are listed.
- D-6: project title follows the published paper (Teaching Load Assignment and Management System).

### H-2 Capture real screenshots
From https://atlas-psu.onrender.com with pseudonym data only. Six images listed in plan.md section 7. Desktop 1440x900, phone 390x844. Hide anything that is a real name, real email, token, or password. Save as PNG named `atlas-shot-1.png` to `atlas-shot-6.png`.

### H-2b Event and group photos
Pick 6 real photos from the Nov 9 event and the group, landscape, at most 1600 px wide. Save as `capstone-event-1` to `capstone-event-6` (PNG or JPG). Tell the group before they go live. Where each goes on `pages/featured.html` (added by A-05):
- 1: presenter on stage with the slide behind (gallery "The Event")
- 2: audience and panel wide shot (gallery)
- 3: the whole team, ideally with the trophies (top of "The Team", not in the gallery)
- 4: close-up of the three awards (gallery)
- 5: question and answer with the panel (gallery)
- 6: the team during the demo (gallery)
Skip any photo that shows a screen with real names, emails, or passwords.

### H-3 Generate logo, cover, OG
Use prompts A1, A2, A3 from plan.md Appendix A. Save `atlas-logo.png`, `atlas-cover.png`, `og-cover.jpg` (1200x630).

### H-4 Convert
Put all images in `assets/images/` first, then run ONE script from the tools folder (run `npm install` there once if it says it cannot find `sharp`):
- Everything is PNG: from the repo root, `node tools\png-to-webp.mjs`. It converts only .png files, keeps the exact pixel size, moves the originals to `..\images_original_backup`, and skips the four icon PNGs and any name that already has a .webp.
- Any photo is JPG (phone photos are): from the tools folder, `node optimize-images.mjs --max-width=1600` for a dry run, then `node optimize-images.mjs --write --max-width=1600`. It converts every PNG and JPG, fixes phone rotation, and shrinks anything wider than 1600 px. Do not run both scripts.
Do not put `atlas-og.jpg` in the folder until after the script has run, because `optimize-images.mjs` would turn it into WebP. Confirm `atlas-cover.webp`, `atlas-shot-1.webp` to `atlas-shot-6.webp`, and `capstone-event-1.webp` to `capstone-event-6.webp` exist. Send the repo to the agent only after this.

---

## Phase A: ATLAS

### A-01 index.html: ATLAS featured card
Files: `index.html` (only the ATLAS card inside `#featured-projects`, and the section intro paragraph).
1. Find the card with class `thesis-card` (image `atlas.webp`). Replace it with:
   - Image `assets/images/atlas-cover.webp`, alt "ATLAS PSU teaching load assignment dashboard and weekly timetable".
   - Badge `Award-Winning · Live System`.
   - Title `ATLAS PSU: Teaching Load Assignment and Management System` (D-6).
   - Description: the one-line from plan.md section 5 (230 characters max, do not exceed).
   - Tags: `Python / Flask`, `CP-SAT`, `Genetic Algorithm`, `PostgreSQL (Supabase)`, `Render`.
   - Links: `Live System` to `https://atlas-psu.onrender.com`. Add a second link `Featured Page` to `pages/featured.html` using class `proj-card-link dim`.
2. Replace the `section-intro-desc` paragraph with the "Featured intro" copy from plan.md section 4.
Check (one command): search `index.html` for `ATLAS-PSU/` and `atlas.webp`; both must return nothing.

### A-02 projects.html: ATLAS card and its schema
Files: `pages/projects.html` (ATLAS card in "Top Live Projects", and the ATLAS entry in the ItemList JSON-LD).
1. Replace the ATLAS card the same way as A-01. Badge: `Primary Featured · Award-Winning · Live System`. Remove the sentence "Backend only runs locally". Image path uses `../assets/images/atlas-cover.webp`. Link `https://atlas-psu.onrender.com`, plus a `Featured Page` link to `featured.html` (class `proj-card-link dim`).
2. In the JSON-LD `project-atlas` entry: name `ATLAS PSU: Teaching Load Assignment and Management System`, description = the long description from plan.md section 5, url `https://atlas-psu.onrender.com`, add `"image": "https://www.arthurr.gt.tc/assets/images/atlas-cover.webp"`, `"programmingLanguage": ["Python", "JavaScript", "SQL"]`, `"award": ["1st Place Award", "Most Innovative Study Award", "Best Presenter Award"]`, and `"citation": "https://doi.org/10.5281/zenodo.24479345"`, `"keywords": "CP-SAT, genetic algorithm, Flask, Supabase, Render, teaching load, scheduling"`.
Check: search `pages/projects.html` for `ATLAS-PSU/`, `atlas.webp`, `runs locally`; all must return nothing.

### A-03 pages/featured.html: ATLAS PSU case study page
Files: new `pages/featured.html`; append a small block to the end of `assets/css/global.css`.
Purpose: a showcase of the ATLAS PSU case study, kept apart from the regular projects. It is temporary by design. Put this HTML comment at the top of the main content: `Case study showcase. Review and update when the study is pursued as a capstone (reminder: Nov 2027).`
Build by copying the head, nav, footer, scripts, and cookie modal structure from `pages/contact.html` (same relative paths with `../`). Do not add a nav item (D-8). Then:
- `<title>`: `Case Study: ATLAS PSU Teaching Load Assignment System | Arthur Baldosano Jr.`
- Meta description (max 160 chars): `Case study of Arthur Baldosano Jr.: ATLAS PSU, a live CP-SAT and genetic algorithm system that assigns teaching loads at Palawan State University.`
- Canonical, hreflang, OG, Twitter, DC tags following contact.html, with `og:image` set to `https://www.arthurr.gt.tc/assets/images/atlas-cover.webp`.
- JSON-LD: `SoftwareApplication` (same fields as A-02), `ScholarlyArticle` for the paper (headline = published title, url = the DOI, `datePublished` 2026, publisher Zenodo, all 13 authors as `Person`), `BreadcrumbList` (Home, Capstone), `WebPage`. No FAQPage.
- Body, in this order, using existing classes (`page-header`, `container`, `section-label`, `section-title`, `proj-card` styles):
  1. Header: label `Case Study`, title `ATLAS PSU`, the one-line description from plan.md section 5.
  2. Recognition strip: `1st Place Award`, `Most Innovative Study Award`, `Best Presenter Award`, with the line "4th PAL-SU IT Department UI/UX Design Case Study Competition, November 9, 2026". No score numbers.
  3. Facts row: Role (team leader, backend and optimization engine, full-stack), Status (Live), Stack, Hosting, Paper.
  4. Problem and context: chairpersons assign teaching loads by hand across College of Sciences departments (2 short paragraphs from the plan.md safe facts only).
  5. How it works: CP-SAT builds feasible schedules under hard rules, the genetic algorithm improves balance, saved and approved runs, leave and availability handling. No numbers.
  6. System: role-based access, department-scoped data, audit log, Supabase PostgreSQL with an RPC protecting faculty reads, admin Test Lab.
  7. Stack table from plan.md section 5 (Languages, Optimization, Database, Auth and security, Hosting, Tooling).
  8. Screens: `atlas-shot-1.webp` to `atlas-shot-6.webp` in a responsive grid (2 columns desktop, 1 mobile), `loading="lazy" decoding="async"`, descriptive alt and a one-line caption each.
  9. The team: Arthur Baldosano Jr. (team leader, backend and optimization engine, full-stack), Jestone Jaranilla (co-programmer and presenter), VJ Diamante (co-programmer and presenter), then "Research team" with the other ten names exactly as in plan.md section 5 (or the full names and roles from the Decision overrides). Do not invent roles.
  10. Event gallery: every `capstone-event-N.webp` that exists, lazy loaded, caption "4th PAL-SU IT Department UI/UX Design Case Study Competition, November 9, 2026". Do not reference a file that does not exist.
  11. Published paper: the APA citation from plan.md section 5, copied exactly, with the DOI as a link and a link to `research.html`.
  12. Honest limitations: the three limitations in plan.md safe facts.
  13. Access: `Open the live system` link, the D-4 sign-in note, and the D-7 wake-up note.
- CSS block appended to `global.css`: `.case-awards`, `.case-facts`, `.case-team`, `.case-gallery`, `.case-gallery figure`, `.case-gallery figcaption`, `.case-table`. Use existing tokens only, border `1px solid var(--border)`, radius `var(--radius)`, correct in both themes and at 360 px width.
Check: search the new file for em dash (U+2014) and en dash (U+2013) characters, and for `atlas-psu.html`; all must return nothing.

### A-04 pages/research.html: add the ATLAS paper
Files: `pages/research.html` (card grid and the ItemList JSON-LD only).
1. Add a new card as the first card in "Published Papers": image `../assets/images/atlas-cover.webp`, alt "ATLAS PSU teaching load assignment dashboard", badge `Research Paper · 2026`, title = the published paper title, description "Case study paper by a team of 13 students documenting ATLAS PSU, a CP-SAT and genetic algorithm teaching load system for department chairpersons of the College of Sciences at Palawan State University. First author.", tags `Systems Analysis`, `Constraint Programming`, `Genetic Algorithm`, `Academic Systems`, links `Read Paper` to `https://doi.org/10.5281/zenodo.24479345` and a dim `Featured Page` link to `featured.html`. No PDF link.
2. JSON-LD: add a `ScholarlyArticle` as position 1 (`@id` ending `#research-atlas`, `datePublished` `2026`, all 13 authors as `Person` in citation order, publisher Zenodo, url the DOI), renumber the other two, set `numberOfItems` 3.
Check: search `pages/research.html` for `24479345`; it must appear in the card and the JSON-LD.

### A-05 pages/featured.html: event gallery and team photo
Files: `pages/featured.html` only. The CSS classes `case-gallery` and `case-section` already exist.
Run only after H-2b and H-4. List `assets/images/` first and use only `capstone-event-N.webp` files that exist.
1. Insert a new `case-section reveal` block labelled `The Event` right after the `Screens` section and before `The Team`. Lead line: `4th PAL-SU IT Department UI/UX Design Case Study Competition, November 9, 2026.` Then a `case-gallery` of figures for photos 1, 2, 4, 5, 6 in that order, same markup as the Screens figures (`../assets/images/...`, `loading="lazy" decoding="async"`), with these captions and matching alt text:
   - 1: `Presenting ATLAS PSU at the competition.`
   - 2: `The audience and panel during the presentations.`
   - 4: `The three awards from the competition.`
   - 5: `Question and answer with the panel.`
   - 6: `The team during the demo.`
2. If `capstone-event-3.webp` exists, add one figure (class `case-gallery`) at the top of `The Team` section, above the names, with caption `The ATLAS PSU team after the competition.`
3. Add no names, claims, or text beyond the above. The captions follow the H-2b shot list, and the owner confirms they match the photos.
Check: every `capstone-event-` path in `featured.html` exists in `assets/images/`.

### A-06 pages/featured.html: og:image size
Files: `pages/featured.html` head only.
Run only after H-4.
1. Read the real pixel size of `assets/images/atlas-cover.webp` (for example `python3 -I -c "from PIL import Image; print(Image.open('assets/images/atlas-cover.webp').size)"`). Insert after the `og:image:secure_url` line: `<meta property="og:image:width" content="W" />` and `<meta property="og:image:height" content="H" />` using the measured numbers.
2. Skipped (see C-8, `atlas-og.jpg` is dropped). Only if `assets/images/atlas-og.jpg` exists (1200x630), use it instead for `og:image`, `og:image:secure_url`, and `twitter:image`, set `og:image:type` to `image/jpeg`, width 1200, height 630. Leave `atlas-cover.webp` in the page JSON-LD and on the cards.
3. D-03 check 6 (1200x630 on all pages) applies to `featured.html` only when it uses `atlas-og.jpg`.
Check: `featured.html` contains numeric `og:image:width` and `og:image:height` that match the file named in `og:image`.

---

## Phase B: Positioning

### B-01 index.html: head and structured data
Files: `index.html` (everything above `</head>`).
1. `<title>`, meta description, keywords (remove "PSU SITE President", add technical SEO terms such as `technical SEO specialist Philippines, SEO audit Palawan, GA4 GTM setup, schema markup`), `DC.title`, `DC.subject`, `DC.description`, `DC.date` to `2026-11-24`, `og:title`, `og:description` (remove the PSU-SITE sentence), `og:updated_time` to `2026-11-24T00:00:00+08:00`, Twitter title and description, all using plan.md section 4 copy. Set `og:image:width` 1200 and `og:image:height` 630 (they already declare this; the new file matches).
2. Person JSON-LD: `jobTitle` `Technical SEO Specialist and Systems & Data Analyst`; description without "Serves as PSU-SITE President"; `knowsAbout` add `Technical SEO`, `SEO Audits`, `Google Analytics 4`, `Google Tag Manager`, `Schema Markup`, `Google Search Console`, `Constraint Programming`, `PostgreSQL`, `Supabase`; `seeks.name` `Technical SEO, Systems Analysis, and Data Analytics opportunities`.
3. Skills ItemList: replace with the 16 items of plan.md section 4, set `numberOfItems` 16, keep the same item shape.
4. Service JSON-LD: add `Technical SEO Audits` and `GA4 and Google Tag Manager Tracking Setup` to `serviceType` and as two `Offer` entries in `hasOfferCatalog`. Name becomes `Technical SEO, Systems Analysis, Data Analytics & Full-Stack Development Services`. Keep "Contact for a quote".
5. FAQPage: rewrite answers for "Who is", "What technologies", "Is available for freelance", "How can I hire" to match positioning (no SITE, no "full-time opportunities" claim beyond "open to freelance and remote roles"). Add one question: "What technical SEO work does Arthur Baldosano Jr. do?" with the services list from Appendix B.
Check: search `index.html` for `SITE`, `President`, `Student Leadership`; the head portion must return nothing (the body is handled in B-02).

### B-02 index.html: body
Files: `index.html` (from `<body>` to the footer).
1. Hero eyebrow, description, badges: plan.md section 4.
2. About: title, bio 1, bio 2, skills grid (16 items), stats (15, 3, 16 with labels `Live Projects`, `Freelance Builds`, `Certifications`). Remove the "PSU / SITE President" stat and the "Student Leadership" skill.
3. AI assistant section intro: change "projects, skills, and experience" wording only if it mentions leadership. Leave otherwise.
4. `placeholder` text of the chat input stays.
Check: search `index.html` for `SITE`, `President`, `Student Leadership`, `Leader`; all must return nothing. Search for `Analyst.` and confirm the About title reads Analyst, Optimizer, Builder.

### B-03 Other pages: meta only
Files: `pages/contact.html`, `pages/articles.html`, `pages/research.html`, `pages/certifications.html`, `pages/projects.html` (head only).
For each: `<title>`, meta description, keywords, DC.description, OG and Twitter title and description, `DC.date` and `og:updated_time` to 2026-11-24. Replace "Systems & Data Analyst" with "Technical SEO Specialist & Systems & Data Analyst" where it fits the length, or add "technical SEO" to the description. Contact page: update ContactPage `jobTitle` and the FAQ answer "What kind of projects" to include technical SEO audits and GA4 and GTM tracking setup. Projects page: `og:description` and Twitter description say "15 systems analysis and full-stack projects".
Check: search these five files for `SITE` and `9+`; both must return nothing.

### B-04 Schema count fixes
Files: `pages/certifications.html` (ItemList), `pages/projects.html` (ItemList and PinnedPicks text).
1. Certifications: add `Introduction to Data Science` (Cisco Networking Academy, about Data Analytics) as a ListItem in the Data Analytics position, renumber positions, set `numberOfItems` 16.
2. Projects: add `Rise From Nothing` to the ItemList (description from its card, url `https://abaldosano.github.io/RFN-Development/`), renumber, set `numberOfItems` 15.
3. PinnedPicks JSON-LD description: "Independently designed, built, and operated affiliate e-commerce catalog curating Shopee picks, with a PostgreSQL backend and Pinterest-led traffic." Remove "Amazon, and SHEIN".
Check: search `pages/` for `Amazon` and `SHEIN`; no result may describe current PinnedPicks coverage.

---

## Phase C: Chatbot

### C-01 assets/js/chatbot.js terminal knowledge
Files: `assets/js/chatbot.js` (only the `TERMINAL_KNOWLEDGE` object, plus the `DEFAULT_GREETING` string is left alone).
1. `bio`: rewrite from plan.md Appendix B identity. Remove "President of PSU-SITE".
2. `skills`: the 16 items from plan.md section 4, one per line.
3. `projects`: numbered list of the 15 projects in the page order, ATLAS first with `https://atlas-psu.onrender.com`, PinnedPicks `https://www.pinnedpicks.gt.tc/`, CrypStockDash link, NeuralGrid `https://abaldosano.github.io/NeuralGridEngine/`, Rise From Nothing `https://abaldosano.github.io/RFN-Development/`, others by name only. End with `->   Full list: pages/projects.html`.
4. Add a `services` entry (the Appendix B services list, one per line) and add `services` to the `help` text.
5. `certifications`: add `* Introduction to Data Science (Cisco Networking Academy)` so it matches 16.
6. `research`: add the ATLAS paper as entry [1] (title as published, 2026, first author of 13, Zenodo DOI `https://doi.org/10.5281/zenodo.24479345`) and renumber the other two.
7. `projects` entry [1] points to `https://atlas-psu.onrender.com` and mentions the featured page `pages/featured.html`.
Keep the template-literal style and the 80-column wrapping. No other function changes.
Check: search `chatbot.js` for `SITE`, `President`, `Student Leadership`, `ATLAS-PSU/`; all must return nothing.

### C-02 Worker chatbot: knowledge.js and index.js (separate session, targeted edits)
Attach to this session only: `worker/src/knowledge.js`, `worker/src/index.js`, `worker/src/arthur-personality.json`, and `docs/plan.md`. The repo zip is not needed and the Worker files must never be added to it (`worker/` is gitignored).
Exception to rule 1 for this step only: return the changed files themselves, with their paths, as soon as the edits are made. Do not return a repo zip. Expected: `worker/src/knowledge.js` and `worker/src/index.js`. `arthur-personality.json` must come back unchanged and does not need returning.
Prompt for the agent:
```
Apply docs/plan.md Appendix C exactly. Read the three attached files first. Edit knowledge.js (K-1 to K-9) and index.js (W-1, W-2) by anchor, as targeted find-and-replace edits only. Do not rewrite or reformat either file. If any anchor is not found exactly once, stop and tell me which one. Do not touch LEAK_MARKERS, limits, CORS, logging, the Gemini payload, the import line, or the personality append code. Skip OPT-1 unless I say so. Use no em dashes, no en dashes, no backticks inside the template literal. No tests. Return the modified files with their full paths first, then run the search checks listed at the end of Appendix C.
```
After you receive the files: put them back in `worker/src/`, run `wrangler deploy` from the worker folder, then ask the chatbot on the live site: "Who is Arthur?", "What is ATLAS PSU?", "Is he the PSU-SITE president?", and "How much does he charge?" Expected: SEO and analyst identity, the ATLAS PSU case study with awards and the Render link, an honest "served in PSU-SITE during A.Y. 2024-2026, including as president, and has since stepped down", and no rate.

---

## Phase D: Housekeeping

### D-01 sitemap, manifest, dates
Files: `sitemap.xml`, `manifest.json`.
1. `sitemap.xml`: every `lastmod` becomes `2026-11-24`. Add `https://www.arthurr.gt.tc/pages/featured.html` with priority 0.8, changefreq monthly.
2. `manifest.json` description: `Technical SEO specialist and Systems & Data Analyst and IT student at Palawan State University. SEO audits, GA4 and GTM tracking, and custom web systems from Puerto Princesa, Palawan.` Screenshot entry stays.
Check: search `sitemap.xml` for `2026-06-16`; must return nothing.

### D-02 README
Files: `README.md`.
Rewrite to match the site, keeping the existing structure and badges:
- Tagline and header line: `Technical SEO · Systems & Data Analyst · Puerto Princesa, Palawan`. Remove "PSU-SITE President" and the Leadership row.
- What Is This, About: plan.md section 4 positioning, open to freelance work.
- Skills table: add rows for Technical SEO (GA4, GTM, Search Console, schema markup), Optimization (CP-SAT, genetic algorithms), Databases (PostgreSQL, Supabase), Hosting (GitHub Pages, Cloudflare Workers, Render).
- At a Glance: 15 projects, 3 freelance builds, 16 certifications.
- Research: add the ATLAS paper with the citation from plan.md section 5 (3 papers).
- Projects: ATLAS first with the new description, tags, live link, and featured page link; list all 15 in site order. Fix PinnedPicks to Shopee only. Remove the dead GitHub Pages link for ATLAS.
- Certifications: replace the "in progress" table with the 16 credentials grouped as on the site.
- SEO and Discoverability section: list the actual schema types and the sitemap covering seven pages (including the featured page).
- Footer line: remove "PSU-SITE President".
- Keep the "Adding Images" section if present, keep License.
Check: search `README.md` for `SITE`, `President`, `9+`, `Amazon`, `ATLAS-PSU/`; all must return nothing.

### D-03 Final sweep
Files: whole repo, read-only except fixes.
Run these single searches and fix any hit:
1. `SITE` (case-sensitive, exclude `site_name`, `Sitemap`, `website`, `og:site`), `President`, `Student Leadership`, `Developer. Leader.`
2. `ATLAS-PSU/`, `atlas.webp`, `atlas-psu.html`, `Automated Teaching Load`, and `Automatic Teaching` anywhere.
3. Em dash (U+2014) and en dash (U+2013) characters in html, js, json, md.
4. Every `assets/images/...` path referenced in html and css exists on disk.
5. Open each JSON-LD block count: confirm 16 certifications items, 15 project items, 16 skills items.
6. `og:image:width` is 1200 and `og:image:height` is 630 on all six pages.
Then tick all boxes in the status board and return the final `repository.zip`.

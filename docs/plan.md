# Portfolio Update Plan (Nov 2026)

Planner: Claude (Portfolio website planner). Repo state read: full zip as of 2026-11-23 (6 HTML pages, 5 JS, 4 CSS, tools/, README, sitemap, manifest).
No tests are part of this update. Verification is by search and by opening the pages, nothing else.

## 1. Goals

1. Rebuild the ATLAS PSU entry in every place it appears: title, description, tags, badge, link, image, schema, README, chatbot.
2. Point every ATLAS link to https://atlas-psu.onrender.com (the old GitHub Pages link goes away).
3. Remove "PSU-SITE President" and "Student Leadership" framing everywhere.
4. Reposition the whole site as: Technical SEO + Systems & Data Analyst (full-stack is a method, not the headline).
5. Update the chatbot knowledge: `TERMINAL_KNOWLEDGE` in `assets/js/chatbot.js` (in repo) and `knowledge.js` (in the Cloudflare Worker, NOT in this repo).
6. Fix stale facts found during the read (section 4).
7. Produce image assets (logo, cover, real screenshots, event photos, OG cover) from the prompts in Appendix A.
8. Build `pages/featured.html`, a dedicated showcase of the ATLAS PSU case study, separate from the regular project list and temporary by design (updated or replaced later).
9. Add the published ATLAS paper (Zenodo) to the research page and cite it everywhere ATLAS is described.

## Corrections (2026-11-24, override anything below)

- The ATLAS PSU paper is a CASE STUDY paper, submitted and defended as a case study. It is not Arthur's capstone. A capstone is only planned for the future, and ATLAS may be pursued as that capstone title later. Do not call ATLAS his capstone anywhere (site, README, chatbot, knowledge.js, schema). Use "case study".
- The page `pages/capstone.html` is named `pages/featured.html`. Links to it read "Featured Page". Its header label is "Case Study".
- steps.md "Corrections" block lists the full set (C-1 to C-6), including the open nav item decision (D-8).

## 2. Findings that shape the plan

| # | Finding | Consequence |
|---|---------|-------------|
| F1 | The chatbot lives in the Cloudflare Worker, not in the repo zip. `.gitignore` excludes `worker/`. You supplied the three files (`worker/src/index.js`, `worker/src/knowledge.js`, `worker/src/arthur-personality.json`), and they are now mapped in Appendix C as targeted edits. | Step C-02 is a find-and-replace edit of two files, run in its own session. The files are never added to the repo zip. You redeploy with `wrangler deploy`. |
| F2 | Current `atlas.webp` is a poster with the official PSU seal, the name "Automatic Teaching Load Assignment System", and invented-looking numbers (Balance score 33%). | Replace it. New cover must not use the PSU seal and must not show numbers that are not from the real app. |
| F3 | `og-cover.jpg` says "Developer. Leader. Builder." and shows "Student Leadership". It is 1731x909 but every page declares 1200x630. | Regenerate at exactly 1200x630 with the new positioning. |
| F4 | `projects.html` ATLAS card says "Backend only runs locally". ATLAS has been live on Render since 2026-10-16. | Rewrite. |
| F5 | ATLAS links point to `abaldosano.github.io/ATLAS-PSU/`. The repo is now private, so that link is likely dead. | Replace in index, projects, JSON-LD, README, chatbot. |
| F6 | Projects JSON-LD says `numberOfItems: 14` but the page has 15 cards (Rise From Nothing is missing from the list). | Add it, set 15. |
| F7 | Certifications JSON-LD says 15, page has 16 cards (Introduction to Data Science missing). | Add it, set 16. |
| F8 | About copy and projects JSON-LD say PinnedPicks covers "Shopee, Amazon, and SHEIN". It is Shopee only now, on a Supabase/PostgreSQL backend. The index card is already correct. | Align the About text, JSON-LD, README. |
| F9 | Stat says "16+ Live Projects" on index, "9+" in README and projects meta. The page lists 15. | Use one number: 15. |
| F10 | `sitemap.xml` lastmod is 2026-06-16. `DC.date` and `og:updated_time` are 2026-07-12. | Set all to 2026-11-24. |
| F11 | README still says certifications are "in progress", lists 9 projects, lists only HTML/CSS/JS skills. | Rewrite. |
| F12 | `chatbot.js` terminal `skills` and `projects` lists are shorter than the site. | Sync. |
| F13 | Bio says he "manages his own freelance IT practice independently". Freelance on Upwork is just starting. | Reword to "open to freelance work". No client results or ranking claims anywhere. |
| F14 | The site contains zero em dashes (only one inside a CSS comment). | Keep it that way. No em dashes or en dashes in any new text. |
| F15 | The ATLAS paper is published on Zenodo (DOI 10.5281/zenodo.24479345, 13 authors) but the research page and its JSON-LD list only 2 papers. | Add it as a third entry (step A-04), cite it on the featured page, README, chatbot, and knowledge.js. |
| F16 | The project name differs by source: site says "Automated Teaching Load Assignment System", the old poster says "Automatic ...", the published paper says "A Teaching Load Assignment and Management System". | Use the published paper wording everywhere (D-6). |
| F17 | Stack check against the repo (section 4): Flask, CP-SAT, genetic algorithm, Supabase, Render, pytest, Figma, role-based access, and audit log appear nowhere on the site today. The 16 certifications and most languages are already there. | Only the genuinely new items are added. No duplicates. |

## 3. Decisions

D-1, D-2, D-3 were settled by you on 2026-11-24. D-6 is settled by the published paper. D-4, D-5, D-7, D-8, D-9 are open and have defaults so nothing is blocked.

| ID | Decision | Value used in steps.md | Change it if |
|----|----------|------------------------|--------------|
| D-1 | Awards (SETTLED) | "1st Place Award", "Most Innovative Study Award", "Best Presenter Award", 4th PAL-SU IT Department UI/UX Design Case Study Competition, 2026-11-09. | Your certificate wording differs. Use the certificate text exactly. No score numbers are published. |
| D-2 | Case study page (SETTLED) | Yes: `pages/featured.html`. A showcase of the ATLAS PSU case study, kept apart from the regular projects. It holds event photos, the team, screenshots, and the paper. Temporary by design: update or replace it if the capstone is pursued further or after about a year. | Never, unless you drop it. |
| D-3 | Team credit (SETTLED) | Name Jestone Jaranilla and VJ Diamante as co-programmers, and list all 13 authors exactly as in the Zenodo citation. Roles are only stated for the three people whose roles are confirmed (you, Jestone, VJ). | You tell the agent other members' full names and roles. Let the group know before it goes live. |
| D-4 | Public demo access (SETTLED) (the live site needs a login) | Featured page says "Sign-in required. Request demo access by email." No credentials in the repo. |
| D-5 | OG cover photo (SETTLED) | Use the old event photo reads as the leadership brand But the user will provide a new one. |
| D-6 | Official title (SETTLED by the paper) | Paper title: "ATLAS PSU: A Teaching Load Assignment and Management System for Department Chairpersons of the College of Sciences at Palawan State University". Card title: "ATLAS PSU: Teaching Load Assignment and Management System". Short name: ATLAS PSU. | The abstract or defense used another name. |
| D-7 | Render plan (SETTLED) | Add a small note "First load can take up to a minute while the server wakes". Yes note this in the link|
| D-8 | Navigation (SETTLED) | You want a nav item on all six pages (OPEN: not added; A-03 says no nav item). |
| D-9 | Group and event photos | Use only photos you supply, captioned with the event name and date, and names from the citation. | Someone asks to be left out. |

## 4. Positioning (single source of truth for copy)

Headline identity: **Technical SEO Specialist and Systems & Data Analyst**, Puerto Princesa, Palawan, Philippines. Third-year BSIT student at Palawan State University (Data Analytics and E-Commerce). Open to freelance work, remote, worldwide.

Two lanes:
- Technical SEO: technical SEO audits, GA4 and Google Tag Manager tracking, schema markup (JSON-LD), Google Search Console, on-page SEO, landing pages.
- Systems & Data Analysis: requirements, system design, data analytics, optimization, directed into full-stack builds.

Evidence he can point to (only use these, never invent):
- This portfolio: Person, WebSite, ProfilePage, ItemList, Service, FAQPage, CollectionPage, ContactPage, BreadcrumbList, ScholarlyArticle schema, hreflang, Dublin Core, GTM with Consent Mode v2, sitemap, robots.
- PinnedPicks: JSON-LD, Open Graph, Twitter cards, sitemap, robots, search engine verification, PWA manifest, cookie consent.
- Credentials: Google Analytics 2026 Certified, SEO Certified (HubSpot), Digital Marketing, Content Marketing, Email Marketing, Data Analytics Essentials (Cisco).
- Upwork profile title: "Technical SEO & GA4/GTM Specialist | I Help Businesses Improve Search" (fixed-price work).

Do not publish: hourly rate, traffic or ranking numbers, Pinterest or affiliate earnings, client results, availability dates, private career plans, or anything about family, relationships, religion, health, or finances.

### New versus already on the site (verified against the repo on 2026-11-24)

| Item | On the site today? | Action |
|------|--------------------|--------|
| HTML / CSS / JavaScript, Python / FastAPI, Node.js / Express, C#, Three.js / Canvas API, Git / GitHub, AI Integration, E-Commerce Platforms, Data Analytics, System Design, Full-Stack Development | Yes (skills grid and JSON-LD) | Keep. Do not add again. |
| PostgreSQL | Yes (skills grid, PinnedPicks card) | Only extend the label to "PostgreSQL / Supabase". |
| Edge Functions, Involve Asia pipeline | Yes (PinnedPicks card) | Keep. |
| Cloudflare Workers, KV, Gemini, Pyodide, GA4 through GTM, schema types | README only, not in the skills grid, schema, or chatbot | Keep in README. Surface the SEO items through the Technical SEO skills. |
| Technical SEO, Google Search Console, GA4 and Google Tag Manager as skills, Schema Markup as a skill | No (only the GTM container id in the page head, one README row, and "SEO Certified" in the chatbot list) | NEW |
| Flask, CP-SAT, genetic algorithm, Supabase, Render, pytest, Figma | No (zero matches in html, js, json, md) | NEW |
| Role-based access, audit log, department-scoped data | No (only the old poster image, which is replaced) | NEW, used on the featured page, ATLAS schema, chatbot, knowledge.js |
| The 16 certifications | Already on the certifications page (16 cards). The certifications JSON-LD and chatbot list only 15. | NOT new. Add only Introduction to Data Science to the JSON-LD and chatbot, and show "16" in the stats. |
| Student Leadership, PSU-SITE President | Yes | REMOVE |

New copy (agents use these exact strings unless a decision above changes them):

| Slot | Copy |
|------|------|
| index `<title>` | Arthur Baldosano Jr. \| Technical SEO Specialist & Systems & Data Analyst \| Philippines |
| index meta description | Technical SEO specialist and Systems & Data Analyst in Palawan, Philippines. SEO audits, GA4 and GTM tracking, schema markup, and custom-built web systems. |
| Hero eyebrow | Technical SEO · Systems & Data Analyst · Puerto Princesa, Palawan |
| Hero description | I audit and fix what keeps sites from being found, then analyze and design the systems behind them. From GA4 tracking and schema markup to a constraint-programming scheduler for a university, I take work from analysis to a live build. |
| Hero badges | Technical SEO, GA4 and GTM, Systems Analysis, Data Analytics |
| About title | Analyst.<br><em>Optimizer.</em><br>Builder. |
| About bio 1 | I'm **Arthur Baldosano Jr.**, a technical SEO specialist and systems and data analyst based in **Puerto Princesa, Palawan**. I audit sites, set up GA4 and Google Tag Manager tracking, and implement structured data. I apply the same analysis to custom systems: breaking down requirements, designing the system, and directing it into **full-stack web applications, e-commerce platforms, and academic systems**. All custom, none from templates. I'm a third-year BSIT student at Palawan State University specializing in Data Analytics and E-Commerce, and I'm open to freelance work. |
| About bio 2 | On the product side, I independently designed, built, and operate PinnedPicks, an affiliate e-commerce catalog for Shopee picks with a PostgreSQL backend, a full technical SEO setup, and a Pinterest-led traffic strategy. |
| Skills grid (16) | Technical SEO; GA4 and Google Tag Manager; Schema Markup (JSON-LD); Google Search Console; Data Analytics; Systems Analysis and Design; Full-Stack Development; E-Commerce Platforms; HTML / CSS / JavaScript; Python / Flask / FastAPI; Node.js / Express; PostgreSQL / Supabase; Constraint Programming (CP-SAT); Three.js / Canvas API; Git / GitHub; AI Integration |
| Stats | 15 Live Projects; 3 Freelance Builds; 16 Certifications |
| Featured intro | A cross-section of what I analyze and ship: a live constraint-programming scheduler for a university, a from-scratch neural network rendered in the browser, and an affiliate catalog built with technical SEO from day one. |

## 5. ATLAS PSU, new definition

Official title (D-6): **ATLAS PSU: A Teaching Load Assignment and Management System for Department Chairpersons of the College of Sciences at Palawan State University** (as published). Card and heading title: **ATLAS PSU: Teaching Load Assignment and Management System**. Short name: **ATLAS PSU**.

One-line (for cards, max 230 characters because `.proj-card-desc` clamps at 5 lines):
> A live system that assigns faculty teaching loads for College of Sciences chairpersons at Palawan State University, using CP-SAT and a genetic algorithm. 1st Place, Most Innovative Study, and Best Presenter.

Long description (case study page, JSON-LD, chatbot):
> ATLAS PSU is a live decision-support system that builds and balances faculty teaching loads for department chairpersons in Palawan State University's College of Sciences. A CP-SAT constraint model produces feasible schedules under hard rules (rooms, blocks, faculty availability and leave), and a genetic algorithm improves balance across faculty. Chairpersons work on a Monday to Saturday 30-minute timetable grid with drag and drop, saved and approved runs, printable and Excel timetables, and reports. Access is role based (chairperson, faculty, admin) with department-scoped data, an audit log, and an admin Test Lab that monitors CP-SAT, genetic algorithm, and validation runs live.

Badge text: `Award-Winning · Live System`
Tags: `Python / Flask`, `CP-SAT`, `Genetic Algorithm`, `PostgreSQL (Supabase)`, `Render`
Links: Live system -> https://atlas-psu.onrender.com ; Featured page -> pages/featured.html ; Paper -> https://doi.org/10.5281/zenodo.24479345
Image alt: "ATLAS PSU teaching load assignment dashboard and weekly timetable".

### Newly used stack (from ATLAS, to appear in skills, schema, README, chatbot)

| Area | Items |
|------|-------|
| Languages | Python (Flask backend), vanilla JavaScript (frontend), SQL (PostgreSQL schema, seed and reset scripts, RPC functions) |
| Optimization | CP-SAT constraint programming (Google OR-Tools solver), genetic algorithm |
| Database | PostgreSQL on Supabase, with an RPC function protecting faculty data reads |
| Auth and security | Real logins, role-based access by department (chairperson, faculty, admin), audit log |
| Hosting | Render (web app), Supabase (database). Replaced the earlier GitHub Pages demo. |
| Tooling | pytest, Git branching with rollback tags, Figma (UI proposal), PWA manifest (installable), Excel and printable timetable export |
| Design | Dark mode, department themes, flagship motion layer, mobile bottom bar, drag and drop timetable |

### Facts safe to state publicly

- Completed case study work April to July 2026; final paper submitted 2026-11-04.
- Competition: 4th PAL-SU IT Department UI/UX Design Case Study Competition, 8 case studies, 2026-11-09. Awards: 1st Place Award, Most Innovative Study Award, Best Presenter Award (D-1).
- Scope: College of Sciences departments (IT, CS, Marine Biology, Medical Biology, Environmental Science). Faculty-taught courses only.
- Privacy by design: no student personal data, no stored passwords of our own, no IP tracking, no leave reasons.
- Limitations (state honestly if asked): not every chairperson was interviewed, a faculty survey was not pursued, faculty-side design rests on chairperson accounts.

### Team (D-3)

- Arthur Baldosano Jr.: team leader, backend and optimization engine, full-stack.
- Jestone Jaranilla: co-programmer and presenter.
- VJ Diamante: co-programmer and presenter.
- Research team, names exactly as in the citation: R. Camacho, J. Bantillo, E. Tragico, J. Rovalo, R. Ortega, R. J. Torres, A. L. Jalane, Z. Zambales, J. A. Ferrer, G. E. Aumenta. No roles are stated for them unless you supply them.

### Published paper (Zenodo)

Cite exactly:

> Baldosano Jr., A., Diamante, V., Jaranilla, J., Camacho, R., Bantillo, J., Tragico, E., Rovalo, J., Ortega, R., Torres, R. J., Jalane, A. L., Zambales, Z., Ferrer, J. A., & Aumenta, G. E. (2026). ATLAS PSU: A Teaching Load Assignment and Management System for Department Chairpersons of the College of Sciences at Palawan State University. Zenodo. https://doi.org/10.5281/zenodo.24479345

Use it on the featured page, the research page (third entry, first author), README, chatbot, and knowledge.js. No PDF download link is known, so link the DOI only.

### Not safe to state

Benchmark numbers (the 750-run benchmark was not re-run), the 91 vs 92 score gap, interview respondent names, real faculty names, the private repo link, and any claim that PSU officially adopted the system.

## 6. File inventory: what changes where

Line numbers are approximate, from the 2026-11-23 zip. Agents must search by string, not trust line numbers.

| File | Changes |
|------|---------|
| `index.html` | Title, description, keywords (drop "PSU SITE President"), DC.*, OG and Twitter text, Person JSON-LD (jobTitle, description, knowsAbout, seeks), skills ItemList (13 to 16), Service schema (add Technical SEO offers), FAQPage (identity, technologies, freelance), hero eyebrow/desc/badges, About, skills grid, stats, ATLAS featured card (~lines 610-632), featured intro, `DC.date` and `og:updated_time`. |
| `pages/projects.html` | Title and descriptions, ATLAS card (~lines 256-277), PinnedPicks description in JSON-LD, ItemList add Rise From Nothing and set 15, `og:description` "9+" to "15", dates. |
| `pages/featured.html` | New (D-2). Featured page (case study showcase). |
| `pages/contact.html` | Title, meta, DC, OG, ContactPage and FAQ text: add Technical SEO. |
| `pages/articles.html` | Meta description only: "Technical SEO specialist and Systems & Data Analyst". |
| `pages/research.html` | Meta description, plus the ATLAS paper as a new card and ScholarlyArticle (3 items). |
| `pages/certifications.html` | Meta description; ItemList add Introduction to Data Science, set 16. |
| `assets/js/chatbot.js` | `TERMINAL_KNOWLEDGE`: bio, skills, projects (new ATLAS link and full list), add `services` command and help entry. Remove "President of PSU-SITE" and "Student Leadership". |
| Worker `knowledge.js` and `index.js` | Not in the repo. Targeted edits only, listed in Appendix C. `arthur-personality.json` needs no change. |
| `assets/js/greetings.json` | No change. |
| `assets/css/global.css` | Append a small case study block (facts row, awards strip, team grid, gallery, spec table). |
| `sitemap.xml` | lastmod 2026-11-24, add featured.html. |
| `manifest.json` | description. |
| `README.md` | Rewrite sections: tagline, About, skills table, stats, Projects (15), Research (3), Certifications (16), SEO section, Technologies, footer. Remove SITE. |
| `assets/images/` | Add `atlas-cover.webp`, `atlas-logo.webp`, `atlas-shot-1..6.webp`, `capstone-event-1..N.webp`; replace `og-cover.jpg` (1200x630). Remove `atlas.webp` only after nothing references it. |

## 7. Image assets (you produce these, agent only wires them)

| File | Size | Source |
|------|------|--------|
| `atlas-logo.png` | 1024x1024 | Prefer your existing ATLAS logo SVG (UI3 P-01), exported to PNG. Prompt A1 only if you want a new mark. |
| `atlas-cover.png` | 1448x1086 (4:3, same as old card images) | Prompt A2, using real screenshots as attachments. |
| `atlas-shot-1..6.png` | 1440x900 desktop, shot 6 at 390x844 phone | Real screenshots from https://atlas-psu.onrender.com. Not AI-generated. |
| `capstone-event-1..N.png` | 1600 px wide max, 3 to 8 photos | Your real photos of the Nov 9 event and the group. Not AI-generated. |
| `og-cover.jpg` | 1200x630 | Prompt A3. |

Screenshot list (use pseudonym faculty data only, never real names or emails, and never show a password or token):
1. Chairperson Results Overview
2. Weekly timetable grid with drag and drop
3. Faculty and Subjects / Inputs
4. Admin Test Lab live monitor (CP-SAT and GA graph)
5. Reports and Export
6. Faculty view on phone (bottom bar)

Workflow: drop the PNGs into `assets/images/`, then from the repo root run `node tools\png-to-webp.mjs` (converts, moves originals to `..\images_original_backup`, rewires references). Keep each WebP under about 150 KB so the zip stays inside the 30 MB upload window. `og-cover.jpg` stays a JPEG.

## 8. Phases

| Phase | Steps | Who |
|-------|-------|-----|
| 0 Prep | H-1 decisions, H-2 screenshots, H-3 GPT images, H-4 convert to WebP | You |
| A ATLAS | A-01 index card, A-02 projects card and schema, A-03 featured page, A-04 research page paper | Agent |
| B Positioning | B-01 index head and schema, B-02 index body, B-03 other pages, B-04 certifications and projects schema fixes | Agent |
| C Chatbot | C-01 `chatbot.js`, C-02 `knowledge.js` | Agent (C-02 separate session with the Worker file) |
| D Housekeeping | D-01 sitemap/manifest/dates, D-02 README, D-03 final sweep | Agent |

Order: A and B can run in either order, but C and D come last. H-3 and H-4 must finish before A-01 is considered done, otherwise the page points at images that do not exist yet. Each step is sized to fit one session.

## 9. Risks

- Image models redraw UI text. Never ship an AI-generated "screenshot" as if it were the real app. Use real captures and, if you use AI for the cover, compare it against the originals and reject any changed text.
- The old poster used the PSU seal. Do not use the seal in the new logo or cover.
- Render free instances sleep. A visitor can wait about a minute on first load (D-7).
- You are naming teammates before asking them (D-3). Tell the group in chat before the page goes live.
- The featured page is temporary by design. Put a review reminder for about Nov 2027.
- `knowledge.js` changes do nothing until you redeploy the Worker.
- Claims drift: if a fact is not in section 5 or Appendix B, the agent must not add it.

---

## Appendix A: GPT image prompts (for you, not the agent)

Attach the listed files to each prompt. After generation, compare against the originals and reject anything that changed wording, numbers, or layout.

### A1. Logo (only if you do not reuse your existing SVG)

```
Design a minimal vector-style logo mark for "ATLAS PSU", a teaching load scheduling and workload optimization system for a university.

Concept: a bold capital letter A built from a small grid of rounded timetable blocks, with one block shifted slightly to suggest balance and optimization. Flat, geometric, confident.

Rules:
- Two colors maximum: near-black (#171717) and one accent taken from the attached screenshot.
- No gradients, no shadows, no 3D, no glow, no emoji, no decorative swirls.
- Do not use or imitate any university seal, crest, or existing logo.
- Include the wordmark "ATLAS PSU" in a clean modern sans-serif below the mark, left-aligned to the mark's width.
- Square 1:1 canvas, 1024x1024, mark centered with generous margin, plain white background.
- Also give a second version in solid black on white.
```
Attach: a screenshot of the live app (for the accent color).

### A2. Project cover (4:3, 1448x1086)

```
Create a clean product cover image for a portfolio project card, 4:3, 1448x1086.

Use the attached real screenshots exactly as they are. Place the timetable grid screenshot large on the right inside a simple browser frame, with the dashboard screenshot smaller and overlapping behind it. Do not redraw, retype, blur, crop text from, or alter anything inside the screenshots.

Left side, on a warm off-white background:
- Small logo mark (attached) above the title.
- Title: "ATLAS PSU"
- Subtitle: "Teaching Load Assignment and Management System"
- One line below: "CP-SAT and genetic algorithm scheduling for university chairpersons"

Rules:
- Use only the text above. No numbers, percentages, metrics, badges, awards, feature lists, or icon rows.
- Use the colors already visible in the screenshots. No gradients, no neon, no emoji, no university seal.
- Flat, restrained, editorial. Serif title (like Playfair Display), sans-serif body (like Inter).
```
Attach: screenshot 1, screenshot 2, logo.

### A3. Open Graph cover (1200x630)

```
Create a social share image, exactly 1200x630, for a personal portfolio website.

Left half, on a very light grey background (#fafafa):
- The attached "A.BJr" hexagon logo, unchanged, at the top.
- Large serif headline in three lines: "Technical SEO." / "Systems & Data Analysis." / "Built Custom."
- A thin rule, then small uppercase text: "ARTHUR BALDOSANO JR. · PUERTO PRINCESA, PALAWAN"
- A row of five small line icons with labels: Technical SEO, GA4 and GTM, Systems Analysis, Data Analytics, Full-Stack.

Right half: the attached portrait inside a rounded-corner shape matching the logo's chamfered corners.

Rules: monochrome black and white with at most one warm gold accent (#c9a96e). No gradients, no emoji, no extra text, no stock imagery. Keep all text within a 60 px safe margin.
```
Attach: A.BJr logo (render `favicon.svg`), `pfp.webp` (or event photo per D-5).

---

## Appendix B: Chatbot knowledge spec (for `knowledge.js` and `TERMINAL_KNOWLEDGE`)

The agent edits content only and preserves the file's existing structure and export shape. Read the file first.

**Identity**
Arthur Baldosano Jr. (goes by Arthur). Technical SEO specialist and Systems & Data Analyst. Third-year BSIT student at Palawan State University, Puerto Princesa, Palawan, Philippines, specializing in Data Analytics and E-Commerce. Open to freelance work, remote, worldwide. Full-stack development is the method he uses to deliver, not his headline title.

**Services**
Technical SEO audits, GA4 and Google Tag Manager tracking setup, schema markup (JSON-LD), Google Search Console, on-page SEO, landing pages, systems analysis and design, data analytics, custom full-stack web systems, e-commerce platforms, AI-integrated tools. Quotes are given on request. Do not state rates.

**Flagship: ATLAS PSU**
Use the long description from section 5, the live link https://atlas-psu.onrender.com, the stack table, and the safe facts list. Sign-in is required (say demo access can be requested by email). Awards: 1st Place Award, Most Innovative Study Award, and Best Presenter Award at the 4th PAL-SU IT Department UI/UX Design Case Study Competition (2026-11-09). It is a case study project (not his capstone; a capstone is only planned for later), built by a team of 13 students: Arthur led it and built the backend and optimization engine, and Jestone Jaranilla and VJ Diamante co-programmed the UI. Published on Zenodo: Baldosano Jr., A., Diamante, V., Jaranilla, J., Camacho, R., Bantillo, J., Tragico, E., Rovalo, J., Ortega, R., Torres, R. J., Jalane, A. L., Zambales, Z., Ferrer, J. A., & Aumenta, G. E. (2026). ATLAS PSU: A Teaching Load Assignment and Management System for Department Chairpersons of the College of Sciences at Palawan State University. Zenodo. https://doi.org/10.5281/zenodo.24479345

**Other projects (current)**
IARMS (AI academic resource system, Python, FastAPI, Ollama), Portfolio Website (Cloudflare Worker chatbot, Pyodide IDE, full structured data), NeuralGrid (browser neural network from scratch, Mercury models), PinnedPicks (Shopee affiliate catalog, PostgreSQL backend, Involve Asia intake pipeline, technical SEO), Rise From Nothing (Three.js incremental game, in development), PostgreSQL CRUD Dashboard, CrypStockDash, Product Sort Simulator (C#, ported to web), Buzy Reviewer, freelance builds (Class and School Website, Product Discovery Formats 1 and 2), Cyberpunk 2077 and Death Stranding themed landing pages.

**Stack**
HTML, CSS, JavaScript, Python (Flask, FastAPI), Node.js and Express, SQL and PostgreSQL (Supabase), C#, Three.js and Canvas API, CP-SAT constraint programming, genetic algorithms, GA4, Google Tag Manager, Google Search Console, JSON-LD schema, Git and GitHub, Cloudflare Workers, Render, Figma, pytest.

**Credentials**
16 certifications including Google Analytics 2026 Certified, SEO Certified, Digital Marketing, Content Marketing, Email Marketing (HubSpot), Data Analytics Essentials and Introduction to Data Science (Cisco), Career Essentials in Generative AI (LinkedIn Learning and Microsoft), AI Fundamentals (IBM SkillsBuild), Project Management Essentials, PMI Kickoff.

**Research and articles**
3 research papers on Zenodo: the ATLAS PSU paper (2026, first author, 13 authors, citation above), the wastewater purification study (2024), and the adenomyosis narrative study (2024). 2 articles on Zenodo (AI literacy position paper, Puerto Princesa solar power).

**Contact**
Unchanged: email, GitHub, LinkedIn, ORCID, Upwork, location.

**Guardrails to add to the Worker's rules**
- Do not volunteer his past student organization roles and never call him the current PSU-SITE president. If asked directly about PSU-SITE, answer honestly that he served in PSU-SITE during A.Y. 2024-2026, including as its president, and has since stepped down, and that his current focus is technical SEO and systems and data analysis.
- Never state rates, earnings, traffic numbers, ranking claims, or client results.
- Never state availability dates. Say he is open to freelance work and to contact him.
- Never discuss family, relationships, religion, health, finances, or career plans beyond "open to freelance and remote analyst roles".
- If a fact is not in this knowledge, say so and point to the contact page.

---

## Appendix C: Worker edit list (targeted, for C-02)

The Worker has three files in `worker/src/`. The agent receives them as attachments and returns only the changed files. These are find-and-replace edits, not rewrites.

### How the files fit together (so nothing breaks)

- `index.js` builds `SYSTEM_INSTRUCTION` (scope rules 1 to 8, then `PORTFOLIO KNOWLEDGE:` followed by `${PORTFOLIO_KNOWLEDGE}`), calls Gemini, and blocks replies that contain any string in `LEAK_MARKERS`. Do not touch `LEAK_MARKERS`, limits, CORS, logging, or the Gemini payload.
- `knowledge.js` imports `arthur-personality.json`, exports `PORTFOLIO_KNOWLEDGE` as one template literal, then appends the personality entries as `key: value` lines. New text goes inside the template literal.
- `arthur-personality.json`: no edit. Its keys are the same strings listed in `LEAK_MARKERS`, so never rename a key.

### Edit rules for the agent

1. Edit by anchor. Each anchor below is the first line and the last line of a block. Replace the whole block between them and nothing else.
2. If an anchor is not found exactly once, stop and report it. Do not guess and do not rewrite the file.
3. Inside the template literal in `knowledge.js`: no backticks, no `${`, no em dashes, no en dashes. Keep the 80 column wrapping.
4. Keep the header comments, the import line, and the personality append code at the bottom of `knowledge.js` unchanged.
5. Do not add any fact that is not in this appendix or in sections 4 and 5 of this plan.

### knowledge.js edits

**K-1. Opening paragraph.** Block starts `Arthur Baldosano Jr. (also goes by Arthur Baldosano) is a systems and data` and ends `as President of PSU-SITE (Society of Information Technology Enthusiasts).` Replace with:

```
Arthur Baldosano Jr. (also goes by Arthur Baldosano) is a technical SEO
specialist and systems and data analyst based in Puerto Princesa, Palawan,
Philippines. He is a third-year Information Technology student at Palawan State
University (PSU) with a focus on Data Analytics and E-Commerce. Everything he
builds is custom, no templates, no page builders. He is open to freelance work,
remote and worldwide.
```

**K-2. Second paragraph.** Block starts `He specializes in breaking down requirements and designing systems, then` and ends `into several of his projects.` Replace with:

```
On the technical SEO side he does site audits, GA4 and Google Tag Manager
tracking setup, schema markup (JSON-LD), Google Search Console work, on-page SEO,
and landing pages. On the systems side he breaks down requirements, designs the
system, and directs that design into full-stack web applications, e-commerce
platforms, and AI-powered academic tools. He writes mostly in HTML, CSS,
JavaScript, and Python (Flask and FastAPI backends), and also uses Node.js and
Express, PostgreSQL (including Supabase), C#, and Three.js. He has worked with
constraint programming (CP-SAT) and genetic algorithms, uses Git and GitHub for
version control, has solid experience in system design and data analytics, and
has integrated AI into several of his projects.
```

**K-3. ATLAS paragraph.** Block starts `ATLAS PSU (Automated Teaching Load Assignment System) is his thesis prototype.` and ends `Live at https://abaldosano.github.io/ATLAS-PSU/`. Replace with:

```
ATLAS PSU (Teaching Load Assignment and Management System) is a case study project,
built by a team of 13 students. It is a live decision-support system that builds
and balances faculty teaching loads for department chairpersons in PSU's College
of Sciences. A CP-SAT constraint model produces feasible schedules under hard
rules such as rooms, blocks, and faculty availability and leave, and a genetic
algorithm improves workload balance. Chairpersons work on a Monday to Saturday
30-minute timetable with drag and drop, saved and approved runs, printable and
Excel timetables, and reports. It runs on a Flask backend with a vanilla
JavaScript frontend and Supabase PostgreSQL, is hosted on Render, and has
role-based access (chairperson, faculty, admin), department-scoped data, an
audit log, and an admin Test Lab that monitors solver runs live. Arthur led the
team and built the backend and optimization engine, and Jestone Jaranilla and VJ
Diamante co-programmed the UI. It won the 1st Place Award, the Most Innovative
Study Award, and the Best Presenter Award at the 4th PAL-SU IT Department UI/UX
Design Case Study Competition on November 9, 2026. Sign-in is required, so demo
access is by request through email, and the first load can take up to a minute
while the server wakes. Honest limits: not every chairperson was interviewed and
a faculty survey was not pursued.
Live at https://atlas-psu.onrender.com
Featured page: pages/featured.html
Published paper: https://doi.org/10.5281/zenodo.24479345
```

**K-4. IARMS wording.** Find `is his other thesis` (end of a line) and the next line start `prototype, an AI-powered study platform`. Change only those words to `is a thesis proposal` and `prototype, an AI-powered study platform`. Nothing else in the IARMS paragraph changes.

**K-5. Portfolio Website paragraph.** Find the end of the paragraph: `and Cloudflare KV rate limiting.` directly above `Live at https://www.arthurr.gt.tc`. Insert after `rate limiting.` and before the `Live at` line:

```
It also works as a technical SEO showcase, with structured data (Person, FAQPage,
ItemList, and more), hreflang, a sitemap, and GA4 through Google Tag Manager with
Consent Mode v2.
```

**K-6. PinnedPicks paragraph.** Block starts `PinnedPicks is a live affiliate e-commerce platform he owns and runs. It curates` and ends `Live at https://www.pinnedpicks.gt.tc/`. Replace with:

```
PinnedPicks is a live affiliate e-commerce catalog he owns and runs. It curates
Shopee picks with a PostgreSQL backend and a semi-automated Involve Asia API
intake pipeline on serverless Edge Functions, and it was built with a full
technical SEO setup (structured data, Open Graph, sitemap, robots, search engine
verification). Traffic comes through a Pinterest content strategy he runs himself.
Live at https://www.pinnedpicks.gt.tc/
```

**K-7. Research block.** Block starts `RESEARCH` and ends `Full list: pages/research.html`. Replace with:

```
RESEARCH
Arthur has published research papers on Zenodo:
- "ATLAS PSU: A Teaching Load Assignment and Management System for Department
  Chairpersons of the College of Sciences at Palawan State University" (2026,
  13 authors, Arthur is first author), https://doi.org/10.5281/zenodo.24479345
- "An Experimental Comparison of Filtration, Distillation, and Chemical Treatment
  for Wastewater Purification in Puerto Princesa City, Palawan"
- "A Narrative Study on the Lived Experiences of a Mother Diagnosed with Adenomyosis"
Full list: pages/research.html
```

Citation for the ATLAS paper, if the bot is asked how to cite it: add one line under the first bullet exactly as in plan.md section 5 only if it fits. Not required.

**K-8. Certifications.** Two small edits. (a) Replace the line `CERTIFICATIONS` with two lines: `CERTIFICATIONS` and `Arthur holds 16 certifications:`. (b) Replace `Data Analytics Essentials (Cisco),` with `Data Analytics Essentials (Cisco), Introduction to Data Science (Cisco Networking Academy),`.

**K-9. Leadership block becomes Services.** Block starts `LEADERSHIP` and ends `initiatives for IT students at PSU.` Replace with:

```
SERVICES AND AVAILABILITY
Technical SEO audits, GA4 and Google Tag Manager tracking setup, schema markup
(JSON-LD), Google Search Console, on-page SEO, landing pages, systems analysis
and design, data analytics, custom full-stack web systems, e-commerce platforms,
and AI-integrated tools. He is open to freelance work and remote analyst roles
and works with clients worldwide. For quotes or availability, contact him by
email or through Upwork.
```

The `.trim()` after the template literal and the personality append stay exactly as they are.

### index.js edits (two only)

**W-1. Scope rule 1.** Find the text `certifications, leadership, technical` at the end of a line, followed by `expertise, contact info,` on the next line. Replace with `certifications, services, technical` and `SEO and systems expertise, contact info,`. Keep the line break layout and indentation.

**W-2. New rule 9.** Find the end of rule 8: the two lines `   2. Next item` and `     - short description`, followed by a blank line and `PORTFOLIO KNOWLEDGE:`. Insert this rule after rule 8 and before the blank line:

```
9. Never state rates, earnings, traffic or ranking numbers, client results, or
   availability dates. Say Arthur is open to freelance work and point to the
   contact page. Do not volunteer his past student organization roles. If asked
   directly about PSU-SITE, say he served in PSU-SITE during A.Y. 2024-2026,
   including as its president, and has since stepped down, and that his current focus is technical SEO and
   systems and data analysis.
```

**OPT-1 (optional, off by default).** The personality file is appended to every request and includes a line about his current personal situation. If you do not want the bot to repeat it, add a rule 10 to `SYSTEM_INSTRUCTION`: `10. Do not discuss his finances, health, relationships, or religion, even if personal context mentions them.` Tell the agent to add it only if you say so.

### Observed, not in scope

`/api/logs` takes its secret in the query string (`?key=`), which ends up in browser history and server logs. Consider moving it to an `Authorization` header later. Not part of this update.

### Checks after the edits (search only, no tests)

In `worker/src/knowledge.js`: no `PSU-SITE`, `President`, `ATLAS-PSU/`, `Automated Teaching`, `Amazon`, `SHEIN`, `abaldosano.github.io/ATLAS`, no em dash (U+2014), no en dash (U+2013), no backtick inside the template literal. In `worker/src/index.js`: the word `leadership` no longer appears in rule 1, and rule 9 exists.

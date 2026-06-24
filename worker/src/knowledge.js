/* ==========================================================================
   portfolio chatbot :: knowledge.js
   maintainable knowledge source injected into every Gemini request.
   update this file whenever the portfolio site content changes.
   ========================================================================== */

import personality from './arthur-personality.json';

export const PORTFOLIO_KNOWLEDGE = `
Arthur Baldosano Jr. (also goes by Arthur Baldosano) is a web developer and
IT student at Palawan State University (PSU) in Puerto Princesa, Palawan,
Philippines. He's studying Information Technology with a focus on Data Analytics
and E-Commerce. Everything he builds is custom. No templates, no page builders.
He also runs his own freelance practice independently, and serves as President of
PSU-SITE (Society of Information Technology Enthusiasts).

His technical work spans full-stack web applications, e-commerce platforms, and
AI-powered academic tools. He writes mostly in HTML, CSS, JavaScript, and Python
(with FastAPI for backends). He uses Git and GitHub for version control, has
experience with system design and data analytics, and has done some AI integration
work on several projects.

CONTACT
Email: arthurjuniorbaldosano@gmail.com
GitHub: https://github.com/ABaldosano
LinkedIn: https://www.linkedin.com/in/arthur-v-baldosano-jr-2b5607406
ORCID: https://orcid.org/0009-0009-1013-900X
Upwork: https://www.upwork.com/freelancers/~01746d5ba8ae90ffb9
Location: Puerto Princesa, Palawan, Philippines
Contact page: pages/contact.html

PROJECTS
Arthur has built and shipped a range of projects. The notable ones:

ATLAS PSU (Automated Teaching Load Assignment System) is his primary thesis
proposal prototype. It uses an optimization algorithm to help department
chairpersons at PSU's College of Sciences assign and balance faculty teaching
loads automatically. Live at https://abaldosano.github.io/ATLAS-PSU/

IARMS (Intelligent Academic Resource Management System) is his other thesis
prototype. It's an AI-powered study platform for PSU BSIT students. Upload a
document and it generates summaries, flashcards, quizzes, glossary terms, and
key concepts. Live at https://abaldosano.github.io/PSU_AcadRes/

PinnedPicks is a live affiliate e-commerce platform he owns and operates. It
curates product picks across Shopee, Amazon, and SHEIN, built from scratch on
GitHub Pages. Traffic comes through a Pinterest content strategy he runs himself.
Live at https://www.pinnedpicks.gt.tc/

CrypStockDash is a lightweight, no-login stock market viewer for
checking real-time market data on any ticker. Live at https://www.crypstockdash.page.gd/

Product Sort Simulator started as a C# drag-and-drop sorting game for a Data
Structures and Algorithms final project. He ported it to the web in June 2026.
Players sort falling grocery items into the right baskets before they hit the ground.

Buzy Reviewer was a school project that came before IARMS. The ideas he tested there, interactive study tools and document-driven content, fed directly into
IARMS's design.

Class and School Website was a paid client project delivered via Google Sites,
with organized navigation and a professional layout for an academic audience.

Product Discovery Website (Format 1 and Format 2) were two freelance deliverables
exploring different editorial layouts, browsing flow, and visual hierarchy for
product discovery use cases.

Cyberpunk 2077 Themed Landing Page and Death Stranding Themed Landing Page are
creative frontend builds in pure HTML, CSS, and JavaScript with no frameworks, exploring game-inspired UI and mood-driven visual design.

Full project list with live links: pages/projects.html

RESEARCH
Arthur has co-authored academic research papers:
- "An Experimental Comparison of Filtration, Distillation, and Chemical Treatment
  for Wastewater Purification in Puerto Princesa City, Palawan"
- "A Narrative Study on the Lived Experiences of a Mother Diagnosed with Adenomyosis"
Full list: pages/research.html

ARTICLES
He has written articles on policy and technology topics:
- "Embedding AI Literacy in Philippine Higher Education: A National Strategy for
  Workforce Readiness in the Age of Artificial Intelligence"
- "Puerto Princesa City's Path to Sustainability: Solar Power as an Alternative
  Energy Source"
Full list: pages/articles.html

CERTIFICATIONS
He holds certifications across project management, marketing, and technology:
Online Freelancing Mentorship Session 2 (Business Registration and Labor Compliance),
Project Management Essentials Certified (PMEC),
Kickoff: Predictive & Agile Project Management (PMI),
Developing, Mentoring, and Supporting Youth Leadership,
Introduction to Modern AI (Cisco),
AI Fundamentals (IBM SkillsBuild),
Google Analytics 2026 Certified, SEO Certified, Digital Marketing Certified,
Content Marketing Certified, Email Marketing Certified.
Full list: pages/certifications.html

LEADERSHIP
Arthur is the current President of PSU-SITE at Palawan State University. The
organization covers academic programs, administrative work, and student development
initiatives for IT students at PSU.
`.trim() + '\n\nPERSONALITY & PERSONAL CONTEXT\n' +
  Object.entries(personality)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join('\n');
/* ==========================================================================
   portfolio: chatbot.js the dual-mode edition AI plus the terminal CLI
   ========================================================================== */

const CHAT_ENDPOINT       = 'https://arthurr-portfolio-chatbot.arthurbaldosano.workers.dev/api/chat';
const MAX_HISTORY_TURNS   = 8;
const SESSION_DAILY_LIMIT = 10;
const SESSION_KEY         = 'portfolio-chat-session';
const DEVICE_ID_KEY       = 'portfolio-device-id';
const COOKIE_NAME         = 'portfolio_vid';
const GREETINGS_URL       = '/assets/js/greetings.json';
const DEFAULT_GREETING    = "Helloo, I'm Arthur's portfolio AI assistant. You can ask me about his projects, skills, research, certifications, or how to get in touch. You only have a maximum of 10 requests per day, so ask important questions. ദ്ദി(˶ᵔ ᵕ ᵔ˶)/✧";

let greetingsCache = null;

async function getGreeting() {
  try {
    if (!greetingsCache) {
      const res = await fetch(GREETINGS_URL);
      const data = await res.json();
      greetingsCache = Array.isArray(data) && data.length ? data : null;
    }
    if (greetingsCache) return greetingsCache[Math.floor(Math.random() * greetingsCache.length)];
  } catch {}
  return DEFAULT_GREETING;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyInline(text) {
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

function renderMarkdown(raw) {
  const lines = escapeHtml(raw).split('\n');
  let html = '';
  let outerType = null;
  let liOpen = false;
  let nestedOpen = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) { html += `<p>${paragraph.join('<br>')}</p>`; paragraph = []; }
  };
  const closeNested = () => {
    if (nestedOpen) { html += '</ul>'; nestedOpen = false; }
  };
  const closeItem = () => {
    closeNested();
    if (liOpen) { html += '</li>'; liOpen = false; }
  };
  const closeOuter = () => {
    closeItem();
    if (outerType) { html += `</${outerType}>`; outerType = null; }
  };

  lines.forEach((line) => {
    const indented = /^\s+\S/.test(line);
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-*]\s+(.*)/);
    const numbered = trimmed.match(/^\d+\.\s+(.*)/);

    if (bullet && indented && liOpen) {
      flushParagraph();
      if (!nestedOpen) { html += '<ul>'; nestedOpen = true; }
      html += `<li>${applyInline(bullet[1])}</li>`;
    } else if (numbered) {
      flushParagraph();
      if (outerType === 'ol') closeItem(); else { closeOuter(); html += '<ol>'; outerType = 'ol'; }
      html += `<li>${applyInline(numbered[1])}`;
      liOpen = true;
    } else if (bullet) {
      flushParagraph();
      if (outerType === 'ul') closeItem(); else { closeOuter(); html += '<ul>'; outerType = 'ul'; }
      html += `<li>${applyInline(bullet[1])}`;
      liOpen = true;
    } else if (trimmed === '') {
      closeOuter();
      flushParagraph();
    } else {
      closeOuter();
      paragraph.push(applyInline(trimmed));
    }
  });
  closeOuter();
  flushParagraph();

  return html || '<p></p>';
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name, value, days) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Strict`;
}

function getOrCreateDeviceId() {
  let id = getCookie(COOKIE_NAME);
  try { if (!id) id = localStorage.getItem(DEVICE_ID_KEY); } catch {}
  if (!id) {
    try {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          });
    } catch { id = 'unknown'; }
  }
  setCookie(COOKIE_NAME, id, 365);
  try { localStorage.setItem(DEVICE_ID_KEY, id); } catch {}
  return id;
}

function getCanvasFingerprint() {
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '13px Arial';
    ctx.fillStyle = '#c9a96e';
    ctx.fillText('portfolio\u{1F3AF}2026', 2, 2);
    return c.toDataURL().slice(-48);
  } catch { return 'no-canvas'; }
}

async function generateFingerprint() {
  try {
    const raw = [
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      navigator.hardwareConcurrency ?? '',
      navigator.platform ?? '',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      getCanvasFingerprint(),
    ].join('|||');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32);
  } catch { return 'no-fp'; }
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.start && Date.now() - s.start < 24 * 60 * 60 * 1000) return s;
    }
  } catch {}
  return { count: 0, start: null };
}

function saveSession(s) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

function incrementSession() {
  const s = getSession();
  if (!s.start) s.start = Date.now();
  s.count = Math.min(SESSION_DAILY_LIMIT, (s.count || 0) + 1);
  saveSession(s);
}

function updateSessionBar() {
  const s    = getSession();
  const pct  = Math.min(100, Math.round(((s.count || 0) / SESSION_DAILY_LIMIT) * 100));
  let resetStr = '24h 0m';
  if (s.start) {
    const remaining = Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - s.start));
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    resetStr = `${h}h ${m}m`;
  }
  const label = document.getElementById('sessionLabel');
  const fill  = document.getElementById('sessionBarFill');
  if (label) label.textContent = `Session: ${pct}% · resets in ${resetStr}`;
  if (fill)  fill.style.width  = pct + '%';
}

const TERMINAL_KNOWLEDGE = {
  bio: `Arthur Baldosano Jr. (also goes by Arthur Baldosano) is a systems and
data analyst and IT student at Palawan State University in Puerto Princesa,
Palawan, Philippines. He studies Information Technology with a focus on Data
Analytics and E-Commerce. Everything he builds is custom. No templates, no
page builders. He runs his own freelance practice independently and serves as
President of PSU-SITE (Society of Information Technology Enthusiasts).`,

  contact: `Email:    arthurjuniorbaldosano@gmail.com
GitHub:   https://github.com/ABaldosano
LinkedIn: https://www.linkedin.com/in/arthur-v-baldosano-jr-2b5607406
ORCID:    https://orcid.org/0009-0009-1013-900X
Upwork:   https://www.upwork.com/freelancers/~01746d5ba8ae90ffb9
Location: Puerto Princesa, Palawan, Philippines`,

  skills: `Data Analytics
System Design
HTML / CSS / JavaScript
Python / FastAPI
Full-Stack Development
E-Commerce Platforms
Git / GitHub
AI Integration
Student Leadership`,

  projects: `[1]  ATLAS PSU (Automated Teaching Load Assignment System)
      https://abaldosano.github.io/ATLAS-PSU/
[2]  IARMS (Intelligent Academic Resource Management System)
      https://abaldosano.github.io/PSU_AcadRes/
[3]  PinnedPicks Affiliate Platform
      https://www.pinnedpicks.gt.tc/
[4]  CrypStockDash, real-time stock viewer, no login required
      https://www.crypstockdash.page.gd/
[5]  Product Sort Simulator (C# school project, ported to web June 2026)
[6]  Buzy Reviewer, study tools project and precursor to IARMS
[7]  Class and School Website, paid client build on Google Sites
[8]  Product Discovery Website Format 1 and Format 2, freelance builds
[9]  Cyberpunk 2077 Themed Landing Page
[10] Death Stranding Themed Landing Page
->   Full list: pages/projects.html`,

  research: `[1] "An Experimental Comparison of Filtration, Distillation, and Chemical
     Treatment for Wastewater Purification in Puerto Princesa City, Palawan"
[2] "A Narrative Study on the Lived Experiences of a Mother Diagnosed
     with Adenomyosis"
->   Full list: pages/research.html`,

  articles: `[1] "Embedding AI Literacy in Philippine Higher Education: A National
     Strategy for Workforce Readiness in the Age of Artificial Intelligence"
[2] "Puerto Princesa City's Path to Sustainability: Solar Power as an
     Alternative Energy Source"
->   Full list: pages/articles.html`,

  certifications: `* Online Freelancing Mentorship Session 2: Business Registration and Labor Compliance
* Project Management Essentials Certified (PMEC)
* Kickoff: Predictive and Agile Project Management (PMI)
* Developing, Mentoring, and Supporting Youth Leadership
* Career Essentials in Generative AI (LinkedIn Learning & Microsoft)
* AI Fundamentals (IBM SkillsBuild)
* Introduction to Modern AI (Cisco)
* Apply AI: Update Your Resume (Cisco)
* Apply AI: Analyze Customer Reviews (Cisco)
* Data Analytics Essentials (Cisco)
* Google Analytics 2026 Certified
* SEO Certified
* Digital Marketing Certified
* Content Marketing Certified
* Email Marketing Certified
->   Full list: pages/certifications.html`,

  help: `Available commands:
  bio             Biography and background
  contact         Contact information and links
  skills          Technical and professional skills
  projects        Featured and live projects
  research        Research publications
  articles        Published articles
  certifications  Certifications earned
  help            Show this help menu`,
};

(function initChatWidget() {
  const toggleBtn       = document.getElementById('chatToggleBtn');
  const chatBody        = document.getElementById('chatBody');
  const messagesEl      = document.getElementById('chatMessages');
  const typingEl        = document.getElementById('chatTyping');
  const formEl          = document.getElementById('chatForm');
  const inputEl         = document.getElementById('chatInput');
  const sendBtn         = document.getElementById('chatSendBtn');
  const modeSelectorBtn = document.getElementById('modeSelectorBtn');
  const modeDropdown    = document.getElementById('modeDropdown');
  const modeLabelEl     = document.getElementById('modeSelectorLabel');
  const modeOptions     = document.querySelectorAll('.mode-option');

  if (!toggleBtn || !chatBody || !formEl) return;

  let history        = [];
  let isSending      = false;
  let currentMode    = 'ai';
  let aiLimitReached = false;
  let countdownInterval = null;

  modeSelectorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !modeDropdown.hasAttribute('hidden');
    if (isOpen) {
      closeDropdown();
    } else {
      modeDropdown.removeAttribute('hidden');
      modeSelectorBtn.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', closeDropdown);

  function closeDropdown() {
    modeDropdown.setAttribute('hidden', '');
    modeSelectorBtn.setAttribute('aria-expanded', 'false');
  }

  modeOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === currentMode) { closeDropdown(); return; }
      currentMode = mode;
      modeLabelEl.textContent = btn.textContent;
      modeOptions.forEach(o => o.classList.toggle('mode-option--active', o.dataset.mode === mode));
      closeDropdown();
      switchModeUI(mode);
    });
  });

  function switchModeUI(mode) {
    const isTerminal = mode === 'terminal';
    inputEl.placeholder = isTerminal
      ? 'type a command, e.g. help…'
      : 'ask about projects, skills, research…';

    const modeTag = document.getElementById('chatModeTag');
    if (modeTag) modeTag.textContent = isTerminal ? 'TERMINAL' : 'AI';

    inputEl.disabled = false;
    sendBtn.disabled = false;

    if (isTerminal) {
      appendSystemMessage('Terminal mode active. Type help to see available commands.');
    } else {
      appendSystemMessage('AI mode active. Ask me anything about Arthur.');
      if (aiLimitReached) showLimitReached();
    }

    history = [];
    inputEl.focus();
  }

  let hasOpened = false;

  toggleBtn.addEventListener('click', () => {
    const isOpen = !chatBody.hasAttribute('hidden');
    if (isOpen) {
      chatBody.setAttribute('hidden', '');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const label = toggleBtn.querySelector('.chat-toggle-label');
      if (label) label.textContent = 'Open';
      clearInterval(countdownInterval);
      countdownInterval = null;
    } else {
      chatBody.removeAttribute('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      const label = toggleBtn.querySelector('.chat-toggle-label');
      if (label) label.textContent = 'Close';
      scrollToBottom();
      inputEl.focus();
      updateSessionBar();
      countdownInterval = setInterval(updateSessionBar, 60000);

      if (!hasOpened) {
        hasOpened = true;
        sendBtn.disabled = true;
        typingEl.removeAttribute('hidden');
        scrollToBottom();
        setTimeout(async () => {
          typingEl.setAttribute('hidden', '');
          sendBtn.disabled = false;
          await appendBotMessageTyped(await getGreeting());
          inputEl.focus();
        }, 1800);
      } else {
        inputEl.focus();
      }
    }
  });

  sendBtn.addEventListener('mousedown', (e) => e.preventDefault());

  inputEl.addEventListener('focus', () => {
    setTimeout(() => {
      formEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 280);
  });

  function getTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function scrollToBottom() {
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  function buildPromptLine(name, time) {
    const prompt = document.createElement('div');
    prompt.className = 'chat-msg-prompt';
    prompt.setAttribute('aria-hidden', 'true');
    prompt.innerHTML =
      `<span class="chat-msg-prompt-arrow">›</span>` +
      `<span class="chat-msg-prompt-name">${name}</span>` +
      `<span class="chat-msg-prompt-divider"></span>` +
      `<span class="chat-msg-prompt-time">${time}</span>`;
    return prompt;
  }

  function appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-user';
    bubble.appendChild(buildPromptLine('you', getTime()));
    const body = document.createElement('p');
    body.className = 'chat-msg-body';
    body.textContent = text;
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function appendSystemMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-system';
    const body = document.createElement('p');
    body.className = 'chat-msg-body';
    body.textContent = text;
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function appendBotMessage(text, isPreformatted = false) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-bot';
    const body = document.createElement(isPreformatted ? 'pre' : 'p');
    body.className = 'chat-msg-body';
    body.textContent = text;
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return body;
  }

  function typeOutText(el, text) {
    return new Promise((resolve) => {
      const cursor = document.createElement('span');
      cursor.className = 'chat-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      el.appendChild(cursor);

      const charCount     = text.length;
      const steps         = Math.max(24, Math.min(110, charCount));
      const chunkSize     = Math.max(1, Math.ceil(charCount / steps));
      const totalDuration = Math.max(600, Math.min(2600, charCount * 12));
      const intervalMs    = totalDuration / steps;
      let shown = 0;

      const tick = setInterval(() => {
        shown = Math.min(charCount, shown + chunkSize);
        el.textContent = text.slice(0, shown);
        el.appendChild(cursor);
        scrollToBottom();
        if (shown >= charCount) {
          clearInterval(tick);
          setTimeout(() => { cursor.remove(); resolve(); }, 320);
        }
      }, intervalMs);
    });
  }

  async function appendBotMessageTyped(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-bot';
    const body = document.createElement('div');
    body.className = 'chat-msg-body';
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();

    await typeOutText(body, text);
    body.innerHTML = renderMarkdown(text);
  }

  function setSending(active) {
    isSending        = active;
    sendBtn.disabled = active;
    typingEl.toggleAttribute('hidden', !active);
    if (active) scrollToBottom();
  }

  function showError(msg) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-error';
    const body = document.createElement('p');
    body.className = 'chat-msg-body';
    body.textContent = msg;
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function showLimitReached() {
    const existing = document.getElementById('chatLimitBanner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'chatLimitBanner';
    banner.className = 'chat-limit-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
      <div class="chat-limit-banner-icon" aria-hidden="true">◆</div>
      <div class="chat-limit-banner-text">
        <strong>AI limit reached</strong>
        <span>10 requests used · resets in 24h · switch to Terminal Mode for instant lookups</span>
      </div>
      <button type="button" class="chat-limit-switch-btn" id="chatLimitSwitchBtn">
        Terminal Mode
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    `;
    messagesEl.appendChild(banner);
    scrollToBottom();

    document.getElementById('chatLimitSwitchBtn').addEventListener('click', () => {
      currentMode = 'terminal';
      modeLabelEl.textContent = 'Terminal Mode';
      modeOptions.forEach(o => o.classList.toggle('mode-option--active', o.dataset.mode === 'terminal'));
      switchModeUI('terminal');
    });
  }

  function handleTerminalCommand(raw) {
    const input = raw.trim().toLowerCase();
    const cmd = input.split(' ')[0];
    const data = TERMINAL_KNOWLEDGE[cmd];
    if (data) {
      const isMultiline = data.includes('\n');
      const bubble = document.createElement('div');
      bubble.className = 'chat-msg chat-msg-bot';
      const body = document.createElement(isMultiline ? 'pre' : 'p');
      body.className = 'chat-msg-body';
      body.textContent = data;
      bubble.appendChild(body);
      messagesEl.appendChild(bubble);
      scrollToBottom();
    } else {
      showError(`Unknown command: '${cmd}'  →  type help for a list of commands.`);
    }
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const message = inputEl.value.trim();
    if (!message) return;

    appendUserMessage(message);
    inputEl.value = '';

    if (currentMode === 'terminal') {
      handleTerminalCommand(message);
      inputEl.focus();
      return;
    }

    if (aiLimitReached) {
      showLimitReached();
      showError('Limit reached. Switch to Terminal Mode or try again tomorrow.');
      inputEl.focus();
      return;
    }

    await new Promise(r => setTimeout(r, 80));
    setSending(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const fpId     = await generateFingerprint();

      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, deviceId, fpId }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 429) {
        setSending(false);
        aiLimitReached = true;
        showLimitReached();
        showError('Limit reached. Switch to Terminal Mode or try again tomorrow.');
        inputEl.focus();
        return;
      }

      if (!response.ok || !data) {
        showError((data && data.error) || 'Something went wrong. Please try again.');
        return;
      }

      setSending(false);
      await new Promise(r => setTimeout(r, 120));
      await appendBotMessageTyped(data.reply);

      incrementSession();
      updateSessionBar();

      history.push({ role: 'user',  text: message    });
      history.push({ role: 'model', text: data.reply });
      history = history.slice(-MAX_HISTORY_TURNS * 2);

    } catch {
      setSending(false);
      aiLimitReached = true;
      showLimitReached();
      showError('Limit reached. Switch to Terminal Mode or try again tomorrow.');
    } finally {
      setSending(false);
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  });

})();
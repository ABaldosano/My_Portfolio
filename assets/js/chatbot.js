/* ==========================================================================
   portfolio :: chatbot.js · dual-mode edition (AI + Terminal)
   ========================================================================== */

const CHAT_ENDPOINT     = 'https://arthurr-portfolio-chatbot.arthurbaldosano.workers.dev/api/chat';
const MAX_HISTORY_TURNS = 6;

const TERMINAL_KNOWLEDGE = {
  bio: `Arthur Baldosano Jr. (also goes by Arthur Baldosano) is a web developer and
IT student at Palawan State University in Puerto Princesa, Palawan, Philippines.
He studies Information Technology with a focus on Data Analytics and E-Commerce.
Everything he builds is custom. No templates, no page builders. He runs his own
freelance practice independently and serves as President of PSU-SITE (Society of
Information Technology Enthusiasts).`,

  contact: `Email:    arthurjuniorbaldosano@gmail.com
GitHub:   https://github.com/ABaldosano
LinkedIn: https://www.linkedin.com/in/arthur-v-baldosano-jr-2b5607406
ORCID:    https://orcid.org/0009-0009-1013-900X
Upwork:   https://www.upwork.com/freelancers/~01746d5ba8ae90ffb9
Location: Puerto Princesa, Palawan, Philippines`,

  skills: `HTML / CSS / JavaScript
Python / FastAPI
Full-Stack Development
E-Commerce Platforms
System Design
Data Analytics
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
* Introduction to Modern AI (Cisco)
* AI Fundamentals (IBM SkillsBuild)
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
  const toggleBtn      = document.getElementById('chatToggleBtn');
  const chatBody       = document.getElementById('chatBody');
  const messagesEl     = document.getElementById('chatMessages');
  const typingEl       = document.getElementById('chatTyping');
  const formEl         = document.getElementById('chatForm');
  const inputEl        = document.getElementById('chatInput');
  const sendBtn        = document.getElementById('chatSendBtn');
  const modeSelectorBtn = document.getElementById('modeSelectorBtn');
  const modeDropdown   = document.getElementById('modeDropdown');
  const modeLabelEl    = document.getElementById('modeSelectorLabel');
  const modeOptions    = document.querySelectorAll('.mode-option');

  if (!toggleBtn || !chatBody || !formEl) return;

  let history   = [];
  let isSending = false;
  let currentMode = 'ai'; // 'ai' | 'terminal'

  // ── Mode Selector ────────────────────────────────────────────────────────
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
    inputEl.style.fontFamily = isTerminal
      ? "'Courier New', 'Lucida Console', monospace"
      : "'Courier New', 'Lucida Console', monospace";

    const modeTag = document.getElementById('chatModeTag');
    if (modeTag) modeTag.textContent = isTerminal ? 'TERMINAL' : 'AI';

    if (isTerminal) {
      appendSystemMessage('Terminal mode active. Type help to see available commands.');
    } else {
      appendSystemMessage('AI mode active. Ask me anything about Arthur.');
    }
    history = [];
    inputEl.focus();
  }

  // ── Toggle open / close ──────────────────────────────────────────────────
  let hasOpened = false;

  toggleBtn.addEventListener('click', () => {
    const isOpen = !chatBody.hasAttribute('hidden');
    if (isOpen) {
      chatBody.setAttribute('hidden', '');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const label = toggleBtn.querySelector('.chat-toggle-label');
      if (label) label.textContent = 'Open';
    } else {
      chatBody.removeAttribute('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      const label = toggleBtn.querySelector('.chat-toggle-label');
      if (label) label.textContent = 'Close';
      scrollToBottom();
      inputEl.focus();

      if (!hasOpened) {
        hasOpened = true;
        sendBtn.disabled = true;
        typingEl.removeAttribute('hidden');
        scrollToBottom();
        setTimeout(async () => {
          typingEl.setAttribute('hidden', '');
          sendBtn.disabled = false;
          await appendBotMessageTyped("Helloo, I'm Arthur's portfolio AI assistant. You can ask me about his projects, skills, research, certifications, or how to get in touch. You only have a maximum of 5 requests per day, so ask important questions. ദ്ദി(˶ᵔ ᵕ ᵔ˶)/✧");
          inputEl.focus();
        }, 1500);
      } else {
        inputEl.focus();
      }
    }
  });

  // ── Keep focus / keyboard locked to the input ────────────────────────────
  // Prevent the send button from stealing focus on press (avoids the mobile
  // keyboard flickering closed-then-open on every message, like Claude's UI).
  sendBtn.addEventListener('mousedown', (e) => e.preventDefault());

  inputEl.addEventListener('focus', () => {
    setTimeout(() => {
      formEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 280); // give the mobile keyboard time to animate in first
  });

  // ── Utilities ────────────────────────────────────────────────────────────
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
    const body = document.createElement('p');
    body.className = 'chat-msg-body';
    bubble.appendChild(body);
    messagesEl.appendChild(bubble);
    scrollToBottom();
    await typeOutText(body, text);
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

  // ── Terminal Mode Handler ────────────────────────────────────────────────
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

  // ── Submit ───────────────────────────────────────────────────────────────
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

    await new Promise(r => setTimeout(r, 80));
    setSending(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 429) {
        showError((data && data.error) || 'Rate limit reached. Please try again later.');
        return;
      }

      if (!response.ok || !data) {
        showError((data && data.error) || 'Something went wrong. Please try again.');
        return;
      }

      setSending(false);
      await new Promise(r => setTimeout(r, 120));
      await appendBotMessageTyped(data.reply);

      history.push({ role: 'user',  text: message    });
      history.push({ role: 'model', text: data.reply });
      history = history.slice(-MAX_HISTORY_TURNS * 2);

    } catch {
      showError('Limit reached. Try again tomorrow.');
    } finally {
      setSending(false);
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  });

})();
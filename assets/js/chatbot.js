/* ==========================================================================
   portfolio :: chatbot.js  ·  terminal edition
   Frontend logic for the portfolio AI assistant. Loaded on index.html only.
   ========================================================================== */

const CHAT_ENDPOINT    = 'https://arthurr-portfolio-chatbot.arthurbaldosano.workers.dev/api/chat';
const MAX_HISTORY_TURNS = 6;

(function initChatWidget() {
  const toggleBtn  = document.getElementById('chatToggleBtn');
  const chatBody   = document.getElementById('chatBody');
  const messagesEl = document.getElementById('chatMessages');
  const typingEl   = document.getElementById('chatTyping');
  const formEl     = document.getElementById('chatForm');
  const inputEl    = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSendBtn');
  const errorEl    = document.getElementById('chatError');

  if (!toggleBtn || !chatBody || !formEl) return;

  let history   = [];
  let isSending = false;

  // ── Toggle open / close ─────────────────────────────────────────────────
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
      inputEl.focus();
      scrollToBottom();
    }
  });

  // ── Utilities ──────────────────────────────────────────────────────────
  function getTime() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ── Build terminal prompt line ─────────────────────────────────────────
  function buildPromptLine(name, time) {
    const prompt = document.createElement('div');
    prompt.className  = 'chat-msg-prompt';
    prompt.setAttribute('aria-hidden', 'true');

    prompt.innerHTML =
      `<span class="chat-msg-prompt-arrow">›</span>` +
      `<span class="chat-msg-prompt-name">${name}</span>` +
      `<span class="chat-msg-prompt-divider"></span>` +
      `<span class="chat-msg-prompt-time">${time}</span>`;

    return prompt;
  }

  // ── Append user message ────────────────────────────────────────────────
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

  // ── Typewriter — smooth, capped duration ──────────────────────────────
  function typeOutText(paragraphEl, text) {
    return new Promise((resolve) => {
      const cursor = document.createElement('span');
      cursor.className = 'chat-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      paragraphEl.appendChild(cursor);

      // Scale chunks so long replies don't crawl, short replies don't blink
      const charCount     = text.length;
      const steps         = Math.max(24, Math.min(110, charCount));
      const chunkSize     = Math.max(1, Math.ceil(charCount / steps));
      const totalDuration = Math.max(600, Math.min(2600, charCount * 12));
      const intervalMs    = totalDuration / steps;

      let shown = 0;

      const tick = setInterval(() => {
        shown = Math.min(charCount, shown + chunkSize);
        paragraphEl.textContent = text.slice(0, shown);
        paragraphEl.appendChild(cursor);
        scrollToBottom();

        if (shown >= charCount) {
          clearInterval(tick);
          // Brief pause so cursor blinks once at end before disappearing
          setTimeout(() => {
            cursor.remove();
            resolve();
          }, 320);
        }
      }, intervalMs);
    });
  }

  // ── Append bot message with typewriter ────────────────────────────────
  async function appendBotMessageTyped(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-bot';

    bubble.appendChild(buildPromptLine('arthurbot', getTime()));

    const body = document.createElement('p');
    body.className = 'chat-msg-body';
    bubble.appendChild(body);

    messagesEl.appendChild(bubble);
    scrollToBottom();

    await typeOutText(body, text);
  }

  // ── Sending state — shows / hides thinking UI ─────────────────────────
  function setSending(active) {
    isSending         = active;
    sendBtn.disabled  = active;
    inputEl.disabled  = active;
    typingEl.toggleAttribute('hidden', !active);
    if (active) scrollToBottom();
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.removeAttribute('hidden');
  }

  function clearError() {
    errorEl.setAttribute('hidden', '');
    errorEl.textContent = '';
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const message = inputEl.value.trim();
    if (!message) return;

    clearError();
    appendUserMessage(message);
    inputEl.value = '';

    // Tiny delay before showing thinking UI — feels more intentional
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

      // Hide thinking UI, then type out response
      setSending(false);

      // Brief breath between thinking ending and reply starting
      await new Promise(r => setTimeout(r, 120));
      await appendBotMessageTyped(data.reply);

      history.push({ role: 'user',  text: message    });
      history.push({ role: 'model', text: data.reply });
      history = history.slice(-MAX_HISTORY_TURNS * 2);

    } catch {
      showError('Unable to reach the AI assistant. Please try again shortly.');
    } finally {
      setSending(false);
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  });

})();
/* ==========================================================================
   portfolio :: chatbot.js
   frontend logic for the portfolio AI assistant. loaded on index.html only.
   ========================================================================== */

// Your deployed Worker endpoint.
const CHAT_ENDPOINT = 'https://arthurr-portfolio-chatbot.arthurbaldosano.workers.dev/api/chat';

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

  let history = [];
  let isSending = false;

  toggleBtn.addEventListener('click', () => {
    const isOpen = chatBody.hasAttribute('hidden') === false;
    if (isOpen) {
      chatBody.setAttribute('hidden', '');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.querySelector('.chat-toggle-label').textContent = 'Open Chat';
    } else {
      chatBody.removeAttribute('hidden');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.querySelector('.chat-toggle-label').textContent = 'Close Chat';
      inputEl.focus();
    }
  });

  function appendStaticMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'chat-msg chat-msg-user' : 'chat-msg chat-msg-bot';
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  // Reveals `text` inside `paragraphEl` in smooth incremental chunks (a
  // typewriter effect) rather than dumping the whole reply in at once.
  // Total duration is capped so long replies don't take forever to finish.
  function typeOutText(paragraphEl, text) {
    return new Promise((resolve) => {
      const cursor = document.createElement('span');
      cursor.className = 'chat-cursor';
      paragraphEl.appendChild(cursor);

      const steps = Math.max(16, Math.min(90, text.length));
      const chunkSize = Math.max(1, Math.ceil(text.length / steps));
      const totalDurationMs = Math.max(420, Math.min(2200, text.length * 14));
      const intervalMs = totalDurationMs / steps;

      let shown = 0;

      const timer = setInterval(() => {
        shown = Math.min(text.length, shown + chunkSize);
        paragraphEl.textContent = text.slice(0, shown);
        paragraphEl.appendChild(cursor);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        if (shown >= text.length) {
          clearInterval(timer);
          cursor.remove();
          resolve();
        }
      }, intervalMs);
    });
  }

  async function appendBotMessageTyped(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-bot';
    const p = document.createElement('p');
    bubble.appendChild(p);
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    await typeOutText(p, text);
  }

  function setSending(state) {
    isSending = state;
    sendBtn.disabled = state;
    inputEl.disabled = state;
    typingEl.toggleAttribute('hidden', !state);
    if (state) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.removeAttribute('hidden');
  }

  function clearError() {
    errorEl.setAttribute('hidden', '');
    errorEl.textContent = '';
  }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const message = inputEl.value.trim();
    if (!message) return;

    clearError();
    appendStaticMessage('user', message);
    inputEl.value = '';
    setSending(true); // shows the "Thinking" dots while we wait on the API

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 429) {
        showError((data && data.error) || 'The AI assistant has reached its usage limit. Please try again later.');
        return;
      }

      if (!response.ok || !data) {
        showError((data && data.error) || 'Something went wrong. Please try again in a moment.');
        return;
      }

      // Hide the "Thinking" dots first, then type the reply out smoothly.
      setSending(false);
      await appendBotMessageTyped(data.reply);

      history.push({ role: 'user', text: message });
      history.push({ role: 'model', text: data.reply });
      history = history.slice(-MAX_HISTORY_TURNS * 2);
    } catch {
      setSending(false);
      showError('Unable to reach the AI assistant right now. Please try again shortly.');
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  });
})();
/* ==========================================================================
   portfolio :: chatbot.js
   frontend logic for the portfolio AI assistant. loaded on index.html only.
   ========================================================================== */

// Replace this with your deployed Worker URL after running `wrangler deploy`.
// Example: https://arthurr-portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev/api/chat
const CHAT_ENDPOINT = 'https://arthurr-portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev/api/chat';

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

  function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'chat-msg chat-msg-user' : 'chat-msg chat-msg-bot';
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
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
    appendMessage('user', message);
    inputEl.value = '';
    setSending(true);

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

      appendMessage('bot', data.reply);
      history.push({ role: 'user', text: message });
      history.push({ role: 'model', text: data.reply });
      history = history.slice(-MAX_HISTORY_TURNS * 2);
    } catch {
      showError('Unable to reach the AI assistant right now. Please try again shortly.');
    } finally {
      setSending(false);
      inputEl.focus();
    }
  });
})();
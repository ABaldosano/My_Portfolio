/* ==========================================================================
   portfolio :: compiler.js · Pyodide-based python compiler (add-on layer)
   Loaded once globally. Never imports, calls, or mutates chatbot.js internals.
   ========================================================================== */

(function initPyCompiler() {
  const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v314.0.0/full/pyodide.js';

  const sectionEl       = document.getElementById('py-compiler');
  const inputEl         = document.getElementById('pyInput');
  const runBtn          = document.getElementById('pyRunBtn');
  const runLabel        = document.getElementById('pyRunBtnLabel');
  const clearBtn        = document.getElementById('pyClearBtn');
  const outputEl        = document.getElementById('pyOutput');
  const statusDot       = document.getElementById('compilerStatusDot');
  const statusLabel     = document.getElementById('compilerStatusLabel');
  const gutterEl        = document.getElementById('pyGutter');
  const highlightCodeEl = document.getElementById('pyHighlightCode');
  const hiddenInputEl   = document.getElementById('pyHiddenInput');

  // ── Interactive-terminal state (input() pause/replay model) ─────────────
  let answers          = [];   // values supplied so far, in call order
  let shownLen          = 0;   // how much of the python stdout we've already rendered
  let awaitingInput     = false;
  let typedBuffer       = '';
  let typedSpan         = null;
  let caretSpan         = null;
  let activeCode        = '';

  if (!inputEl || !runBtn || !outputEl) return;

  const INDENT_UNIT = '    '; // 4 spaces, PEP8-style

  // ── Editor enhancements: syntax highlighting + line numbers ──────────────
  // Escape first, then wrap only our own <span> tags around matched tokens —
  // never reflects raw/unescaped user text into innerHTML.
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const PY_TOKEN_RE = /(?<comment>#.*)|(?<string>(?:[rRbBuUfF]{0,2})(?:'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"))|(?<decorator>@[A-Za-z_][A-Za-z0-9_.]*)|(?<number>\b0[xX][0-9a-fA-F]+\b|\b\d+\.\d+(?:[eE][+-]?\d+)?\b|\b\d+(?:[eE][+-]?\d+)?\b)|(?<keyword>\b(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)|(?<selfword>\b(?:self|cls)\b)|(?<funcdef>(?<=\bdef\s+)[A-Za-z_][A-Za-z0-9_]*)|(?<classname>(?<=\bclass\s+)[A-Za-z_][A-Za-z0-9_]*)|(?<funccall>\b[A-Za-z_][A-Za-z0-9_]*\b(?=\s*\())/g;

  function highlightPython(code) {
    let out = '';
    let lastIndex = 0;
    let match;
    PY_TOKEN_RE.lastIndex = 0;

    while ((match = PY_TOKEN_RE.exec(code)) !== null) {
      if (match.index > lastIndex) out += escapeHtml(code.slice(lastIndex, match.index));

      const g = match.groups;
      let cls = null;
      if (g.comment) cls = 'tok-comment';
      else if (g.string) cls = 'tok-string';
      else if (g.decorator) cls = 'tok-decorator';
      else if (g.number) cls = 'tok-number';
      else if (g.keyword) cls = 'tok-keyword';
      else if (g.selfword) cls = 'tok-self';
      else if (g.funcdef) cls = 'tok-funcdef';
      else if (g.classname) cls = 'tok-classname';
      else if (g.funccall) cls = 'tok-funccall';

      out += cls ? `<span class="${cls}">${escapeHtml(match[0])}</span>` : escapeHtml(match[0]);
      lastIndex = match.index + match[0].length;
      if (match[0].length === 0) PY_TOKEN_RE.lastIndex++;
    }

    out += escapeHtml(code.slice(lastIndex));
    return out + '\n'; // trailing newline keeps the last empty line in sync
  }

  function updateGutter(value) {
    if (!gutterEl) return;
    const lineCount = value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lineCount; i++) numbers += (i === lineCount ? i : i + '\n');
    gutterEl.textContent = numbers || '1';
  }

  function syncEditor() {
    const value = inputEl.value;
    if (highlightCodeEl) highlightCodeEl.innerHTML = highlightPython(value);
    updateGutter(value);
  }

  function getLineStart(text, pos) {
    return text.lastIndexOf('\n', pos - 1) + 1;
  }

  // ── Tab to indent (Shift+Tab to dedent) + auto indent/dedent on Enter ────
  inputEl.addEventListener('keydown', (e) => {
    const ta = inputEl;

    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: start, selectionEnd: end, value } = ta;

      if (start === end) {
        ta.value = value.slice(0, start) + INDENT_UNIT + value.slice(end);
        ta.selectionStart = ta.selectionEnd = start + INDENT_UNIT.length;
      } else {
        const lineStart = getLineStart(value, start);
        const before = value.slice(0, lineStart);
        const selected = value.slice(lineStart, end);
        const after = value.slice(end);
        const newSelected = e.shiftKey
          ? selected.replace(/^( {1,4}|\t)/gm, '')
          : selected.replace(/^/gm, INDENT_UNIT);

        ta.value = before + newSelected + after;
        ta.selectionStart = lineStart;
        ta.selectionEnd = lineStart + newSelected.length;
      }
      syncEditor();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart: pos, selectionEnd: endPos, value } = ta;
      const lineStart = getLineStart(value, pos);
      const currentLine = value.slice(lineStart, pos);
      const indentMatch = currentLine.match(/^[ \t]*/);
      let indent = indentMatch ? indentMatch[0] : '';
      const trimmed = currentLine.replace(/#.*/, '').trim();

      if (/:\s*$/.test(trimmed)) {
        indent += INDENT_UNIT; // entering a block (def/if/for/class/...)
      } else if (/^(return|pass|break|continue|raise)\b/.test(trimmed)) {
        indent = indent.slice(0, Math.max(0, indent.length - INDENT_UNIT.length)); // leaving a block
      }

      const insertion = '\n' + indent;
      ta.value = value.slice(0, pos) + insertion + value.slice(endPos);
      ta.selectionStart = ta.selectionEnd = pos + insertion.length;
      syncEditor();
      return;
    }

    // "Electric colon" — dedent else / elif / except / finally to match their block opener
    if (e.key === ':') {
      setTimeout(() => {
        const pos = ta.selectionStart;
        const value = ta.value;
        const lineStart = getLineStart(value, pos);
        const lineSoFar = value.slice(lineStart, pos);
        const trimmed = lineSoFar.trim();

        if (/^(else|elif\b.*|except\b.*|finally)\s*:$/.test(trimmed)) {
          const indentMatch = lineSoFar.match(/^[ \t]*/);
          const curIndent = indentMatch ? indentMatch[0] : '';
          if (curIndent.length >= INDENT_UNIT.length) {
            const newIndent = curIndent.slice(0, curIndent.length - INDENT_UNIT.length);
            const newLine = newIndent + trimmed;
            ta.value = value.slice(0, lineStart) + newLine + value.slice(pos);
            ta.selectionStart = ta.selectionEnd = lineStart + newLine.length;
            syncEditor();
          }
        }
      }, 0);
    }
  });

  inputEl.addEventListener('input', syncEditor);
  syncEditor(); // initial paint (empty editor → gutter shows "1")

  let pyodideInstance = null;
  let pyodideLoading  = null;
  let isRunning       = false;
  let isPyodideReady  = false;

  // ── Load the Pyodide <script> exactly once, however many times we're asked ──
  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (window.loadPyodide) { resolve(); return; }
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Pyodide script failed to load.')));
        return;
      }
      const s = document.createElement('script');
      s.src   = src;
      s.async = true;
      s.onload  = () => resolve();
      s.onerror = () => reject(new Error('Pyodide script failed to load.'));
      document.head.appendChild(s);
    });
  }

  function setStatus(text, ready) {
    if (statusLabel) statusLabel.textContent = text;
    if (statusDot) statusDot.classList.toggle('compiler-status-dot--ready', !!ready);
  }

  function setRunButtonState(state) {
    if (state === 'loading') { runBtn.disabled = true;  runLabel.textContent = 'Loading\u2026'; }
    if (state === 'running') { runBtn.disabled = true;  runLabel.textContent = 'Running\u2026'; }
    if (state === 'idle')    { runBtn.disabled = false; runLabel.textContent = 'Run'; }
  }

  // ── Single global Pyodide instance, initialized once ────────────────────
  async function initPyodide() {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading)  return pyodideLoading;

    setStatus('loading\u2026', false);
    setRunButtonState('loading');

    pyodideLoading = (async () => {
      await loadScriptOnce(PYODIDE_CDN);
      const pyodide = await window.loadPyodide();
      pyodideInstance = pyodide;
      isPyodideReady = true;
      setStatus('ready', true);
      setRunButtonState('idle');
      return pyodide;
    })();

    return pyodideLoading;
  }

  // Kick off loading in the background as soon as the page is ready.
  initPyodide().catch((err) => {
    setStatus('failed to load', false);
    outputEl.appendChild(Object.assign(document.createElement('span'), {
      className: 'py-stderr',
      textContent: `[compiler] ${err.message || err}`
    }));
  });

  // ── Output helpers ───────────────────────────────────────────────────────
  function clearOutput() {
    outputEl.textContent = '';
    shownLen = 0;
    answers = [];
    awaitingInput = false;
    typedBuffer = '';
    typedSpan = null;
    caretSpan = null;
    outputEl.classList.remove('py-output--awaiting-input');
    if (hiddenInputEl) hiddenInputEl.value = '';
  }

  function appendStdout(text) {
    if (!text) return;
    outputEl.appendChild(document.createTextNode(text));
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function appendStderr(text) {
    if (!text) return;
    const span = document.createElement('span');
    span.className = 'py-stderr';
    span.textContent = text;
    outputEl.appendChild(span);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // ── Live "you are typing" echo while paused on input() ───────────────────
  function enterAwaitingInput() {
    awaitingInput = true;
    typedBuffer = '';
    typedSpan = document.createElement('span');
    typedSpan.className = 'py-typed-input';
    caretSpan = document.createElement('span');
    caretSpan.className = 'py-caret';
    outputEl.appendChild(typedSpan);
    outputEl.appendChild(caretSpan);
    outputEl.classList.add('py-output--awaiting-input');
    outputEl.scrollTop = outputEl.scrollHeight;
    runBtn.disabled = true;
    if (hiddenInputEl) {
      hiddenInputEl.value = '';
      hiddenInputEl.focus({ preventScroll: true });
    } else {
      outputEl.focus();
    }
  }

  function exitAwaitingInput() {
    awaitingInput = false;
    typedSpan = null;
    caretSpan = null;
    outputEl.classList.remove('py-output--awaiting-input');
  }

  function renderTypedBuffer() {
    if (typedSpan) typedSpan.textContent = typedBuffer;
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function submitTypedLine() {
    const value = typedBuffer;
    if (caretSpan && caretSpan.parentNode) caretSpan.remove();
    // freeze the typed value as plain echoed text, then move to a new line
    if (typedSpan) typedSpan.appendChild(document.createTextNode('\n'));
    exitAwaitingInput();
    if (hiddenInputEl) hiddenInputEl.value = '';
    answers.push(value);
    runOnce(activeCode);
  }

  // Route all typing through a real, focusable input element. This is what
  // makes the IDE genuinely usable on touch devices: a <pre> can display a
  // blinking caret but can never summon an on-screen keyboard, only an
  // actual input/textarea can. It also gives us correct paste, autocorrect,
  // and IME support for free on desktop too.
  if (hiddenInputEl) {
    hiddenInputEl.addEventListener('input', () => {
      if (!awaitingInput) return;
      typedBuffer = hiddenInputEl.value;
      renderTypedBuffer();
    });
    hiddenInputEl.addEventListener('keydown', (e) => {
      if (!awaitingInput) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitTypedLine();
      }
    });
  }
  outputEl.addEventListener('click', () => {
    if (!awaitingInput) return;
    if (hiddenInputEl) hiddenInputEl.focus({ preventScroll: true });
    else outputEl.focus();
  });

  // ── Run user code, pausing live at each input() like a real terminal ────
  // Trick: since plain main-thread Pyodide can't block mid-script for a
  // keystroke (that needs Workers + SharedArrayBuffer + cross-origin
  // isolation headers, unavailable on GitHub Pages), we replay the script
  // from the top on every input() call, feeding back all answers collected
  // so far. Output already shown is never re-printed — only the new text
  // produced since the last pause is appended — so visually it behaves
  // exactly like a normal interactive run.
  async function runOnce(code) {
    setRunButtonState('running');

    let callIndex = 0;
    const answersSnapshot = answers;
    function jsHasNextInput() {
      return callIndex < answersSnapshot.length;
    }
    function jsNextInput() {
      const v = answersSnapshot[callIndex];
      callIndex++;
      return v;
    }

    try {
      const pyodide = await initPyodide();
      pyodide.globals.set('__js_has_next_input', jsHasNextInput);
      pyodide.globals.set('__js_next_input', jsNextInput);

      await pyodide.runPythonAsync(
        'import sys, io, builtins\n' +
        'sys.stdout = io.StringIO()\n' +
        'sys.stderr = io.StringIO()\n' +
        'class __PauseForInput(Exception):\n' +
        '    pass\n' +
        'def __py_input(prompt=""):\n' +
        '    if prompt:\n' +
        '        print(prompt, end="")\n' +
        '    if not __js_has_next_input():\n' +
        '        raise __PauseForInput()\n' +
        '    return __js_next_input()\n' +
        'builtins.input = __py_input\n'
      );

      let hadException = false;
      let caughtErr = null;
      try {
        await pyodide.runPythonAsync(code);
      } catch (err) {
        hadException = true;
        caughtErr = err;
      }

      const stdoutText = pyodide.runPython('sys.stdout.getvalue()');
      const stderrText = pyodide.runPython('sys.stderr.getvalue()');
      await pyodide.runPythonAsync('sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__');

      const newChunk = stdoutText.slice(shownLen);
      if (newChunk) appendStdout(newChunk);
      shownLen = stdoutText.length;

      const errText = caughtErr ? String((caughtErr && caughtErr.message) || caughtErr) : '';
      const paused = hadException && (
        stderrText.indexOf('__PauseForInput') !== -1 ||
        errText.indexOf('__PauseForInput') !== -1
      );

      if (paused) {
        isRunning = false;
        setRunButtonState('idle');
        enterAwaitingInput();
        return; // wait for the user's keystrokes; submitTypedLine() resumes us
      }

      if (hadException) {
        appendStderr(stderrText || errText || 'An error occurred while running this code.');
      } else {
        if (stderrText) appendStderr(stderrText);
        if (!stdoutText && !stderrText) appendStdout('(no output)');
      }

    } catch (initErr) {
      appendStderr(`[compiler] ${initErr.message || initErr}`);
    } finally {
      isRunning = false;
      setRunButtonState('idle');
    }
  }

  async function runPythonCode(code) {
    if (isRunning || awaitingInput || !code || !code.trim()) return;
    isRunning = true;
    clearOutput();
    activeCode = code;
    await runOnce(code);
  }

  // ── Event bindings ───────────────────────────────────────────────────────
  runBtn.addEventListener('click', () => runPythonCode(inputEl.value));

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      isRunning = false;
      clearOutput();
      outputEl.textContent = '// output cleared';
      if (isPyodideReady) setRunButtonState('idle');
    });
  }

  inputEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPythonCode(inputEl.value);
    }
  });

  // ── "Pick a Code" sample snippet picker ──────────────────────────────────
  const SNIPPETS = {
    guess: `import random
secret = random.randint(1, 20)
print("Guess the number between 1 and 20!")
while True:
    guess = int(input("Enter guess: "))
    if guess == secret:
        print("You won!")
        break
    print("Too high!" if guess > secret else "Too low!")`,

    password: `import random
import string
length = int(input("Enter password length: "))
chars = string.ascii_letters + string.digits
password = "".join(random.choices(chars, k=length))
print(f"Your password: {password}")`,

    rps: `import random
choices = ["rock", "paper", "scissors"]
computer = random.choice(choices)
player = input("Choose rock, paper, or scissors: ").lower()
print(f"Computer chose: {computer}")
if player == computer:
    print("It's a tie!")
elif (player == "rock" and computer == "scissors") or \\
     (player == "paper" and computer == "rock") or \\
     (player == "scissors" and computer == "paper"):
    print("You win!")
else:
    print("You lose!")`,

    dice: `import random
while True:
    roll = input("Roll the dice? (y/n): ").lower()
    if roll == 'y':
        print(f"You rolled a: {random.randint(1, 6)}")
    elif roll == 'n':
        print("Thanks for playing!")
        break`,

    currency: `# Fixed rates relative to 1 USD
rates = {"EUR": 0.92, "GBP": 0.79, "JPY": 155.5}
amount = float(input("Enter amount in USD: $"))
currency = input("Convert to (EUR, GBP, JPY): ").upper()
if currency in rates:
    converted = amount * rates[currency]
    print(f"\${amount} USD = {converted:.2f} {currency}")
else:
    print("Currency not supported.")`,
  };

  const snippetSelect = document.getElementById('pySnippetSelect');
  if (snippetSelect) {
    snippetSelect.addEventListener('change', () => {
      const code = SNIPPETS[snippetSelect.value];
      snippetSelect.selectedIndex = 0; // reset — behaves like a one-shot picker
      if (!code || !inputEl) return;
      isRunning = false;
      clearOutput();
      outputEl.textContent = 'Code output will appear here.';
      inputEl.value = code;
      syncEditor();
      inputEl.focus();
    });
  }

  // ── Public hook for the chatbot integration layer below ─────────────────
  window.PyCompiler = {
    run(code, autoRun) {
      if (!inputEl || !sectionEl) return;
      inputEl.value = code;
      syncEditor();
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (autoRun) setTimeout(() => runPythonCode(code), 500);
    }
  };
})();

/* ==========================================================================
   chatbot integration hook · add-on only, never touches chatbot.js
   Watches #chatMessages for finished bot replies and tags ```python fences
   with a "Run in Python Compiler" button.
   ========================================================================== */
(function initChatbotPyHook() {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;

  const FENCE_RE = /```python\s*\n?([\s\S]*?)```/gi;
  let debounceTimer = null;

  function enhanceBotMessage(bodyEl) {
    const raw = bodyEl.textContent;

    FENCE_RE.lastIndex = 0;
    if (!FENCE_RE.test(raw)) { bodyEl.dataset.pyScanned = '1'; return; }
    FENCE_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = FENCE_RE.exec(raw)) !== null) {
      const before = raw.slice(lastIndex, match.index);
      if (before) frag.appendChild(document.createTextNode(before));

      const code = match[1].replace(/\n$/, '');

      const block = document.createElement('div');
      block.className = 'chat-code-block';

      const pre  = document.createElement('pre');
      const code_ = document.createElement('code');
      code_.textContent = code; // textContent only — never innerHTML
      pre.appendChild(code_);
      block.appendChild(pre);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'run-in-compiler-btn';
      btn.textContent = 'Run in Python Compiler';
      btn.addEventListener('click', () => {
        if (window.PyCompiler) window.PyCompiler.run(code, true);
      });
      block.appendChild(btn);

      frag.appendChild(block);
      lastIndex = match.index + match[0].length;
    }

    const after = raw.slice(lastIndex);
    if (after) frag.appendChild(document.createTextNode(after));

    bodyEl.textContent = '';
    bodyEl.appendChild(frag);
    bodyEl.dataset.pyScanned = '1';
  }

  function scanMessages() {
    messagesEl.querySelectorAll('.chat-msg-bot .chat-msg-body').forEach((el) => {
      if (el.dataset.pyScanned === '1') return;
      if (el.querySelector('.chat-cursor')) return; // still typing, wait
      enhanceBotMessage(el);
    });
  }

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanMessages, 400);
  });

  observer.observe(messagesEl, { childList: true, subtree: true, characterData: true });
})();
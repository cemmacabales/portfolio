# AI Portfolio Chatbot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating AI chatbot widget (bottom-right) that lets visitors ask questions about Carl, backed by Groq API via a Netlify serverless proxy.

**Architecture:** Self-contained `AiChatbot.jsx` + `AiChatbot.css` component, integrated into `App.jsx` with one import. Groq calls happen inside `netlify/functions/chat.js` (server-side) so the API key never reaches the browser. The component maintains full message history in state; only the last 10 messages are sent to the API (sliding window).

**Tech Stack:** React (JSX), Framer Motion, lucide-react, CSS variables (no Tailwind), Netlify Functions (Node 18, CommonJS), Groq API.

---

## Task 1: Environment Setup + Netlify Function

**Files:**
- Modify: `.env.example`
- Modify: `.env`
- Create: `netlify/functions/chat.js`

- [ ] **Step 1: Add GROQ_API_KEY to .env.example**

Open `.env.example` and append:
```
GROQ_API_KEY=your_groq_api_key_here
```

- [ ] **Step 2: Add GROQ_API_KEY to .env**

Open `.env` and append (use the real key):
```
GROQ_API_KEY=<your_groq_api_key>
```

- [ ] **Step 3: Create the netlify/functions directory and chat.js**

```bash
mkdir -p netlify/functions
```

Create `netlify/functions/chat.js` with this exact content:

```js
// SYSTEM_PROMPT: Paste Carl's portfolio description below.
// This is injected as the first message in every Groq request.
const SYSTEM_PROMPT = `You are a helpful portfolio assistant for Carl Emmanuel Macabales, a 3rd-year Computer Science student at Mapúa University specializing in AI/ML. Answer only questions about Carl — his projects, skills, background, and experience. Be concise, friendly, and accurate. If a visitor asks something unrelated to Carl, politely redirect back to his portfolio.

[Carl: replace this block with your detailed system prompt lines about yourself, your projects, skills, and experience.]`;

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-8b-instant',
];

async function callGroq(apiKey, model, messages) {
  const res = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  let messages;
  try {
    ({ messages } = JSON.parse(event.body));
    if (!Array.isArray(messages)) throw new Error('invalid');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  for (const model of MODELS) {
    try {
      const data = await callGroq(apiKey, model, messages);
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('EMPTY_RESPONSE');
      return { statusCode: 200, headers, body: JSON.stringify({ content }) };
    } catch (err) {
      if (err.message === 'RATE_LIMITED') continue;
      console.error(`Model ${model} failed:`, err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
    }
  }

  return {
    statusCode: 503,
    headers,
    body: JSON.stringify({ error: 'All models rate limited' }),
  };
};
```

- [ ] **Step 4: Add Netlify env var for production**

In the Netlify dashboard → Site settings → Environment variables → Add:
- Key: `GROQ_API_KEY`
- Value: (the real key from `.env`)

- [ ] **Step 5: Install netlify-cli for local function testing (if not installed)**

```bash
npm install -g netlify-cli
```

- [ ] **Step 6: Test the function locally**

In one terminal, start the dev server via netlify (instead of `npm run dev`) so the function is available at `/.netlify/functions/chat`:
```bash
netlify dev
```

In another terminal, send a test request:
```bash
curl -X POST http://localhost:8888/.netlify/functions/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Who is Carl?"}]}'
```

Expected: `{"content":"Carl is ..."}` with a 200 status. If you get `503`, all models are rate-limited — wait 1 minute and retry. If you get `500`, check the GROQ_API_KEY in `.env`.

- [ ] **Step 7: Commit**

```bash
git add netlify/functions/chat.js .env.example
git commit -m "feat: add Groq proxy Netlify function with model fallback chain"
```

---

## Task 2: AiChatbot.css

**Files:**
- Create: `src/components/AiChatbot.css`

- [ ] **Step 1: Create the CSS file**

Create `src/components/AiChatbot.css` with this exact content:

```css
/* ── Wrapper ──────────────────────────────────────────────────── */
.chatbot-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

/* ── Floating trigger button ──────────────────────────────────── */
.chatbot-trigger {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--accent-primary);
  background: var(--bg-secondary);
  color: var(--accent-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(100, 255, 218, 0.2);
  transition: box-shadow 0.2s ease;
}

.chatbot-trigger:hover {
  box-shadow: 0 0 28px rgba(100, 255, 218, 0.4);
}

/* ── Chat panel ───────────────────────────────────────────────── */
.chatbot-panel {
  width: 380px;
  max-height: 520px;
  background: var(--bg-secondary);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* ── Header ───────────────────────────────────────────────────── */
.chatbot-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chatbot-header-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chatbot-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 6px var(--accent-primary);
  flex-shrink: 0;
}

.chatbot-header-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.chatbot-header-subtitle {
  font-size: 0.7rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.chatbot-close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background 0.15s ease;
}

.chatbot-close-btn:hover {
  color: var(--text-primary);
  background: var(--card-bg);
}

/* ── Empty state ──────────────────────────────────────────────── */
.chatbot-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.chatbot-empty-icon {
  color: var(--accent-primary);
  opacity: 0.4;
}

.chatbot-empty-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 220px;
}

/* ── Message list ─────────────────────────────────────────────── */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 255, 218, 0.2) transparent;
}

.chatbot-messages::-webkit-scrollbar {
  width: 4px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: rgba(100, 255, 218, 0.2);
  border-radius: 2px;
}

/* ── Message bubble ───────────────────────────────────────────── */
.chatbot-message {
  display: flex;
  flex-direction: column;
  max-width: 82%;
}

.chatbot-message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.chatbot-message.assistant,
.chatbot-message.error {
  align-self: flex-start;
  align-items: flex-start;
}

.chatbot-bubble {
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.55;
  word-break: break-word;
}

.chatbot-message.user .chatbot-bubble {
  background: var(--accent-primary);
  color: #111111;
  border-bottom-right-radius: 4px;
}

.chatbot-message.assistant .chatbot-bubble {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.chatbot-message.error .chatbot-bubble {
  background: rgba(255, 107, 107, 0.15);
  color: #ff8a8a;
  border: 1px solid rgba(255, 107, 107, 0.25);
  border-bottom-left-radius: 4px;
}

.chatbot-timestamp {
  font-size: 0.65rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  padding: 0 0.25rem;
}

/* ── Typing indicator ─────────────────────────────────────────── */
.chatbot-typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 0.75rem 0.875rem;
  background: var(--bg-primary);
  border-radius: 1rem;
  border-bottom-left-radius: 4px;
}

.chatbot-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: chatbotBounce 1.4s infinite ease-in-out;
}

.chatbot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.chatbot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes chatbotBounce {
  0%, 80%, 100% { transform: scale(0.75); opacity: 0.4; }
  40% { transform: scale(1.1); opacity: 1; }
}

/* ── Input area ───────────────────────────────────────────────── */
.chatbot-input-area {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--card-border);
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  flex-shrink: 0;
}

.chatbot-textarea {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  min-height: 38px;
  max-height: 120px;
  overflow-y: auto;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-textarea::placeholder {
  color: var(--text-secondary);
}

.chatbot-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.15);
}

.chatbot-textarea:disabled {
  opacity: 0.5;
}

.chatbot-send-btn {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: none;
  background: var(--accent-primary);
  color: #111111;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.chatbot-send-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
  box-shadow: 0 4px 12px var(--shadow-primary);
}

.chatbot-send-btn:active:not(:disabled) {
  transform: scale(0.94);
}

.chatbot-send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Hint text ────────────────────────────────────────────────── */
.chatbot-hint {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 0 1rem 0.625rem;
  margin: 0;
  flex-shrink: 0;
}

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .chatbot-wrapper {
    bottom: 1rem;
    right: 1rem;
  }

  .chatbot-panel {
    width: calc(100vw - 2rem);
    max-height: 60vh;
  }
}

/* ── Reduced motion ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .chatbot-typing-dot {
    animation: none;
    opacity: 0.6;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AiChatbot.css
git commit -m "feat: add AiChatbot component styles"
```

---

## Task 3: AiChatbot.jsx

**Files:**
- Create: `src/components/AiChatbot.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/AiChatbot.jsx` with this exact content:

```jsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, MessageCircle } from 'lucide-react'
import './AiChatbot.css'

const WINDOW_SIZE = 10

const panelVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.88, y: 8, transition: { duration: 0.15 } },
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const panelRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 60)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const panel = panelRef.current
    const getFocusables = () =>
      Array.from(panel.querySelectorAll('button, textarea, [tabindex="0"]'))
    const trap = (e) => {
      if (e.key !== 'Tab') return
      const focusables = getFocusables()
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    panel.addEventListener('keydown', trap)
    return () => panel.removeEventListener('keydown', trap)
  }, [isOpen])

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    const payload = nextMessages
      .slice(-WINDOW_SIZE)
      .map(({ role, content }) => ({ role: role === 'error' ? 'assistant' : role, content }))

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })
      const data = await res.json()

      if (!res.ok) {
        const text = res.status === 503
          ? "I'm a bit overwhelmed right now — try again in a moment."
          : "Something went wrong. Check your connection."
        setMessages((prev) => [...prev, { role: 'error', content: text, timestamp: new Date() }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content, timestamp: new Date() }])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: "Something went wrong. Check your connection.", timestamp: new Date() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chatbot-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot-panel"
            ref={panelRef}
            className="chatbot-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originX: 1, originY: 1 }}
            role="dialog"
            aria-label="Portfolio assistant"
            aria-modal="true"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-status-dot" aria-hidden="true" />
                <div>
                  <div className="chatbot-header-title">Ask about Carl</div>
                  <div className="chatbot-header-subtitle">Portfolio assistant</div>
                </div>
              </div>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages or empty state */}
            {messages.length === 0 ? (
              <div className="chatbot-empty" aria-live="polite">
                <MessageCircle size={28} className="chatbot-empty-icon" aria-hidden="true" />
                <p className="chatbot-empty-text">
                  Ask me anything about Carl — his projects, skills, or background.
                </p>
              </div>
            ) : (
              <div
                className="chatbot-messages"
                role="log"
                aria-live="polite"
                aria-label="Conversation history"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`chatbot-message ${msg.role}`}>
                    <div className="chatbot-bubble">{msg.content}</div>
                    <span className="chatbot-timestamp" aria-hidden="true">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="chatbot-message assistant">
                    <div className="chatbot-typing" aria-label="Assistant is typing">
                      <div className="chatbot-typing-dot" />
                      <div className="chatbot-typing-dot" />
                      <div className="chatbot-typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>
            )}

            {/* Input */}
            <div className="chatbot-input-area">
              <textarea
                ref={textareaRef}
                className="chatbot-textarea"
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Carl…"
                rows={1}
                disabled={isLoading}
                aria-label="Message input"
              />
              <button
                className="chatbot-send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="chatbot-hint">Shift + Enter for new line</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        className="chatbot-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label={isOpen ? 'Close assistant' : 'Open portfolio assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex' }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex' }}
            >
              <Bot size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AiChatbot.jsx
git commit -m "feat: add AiChatbot floating widget component"
```

---

## Task 4: System Prompt + App.jsx Integration

**Files:**
- Modify: `netlify/functions/chat.js` (top of file — SYSTEM_PROMPT constant)
- Modify: `src/App.jsx`

- [ ] **Step 1: Write the system prompt**

Open `netlify/functions/chat.js`. Replace the `SYSTEM_PROMPT` constant's placeholder content with Carl's actual system prompt. Keep the backtick string format. Example structure:

```js
const SYSTEM_PROMPT = `You are a helpful portfolio assistant for Carl Emmanuel Macabales...

## About Carl
[Carl's bio, background, year in school, university, specialization]

## Projects
[Brief description of each project: RAG Chatbot, YOLOv12 kidney detection, Read My Face, Earfquake, Petchingu, MyApt]

## Skills
[Carl's technical skills, tools, languages, frameworks]

## Contact / Links
[GitHub, LinkedIn, email as appropriate]

Keep responses concise and friendly. If asked about something unrelated to Carl, say: "I'm here to help with questions about Carl's portfolio — feel free to ask about his projects, skills, or background!"`;
```

- [ ] **Step 2: Add AiChatbot to App.jsx**

Open `src/App.jsx`. Add the import near the top with the other component imports:

```js
import AiChatbot from './components/AiChatbot'
```

Then, inside the `return (...)`, add `<AiChatbot />` just before the closing `</div>` of the root element (after the `<Dock />` render, outside all sections):

```jsx
      {/* ... rest of the app ... */}
      <Dock ... />
      <AiChatbot />
    </div>
  )
```

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/chat.js src/App.jsx
git commit -m "feat: integrate AiChatbot into App and write system prompt"
```

---

## Task 5: End-to-End Browser Verification

**Goal:** Confirm the widget works correctly in both dark and light mode before pushing.

- [ ] **Step 1: Start the dev server with Netlify CLI**

```bash
netlify dev
```

The app will be available at `http://localhost:8888` (not 3000 — netlify-cli wraps the Vite server).

- [ ] **Step 2: Verify dark mode**

1. Open `http://localhost:8888`
2. The `Bot` icon button is visible in the bottom-right — Electric Mint border and mint glow
3. Click the button — panel opens with a spring animation from the bottom-right
4. The button icon swaps to `X` with a rotation transition
5. Empty state shows: "Ask me anything about Carl…"
6. Type a question, press Enter — user bubble appears in Electric Mint, typing dots show
7. Response appears as an assistant bubble
8. Press `Escape` — panel closes
9. Check that old messages persist when you reopen the panel

- [ ] **Step 3: Verify light mode**

1. Toggle light mode using the theme switch in the portfolio
2. The panel and button should update automatically (no Electric Mint → light accent `#00897b`)
3. Bubbles and input area should be legible on the light canvas

- [ ] **Step 4: Verify mobile**

1. Open DevTools → toggle device toolbar → iPhone 14 (390px width)
2. Panel width should be `calc(100vw - 2rem)` — filling most of the screen
3. Panel height should be `60vh`
4. Input and send button should be usable with touch targets

- [ ] **Step 5: Verify error fallback**

Temporarily break the API key in `.env` (add a character to make it invalid), restart netlify dev, send a message. Expected: red-tinted error bubble with the connection error message. Restore the key afterward.

- [ ] **Step 6: Commit verification checkpoint**

```bash
git add -A
git commit -m "chore: verify AI chatbot end-to-end in dev"
```

---

## Post-Deploy Checklist

- [ ] Push branch to remote: `git push origin ui-widget`
- [ ] Confirm `GROQ_API_KEY` is set in Netlify dashboard → Environment Variables
- [ ] Trigger a deploy and test on `cemmacabales.tech` — the `/.netlify/functions/chat` route should resolve in production
- [ ] Confirm Netlify Functions tab shows `chat` function deployed

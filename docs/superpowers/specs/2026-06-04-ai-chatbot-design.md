# AI Portfolio Chatbot — Design Spec
**Date:** 2026-06-04  
**Status:** Approved

---

## 1. Overview

A floating AI chatbot widget for Carl Macabales' portfolio (cemmacabales.tech). Visitors can ask questions about Carl — his projects, skills, background, and experience. The widget lives in the bottom-right corner and matches the portfolio's Electric Mint / void-black design system with full dark/light mode support.

**Chatbot persona:** Portfolio assistant for Carl Macabales. Answers only questions about Carl. Does not handle general conversation or coding questions.

**AI backend:** Groq API, called via a Netlify serverless function proxy so the API key never reaches the browser.

---

## 2. Files

| File | Purpose |
|---|---|
| `src/components/AiChatbot.jsx` | Self-contained widget — button, panel, messages, input |
| `src/components/AiChatbot.css` | All styles using existing CSS variables |
| `netlify/functions/chat.js` | Serverless proxy — holds API key, calls Groq, returns response |
| `src/App.jsx` | Add one import + one `<AiChatbot />` at the root |

---

## 3. Architecture & Data Flow

1. User types a message → `AiChatbot.jsx` appends it to `messages[]`
2. On send → build API payload: system prompt + last 10 messages (sliding window)
3. POST to `/.netlify/functions/chat`
4. Netlify function tries models in fallback order, returns assistant reply
5. Reply appended to `messages[]` as an assistant bubble

**Sliding window:** Last 10 messages sent to the API. All messages remain visible in the UI. Older context is dropped silently — no indication shown to the user.

---

## 4. Model Fallback Chain

The Netlify function catches HTTP 429 (rate limit) and retries with the next model:

1. **Primary:** `llama-3.3-70b-versatile` — best quality
2. **Fallback 1:** `meta-llama/llama-4-scout-17b-16e-instruct` — higher token limits
3. **Fallback 2:** `llama-3.1-8b-instant` — highest daily limits, always-on safety net

If all three fail, return a 503 and the UI shows an inline error bubble.

---

## 5. Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Netlify env + `.env` local | Groq API key — server-side only, never exposed to browser |

Local dev: add `GROQ_API_KEY=<key>` to `.env`. The Netlify function reads `process.env.GROQ_API_KEY`.

---

## 6. System Prompt

Defined as a string constant at the top of `netlify/functions/chat.js`. Carl pastes his portfolio description there. Injected as `{ role: "system", content: SYSTEM_PROMPT }` prepended to every API call. Not user-configurable at runtime.

---

## 7. UI Design

### Floating Button
- **Size:** 52×52px circle, fixed bottom-right (`bottom: 1.5rem; right: 1.5rem`)
- **Style:** `var(--bg-secondary)` fill, 1px Electric Mint border, subtle mint glow (`0 0 16px rgba(100,255,218,0.25)`)
- **Icon:** `Bot` (lucide-react) at rest → `X` when panel is open
- **Animation:** Framer-motion scale spring on open/close
- **Theme:** Inherits CSS variables — works in dark and light mode automatically

### Chat Panel
- **Width:** `380px` desktop / `calc(100vw - 2rem)` mobile
- **Height:** `520px` max desktop / `60vh` mobile, with overflow scroll on the message list
- **Position:** `bottom: 5rem; right: 0` — sits directly above the button
- **Background:** `var(--bg-secondary)` with `backdrop-filter: blur(16px)`
- **Border:** 1px `rgba(100,255,218,0.2)` (Electric Mint, low opacity)
- **Border radius:** `1.5rem` (matches SpotlightCard)
- **Entry animation:** Scale from 0.85 + fade up, origin bottom-right, framer-motion spring

### Message Bubbles
- **User:** Electric Mint background (`#64ffda`), dark ink text (`#111111`), right-aligned
- **Assistant:** `var(--bg-primary)` background, `var(--text-primary)` text, left-aligned
- **Timestamp:** Label-size (`0.75rem`) muted text below each bubble
- **Typing indicator:** Three animated dots shown while `isLoading` is true

### Input Area
- **Textarea:** Auto-grows (1–4 rows), translucent fill `rgba(255,255,255,0.05)`, 1px card-border, 8px radius, Electric Mint border on focus
- **Send button:** Electric Mint primary style (matches existing button pattern)
- **Disabled state:** Send button disabled + reduced opacity while `isLoading`

---

## 8. State

All state lives inside `AiChatbot.jsx`:

```
messages[]        — { role: 'user'|'assistant', content: string, timestamp: Date }
input             — string, textarea value
isOpen            — boolean, panel visibility
isLoading         — boolean, awaiting Groq response
error             — string|null, inline error text
```

No persistence. State resets on page reload (appropriate for portfolio demo).

---

## 9. Error Handling

| Scenario | UI Response |
|---|---|
| All 3 models rate-limited | Inline assistant bubble: *"I'm a bit overwhelmed right now — try again in a moment."* |
| Network error | Inline assistant bubble: *"Something went wrong. Check your connection."* |

Error bubbles use a red-tinted background (`rgba(255,107,107,0.15)`) to distinguish from normal assistant messages. No toast or modal.

---

## 10. Accessibility

- Panel traps focus when open
- `aria-live="polite"` on message list (screen readers announce new messages)
- `Escape` key closes the panel
- All interactive elements have visible focus styles using Electric Mint outline

---

## 11. Constraints

- No TypeScript — plain JSX matching codebase convention
- No Tailwind — all styles in `AiChatbot.css` using existing CSS variables
- No shadcn — no new UI framework dependencies
- `lucide-react` already installed — use for all icons
- Framer-motion already installed — use for all animations (no additional GSAP needed)
- Electric Mint (`#64ffda`) is the sole accent — no purple, no secondary colors
- MagnetLines background preserved — chatbot is `position: fixed`, does not interfere

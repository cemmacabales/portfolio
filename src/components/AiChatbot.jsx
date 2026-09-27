import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useImperativeHandle,
  memo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { X, ArrowUp, SquarePen, CircleAlert } from 'lucide-react'
import { ASSISTANT_OPEN_EVENT } from '../utils/assistant'
import { useBooted } from '../hooks/useBooted'
import memoji from '../assets/memoji-assistant.webp'
import ChatReply from './ChatReply'
import './AiChatbot.css'

const WINDOW_SIZE = 10
const STAMP_GAP_MS = 15 * 60 * 1000
// Matches the sheet's close transition in AiChatbot.css.
const CLOSE_MS = 420
const PEEK_KEY = 'assistant-peeked'

const SUGGESTIONS = [
  'What is Centient?',
  'Is Carl open to work?',
  'What research has he published?',
  'What does he build with?',
  'Why should I hire Carl?',
]

// Critically damped: quick, settled, no overshoot.
const settle = { type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }
const morph = { type: 'spring', stiffness: 380, damping: 36 }

function stampParts(date) {
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const today = new Date().toDateString() === date.toDateString()
  return [today ? 'Today' : date.toLocaleDateString([], { weekday: 'long' }), time]
}

function Avatar({ size }) {
  return (
    <motion.span layoutId="chat-avatar" transition={morph} className={`chat-avatar is-${size}`}>
      <img src={memoji} alt="" width="288" height="288" draggable="false" />
    </motion.span>
  )
}

// The Messages tail: it overlaps the bubble's corner by 12px and curls out 8px.
const TAIL_PATH = {
  right: 'M0 0H12V7A10 10 0 0 0 20 16.8V17H16A16 14 0 0 1 0 3Z',
  left: 'M20 0H8V7A10 10 0 0 1 0 16.8V17H4A16 14 0 0 0 20 3Z',
}

function Tail({ side, layout = false }) {
  return (
    <motion.svg layout={layout} className="chat-tail" viewBox="0 0 20 17" aria-hidden="true">
      <path d={TAIL_PATH[side]} />
    </motion.svg>
  )
}

// One message, with the timestamp above it when a new sitting starts. Memoized
// so that a new message (or a keystroke) doesn't re-render, re-parse and
// re-measure every bubble already in the thread.
const Message = memo(function Message({ msg, stamp, tail, busy, onRetry }) {
  let time = null
  if (stamp) {
    const [day, clock] = stampParts(msg.at)
    time = (
      <p className="chat-stamp">
        <b>{day}</b> {clock}
      </p>
    )
  }

  if (msg.role === 'user') {
    return (
      <>
        {time}
        {/* A whole transform (not x/scale) so the spring runs on the compositor. */}
        <motion.div
          data-msg={msg.id}
          className={`chat-row is-user${tail ? ' ends-group' : ''}`}
          initial={{ opacity: 0, transform: 'translateY(22px) scale(0.94)' }}
          animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
          transition={settle}
          style={{ transformOrigin: '100% 100%' }}
        >
          <div className={`chat-bubble is-user${msg.status ? ' is-failed' : ''}`}>
            {msg.content}
            {tail && <Tail side="right" />}
          </div>
          {msg.status === 'failed' && (
            <div className="chat-failed">
              <CircleAlert size={14} strokeWidth={2.4} aria-hidden="true" />
              <span>
                {msg.reason === 'busy' ? 'Not delivered: the assistant is busy.' : 'Not delivered.'}
              </span>
              <button type="button" onClick={() => onRetry(msg)} disabled={busy}>
                Try again
              </button>
            </div>
          )}
        </motion.div>
      </>
    )
  }

  return (
    <>
      {time}
      <div data-msg={msg.id} className={`chat-row is-assistant${tail ? ' ends-group' : ''}`}>
        <motion.div
          layoutId={`bubble-${msg.id}`}
          transition={morph}
          className="chat-bubble is-assistant"
          style={{ borderRadius: 19 }}
        >
          {/* layout keeps the words unstretched while the bubble grows */}
          <motion.div layout transition={morph}>
            <ChatReply text={msg.content} />
          </motion.div>
          {tail && <Tail side="left" layout />}
        </motion.div>
      </div>
    </>
  )
})

// The field owns the draft, so typing re-renders the field and nothing else.
// The parent only hears when the draft goes from empty to not, or back.
const Composer = memo(function Composer({ controls, fieldRef, busy, onSend, onDraftChange }) {
  const [input, setInput] = useState('')
  const hadDraft = useRef(false)
  const canSend = input.trim().length > 0 && !busy

  const update = (value) => {
    setInput(value)
    const hasDraft = value.length > 0
    if (hasDraft !== hadDraft.current) {
      hadDraft.current = hasDraft
      onDraftChange(hasDraft)
    }
  }

  useImperativeHandle(controls, () => ({
    clear() {
      update('')
      if (fieldRef.current) fieldRef.current.style.height = ''
    },
  }))

  const handleInput = (e) => {
    update(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 132)}px`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (canSend) onSend(input)
    }
  }

  return (
    <form
      className="chat-field"
      data-busy={busy}
      onSubmit={(e) => {
        e.preventDefault()
        if (canSend) onSend(input)
      }}
    >
      <span className="chat-rim" aria-hidden="true" />
      <textarea
        ref={fieldRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about Carl"
        rows={1}
        maxLength={500}
        enterKeyHint="send"
        aria-label="Message"
      />
      <button
        type="submit"
        className="chat-send"
        data-ready={canSend}
        disabled={!canSend}
        aria-label="Send message"
      >
        <ArrowUp size={17} strokeWidth={2.6} aria-hidden="true" />
      </button>
    </form>
  )
})

export default function AiChatbot() {
  const booted = useBooted()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [hasDraft, setHasDraft] = useState(false)
  const [pending, setPending] = useState(null)
  const [peek, setPeek] = useState(false)

  const frameRef = useRef(null)
  const sheetRef = useRef(null)
  const scrollRef = useRef(null)
  const composeRef = useRef(null)
  const textareaRef = useRef(null)
  const composerRef = useRef(null)
  const launcherRef = useRef(null)
  const abortRef = useRef(null)
  const sendRef = useRef(null)

  const hasThread = messages.length > 0
  const last = messages[messages.length - 1]
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content))
  const followUps = SUGGESTIONS.filter((s) => !asked.has(s)).slice(0, 3)
  const showFollowUps =
    hasThread && !pending && last?.role === 'assistant' && !hasDraft && followUps.length > 0

  // ── Open / close ────────────────────────────────────────────────
  const close = () => {
    const hadFocus = sheetRef.current?.contains(document.activeElement)
    setIsOpen(false)
    if (hadFocus) launcherRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    const open = () => setIsOpen(true)
    window.addEventListener(ASSISTANT_OPEN_EVENT, open)
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, open)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    // A phone's keyboard would cover the suggestions, so only a mouse and
    // keyboard setup gets the caret straight away.
    const fine = window.matchMedia('(pointer: fine)').matches
    const timer = setTimeout(() => {
      if (fine) textareaRef.current?.focus({ preventScroll: true })
      else sheetRef.current?.focus({ preventScroll: true })
    }, 80)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Escape closes; Tab stays inside the sheet.
  useEffect(() => {
    if (!isOpen) return
    const sheet = sheetRef.current
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = Array.from(
        sheet.querySelectorAll('button:not([disabled]), textarea, a[href]'),
      ).filter((el) => el.offsetParent !== null)
      if (!focusables.length) return
      const first = focusables[0]
      const lastEl = focusables[focusables.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet)) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        first.focus()
      }
    }
    sheet.addEventListener('keydown', onKey)
    return () => sheet.removeEventListener('keydown', onKey)
  }, [isOpen])

  // On a phone the sheet fills the screen: hold the page still behind it and
  // follow the visual viewport so the keyboard never covers the field.
  useEffect(() => {
    if (!isOpen || !window.matchMedia('(max-width: 760px)').matches) return
    // Set on the frame, the only thing that reads them: on the root they'd
    // restyle the whole thread on every keyboard frame.
    const frame = frameRef.current
    const vv = window.visualViewport
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    const sync = () => {
      if (!vv) return
      frame.style.setProperty('--vvh', `${vv.height}px`)
      frame.style.setProperty('--vvt', `${vv.offsetTop}px`)
    }
    sync()
    vv?.addEventListener('resize', sync)
    vv?.addEventListener('scroll', sync)
    return () => {
      html.style.overflow = previous
      vv?.removeEventListener('resize', sync)
      vv?.removeEventListener('scroll', sync)
      // Let the sheet finish closing before it snaps back to full height.
      setTimeout(() => {
        frame.style.removeProperty('--vvh')
        frame.style.removeProperty('--vvt')
      }, CLOSE_MS)
    }
  }, [isOpen])

  // ── Launcher peek: once per visit, when the hero's own "Ask my assistant"
  // tile has scrolled away, the launcher says what it is for a moment. ──
  useEffect(() => {
    if (!booted) return
    let seen = false
    try {
      seen = sessionStorage.getItem(PEEK_KEY) === '1'
    } catch {
      /* storage blocked: peek anyway */
    }
    if (seen) return
    let hideTimer
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.9) return
      window.removeEventListener('scroll', onScroll)
      try {
        sessionStorage.setItem(PEEK_KEY, '1')
      } catch {
        /* ignore */
      }
      setPeek(true)
      hideTimer = setTimeout(() => setPeek(false), 3200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(hideTimer)
    }
  }, [booted])

  // ── Layout: the thread scrolls under the header and composer ────
  // --compose-h doesn't inherit (see AiChatbot.css), so it's set where it's
  // read and a taller field restyles one element, not the thread.
  useLayoutEffect(() => {
    const compose = composeRef.current
    const scroll = scrollRef.current
    const ro = new ResizeObserver(([entry]) => {
      scroll.style.setProperty('--compose-h', `${entry.borderBoxSize[0].blockSize}px`)
    })
    ro.observe(compose)
    return () => ro.disconnect()
  }, [])

  // Keep the newest thing in view. When a reply lands, the question that
  // prompted it moves up under the header, so a long answer reads from the
  // top with its question still in sight.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    const behavior = smooth ? 'smooth' : 'auto'
    if (last?.role === 'assistant' && !pending) {
      const asks = el.querySelectorAll('.chat-row.is-user')
      const question = asks[asks.length - 1]
      const headH = parseFloat(getComputedStyle(el).paddingTop) || 0
      const top = question ? question.offsetTop - headH - 6 : el.scrollHeight
      el.scrollTo({ top: Math.min(top, el.scrollHeight), behavior })
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior })
    }
  }, [messages, pending]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sending ─────────────────────────────────────────────────────
  const send = async (raw) => {
    const text = raw.trim()
    if (!text || pending) return

    const id = Date.now()
    const replyId = id + 1
    const userMsg = { id, role: 'user', content: text, at: new Date() }
    const payload = [...messages.filter((m) => !m.status), userMsg]
      .slice(-WINDOW_SIZE)
      .map(({ role, content }) => ({ role, content }))

    setMessages((prev) => [...prev, userMsg])
    composerRef.current?.clear()
    setPending(replyId)

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.content) {
        throw Object.assign(new Error('Not delivered'), {
          busy: res.status === 503 || res.status === 429,
        })
      }
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'assistant', content: data.content, at: new Date() },
      ])
    } catch (err) {
      if (controller.signal.aborted) return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: 'failed', reason: err.busy ? 'busy' : 'offline' } : m,
        ),
      )
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setPending(null)
      }
    }
  }

  const retry = (msg) => {
    if (pending) return
    setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    send(msg.content)
  }

  // Stable handles for the memoized rows and field, calling the latest render.
  useLayoutEffect(() => {
    sendRef.current = { send, retry }
  })
  const onSend = useCallback((text) => sendRef.current.send(text), [])
  const onRetry = useCallback((msg) => sendRef.current.retry(msg), [])

  const startOver = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setPending(null)
    setMessages([])
    composerRef.current?.clear()
    textareaRef.current?.focus({ preventScroll: true })
  }

  // ── Thread ──────────────────────────────────────────────────────
  const rows = messages.map((msg, i) => {
    const prev = messages[i - 1]
    const next = messages[i + 1]
    // Only the last bubble of a run gets a tail, as in Messages.
    const tail =
      !next || next.role !== msg.role || next.at - msg.at > STAMP_GAP_MS || Boolean(msg.status)
    return (
      <Message
        key={msg.id}
        msg={msg}
        stamp={!prev || msg.at - prev.at > STAMP_GAP_MS}
        tail={tail}
        busy={msg.status === 'failed' && Boolean(pending)}
        onRetry={onRetry}
      />
    )
  })

  return (
    <div className="chat" data-open={isOpen}>
      <button
        ref={launcherRef}
        type="button"
        className="chat-launcher"
        data-peek={peek}
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="chat-sheet"
        aria-haspopup="dialog"
        tabIndex={isOpen ? -1 : 0}
      >
        <span className="chat-launcher-label">
          <span>
            <span>Ask about Carl</span>
          </span>
        </span>
        <span className="chat-launcher-face" aria-hidden="true">
          <img src={memoji} alt="" width="288" height="288" draggable="false" />
        </span>
      </button>

      <div ref={frameRef} className="chat-frame">
        {/* The drop shadow is cast by this plate, which morphs with the sheet
            but holds no content: nothing animating in the thread can make the
            GPU redraw a 40px shadow around the whole sheet. */}
        <div className="chat-shade" aria-hidden="true" />
        <section
          ref={sheetRef}
          id="chat-sheet"
          className="chat-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Chat with Carl's assistant"
          inert={!isOpen}
          tabIndex={-1}
        >
          <div className="chat-body">
            <header className="chat-head" data-thread={hasThread}>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={startOver}
                aria-label="Start a new chat"
                disabled={!hasThread}
              >
                <SquarePen size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <div className="chat-id" aria-hidden="true">
                {hasThread && (
                  <>
                    <Avatar size="sm" />
                    <motion.span layoutId="chat-name" transition={morph} className="chat-name">
                      Carl&rsquo;s assistant
                    </motion.span>
                  </>
                )}
              </div>
              <button type="button" className="chat-icon-btn" onClick={close} aria-label="Close chat">
                <X size={17} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </header>

            <motion.div ref={scrollRef} className="chat-scroll" layoutScroll>
              {hasThread ? (
                <div className="chat-thread" role="log" aria-live="polite" aria-label="Conversation">
                  {rows}
                  {/* No exit animation on purpose: when the reply lands, this
                      bubble hands its box to it (same layoutId) and the reply
                      grows out of it instead of the dots stretching. */}
                  {pending && (
                    <div key={pending} className="chat-row is-assistant ends-group">
                      <motion.div
                        layoutId={`bubble-${pending}`}
                        transition={morph}
                        className="chat-bubble is-assistant chat-typing"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1, transition: { ...settle, delay: 0.28 } }}
                        style={{ originX: 0, originY: 1, borderRadius: 19 }}
                        role="status"
                        aria-label="Carl's assistant is typing"
                      >
                        <span />
                        <span />
                        <span />
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="chat-empty">
                  <div className="chat-card">
                    <Avatar size="lg" />
                    <motion.h2 layoutId="chat-name" transition={morph} className="chat-card-name">
                      Carl&rsquo;s assistant
                    </motion.h2>
                    <p className="chat-card-sub">
                      Ask about his projects, his research, or whether he&rsquo;s free for a role.
                    </p>
                  </div>
                  <ul className="chat-suggest" aria-label="Suggested questions">
                    {SUGGESTIONS.slice(0, 4).map((q, i) => (
                      <li key={q} style={{ '--i': i }}>
                        <button type="button" onClick={() => send(q)}>
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="chat-note">Replies are AI-generated from Carl&rsquo;s portfolio.</p>
                </div>
              )}
            </motion.div>

            <div ref={composeRef} className="chat-compose">
              <AnimatePresence initial={false}>
                {showFollowUps && (
                  <motion.ul
                    key="follow-ups"
                    className="chat-followups"
                    aria-label="Suggested questions"
                    initial={{ opacity: 0, transform: 'translateY(8px)' }}
                    animate={{
                      opacity: 1,
                      transform: 'translateY(0px)',
                      transition: { ...settle, delay: 0.5 },
                    }}
                    exit={{
                      opacity: 0,
                      transform: 'translateY(6px)',
                      transition: { duration: 0.12 },
                    }}
                  >
                    {followUps.map((q) => (
                      <li key={q}>
                        <button type="button" onClick={() => send(q)}>
                          {q}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              <Composer
                controls={composerRef}
                fieldRef={textareaRef}
                busy={Boolean(pending)}
                onSend={onSend}
                onDraftChange={setHasDraft}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { memo, useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { ArrowUp, AudioLines } from 'lucide-react'
import memoji from '../assets/memoji-assistant.webp'
import { TAIL_PATH } from './messageTail'
import { usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import './AssistantTile.css'

// The chat's own first suggestions, each with a short version of the answer.
// Non-breaking spaces keep a sentence from starting at the end of a line.
// The last one is where the preview comes to rest, so it's the one a
// recruiter most needs to see.
const EXCHANGES = [
  {
    q: 'What is Centient?',
    a: 'It pays people in USDC to rank AI answers. It\u00a0won a $5,000 grant.',
  },
  {
    q: 'What research has he published?',
    a: 'Two IEEE papers: a RAG chatbot for AFib guidelines, and kidney\u00a0CT segmentation.',
  },
  {
    q: 'What does he build with?',
    a: 'PyTorch for the models. Next.js, TypeScript, and PostgreSQL for the product around them.',
  },
  {
    q: 'Is Carl open to work?',
    a: 'Yes: full-time, freelance, or research. AI/ML\u00a0first, full-stack too.',
  },
]

// Beats, in ms. A reply is held long enough to read it.
const BEAT = {
  start: 700, // after the tile has risen in
  key: 36, // per character typed into the field
  aim: 420, // typed, before it sends
  think: 480, // sent, before the dots
  dots: 1250, // dots, before the reply
  read: 1900, // hold on a reply, plus `perChar` for each character in it
  perChar: 24,
}

// Exchanges kept above the current one; older ones are long clipped.
const KEEP = 3

// Critically damped, as in the chat: quick, settled, no overshoot.
const settle = { type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }
const morph = { type: 'spring', stiffness: 380, damping: 36 }

function Tail({ side, layout = false }) {
  return (
    <motion.svg layout={layout} className="as-tail" viewBox="0 0 20 17" aria-hidden="true">
      <path d={TAIL_PATH[side]} />
    </motion.svg>
  )
}

// Fades are CSS (see .as-row): a Framer opacity fade hands off from its Web
// Animation to the inline style at the end, and that seam can drop a frame.

// What the visitor "sends": it rises out of the field into the thread.
const Question = memo(function Question({ text, still }) {
  return (
    <motion.span
      layout="position"
      className="as-row is-q"
      initial={still ? false : { y: 34, scale: 0.9 }}
      animate={{ y: 0, scale: 1 }}
      transition={settle}
      style={{ originX: 1, originY: 1 }}
    >
      <span className="as-bubble is-q">
        {text}
        <Tail side="right" />
      </span>
    </motion.span>
  )
})

// Three dots that grow into the reply, the way Messages hands one to the other.
const Reply = memo(function Reply({ text, typing, still }) {
  return (
    <motion.span
      layout="position"
      className="as-row is-a"
      initial={still ? false : { scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={settle}
      style={{ originX: 0, originY: 1 }}
    >
      <motion.span
        layout={!still}
        transition={morph}
        className={`as-bubble is-a${typing ? ' is-typing' : ''}`}
        style={{ borderRadius: 18 }}
      >
        {typing ? (
          <span className="as-dots">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <motion.span layout={!still} transition={morph} className="as-text">
            {text}
          </motion.span>
        )}
        {!typing && <Tail side="left" layout={!still} />}
      </motion.span>
    </motion.span>
  )
})

// The compose field types each question out by itself, so the thread above it
// doesn't re-render (and re-measure) once per character.
const Field = memo(function Field({ text, paused, onTyped }) {
  const [count, setCount] = useState(0)
  const [typing, setTyping] = useState(text)
  if (text !== typing) {
    setTyping(text)
    setCount(0)
  }

  const done = text !== '' && count >= text.length
  const typedRef = useRef(onTyped)
  useEffect(() => {
    typedRef.current = onTyped
  })

  useEffect(() => {
    if (paused || !text) return
    const timer = done
      ? setTimeout(() => typedRef.current(), BEAT.aim)
      : setTimeout(() => setCount((n) => n + 1), BEAT.key)
    return () => clearTimeout(timer)
  }, [text, count, done, paused])

  const draft = text.slice(0, count)
  return (
    <span className="as-field" data-armed={draft ? '' : undefined}>
      <span className="as-draft">
        {draft ? (
          <>
            {draft}
            <span className="as-caret" />
          </>
        ) : (
          <span className="as-placeholder">Ask anything</span>
        )}
      </span>
      <span className="as-send">
        <AudioLines className="as-send-idle" size={17} strokeWidth={2} />
        <ArrowUp className="as-send-go" size={17} strokeWidth={2.6} />
      </span>
    </span>
  )
})

export default function AssistantTile({ variants, onClick }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const booted = useBooted()
  const [hovered, setHovered] = useState(false)
  // `step` is the exchange being asked; phases run idle → compose → sent →
  // typing → replied, then the next step composes. It plays through once and
  // rests on the last reply.
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState('idle')

  const last = EXCHANGES.length - 1
  const finished = step === last && phase === 'replied'
  const running = booted && inView && pageVisible && !hovered && !reduce && !finished

  useEffect(() => {
    if (!running || phase === 'compose') return
    const next = {
      idle: [BEAT.start, () => setPhase('compose')],
      sent: [BEAT.think, () => setPhase('typing')],
      typing: [BEAT.dots, () => setPhase('replied')],
      replied: [
        BEAT.read + EXCHANGES[step].a.length * BEAT.perChar,
        () => {
          setStep(step + 1)
          setPhase('compose')
        },
      ],
    }[phase]
    const timer = setTimeout(next[1], next[0])
    return () => clearTimeout(timer)
  }, [running, phase, step])

  // Reduced motion shows one finished exchange and nothing moves.
  const shownStep = reduce ? 0 : step
  const shownPhase = reduce ? 'replied' : phase
  const rows = []
  for (let i = Math.max(0, shownStep - KEEP); i <= shownStep; i++) {
    const current = i === shownStep
    if (current && (shownPhase === 'idle' || shownPhase === 'compose')) break
    rows.push(<Question key={`q${i}`} text={EXCHANGES[i].q} still={reduce} />)
    if (current && shownPhase === 'sent') break
    rows.push(
      <Reply
        key={`a${i}`}
        text={EXCHANGES[i].a}
        typing={current && shownPhase === 'typing'}
        still={reduce}
      />,
    )
  }

  return (
    <motion.button
      ref={ref}
      variants={variants}
      type="button"
      className="tile tile-mint"
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <span className="as-head">
        <span className="as-avatar" aria-hidden="true">
          <img src={memoji} alt="" width="288" height="288" draggable="false" />
        </span>
        <span className="as-copy">
          <span className="as-title">Ask my assistant</span>
          <span className="as-sub">It knows my projects, papers, and stack.</span>
        </span>
      </span>

      <span className="as-thread" aria-hidden="true">
        {rows}
      </span>

      <span className="as-compose" aria-hidden="true">
        <Field
          text={!reduce && phase === 'compose' ? EXCHANGES[step].q : ''}
          paused={!running}
          onTyped={() => setPhase('sent')}
        />
      </span>
    </motion.button>
  )
}

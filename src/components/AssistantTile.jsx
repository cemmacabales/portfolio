import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { AudioLines } from 'lucide-react'
import memoji from '../assets/memoji-assistant.webp'
import { usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import './AssistantTile.css'

// "Ask me", the way a new Apple device says hello: one language at a time,
// written in and let go. English first, then Filipino and Arabic (Carl grew
// up in Al Khobar), then around the world. `dir` matters for the Arabic, whose
// stroke has to run right to left; `lang` picks the right glyphs.
const GREETINGS = [
  { text: 'Ask me', lang: 'en' },
  { text: 'Tanungin mo ako', lang: 'fil' },
  { text: 'اسألني', lang: 'ar', dir: 'rtl' },
  { text: '聞いてみて', lang: 'ja' },
  { text: 'Pregúntame', lang: 'es' },
  { text: '물어보세요', lang: 'ko' },
  { text: 'Demande-moi', lang: 'fr' },
  { text: 'मुझसे पूछो', lang: 'hi' },
  { text: 'Frag mich', lang: 'de' },
  { text: '问我吧', lang: 'zh' },
  { text: 'Chiedimi', lang: 'it' },
  { text: 'Pergunte-me', lang: 'pt' },
]

// How long each greeting stays, written in and resting, before the next.
const HOLD = 2600
// The first one waits for the tile to rise in.
const FIRST = 1400

// Light that drifts under the grain. Each glow wanders its own path at its own
// pace (see AssistantTile.css), so the mix never quite repeats.
const GLOWS = ['g1', 'g2', 'g3', 'g4', 'g5']

export default function AssistantTile({ variants, onClick }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3 })
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const booted = useBooted()
  const running = booted && inView && pageVisible && !reduce

  // `shown` is the greeting on screen; `gone` is the one letting go behind it.
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(null)

  useEffect(() => {
    if (!running) return undefined
    const id = setTimeout(
      () => {
        setGone(shown)
        setShown((shown + 1) % GREETINGS.length)
      },
      gone === null && shown === 0 ? FIRST : HOLD,
    )
    return () => clearTimeout(id)
  }, [running, shown, gone])

  // The cursor carries a little light of its own across the tile.
  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const box = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--as-x', `${event.clientX - box.left}px`)
    ref.current.style.setProperty('--as-y', `${event.clientY - box.top}px`)
  }

  return (
    <motion.button
      ref={ref}
      variants={variants}
      type="button"
      className="tile tile-mint"
      data-still={reduce || !booted ? '' : undefined}
      onClick={onClick}
      onPointerMove={onPointerMove}
    >
      <span className="as-sky" aria-hidden="true">
        {GLOWS.map((g) => (
          <span key={g} className={`as-glow is-${g}`} />
        ))}
        <span className="as-glow is-cursor" />
        <span className="as-grain" />
      </span>

      <span className="as-avatar" aria-hidden="true">
        <img src={memoji} alt="" width="288" height="288" draggable="false" />
      </span>

      <span className="visually-hidden">Ask my assistant.</span>
      <span className="as-hello" aria-hidden="true">
        {gone !== null && !reduce && (
          <Greeting key={`out${gone}`} greeting={GREETINGS[gone]} leaving />
        )}
        <Greeting key={`in${shown}`} greeting={GREETINGS[reduce ? 0 : shown]} still={shown === 0 && gone === null} />
      </span>
      <span className="as-sub">It knows me, my work, and what I’m into.</span>

      <span className="as-field" aria-hidden="true">
        <span className="as-placeholder">Ask anything</span>
        <span className="as-mic">
          <AudioLines size={17} strokeWidth={2} />
        </span>
      </span>
    </motion.button>
  )
}

// One greeting, stacked in the same cell as the one before it. Arriving, a soft
// edge sweeps across it in reading direction, as if it's being written;
// leaving, it lifts and blurs away.
function Greeting({ greeting, leaving = false, still = false }) {
  const state = leaving ? ' is-leaving' : still ? '' : ' is-arriving'
  return (
    <span className={`as-word${state}`} lang={greeting.lang} dir={greeting.dir}>
      {greeting.text}
    </span>
  )
}

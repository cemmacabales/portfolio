import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  motion, // eslint-disable-line no-unused-vars
  AnimatePresence,
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { Check, ChevronsUpDown, RotateCcw } from 'lucide-react'
import { stack } from '../data/portfolio'
import { usePageVisible } from '../hooks/useCycle'
import Segmented from './Segmented'
import { useBooted } from '../hooks/useBooted'
import './StackTile.css'

const EASE = [0.16, 1, 0.3, 1]
const THUMB_SPRING = { type: 'spring', bounce: 0, duration: 0.45 }
const byName = Object.fromEntries(stack.map((tool) => [tool.name, tool]))
const glyph = (tool) => ({ '--icon': `url("${tool.icon}")`, '--tint': tool.tint || 'var(--ink)' })

/* ── Filter: an iOS segmented control (Segmented.jsx) ──────────── */
const GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'ml', label: 'ML' },
  { id: 'web', label: 'Web' },
  { id: 'infra', label: 'Infra' },
]

/*
 * The Dock's magnification, in two dimensions: each icon grows with how close
 * the cursor is. Rects are all read before any --p is written, so a frame
 * never forces a second style pass. Fine pointers only.
 */
const REACH = 118

function useMagnify(ref, enabled) {
  useEffect(() => {
    const grid = ref.current
    if (!grid || !enabled) return undefined
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined

    const items = [...grid.querySelectorAll('.stack-item')]
    let frame = 0
    let point = null

    const apply = () => {
      frame = 0
      const rects = items.map((el) => el.getBoundingClientRect())
      rects.forEach((r, i) => {
        let p = 0
        if (point) {
          // The glyph sits at the top of the item; measure to its center.
          const d = Math.hypot(point.x - (r.left + r.width / 2), point.y - (r.top + 20))
          const t = Math.max(0, 1 - d / REACH)
          p = t * t * (3 - 2 * t)
        }
        items[i].style.setProperty('--p', p.toFixed(3))
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onMove = (event) => {
      point = { x: event.clientX, y: event.clientY }
      schedule()
    }
    const onLeave = () => {
      point = null
      schedule()
    }

    grid.addEventListener('pointermove', onMove, { passive: true })
    grid.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerleave', onLeave)
      items.forEach((el) => el.style.removeProperty('--p'))
    }
  }, [ref, enabled])
}

/*
 * On first view, each icon's brand color washes across the grid once, top
 * left to bottom right, so the colors are there to be found on hover. The
 * icons are fully drawn without it; this only tints them for a moment.
 */
function useColorWave(ref, run) {
  const played = useRef(false)

  useEffect(() => {
    const grid = ref.current
    if (!grid || !run || played.current) return
    played.current = true
    const origin = grid.getBoundingClientRect()
    grid.querySelectorAll('.stack-glyph').forEach((el) => {
      const r = el.getBoundingClientRect()
      const delay = 120 + ((r.left - origin.left) * 0.8 + (r.top - origin.top) * 1.1) * 0.9
      const timing = { duration: 1200, delay, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' }
      el.animate(
        [
          { transform: 'none' },
          { transform: 'translateY(-4px) scale(1.14)', offset: 0.32 },
          { transform: 'none' },
        ],
        timing
      )
      el.firstElementChild.animate([{ opacity: 0 }, { opacity: 1, offset: 0.32 }, { opacity: 0 }], timing)
    })
  }, [ref, run])
}

function ToolGrid({ filter }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const booted = useBooted()
  const seen = useInView(ref, { once: true, amount: 0.5 })
  useMagnify(ref, !reduce)
  useColorWave(ref, seen && booted && !reduce)

  const picked = GROUPS.find((g) => g.id === filter)
  const matches = stack.filter((tool) => tool.group === filter)

  return (
    <>
      <ul ref={ref} className={`tile-body stack-grid${filter === 'all' ? '' : ' is-filtered'}`}>
        {stack.map((tool, i) => (
          <li
            key={tool.name}
            className={`stack-item${tool.group === filter ? ' is-match' : ''}`}
            style={{ '--k': i }}
          >
            <span className="stack-glyph" aria-hidden="true" style={glyph(tool)}>
              <span className="stack-tint" />
            </span>
            <span className="stack-name">{tool.name}</span>
          </li>
        ))}
      </ul>
      <p className="visually-hidden" aria-live="polite">
        {filter === 'all' ? '' : `${picked.label}: ${matches.map((tool) => tool.name).join(', ')}`}
      </p>
    </>
  )
}

/*
 * Pipeline: five tools in the order a project uses them, run like a build.
 * Each step fills its ring, then the rail carries the work to the next one.
 * Tapping a step swaps its tool, and the run picks up again from that step,
 * the way an incremental build only redoes what changed.
 */
const PIPELINE = [
  { step: 'Train', verb: 'Training with', options: ['PyTorch', 'TensorFlow', 'scikit-learn'] },
  { step: 'Serve', verb: 'Serving with', options: ['FastAPI', 'Flask', 'Node.js'] },
  { step: 'Store', verb: 'Storing in', options: ['PostgreSQL', 'Redis', 'Firebase'] },
  { step: 'Ship', verb: 'Shipping with', options: ['Next.js', 'React'] },
  { step: 'Deploy', verb: 'Deploying with', options: ['Docker', 'Git'] },
]

const RING_MS = 720
const LINK_MS = 280
// `at` counts half-steps: 2i while step i runs, 2i + 1 while the rail carries
// its work onward. END means every step is done; -1 means not started.
const END = PIPELINE.length * 2 - 1
// Everything in the status pill besides the words: padding, dot, gap, border.
const STATUS_CHROME = 12 + 7 + 8 + 14 + 2

function statusFor(at, tools) {
  if (at < 0) return 'Ready'
  if (at >= END) return 'Live'
  const i = Math.floor(at / 2)
  return `${PIPELINE[i].verb} ${tools[i]}`
}

function Ring() {
  return (
    <svg className="pipe-ring" viewBox="0 0 56 56" aria-hidden="true">
      <circle className="ring-track" cx="28" cy="28" r="26" />
      <circle className="ring-fill" cx="28" cy="28" r="26" pathLength="1" />
    </svg>
  )
}

function Pipeline() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.6 })
  const booted = useBooted()
  const pageVisible = usePageVisible()
  const reduce = useReducedMotion()
  const [picks, setPicks] = useState(() => PIPELINE.map(() => 0))
  const [at, setAt] = useState(-1)
  // Bumped on every tap, so the step timer restarts with the ring it paces.
  const [stamp, setStamp] = useState(0)
  const [tapped, setTapped] = useState(false)
  const [spins, setSpins] = useState(0)

  const pos = reduce ? END : at
  const tools = PIPELINE.map((stage, i) => stage.options[picks[i]])
  const status = statusFor(pos, tools)

  // The status pill fits its words and springs between sizes, like the Dynamic Island.
  const measureRef = useRef(null)
  const pillWidth = useMotionValue('auto')
  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return undefined
    // The observer reports the width whenever the words change it (or the web
    // font swaps in), after layout and before the frame paints, so it never
    // forces a layout of the page mid-mount. The first report sizes the pill
    // outright; later ones spring to the new width.
    let sized = false
    const observer = new ResizeObserver(() => {
      const width = el.offsetWidth + STATUS_CHROME
      if (sized) animate(pillWidth, width, THUMB_SPRING)
      else pillWidth.set(width)
      sized = true
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [pillWidth])

  // The first run starts itself, once, when the pipeline is in view.
  useEffect(() => {
    if (at === -1 && booted && inView && pageVisible && !reduce) setAt(0)
  }, [at, booted, inView, pageVisible, reduce])

  useEffect(() => {
    if (reduce || at < 0 || at >= END || !pageVisible) return undefined
    const id = setTimeout(() => setAt((a) => a + 1), at % 2 === 0 ? RING_MS : LINK_MS)
    return () => clearTimeout(id)
  }, [at, stamp, reduce, pageVisible])

  const swap = (i) => {
    setPicks((prev) => prev.map((v, j) => (j === i ? (v + 1) % PIPELINE[i].options.length : v)))
    setAt((a) => (a < 0 ? 0 : Math.min(a, i * 2)))
    setStamp((s) => s + 1)
    setTapped(true)
  }

  const rerun = () => {
    setAt(0)
    setStamp((s) => s + 1)
    setSpins((s) => s + 1)
    setTapped(true)
  }

  return (
    <div
      ref={ref}
      className={`pipeline${pos >= END ? ' is-live' : ''}${pos >= 0 && pos < END ? ' is-busy' : ''}`}
    >
      <div className="pipeline-bar">
        <p className="pipeline-title">From model to product</p>
        <motion.p className="pipe-status" aria-hidden="true" style={{ width: pillWidth }}>
          <span ref={measureRef} className="pipe-measure">
            {status}
          </span>
          <span className="pipe-dot" />
          <span className="pipe-status-roll">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={status}
                className="pipe-status-text"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {status}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.p>
        <button type="button" className="pipe-rerun" onClick={rerun} aria-label="Run the pipeline again">
          <motion.span
            className="pipe-rerun-icon"
            animate={{ rotate: spins * -360 }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
          >
            <RotateCcw size={15} strokeWidth={2} />
          </motion.span>
        </button>
      </div>

      <div className="pipeline-track">
        <span className="pipe-rail" aria-hidden="true">
          {PIPELINE.slice(1).map((stage, i) => (
            <span key={stage.step} className={`pipe-fill${pos >= i * 2 + 1 ? ' is-on' : ''}`} style={{ '--i': i }} />
          ))}
        </span>
        <ol className="pipe-nodes">
          {PIPELINE.map((stage, i) => {
            const tool = byName[tools[i]]
            const next = stage.options[(picks[i] + 1) % stage.options.length]
            const state = pos > i * 2 ? 'done' : pos === i * 2 ? 'running' : 'queued'
            return (
              <li key={stage.step}>
                <button
                  type="button"
                  className={`pipe-node is-${state}`}
                  style={{ '--tint': tool.tint || 'var(--ink)' }}
                  onClick={() => swap(i)}
                  aria-label={`${stage.step} with ${tool.name}. Swap to ${next}.`}
                >
                  <span className="pipe-orb" aria-hidden="true">
                    <Ring key={tool.name} />
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={tool.name}
                        className="pipe-glyph"
                        style={glyph(tool)}
                        initial={{ y: 14, opacity: 0, scale: 0.7 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -14, opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.38, ease: EASE }}
                      />
                    </AnimatePresence>
                    <span className="pipe-check">
                      <Check size={10} strokeWidth={3.2} />
                    </span>
                  </span>
                  <span className="pipe-step">{stage.step}</span>
                  <span className="pipe-tool" aria-hidden="true">
                    <span className="pipe-tool-roll">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={tool.name}
                          className="pipe-tool-name"
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: '-100%', opacity: 0 }}
                          transition={{ duration: 0.38, ease: EASE }}
                        >
                          {tool.name}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <ChevronsUpDown className="pipe-swap" size={12} strokeWidth={2} />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Only runs the reader started are announced; the first one starts itself. */}
      <p className="visually-hidden" aria-live="polite">
        {tapped && pos >= END ? `Pipeline finished: ${tools.join(', ')}.` : ''}
      </p>
    </div>
  )
}

/* ── Tools I reach for ───────────────────────────────────────── */
export default function StackTile({ variants }) {
  const [filter, setFilter] = useState('all')

  return (
    <motion.article variants={variants} className="tile tile-stack">
      <div className="tile-head stack-head">
        <h3 className="stack-title">Tools I reach for</h3>
        <Segmented options={GROUPS} value={filter} onChange={setFilter} label="Highlight tools by area" />
      </div>
      <ToolGrid filter={filter} />
      <Pipeline />
    </motion.article>
  )
}

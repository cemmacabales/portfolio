import { useEffect, useState } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion
} from 'framer-motion'
import './ScrollThread.css'

/**
 * ScrollThread — the signature "circuit spine" that ties every section together.
 *
 * A fixed left-gutter thread whose Electric Mint progress draws as you scroll, with a
 * traveling signal (the comet) and section nodes that ignite as their section becomes
 * active. It doubles as ambient navigation: each node scrolls to its section.
 *
 * Desktop (>= 1100px) shows the spine. Narrower viewports fall back to a thin top
 * progress bar. Honors prefers-reduced-motion: the draw still mirrors scroll (like a
 * scrollbar) but the autonomous pulses and the comet's glow loop are stilled.
 */
export default function ScrollThread({ sections, activeSection, onSelect }) {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Smooth the raw scroll value so the comet glides instead of snapping. Under reduced
  // motion we bind to the raw value (no spring easing, no overshoot).
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  })
  const progress = reduceMotion ? scrollYProgress : smoothProgress

  const cometTop = useTransform(progress, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`)

  // Compute where each section sits along the scroll, so a node lands exactly where the
  // comet reaches it. Recomputed on resize and when content height changes.
  const [fractions, setFractions] = useState(() =>
    sections.map((_, i) => (sections.length > 1 ? i / (sections.length - 1) : 0))
  )

  useEffect(() => {
    const measure = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      if (scrollable <= 0) return
      const next = sections.map((s) => {
        const el = document.getElementById(s.id)
        if (!el) return 0
        const center = el.offsetTop + el.offsetHeight / 2
        const frac = (center - doc.clientHeight / 2) / scrollable
        return Math.min(Math.max(frac, 0), 1)
      })
      setFractions(next)
    }

    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    // Re-measure after late-loading assets settle.
    const t = setTimeout(measure, 1200)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
      clearTimeout(t)
    }
  }, [sections])

  return (
    <>
      {/* Top progress bar — the fallback thread on narrow viewports */}
      <motion.div
        className="thread-bar"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <nav className="scroll-thread" aria-label="Page progress">
        <svg
          className="thread-svg"
          viewBox="0 0 4 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            className="thread-track"
            x1="2"
            y1="0"
            x2="2"
            y2="100"
            vectorEffect="non-scaling-stroke"
          />
          <motion.line
            className="thread-progress"
            x1="2"
            y1="0"
            x2="2"
            y2="100"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: progress }}
          />
        </svg>

        {/* Traveling signal */}
        <motion.span
          className={`thread-comet ${reduceMotion ? 'is-static' : ''}`}
          style={{ top: cometTop }}
          aria-hidden="true"
        />

        <ul className="thread-nodes">
          {sections.map((s, i) => (
            <ThreadNode
              key={s.id}
              section={s}
              fraction={fractions[i]}
              progress={progress}
              active={activeSection === s.id}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </nav>
    </>
  )
}

function ThreadNode({ section, fraction, progress, active, onSelect }) {
  // The dot fills with mint right as the comet passes its fraction. Guard against a
  // degenerate input range (the home node sits at fraction ~0) which would yield NaN.
  const end = Math.max(fraction, 0.001)
  const start = Math.max(end - 0.04, 0)
  const fill = useTransform(progress, [start, end], [0.18, 1])

  return (
    <li className="thread-node-slot" style={{ top: `${fraction * 100}%` }}>
      <button
        type="button"
        className={`thread-node ${active ? 'is-active' : ''}`}
        onClick={() => onSelect(section.id)}
        aria-label={`Go to ${section.label}`}
        aria-current={active ? 'true' : undefined}
      >
        <motion.span className="thread-node-dot" style={{ opacity: fill }} />
        <span className="thread-node-ring" aria-hidden="true" />
      </button>
      <span className="thread-node-label">{section.label}</span>
    </li>
  )
}

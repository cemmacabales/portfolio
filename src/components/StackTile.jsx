import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { stack } from '../data/portfolio'
import LivingGradient from './LivingGradient'
import { usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import './StackTile.css'

/*
 * Tools I reach for, as a lens. The tools are faint type on a night sky; a
 * lens shows a bright copy of the same words, and the word it rests on melts
 * into a blob of its brand color with the logo inside, while the sky turns
 * to that color. With a mouse the lens trails the cursor; on a phone it tours
 * by itself, its ring can be dragged, and tapping a word glides it there.
 * Keyboard focus on a word brings the lens to it too.
 *
 * Both copies split every word into letters laid out identically, so the
 * bright one lines up with the faint one under the lens. The faint copy is the
 * real list (buttons, prerendered as text); the bright one is decoration.
 */

// Black and white marks have no tint in the data; these slates still read on
// the night sky.
const UNTINTED = { Flask: '#56707e', 'Next.js': '#5b5b66' }
const TOOLS = stack.map((tool) => ({
  ...tool,
  color: tool.tint || UNTINTED[tool.name] || '#5b5b66',
  where: tool.shipped?.length ? tool.shipped.join(' · ') : 'In the toolbox',
  label: tool.shipped?.length ? `${tool.name}: ${tool.shipped.join(', ')}` : `${tool.name}: in the toolbox`,
  letters: [...tool.name],
}))

// The lens settles on a word when it's this close to its center (× radius)...
const HIT = 0.55
// ...for this long (ms).
const SETTLE = 140
// How long a word keeps the goo filter after it un-morphs, so the letters can
// melt back out of the blob before the text turns crisp again.
const GOO_OFF = 650
// Idle this long, and the lens tours word to word, resting on each.
const IDLE = 3500
const REST = 2600
// Easing per 60fps frame: brisk behind a cursor, slow and calm on the tour.
const FOLLOW = 0.22
const GLIDE = 0.07

function Letters({ letters }) {
  return letters.map((ch, j) => (
    <span key={j} className="lens-l">
      {ch}
    </span>
  ))
}

export default function StackTile({ variants }) {
  const ref = useRef(null)
  const stageRef = useRef(null)
  const dimRef = useRef(null)
  const litRef = useRef(null)
  const ringRef = useRef(null)

  const inView = useInView(ref, { amount: 0.15 })
  const pageVisible = usePageVisible()
  const booted = useBooted()
  const reduce = useReducedMotion()
  const running = inView && pageVisible

  const [current, setCurrent] = useState(-1)
  const [goo, setGoo] = useState([])
  const [touched, setTouched] = useState(false)

  // Everything the frame loop reads and writes lives here, outside React.
  const lens = useRef(null)
  if (!lens.current) {
    lens.current = {
      x: null, y: null, tx: 0, ty: 0, w: 0, h: 0, r: 92,
      centers: [], pointer: null, mode: 'tour', dragging: false, grab: { x: 0, y: 0 },
      lastInput: -Infinity, tourIdx: 0, tourNext: 0,
      candidate: -1, since: 0, current: -1, drawn: '',
    }
  }

  // Word centers, the lens radius, and how far each letter has to slide to
  // reach its word's center. Measured from the faint copy, which never moves,
  // and only on resize and font load, so the loop reads no layout but the
  // stage's own box.
  useEffect(() => {
    const stage = stageRef.current
    const lit = litRef.current
    const st = lens.current

    const measure = () => {
      const sb = stage.getBoundingClientRect()
      const words = [...dimRef.current.querySelectorAll('.lens-word')]
      const reads = words.map((word) => ({
        box: word.getBoundingClientRect(),
        letters: [...word.querySelectorAll('.lens-l')].map((l) => l.getBoundingClientRect()),
      }))
      st.r = parseFloat(getComputedStyle(stage).getPropertyValue('--r')) || 92
      st.w = sb.width
      st.h = sb.height
      st.centers = reads.map(({ box }) => ({
        x: box.left - sb.left + box.width / 2,
        y: box.top - sb.top + box.height / 2,
      }))
      if (st.x === null) {
        st.x = st.tx = sb.width / 2
        st.y = st.ty = sb.height / 2
      }

      const litWords = lit.querySelectorAll('.lens-word')
      reads.forEach(({ box, letters }, i) => {
        const cx = box.left + box.width / 2
        litWords[i].querySelectorAll('.lens-l').forEach((l, j) => {
          const dx = cx - (letters[j].left + letters[j].width / 2)
          l.style.setProperty('--dx', `${dx.toFixed(1)}px`)
          l.style.setProperty('--ld', `${((Math.abs(dx) / box.width) * 0.12).toFixed(3)}s`)
        })
      })
      st.drawn = ''
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    let alive = true
    document.fonts?.ready.then(() => alive && measure())
    return () => {
      alive = false
      observer.disconnect()
    }
  }, [])

  // The frame loop: runs only while the tile is on screen and the tab is shown.
  useEffect(() => {
    if (!running) return undefined
    const st = lens.current
    const stage = stageRef.current
    const lit = litRef.current
    const ring = ringRef.current
    const goos = new Set()

    const morph = (i) => {
      const prev = st.current
      st.current = i
      setCurrent(i)
      if (i >= 0) setGoo((g) => (g.includes(i) ? g : [...g, i]))
      if (prev >= 0) {
        const id = setTimeout(() => {
          goos.delete(id)
          if (st.current !== prev) setGoo((g) => g.filter((k) => k !== prev))
        }, GOO_OFF)
        goos.add(id)
      }
    }

    let raf = 0
    let last = performance.now()
    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(64, now - last)
      last = now
      if (!st.centers.length) return

      if (st.pointer) {
        const sb = stage.getBoundingClientRect()
        st.tx = st.pointer.x - sb.left
        st.ty = st.pointer.y - sb.top
      }

      // Idle for a while: tour word to word, resting long enough to morph.
      const free = st.mode === 'tour' || st.mode === 'rest'
      if (free && booted && !reduce && now - st.lastInput > IDLE && now > st.tourNext) {
        st.tourIdx = (st.tourIdx + 7) % st.centers.length
        st.tx = st.centers[st.tourIdx].x
        st.ty = st.centers[st.tourIdx].y
        st.tourNext = now + REST
      }

      if (st.dragging || reduce) {
        st.x = st.tx
        st.y = st.ty
      } else {
        const k = 1 - Math.pow(1 - (st.pointer ? FOLLOW : GLIDE), dt / (1000 / 60))
        st.x += (st.tx - st.x) * k
        st.y += (st.ty - st.y) * k
      }

      const key = `${st.x.toFixed(1)},${st.y.toFixed(1)},${st.r}`
      if (key !== st.drawn) {
        st.drawn = key
        lit.style.clipPath = `circle(${st.r}px at ${st.x.toFixed(1)}px ${st.y.toFixed(1)}px)`
        ring.style.translate = `${(st.x - st.w / 2).toFixed(1)}px ${(st.y - st.h / 2).toFixed(1)}px`
      }

      // The word under the lens morphs once the lens has settled on it.
      let best = -1
      let bestD = Infinity
      st.centers.forEach((c, i) => {
        const d = Math.hypot(c.x - st.x, c.y - st.y)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      const hit = bestD < st.r * HIT ? best : -1
      if (hit !== st.candidate) {
        st.candidate = hit
        st.since = now
      }
      if (st.candidate !== st.current && now - st.since > (reduce ? 0 : SETTLE)) morph(st.candidate)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      goos.forEach(clearTimeout)
    }
  }, [running, booted, reduce])

  /* ── Input ─────────────────────────────────────────────────── */
  const st = lens.current

  // A mouse: the lens trails the cursor. When it leaves, the lens waits, then tours.
  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    st.pointer = { x: event.clientX, y: event.clientY }
    st.mode = 'pointer'
    st.lastInput = performance.now()
  }
  const onPointerLeave = (event) => {
    if (event.pointerType !== 'mouse') return
    st.pointer = null
    st.mode = 'rest'
    st.lastInput = performance.now()
  }

  // A finger: only the ring takes the drag, so a swipe anywhere else scrolls.
  const toStage = (event) => {
    const sb = stageRef.current.getBoundingClientRect()
    return {
      x: Math.min(Math.max(event.clientX - sb.left, 0), sb.width),
      y: Math.min(Math.max(event.clientY - sb.top, 0), sb.height),
    }
  }
  const onRingDown = (event) => {
    if (event.pointerType === 'mouse') return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The pointer is already gone; the drag simply ends on the next up.
    }
    // Hold the ring where it was taken, so it doesn't jump under the finger.
    const p = toStage(event)
    st.grab = { x: p.x - st.x, y: p.y - st.y }
    st.tx = st.x
    st.ty = st.y
    st.dragging = true
    st.mode = 'drag'
    st.lastInput = performance.now()
    setTouched(true)
  }
  const onRingMove = (event) => {
    if (!st.dragging) return
    const p = toStage(event)
    st.tx = Math.min(Math.max(p.x - st.grab.x, 0), st.w)
    st.ty = Math.min(Math.max(p.y - st.grab.y, 0), st.h)
    st.lastInput = performance.now()
  }
  const onRingUp = () => {
    if (!st.dragging) return
    st.dragging = false
    st.mode = 'rest'
    st.lastInput = performance.now()
  }

  // A tap (or click) on a word glides the lens there.
  const glideTo = (i, mode) => {
    const c = st.centers[i]
    if (!c) return
    st.tx = c.x
    st.ty = c.y
    st.pointer = null
    st.mode = mode
    st.lastInput = performance.now()
  }
  const onWordClick = (i) => {
    glideTo(i, 'rest')
    setTouched(true)
  }
  // The keyboard: focus brings the lens and holds it there until focus moves on.
  const onWordFocus = (event, i) => {
    if (event.currentTarget.matches(':focus-visible')) glideTo(i, 'focus')
  }
  const onWordBlur = () => {
    if (st.mode !== 'focus') return
    st.mode = 'rest'
    st.lastInput = performance.now()
  }

  const tool = TOOLS[current]

  return (
    <motion.article
      ref={ref}
      variants={variants}
      className={`tile tile-stack${touched ? ' is-touched' : ''}`}
      style={tool ? { '--t': tool.color } : undefined}
      data-still={reduce || !booted ? '' : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <LivingGradient className="lens-sky" />

      <svg className="lens-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id="lens-goo" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
      </svg>

      <h3 id="lens-title" className="lens-title">
        Tools I reach for
      </h3>

      <div ref={stageRef} className="lens-stage">
        <ul ref={dimRef} className="lens-field is-dim" aria-labelledby="lens-title">
          {TOOLS.map((t, i) => (
            <li key={t.name} className="lens-item">
              <button
                type="button"
                className={`lens-word${current === i ? ' is-gone' : ''}`}
                aria-label={t.label}
                onClick={() => onWordClick(i)}
                onFocus={(event) => onWordFocus(event, i)}
                onBlur={onWordBlur}
              >
                <span className="lens-goo">
                  <Letters letters={t.letters} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div ref={litRef} className={`lens-field is-lit${current >= 0 ? ' has-morph' : ''}`} aria-hidden="true">
          {TOOLS.map((t, i) => (
            <span key={t.name} className="lens-item">
              <span
                className={`lens-word${current === i ? ' is-morph' : ''}${goo.includes(i) ? ' is-goo' : ''}`}
                style={{ '--c': t.color, '--src': `url("${t.icon}")` }}
              >
                <span className="lens-goo">
                  <Letters letters={t.letters} />
                  <span className="lens-blob" />
                </span>
                <span className="lens-icon" />
              </span>
            </span>
          ))}
        </div>

        <span
          ref={ringRef}
          className="lens-ring"
          aria-hidden="true"
          onPointerDown={onRingDown}
          onPointerMove={onRingMove}
          onPointerUp={onRingUp}
          onPointerCancel={onRingUp}
        />
      </div>

      <span className="lens-pill" aria-hidden="true">
        Drag the lens
      </span>

      <p className="lens-cap" aria-hidden="true">
        <span className="lens-name">{tool ? tool.name : `${TOOLS.length} tools`}</span>
        <span className="lens-where">
          {tool ? (
            tool.where
          ) : (
            <>
              <span className="lens-hint-mouse">Move over a word</span>
              <span className="lens-hint-touch">Tap a word, or drag the lens</span>
            </>
          )}
        </span>
      </p>
    </motion.article>
  )
}

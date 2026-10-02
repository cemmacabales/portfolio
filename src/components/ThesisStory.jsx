import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  motion, // eslint-disable-line no-unused-vars
  animate,
  useInView,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { ArrowUpRight, Check, X } from 'lucide-react'
import { thesis } from '../data/portfolio'
import ThesisScan from './ThesisScan'
import DiceBars from './ThesisDice'
import { CLASS_NAMES, SLICE_CLASSES, fmtDice } from './thesisClasses'
import './ThesisStory.css'

const EASE = [0.16, 1, 0.3, 1]
// A touch of overshoot on the way out of the tile, none on the way back.
const GROW = { type: 'spring', bounce: 0.12, duration: 0.62 }
const SHRINK = { type: 'spring', bounce: 0, duration: 0.48 }

// Useless on the server, where there's nothing to measure before paint.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const lerp = (a, b, t) => a + (b - a) * t
const radius = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0

/*
 * Moves `card` (laid out at its final size) so it covers `from`, a fraction
 * `t` of the way home. The corners are counter-scaled on each axis so they
 * stay round while the card is squashed into the tile's shape. `sheet`, the
 * words inside it, is scaled back the other way so they keep their size,
 * pinned to the card's top-left corner the way an App Store story's are. The
 * card clips them to its own corners, so nothing shows past its edges and
 * the shape never changes when it lands. `lift`, the card's shadow, rides
 * along with it.
 */
function placeCard(card, lift, sheet, from, box, r0, r1, t) {
  const sx = lerp(from.width / box.width, 1, t)
  const sy = lerp(from.height / box.height, 1, t)
  const r = lerp(r0, r1, t)
  for (const el of [card, lift]) {
    el.style.transform = `translate(${lerp(from.left - box.left, 0, t)}px, ${lerp(from.top - box.top, 0, t)}px) scale(${sx}, ${sy})`
    el.style.borderRadius = `${r / sx}px / ${r / sy}px`
  }
  sheet.style.transform = `scale(${1 / sx}, ${1 / sy})`
}

// How much of the tile still shows `t` of the way out: all of it at the
// tile, none by `end`, eased at both ends.
function veil(t, end) {
  const v = Math.min(Math.max(1 - t / end, 0), 1)
  return v * v * (3 - 2 * v)
}

// The tile gives way in two beats, so its words never sit over the story's:
// they go first, then its surface turns into the story's.
const WORDS = 0.25
const SURFACE = 0.55

/*
 * Lays a still copy of the tile over the card at the tile's size, so the card
 * leaves as the tile and lands back as it instead of as a blank sheet. Its
 * scan stays hidden while the stand-in is the one flying.
 */
function dress(ghost, tile, box, withScan) {
  const face = tile.cloneNode(true)
  face.classList.remove('is-open', 'is-lifted')
  face.querySelector('.th-expand')?.classList.remove('is-open')
  face.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
  const scan = face.querySelector('.th-scan-tile')
  if (scan && !withScan) scan.style.visibility = 'hidden'
  face.style.width = `${box.width}px`
  face.style.height = `${box.height}px`
  ghost.replaceChildren(face)
}

// The scan is square in both places, so it flies on a uniform scale. Its
// labels are scaled back from their corners, so they stay the size they are
// on the tile and in the header.
function placeScan(fly, labels, from, box, r0, r1, t) {
  const s = lerp(from.width / box.width, 1, t)
  fly.style.transform = `translate(${lerp(from.left - box.left, 0, t)}px, ${lerp(from.top - box.top, 0, t)}px) scale(${s})`
  fly.style.borderRadius = `${lerp(r0, r1, t) / s}px`
  for (const label of labels) label.style.transform = `scale(${1 / s})`
}

function pin(el, box) {
  Object.assign(el.style, {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  })
}

/* ── The data: 290 scans as an iPhone Storage bar ─────────────── */
function DatasetBar({ root }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6, root })
  const total = thesis.dataset.reduce((sum, part) => sum + part.n, 0)
  const label = thesis.dataset.map((part) => `${part.n} ${part.label.toLowerCase()}`).join(', ')

  return (
    <figure ref={ref} className="th-store" data-run={inView || undefined}>
      <p className="th-store-total">
        <b>{total}</b> CT scans
      </p>
      <div className="th-store-bar" role="img" aria-label={`${total} scans: ${label}.`}>
        {thesis.dataset.map((part, i) => (
          <span key={part.id} className="th-store-seg" data-cls={part.id} style={{ flexGrow: part.n, '--i': i }} />
        ))}
      </div>
      <ul className="th-store-legend" aria-hidden="true">
        {thesis.dataset.map((part) => (
          <li key={part.id}>
            <i className="th-dot" data-cls={part.id} />
            {part.label}
            <b>{part.n}</b>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/* ── The result: the tile's Dice bars, grown when scrolled to ───── */
function StoryDice({ root }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.6, root })
  return (
    <div ref={ref}>
      <DiceBars className="th-dice-story" state={reduce ? 'done' : inView ? 'run' : 'armed'} />
    </div>
  )
}

/* ── Stones: learned and forgotten alone, kept together ────────── */
// Drawn at its real width (1 unit = 1 px), so the labels stay legible on phones.
const CHART = { right: 14, row: 12, gap: 8, group: 30, top: 8 }
const TICKS = [1, 10, 100, 1000]

function describe(lane, run) {
  if (lane === 'alone') {
    return `Fold ${run.fold}, trained alone: first found stones at epoch ${run.first}, peaked at ${run.best.toFixed(
      2
    )} on epoch ${run.peak}, and lost them for good by epoch ${run.gone}.`
  }
  return `Fold ${run.fold}, trained together: first found stones at epoch ${run.first} and kept finding them through epoch 1,000.`
}

function ForgettingChart({ root }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5, root })
  const [active, setActive] = useState(null)
  const [w, setW] = useState(640)
  const { alone, together } = thesis.stones

  useIsoLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setW(Math.round(entry.contentRect.width)))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const left = w < 480 ? 72 : 92
  const plot = w - left - CHART.right
  // Epochs on a log axis, 1 to 1,000: alone, everything happens in the first 40.
  const ex = (epoch) => left + (Math.log10(Math.max(epoch, 1)) / 3) * plot
  const laneH = alone.length * (CHART.row + CHART.gap) - CHART.gap
  const yTogether = CHART.top + laneH + CHART.group
  const axisY = yTogether + laneH + 18
  const height = axisY + 22

  const lanes = [
    { id: 'alone', label: 'Alone', y: CHART.top, runs: alone },
    { id: 'together', label: 'Together', y: yTogether, runs: together },
  ]

  const readout = active
    ? describe(active.lane, active.run)
    : 'Each bar is one cross-validation fold: the epochs where the model could see stones at all.'

  return (
    <figure ref={ref} className="th-forget" data-run={inView || undefined}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="th-forget-svg"
        role="img"
        aria-label="Stone detection by training epoch, on a log scale. Trained alone, all five folds found stones by epoch 11 and lost them by epoch 39. Trained together, all five found them between epochs 26 and 350 and kept them through epoch 1,000."
        onPointerLeave={() => setActive(null)}
      >
        {TICKS.map((tick) => (
          <g key={tick} className="th-tick">
            <line x1={ex(tick)} x2={ex(tick)} y1={CHART.top - 4} y2={axisY - 6} />
            <text x={ex(tick)} y={axisY + 8} textAnchor={tick === 1 ? 'start' : tick === 1000 ? 'end' : 'middle'}>
              {tick === 1 ? 'Epoch 1' : tick.toLocaleString('en-US')}
            </text>
          </g>
        ))}

        {lanes.map((lane) => (
          <g key={lane.id} className={`th-lane th-lane-${lane.id}`}>
            <text className="th-lane-label" x={0} y={lane.y + laneH / 2 + 4}>
              {lane.label}
            </text>
            {lane.runs.map((run, i) => {
              const y = lane.y + i * (CHART.row + CHART.gap)
              const x0 = ex(run.first)
              const x1 = lane.id === 'alone' ? ex(run.gone) : ex(1000)
              const on = active?.lane === lane.id && active.run.fold === run.fold
              return (
                <g
                  key={run.fold}
                  className={`th-run${on ? ' is-on' : ''}`}
                  style={{ '--i': i }}
                  onPointerEnter={() => setActive({ lane: lane.id, run })}
                >
                  <rect className="th-run-hit" x={left} y={y - CHART.gap / 2} width={plot} height={CHART.row + CHART.gap} />
                  {lane.id === 'alone' && (
                    <line className="th-run-zero" x1={x1} x2={ex(1000)} y1={y + CHART.row / 2} y2={y + CHART.row / 2} />
                  )}
                  <rect className="th-run-bar" x={x0} y={y} width={Math.max(x1 - x0, 4)} height={CHART.row} rx={CHART.row / 2} />
                  {lane.id === 'alone' && <circle className="th-run-peak" cx={ex(run.peak)} cy={y + CHART.row / 2} r={3} />}
                </g>
              )
            })}
          </g>
        ))}
      </svg>
      <figcaption className="th-readout" aria-live="polite">
        {readout}
      </figcaption>
    </figure>
  )
}

/* ── Speed: three passes against one, raced in scaled time ─────── */
const RACE_SECONDS = 2.6

function Race({ root }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.6, root })
  const { alone, together, perPass } = thesis.latency
  const t = useMotionValue(reduce ? alone : 0)
  const [finished, setFinished] = useState(reduce)

  useEffect(() => {
    if (!inView || reduce) return undefined
    const controls = animate(t, alone, { duration: RACE_SECONDS, ease: 'linear', onComplete: () => setFinished(true) })
    return () => controls.stop()
  }, [inView, reduce, t, alone])

  const aloneFill = useTransform(t, (v) => Math.min(v, alone) / alone)
  const togetherFill = useTransform(t, (v) => Math.min(v, together) / alone)
  const aloneTime = useTransform(t, (v) => `${Math.min(v, alone).toFixed(2)} s`)
  const togetherTime = useTransform(t, (v) => `${Math.min(v, together).toFixed(2)} s`)
  const togetherDone = useTransform(t, (v) => (v >= together ? 1 : 0))

  return (
    <figure ref={ref} className="th-race">
      <div className="th-race-row">
        <p className="th-race-name">One multi-class pass</p>
        <div className="th-race-track">
          <motion.span className="th-race-fill th-race-together" style={{ scaleX: togetherFill }} />
        </div>
        <p className="th-race-time">
          <motion.span>{togetherTime}</motion.span>
          <motion.span className="th-race-check" style={{ opacity: togetherDone, scale: togetherDone }}>
            <Check size={13} strokeWidth={3} aria-hidden="true" />
          </motion.span>
        </p>
      </div>
      <div className="th-race-row">
        <p className="th-race-name">Three single-class passes</p>
        <div className="th-race-track th-race-split" style={{ '--split': perPass / alone }}>
          <motion.span className="th-race-fill th-race-alone" style={{ scaleX: aloneFill }} />
        </div>
        <p className="th-race-time">
          <motion.span>{aloneTime}</motion.span>
        </p>
      </div>
      <figcaption className="th-race-cap">
        <span className={`th-race-verdict${finished ? ' is-shown' : ''}`}>
          {Math.round((1 - together / alone) * 1000) / 10}% less time.
        </span>{' '}
        Per CT volume on the A100, about {perPass} s for each single-class model. At 100 scans a day, that’s about 8
        minutes instead of 21.
      </figcaption>
    </figure>
  )
}

function Section({ root, title, lede, children, className = '' }) {
  return (
    <motion.section
      className={`th-sec ${className}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, root }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h3 className="th-sec-title">
        {title} <span>{lede}</span>
      </h3>
      {children}
    </motion.section>
  )
}

/*
 * The full story, App Store Today style. The card grows out of the tile
 * wearing the tile's face, which gives way to the story's as it goes, while a
 * stand-in of the scan flies from the tile into the header. Closing runs it
 * backward, so the card lands as the tile.
 */
export default function ThesisStory({ onClose, getOrigin, returnFocus }) {
  const reduce = useReducedMotion()
  const [isPresent, safeToRemove] = usePresence()
  const storyRef = useRef(null)
  const panelRef = useRef(null)
  const liftRef = useRef(null)
  const cardRef = useRef(null)
  const sheetRef = useRef(null)
  const scrollRef = useRef(null)
  const ghostRef = useRef(null)
  const slotRef = useRef(null)
  const flyRef = useRef(null)
  const sliceRef = useRef(null)
  const legendRef = useRef(null)
  const closeRef = useRef(null)
  // The header's own scan shows once the stand-in has landed on it. The
  // article below waits for that too: it's off screen until then, and
  // building it on the click would hold up the flight's first frames.
  const [landed, setLanded] = useState(reduce)
  const [show, setShow] = useState({ kidney: true, tumor: true })
  const [opacity, setOpacity] = useState(100)
  const [raw, setRaw] = useState(false)

  // The flight in progress, and how far along it is (0 = tile, 1 = sheet).
  const flight = useRef(null)
  const progress = useRef(0)
  // The open waits a frame or two to start; see below.
  const start = useRef(0)

  /*
   * Everything a flight needs, measured with this file's own transforms taken
   * off first: StrictMode runs the open effect twice, and a close can start
   * while the open is still in the air.
   */
  const measure = useCallback(() => {
    cancelAnimationFrame(start.current)
    flight.current?.stop()
    const card = cardRef.current
    const slot = slotRef.current
    for (const el of [card, liftRef.current]) {
      el.style.transform = ''
      el.style.borderRadius = ''
    }
    sheetRef.current.style.transform = ''
    const { tile, scan } = getOrigin()
    return {
      tile,
      from: tile?.getBoundingClientRect(),
      fromScan: scan?.getBoundingClientRect(),
      // The tile's scan wears its legend once the sweep is done; so does the stand-in, until it leaves.
      legend: Boolean(scan?.querySelector('.th-hud-legend.is-shown')),
      cardBox: card.getBoundingClientRect(),
      slotBox: slot.getBoundingClientRect(),
      scrollBox: scrollRef.current.getBoundingClientRect(),
      r0: tile ? radius(tile) : 28,
      r1: radius(panelRef.current),
      s0: radius(scan ?? slot),
      s1: radius(slot),
    }
  }, [getOrigin])

  const place = useCallback((m, t, withScan) => {
    progress.current = t
    placeCard(cardRef.current, liftRef.current, sheetRef.current, m.from, m.cardBox, m.r0, m.r1, t)
    const ghost = ghostRef.current
    ghost.style.opacity = veil(t, SURFACE)
    // Off the page as it stops being the tile, flat again as it lands.
    liftRef.current.style.opacity = 1 - veil(t, SURFACE)
    if (ghost.firstChild) ghost.firstChild.style.opacity = veil(t, WORDS)
    if (withScan) {
      placeScan(flyRef.current, [sliceRef.current, legendRef.current], m.fromScan, m.slotBox, m.s0, m.s1, t)
      legendRef.current.style.opacity = m.legend ? veil(t, WORDS) : 0
    }
  }, [])

  // Open: the card from the tile's box, the scan from the tile's scan.
  useIsoLayoutEffect(() => {
    const m = measure()
    if (reduce || !m.from || !m.fromScan) {
      setLanded(true)
      return undefined
    }
    const fly = flyRef.current
    const ghost = ghostRef.current
    pin(fly, m.slotBox)
    fly.style.visibility = 'visible'
    dress(ghost, m.tile, m.from, false)
    place(m, 0, true)

    // The click's own frame builds and paints the whole sheet. Starting the
    // spring once that frame is out keeps its first steps from being skipped.
    start.current = requestAnimationFrame(() => {
      start.current = requestAnimationFrame(() => {
        flight.current = animate(0, 1, {
          ...GROW,
          onUpdate: (t) => place(m, t, true),
          onComplete: () => {
            measure()
            progress.current = 1
            ghost.replaceChildren()
            setLanded(true)
          },
        })
      })
    })
    return () => {
      cancelAnimationFrame(start.current)
      flight.current?.stop()
    }
    // Measured once, on open.
  }, [])

  // The header's scan takes over in the same frame the stand-in leaves, so
  // there's never a beat with neither on screen.
  useIsoLayoutEffect(() => {
    if (landed) flyRef.current.style.visibility = 'hidden'
  }, [landed])

  // Close: back into the tile, from wherever the open got to and wherever
  // the header has scrolled to.
  useEffect(() => {
    if (isPresent) return undefined
    const from = progress.current
    const m = measure()
    if (reduce || !m.from || !m.fromScan) {
      // No flight, so the sheet fades out along with the backdrop.
      const fade = panelRef.current.animate(
        { opacity: [1, 0] },
        { duration: reduce ? 200 : 0, easing: 'ease', fill: 'forwards' }
      )
      fade.onfinish = safeToRemove
      return () => fade.cancel()
    }
    // Only fly the scan home if the header's scan is mostly on screen.
    const visible = Math.max(0, Math.min(m.slotBox.bottom, m.scrollBox.bottom) - Math.max(m.slotBox.top, m.scrollBox.top))
    const fliesHome = visible > m.slotBox.height * 0.5
    if (fliesHome) {
      const fly = flyRef.current
      pin(fly, m.slotBox)
      fly.style.visibility = 'visible'
      slotRef.current.style.visibility = 'hidden'
    }
    // Otherwise the tile's face brings its own scan home.
    dress(ghostRef.current, m.tile, m.from, !fliesHome)
    place(m, from, fliesHome)

    flight.current = animate(from, 0, {
      ...SHRINK,
      onUpdate: (t) => place(m, t, fliesHome),
      onComplete: safeToRemove,
    })
    return () => flight.current?.stop()
  }, [isPresent, safeToRemove, measure, place, reduce])

  // Modal duties: focus and Escape at once.
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  /*
   * The page behind goes inert and still once the card has landed: marking
   * #root inert restyles the whole page (about 20 ms), which on the click
   * would cost the flight its first frames. Until then, wheel and touch
   * outside the sheet are simply swallowed.
   */
  useEffect(() => {
    const story = storyRef.current
    if (!landed) {
      const swallow = (event) => {
        if (!scrollRef.current?.contains(event.target)) event.preventDefault()
      }
      story.addEventListener('wheel', swallow, { passive: false })
      story.addEventListener('touchmove', swallow, { passive: false })
      return () => {
        story.removeEventListener('wheel', swallow)
        story.removeEventListener('touchmove', swallow)
      }
    }
    const html = document.documentElement
    const root = document.getElementById('root')
    const previous = html.style.overflow
    let locked = false
    // A beat after landing, so it isn't the same frame that builds the article.
    const id = setTimeout(() => {
      html.style.overflow = 'hidden'
      root?.setAttribute('inert', '')
      locked = true
    }, 120)
    return () => {
      clearTimeout(id)
      if (!locked) return
      html.style.overflow = previous
      root?.removeAttribute('inert')
    }
  }, [landed])

  // Declared after the lock above, so on unmount it runs once #root is live again.
  useEffect(() => () => returnFocus?.(), [returnFocus])

  // Press and hold to see the plain scan, the way Photos shows an original.
  const hold = {
    onPointerDown: (event) => {
      if (event.button !== 0) return
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setRaw(true)
    },
    onPointerUp: () => setRaw(false),
    onPointerCancel: () => setRaw(false),
    onLostPointerCapture: () => setRaw(false),
    onContextMenu: (event) => event.preventDefault(),
  }

  const authors = thesis.authors
  const byline = `${authors.slice(0, -1).join(', ')}, and ${authors.at(-1)}`

  return (
    <div
      ref={storyRef}
      className="th-story th-scope"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thesis-story-title"
      // Clicks here would otherwise bubble (through the portal) to the tile.
      onClick={(event) => event.stopPropagation()}
    >
      <motion.div
        className="th-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      />

      <div ref={panelRef} className="th-panel">
        <motion.button
          ref={closeRef}
          type="button"
          className="th-close"
          onClick={onClose}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, delay: reduce ? 0 : 0.4, ease: EASE } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
        >
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
          <span className="visually-hidden">Close the thesis story</span>
        </motion.button>

        <div ref={liftRef} className="th-lift" />
        <div ref={cardRef} className="th-card">
          <div ref={sheetRef} className="th-sheet">
            <div ref={scrollRef} className="th-scroll">
              <div className="th-content">
                <header className="th-hero">
                  <div className="th-hero-copy">
                    <p className="th-hero-meta">{thesis.meta}</p>
                    <h2 id="thesis-story-title" className="th-hero-title">
                      {thesis.headline}
                    </h2>
                    <p className="th-hero-dek">{thesis.title}</p>
                  </div>

                  <div className="th-viewer">
                    <figure className="th-viewer-figure">
                      <ThesisScan
                        ref={slotRef}
                        className={`th-scan-hero${landed ? '' : ' is-waiting'}`}
                        show={show}
                        opacity={opacity / 100}
                        raw={raw}
                        decoding="sync"
                      >
                        <span className="th-hud th-hud-slice" aria-hidden="true">
                          Axial · {thesis.scan.slice}/{thesis.scan.of}
                        </span>
                        <span className={`th-hud th-hud-raw${raw ? ' is-shown' : ''}`} aria-hidden="true">
                          Original scan
                        </span>
                        <span className="th-scan-press" aria-hidden="true" {...hold} />
                      </ThesisScan>
                      <figcaption className="visually-hidden">{thesis.scan.alt}</figcaption>
                    <button
                      type="button"
                      className="th-hold"
                      aria-pressed={raw}
                      {...hold}
                      onKeyDown={(event) => {
                        if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
                          event.preventDefault()
                          setRaw(true)
                        }
                      }}
                      onKeyUp={(event) => {
                        if (event.key === ' ' || event.key === 'Enter') setRaw(false)
                      }}
                      onBlur={() => setRaw(false)}
                    >
                      Hold to compare
                    </button>
                    </figure>

                    <div className="th-controls" role="group" aria-label="Overlay controls">
                      <div className="th-toggles">
                        {SLICE_CLASSES.map((id) => (
                          <button
                            key={id}
                            type="button"
                            className="th-toggle"
                            data-cls={id}
                            aria-pressed={show[id]}
                            onClick={() => setShow((prev) => ({ ...prev, [id]: !prev[id] }))}
                          >
                            <i className="th-dot" data-cls={id} aria-hidden="true" />
                            {CLASS_NAMES[id]}
                          </button>
                        ))}
                      </div>
                      <label className="th-slider">
                        <span>Opacity</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={opacity}
                          onChange={(event) => setOpacity(Number(event.target.value))}
                          style={{ '--fill': `${((opacity - 10) / 90) * 100}%` }}
                        />
                      </label>
                    </div>
                  </div>
                </header>

                <div className="th-byline">
                  <p>
                    By {byline}. Advised by {thesis.adviser}.
                  </p>
                  <div className="th-links">
                    <a className="th-btn" href={thesis.links.code} target="_blank" rel="noopener noreferrer">
                      View the code
                      <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                    <a className="th-btn th-btn-quiet" href={thesis.links.demo} target="_blank" rel="noopener noreferrer">
                      Watch the demo
                      <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </div>
                </div>

                {landed && (
                  <div className="th-article">
                    <Section root={scrollRef} title="The question." lede="One model for every finding, or a specialist for each?">
                      <p>
                        A single kidney CT can show a cyst, a stone, and a tumor at once. Should one model learn to find all
                        three, or should each abnormality get its own? No one had compared the two under the same
                        conditions, so we trained both: three single-class nnU-Net v2 models and one multi-class model, on the
                        same scans with the same settings.
                      </p>
                    </Section>

                    <Section root={scrollRef} title="The data." lede="290 CT scans, labeled voxel by voxel.">
                      <p>
                        Public scans from KiTS23 and MSWAL, plus extra stone and cyst cases to balance the classes, with every
                        label supervised by a radiologist. 121 of them show more than one abnormality, as real patients often
                        do.
                      </p>
                      <DatasetBar root={scrollRef} />
                    </Section>

                    <Section root={scrollRef} title="The result." lede="Training together raised every Dice score.">
                      <StoryDice root={scrollRef} />
                      <ul className="th-findings">
                        {thesis.results.map((row) => (
                          <li key={row.id}>
                            <p className="th-finding-head">
                              <i className="th-dot" data-cls={row.id} aria-hidden="true" />
                              {row.name}
                              <span>
                                {fmtDice(row.alone)} to {fmtDice(row.together)}
                              </span>
                            </p>
                            <p>{row.story}</p>
                          </li>
                        ))}
                      </ul>
                      <p className="th-foot">
                        Dice is the mean over 5-fold cross-validation; the kidney itself scored {thesis.kidney.toFixed(3)}. Per
                        scan, every gain is significant in a one-tailed paired Wilcoxon signed-rank test:{' '}
                        {thesis.significance.map((s, i) => (
                          <Fragment key={s.id}>
                            <span className="th-nowrap">
                              {CLASS_NAMES[s.id].toLowerCase()} p = {s.p[0]} × 10<sup>{s.p[1]}</sup> (n = {s.n})
                            </span>
                            {i < thesis.significance.length - 1 ? ', ' : '.'}
                          </Fragment>
                        ))}
                      </p>
                    </Section>

                    <Section root={scrollRef} title="Stones." lede="Learned, then forgotten, until the kidney joined in.">
                      <p>
                        Stones fill about 1 in 200,000 voxels of a scan. Trained alone, the model picked them up early and then
                        lost them in every fold. Trained with the kidney, it found them later and kept them. The kidney gives
                        the network a large, steady target to learn from, and that anchors the rare classes around it.
                      </p>
                      <ForgettingChart root={scrollRef} />
                    </Section>

                    <Section root={scrollRef} title="Speed." lede="One pass instead of three.">
                      <Race root={scrollRef} />
                    </Section>

                    <Section root={scrollRef} title="Review." lede="Two clinicians checked 15 cases by hand.">
                      <p>
                        They looked at clean wins, borderline cases, and complete misses. Both confirmed that every stone the
                        multi-class model found was in the right place. They also found where it slips: it sometimes calls a
                        cyst a tumor. So it’s built as a second reader, and a radiologist confirms every finding.
                      </p>
                    </Section>

                    <Section root={scrollRef} title="The tool." lede="The model, in a browser.">
                      <p>
                        A Gradio app loads a NIfTI scan, runs the model, and shows axial, coronal, and sagittal views next to
                        a 3D surface. Class toggles and an opacity slider redraw every view without running the model again. The
                        scan at the top of this page works the same way.
                      </p>
                    </Section>

                    <Section root={scrollRef} title="Specs." lede="How it was built." className="th-sec-specs">
                      <dl className="th-specs">
                        {thesis.specs.map((spec) => (
                          <div key={spec.label} className="th-spec">
                            <dt>{spec.label}</dt>
                            <dd>{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </Section>
                  </div>
                )}
              </div>
            </div>
            <div ref={ghostRef} className="th-ghost" aria-hidden="true" inert />
          </div>
        </div>
      </div>

      {/* The scan's stand-in while it flies between the tile and the header,
          wearing the labels of both, so neither end swaps a label in or out. */}
      <div ref={flyRef} className="th-fly" aria-hidden="true">
        <ThesisScan className="th-scan-fly" show={show} opacity={opacity / 100} decoding="sync">
          <span ref={sliceRef} className="th-hud th-hud-slice">
            Axial · {thesis.scan.slice}/{thesis.scan.of}
          </span>
          <span ref={legendRef} className="th-hud th-hud-legend is-shown">
            {SLICE_CLASSES.map((id) => (
              <span key={id} className="th-chip" data-cls={id}>
                <i className="th-dot" data-cls={id} />
                {CLASS_NAMES[id]}
              </span>
            ))}
          </span>
        </ThesisScan>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, animate, useDragControls, useMotionValue, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Plus } from 'lucide-react'
import AboutTile from './AboutTile'
import SocialTile from './SocialTile'
import SetupTile from './SetupTile'
import SetupDesk from './SetupDesk'
import { useBooted } from '../hooks/useBooted'
import posthog from '../posthog'
import './HeroDesk.css'

// Beside each other the tiles can hand over the row; stacked, a sheet opens.
const WIDE = '(min-width: 961px)'
// On a phone the drawing is too small to read, so the sheet is just the list.
const PHONE = '(max-width: 600px), (max-height: 500px)'
const SPRING = { type: 'spring', bounce: 0, duration: 0.85 }
const SHEET = { type: 'spring', bounce: 0, duration: 0.55 }
const whenIdle = (fn) =>
  window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 300)
const cancelIdle = (id) => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id))
const THUMB_GAP = 22
const LABEL_H = 26

// Everything that reads --dp. It doesn't inherit (see HeroDesk.css), so each
// of these gets the value itself, and the rest of the row isn't restyled.
const DRIVEN = [
  '.desk-slot',
  '.tile-setup > *',
  '.setup-panel-frame',
  '.setup-panel-body',
  '.setup-close svg',
  '.desk-stage-move',
  '.desk-more',
  '.gear',
  '.gear-item',
  '.desk-restore',
].join(', ')

// The panel's box: the row, less the thumbnail strip on its left.
function sizePanel(desk) {
  const W = desk.clientWidth
  const gap = parseFloat(getComputedStyle(desk).columnGap) || 20
  const strip = Math.round(Math.min(196, Math.max(132, W * 0.145)))
  const x = strip + gap
  const panel = desk.querySelector('.setup-panel')
  if (panel) {
    panel.style.left = `${x}px`
    panel.style.width = `${W - x}px`
  }
  return { W, strip, x }
}

const THUMBS = [
  { id: 'about', label: 'What I do for fun' },
  { id: 'social', label: 'Socials' },
]

/*
 * The hero's last row: What I do for fun beside Socials over My setup.
 * Opening My setup hands it the whole row, Stage Manager style: the other two
 * shrink into a strip on the left while the tile grows and the camera pulls
 * back from its MacBook to the whole desk. One spring, written as --dp to the
 * elements it moves, drives every part of that through CSS, so it can
 * reverse mid-flight.
 */
export default function HeroDesk({ variants }) {
  const deskRef = useRef(null)
  const toggleRef = useRef(null)
  const closeRef = useRef(null)
  const sceneRef = useRef(null)
  const aboutRef = useRef(null)
  const socialRef = useRef(null)
  const driven = useRef([])
  const progress = useMotionValue(0)
  const reduce = useReducedMotion()
  const booted = useBooted()

  const [mode, setMode] = useState(null) // 'stage' | 'sheet' while open
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const [layout, setLayout] = useState(null)
  const [peek, setPeek] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [warm, setWarm] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const spinTimer = useRef(0)
  const refocus = useRef(false)

  useEffect(() => setMounted(true), [])

  // Build and lay out the desk ahead of time, hidden and paused, while the
  // page is idle, so the + only has to reveal it. Built on the click, it froze
  // the first frame, and its first paint and garbage landed in the spring.
  useEffect(() => {
    if (!booted || warm || mode) return undefined
    const query = window.matchMedia(WIDE)
    let id = null
    const schedule = () => {
      if (!query.matches || id !== null) return
      id = whenIdle(() => setWarm(true))
    }
    schedule()
    query.addEventListener('change', schedule)
    return () => {
      query.removeEventListener('change', schedule)
      if (id !== null) cancelIdle(id)
    }
  }, [booted, warm, mode])

  // The spring writes straight to the elements it moves: no React render per frame.
  const drive = useCallback((value) => {
    const p = value.toFixed(4)
    for (const el of driven.current) el.style.setProperty('--dp', p)
  }, [])

  useEffect(() => progress.on('change', drive), [progress, drive])

  const release = useCallback(() => {
    for (const el of driven.current) el.style.removeProperty('--dp')
    driven.current = []
  }, [])

  // Collect them once the panel and thumbnails exist, and give the new ones
  // the current value before they paint.
  useLayoutEffect(() => {
    if (!shown || !layout) return
    driven.current = [...deskRef.current.querySelectorAll(DRIVEN)]
    drive(progress.get())
  }, [shown, layout, drive, progress])

  const measure = useCallback(() => {
    const desk = deskRef.current
    const setupTile = desk?.querySelector('.desk-setup')
    const about = aboutRef.current
    const social = socialRef.current
    const move = sceneRef.current
    const bigMac = move?.querySelector('.rig-mac')
    const smallMac = setupTile?.querySelector('.rig-mac')
    if (!desk || !setupTile || !about || !social || !move || !bigMac || !smallMac) return null

    // Size the panel first: the drawing inside lays out to it.
    const { W, strip, x: panelX } = sizePanel(desk)
    const H = desk.clientHeight

    // Offsets ignore transforms, so these are the tiles' resting boxes.
    const box = (el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight })
    const tiles = { about: box(about), social: box(social) }
    const tile = box(setupTile)

    // Stage Manager: both tiles shrunk to the strip's width, stacked, centered.
    const thumbW = strip - 10
    const scaled = THUMBS.map(({ id }) => {
      const s = thumbW / tiles[id].w
      return { id, s, h: tiles[id].h * s }
    })
    const total = scaled.reduce((sum, t) => sum + t.h + LABEL_H, 0) + THUMB_GAP * (scaled.length - 1)
    let y = Math.max(0, (H - total) / 2)
    const thumbs = {}
    for (const t of scaled) {
      const from = tiles[t.id]
      // Tiles scale about their left middle (so the tilt reads right), which
      // moves their top edge by half the height they lose.
      const dy = y - from.y - (from.h / 2) * (1 - t.s)
      thumbs[t.id] = { x: 0, y, w: thumbW, h: t.h, s: t.s, dx: -from.x, dy }
      y += t.h + LABEL_H + THUMB_GAP
    }

    // The pull-back: where the desk's MacBook must start so it sits exactly
    // on the tile's MacBook, measured with the drawing at rest.
    const moveRect = move.getBoundingClientRect()
    const big = bigMac.getBoundingClientRect()
    const small = smallMac.getBoundingClientRect()
    const m = small.width / big.width
    const bx = big.left - moveRect.left
    const by = big.top - moveRect.top
    const sx = small.left - moveRect.left
    const sy = small.top - moveRect.top

    return {
      panel: { x: panelX, w: W - panelX, h: H },
      frame: {
        x: tile.x - panelX,
        y: tile.y,
        w: tile.w,
        h: tile.h,
        r: W - (tile.x + tile.w),
        b: H - (tile.y + tile.h),
      },
      dolly: { m, tx: sx - m * bx, ty: sy - m * by },
      thumbs,
    }
  }, [])

  // The + spins once, then the desk opens. The desk is normally built by
  // then; pressed before the page went idle, it gets built under the spin.
  const expand = () => {
    if (open || spinning) return
    if (reduce) {
      start()
      return
    }
    setSpinning(true)
    if (window.matchMedia(WIDE).matches) setWarm(true)
    // In case the spin's animationend never arrives.
    spinTimer.current = setTimeout(spun, 900)
  }

  const spun = () => {
    clearTimeout(spinTimer.current)
    setSpinning(false)
    start()
  }

  useEffect(() => () => clearTimeout(spinTimer.current), [])

  const start = () => {
    if (open) return
    const wide = window.matchMedia(WIDE).matches
    setMode(wide ? 'stage' : 'sheet')
    setOpen(true)
    if (wide) setShown(true)
    posthog.capture('setup_desk_opened', { layout: wide ? 'stage' : 'sheet' })
  }

  const close = useCallback(() => {
    setOpen(false)
    setPeek(null)
    refocus.current = true
  }, [])

  // Focus goes back to the + once the tile is interactive again.
  useEffect(() => {
    if (open || mode || !refocus.current) return undefined
    refocus.current = false
    const frame = requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [open, mode])

  // Waiting: keep the hidden panel at the size it will open to, so opening
  // doesn't lay the whole drawing out again.
  const waiting = warm && !mode
  useLayoutEffect(() => {
    const desk = deskRef.current
    if (!waiting || !desk) return undefined
    sizePanel(desk)
    const observer = new ResizeObserver(() => sizePanel(desk))
    observer.observe(desk)
    return () => observer.disconnect()
  }, [waiting])

  // Stage: once the panel is in the DOM, measure before the first paint.
  useLayoutEffect(() => {
    if (!shown || layout) return
    setLayout(measure())
  }, [shown, layout, measure])

  // Run the spring toward wherever `open` points, from wherever it is now.
  useEffect(() => {
    if (mode !== 'stage' || !layout) return undefined
    let controls = null
    let frame = 0
    const run = () => {
      controls = animate(progress, open ? 1 : 0, reduce ? { duration: 0 } : SPRING)
      if (!open) {
        controls.then(() => {
          release()
          setShown(false)
          setLayout(null)
          setMode(null)
          setWarm(false)
        })
      }
    }
    // From rest, let the panel's first (heavy) paint land before the clock
    // starts, so the spring's opening frames aren't swallowed by it.
    if (open && progress.get() === 0) {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(run)
      })
    } else {
      run()
    }
    return () => {
      cancelAnimationFrame(frame)
      controls?.stop()
    }
  }, [open, layout, mode, progress, reduce, release])

  // Opening: bring the whole row into view and hand focus to the close button.
  useEffect(() => {
    if (mode !== 'stage' || !open || !layout) return
    closeRef.current?.focus({ preventScroll: true })
    const desk = deskRef.current
    const rect = desk.getBoundingClientRect()
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76
    const fits = rect.height <= window.innerHeight - nav - 32
    const above = rect.top < nav + 8
    const below = rect.bottom > window.innerHeight - 8
    if (above || (fits && below)) {
      const top =
        window.scrollY + rect.top - (fits ? Math.max(nav + 16, (window.innerHeight + nav - rect.height) / 2) : nav + 16)
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [mode, open, layout, reduce])

  // While open: Escape closes, a resize re-measures, and crossing the
  // breakpoint closes rather than rearranging mid-flight.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key !== 'Escape' || mode !== 'stage') return
      const focus = document.activeElement
      if (focus === document.body || deskRef.current?.contains(focus)) close()
    }
    const query = window.matchMedia(WIDE)
    const onQuery = () => {
      progress.jump(0)
      release()
      setOpen(false)
      setShown(false)
      setLayout(null)
      setMode(null)
      setWarm(false)
    }
    let frame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (mode === 'stage' && progress.get() === 1) setLayout(measure())
      })
    })
    if (deskRef.current) observer.observe(deskRef.current)
    document.addEventListener('keydown', onKey)
    query.addEventListener('change', onQuery)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('keydown', onKey)
      query.removeEventListener('change', onQuery)
    }
  }, [open, mode, close, measure, progress, release])

  const stage = mode === 'stage' && shown
  const slotStyle = (id) => {
    const t = layout?.thumbs[id]
    return t ? { '--dx': t.dx, '--dy': t.dy, '--s': t.s } : undefined
  }

  const panelStyle = layout
    ? {
        left: layout.panel.x,
        width: layout.panel.w,
        '--pw': layout.panel.w,
        '--ph': layout.panel.h,
        '--fx': layout.frame.x,
        '--fy': layout.frame.y,
        '--fw': layout.frame.w,
        '--fh': layout.frame.h,
        '--fr': layout.frame.r,
        '--fb': layout.frame.b,
        '--m': layout.dolly.m,
        '--tx': layout.dolly.tx,
        '--ty': layout.dolly.ty,
      }
    : undefined

  return (
    <div ref={deskRef} className="hero-desk" data-stage={stage || undefined} data-open={(stage && open) || undefined}>
      <div
        ref={aboutRef}
        className={`desk-slot${peek === 'about' ? ' is-peek' : ''}`}
        style={slotStyle('about')}
        inert={stage}
      >
        <AboutTile variants={variants} />
      </div>

      <div className="hero-stack">
        <div
          ref={socialRef}
          className={`desk-slot${peek === 'social' ? ' is-peek' : ''}`}
          style={slotStyle('social')}
          inert={stage}
        >
          <SocialTile variants={variants} />
        </div>
        <div className="desk-setup" inert={stage}>
          <SetupTile
            variants={variants}
            expanded={open}
            spinning={spinning}
            onExpand={expand}
            onSpun={spun}
            toggleRef={toggleRef}
          />
        </div>
      </div>

      {(stage || waiting) && (
        <>
          <section
            className="setup-panel"
            style={panelStyle}
            data-ready={layout ? '' : undefined}
            aria-labelledby="setup-panel-title"
          >
            <div className="setup-panel-frame">
              <div className="tile-head setup-head">
                <h2 id="setup-panel-title">My setup</h2>
                <button
                  ref={closeRef}
                  type="button"
                  className="setup-toggle setup-close"
                  aria-expanded={open}
                  aria-controls="setup-desk"
                  onClick={close}
                >
                  <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
                  <span className="visually-hidden">Close my desk</span>
                </button>
              </div>
            </div>
            <div className="setup-panel-body">
              <SetupDesk sceneRef={sceneRef} paused={!stage} />
            </div>
          </section>

          {layout &&
            THUMBS.map(({ id, label }) => {
              const t = layout.thumbs[id]
              return (
                <button
                  key={id}
                  type="button"
                  className="desk-restore"
                  style={{ left: t.x, top: t.y, width: t.w, height: t.h + LABEL_H }}
                  onClick={close}
                  onPointerEnter={() => setPeek(id)}
                  onPointerLeave={() => setPeek(null)}
                  onFocus={() => setPeek(id)}
                  onBlur={() => setPeek(null)}
                >
                  <span className="desk-restore-label">{label}</span>
                  <span className="visually-hidden">, bring back the full row</span>
                </button>
              )
            })}
        </>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence onExitComplete={() => setMode((current) => (current === 'sheet' ? null : current))}>
            {open && mode === 'sheet' && <SetupSheet key="sheet" onClose={close} />}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}

/* ── Stacked layouts: the desk comes up as an iOS sheet ─────────── */
function SetupSheet({ onClose }) {
  const drag = useDragControls()
  const closeRef = useRef(null)
  const reduce = useReducedMotion()
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches)

  useEffect(() => {
    const query = window.matchMedia(PHONE)
    const onChange = () => setPhone(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      html.style.overflow = previous
      root?.removeAttribute('inert')
    }
  }, [onClose])

  return (
    <div className="setup-sheet" role="dialog" aria-modal="true" aria-labelledby="setup-sheet-title">
      <motion.div
        className="setup-sheet-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      />
      <motion.div
        className="setup-sheet-card"
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: '100%' }}
        transition={SHEET}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.9 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose()
        }}
      >
        <div className="setup-sheet-grab" onPointerDown={(event) => drag.start(event)}>
          <span className="setup-sheet-handle" aria-hidden="true" />
          <div className="tile-head setup-head">
            <h2 id="setup-sheet-title">My setup</h2>
            <button ref={closeRef} type="button" className="setup-toggle setup-close" onClick={onClose}>
              <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
              <span className="visually-hidden">Close my desk</span>
            </button>
          </div>
        </div>
        <div className="setup-sheet-body">
          <SetupDesk className="desk-sheet" scene={!phone} />
        </div>
      </motion.div>
    </div>
  )
}

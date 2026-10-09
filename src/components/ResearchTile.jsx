import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion, // eslint-disable-line no-unused-vars
  AnimatePresence,
  animate,
  useInView,
  usePresence,
  useReducedMotion,
} from 'framer-motion'
import { ArrowUpRight, Maximize2, X } from 'lucide-react'
import { research } from '../data/portfolio'
import { usePageVisible } from '../hooks/useCycle'
import { canPortal } from '../utils/canPortal'
import GlideLens from './GlideLens'
import './ResearchTile.css'

const EASE = [0.16, 1, 0.3, 1]
const LENS_SPRING = { type: 'spring', bounce: 0, duration: 0.45 }
const CARD_SPRING = { type: 'spring', bounce: 0, duration: 0.7 }
const SHEET_SPRING = { type: 'spring', bounce: 0, duration: 0.55 }
const INTERVAL = 4200
const COUNT = research.length
// How far each certificate behind the front one shows above it, in px.
const PEEK = 14

/*
 * Where a certificate sits in the wallet at a given depth: the front one
 * square and lit, the ones behind it shrunk from the top edge and dimmed so
 * only a strip shows above, the way Wallet stacks passes.
 */
function pose(depth) {
  return { y: -PEEK * depth, scale: 1 - 0.06 * depth }
}

// The day each paper was presented, drawn as the Calendar app icon.
function CalendarIcon({ date }) {
  return (
    <span className="rs-cal" aria-hidden="true">
      <span className="rs-cal-month">{date.month}</span>
      <span className="rs-cal-day">{date.day}</span>
    </span>
  )
}

// Useless on the server, where there's nothing to measure before paint.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// Where the sheet is laid out, ignoring any zoom transform it has mid-flight.
function layoutBox(el) {
  const transform = el.style.transform
  el.style.transform = 'none'
  const box = el.getBoundingClientRect()
  el.style.transform = transform
  return box
}

/*
 * The transform that puts the Quick Look sheet (laid out at `to`) exactly
 * over the certificate in the wallet (`from`), corners included.
 */
function overCard(from, to) {
  const scale = from.width / to.width
  return { x: from.left - to.left, y: from.top - to.top, scale, borderRadius: 14 / scale }
}

/*
 * Quick Look: the certificate lifts out of the wallet and grows to fill the
 * screen, with the paper's full title under it. Esc, the backdrop, or the
 * close button put it back.
 *
 * The zoom is measured by hand rather than with a shared layoutId. A layoutId
 * in the wallet gets remeasured on every render, and under the stack's own
 * transforms Framer reads the tucked certificate's position wrong and
 * "corrects" it with a jump, so it flickered on every hover.
 */
function QuickLook({ item, uid, onClose, getOrigin }) {
  const closeRef = useRef(null)
  const linkRef = useRef(null)
  const sheetRef = useRef(null)
  const reduce = useReducedMotion()
  const [isPresent, safeToRemove] = usePresence()

  // Grow out of the certificate in the wallet.
  useIsoLayoutEffect(() => {
    const sheet = sheetRef.current
    const from = getOrigin()
    if (!sheet || !from || reduce) return
    const start = overCard(from, layoutBox(sheet))
    sheet.style.transform = `translate(${start.x}px, ${start.y}px) scale(${start.scale})`
    sheet.style.borderRadius = `${start.borderRadius}px`
    const controls = animate(
      sheet,
      { x: [start.x, 0], y: [start.y, 0], scale: [start.scale, 1], borderRadius: [start.borderRadius, 16] },
      SHEET_SPRING
    )
    return () => controls.stop()
    // Measured once, on open.
  }, [])

  // And shrink back into it, wherever it sits now, before leaving.
  useEffect(() => {
    if (isPresent) return undefined
    const sheet = sheetRef.current
    const from = getOrigin()
    if (!sheet || !from || reduce) {
      safeToRemove()
      return undefined
    }
    const end = overCard(from, layoutBox(sheet))
    const controls = animate(sheet, end, SHEET_SPRING)
    controls.then(safeToRemove)
    return () => controls.stop()
  }, [isPresent, safeToRemove, getOrigin, reduce])

  useEffect(() => {
    closeRef.current?.focus()
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      // Two controls, so Tab just trades focus between them.
      if (event.key === 'Tab') {
        event.preventDefault()
        const next = document.activeElement === closeRef.current ? linkRef.current : closeRef.current
        next?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      html.style.overflow = previous
    }
  }, [onClose])

  return (
    <div className="rs-ql" role="dialog" aria-modal="true" aria-labelledby={`${uid}-ql-title`}>
      <motion.div
        className="rs-ql-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
      <div className="rs-ql-body">
        <motion.div
          ref={sheetRef}
          className="rs-sheet rs-ql-sheet"
          style={{ borderRadius: 16, transformOrigin: '0 0' }}
          initial={reduce ? { opacity: 0 } : false}
          animate={reduce ? { opacity: 1 } : undefined}
          exit={reduce ? { opacity: 0 } : undefined}
        >
          <img src={item.cert} alt={item.certAlt} draggable="false" />
        </motion.div>

        <motion.div
          className="rs-ql-caption"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.12, ease: EASE } }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
        >
          <p className="rs-ql-event">
            {item.event} · {item.when}
          </p>
          <h4 id={`${uid}-ql-title`} className="rs-ql-title">
            {item.paper}
          </h4>
          <a ref={linkRef} href={item.url} target="_blank" rel="noopener noreferrer" className="rs-ql-read">
            Read the paper
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </motion.div>

        <motion.button
          ref={closeRef}
          type="button"
          className="rs-ql-close"
          aria-label="Close certificate"
          onClick={onClose}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1, ease: EASE } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
        >
          <X size={18} strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  )
}

/* ── Research ────────────────────────────────────────────────── */
/*
 * The papers as an inset list over a Wallet of their certificates. Picking a
 * paper (or letting the tile cycle) brings its certificate forward while the
 * one it replaces drops away and reappears at the back. Clicking the front
 * certificate opens it in Quick Look.
 */
export default function ResearchTile({ variants }) {
  const uid = useId()
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const ref = useRef(null)
  const tabs = useRef([])
  const cards = useRef([])
  const inView = useInView(ref, { amount: 0.4 })
  // Once the tile has come near, the lens can glide (see GlideLens).
  const seen = useInView(ref, { once: true, margin: '120px 0px' })
  const [held, setHeld] = useState(false)
  const [open, setOpen] = useState(null)
  // The certificate out in Quick Look, hidden in the wallet until it's back.
  const [lifted, setLifted] = useState(null)

  const [front, setFront] = useState(0)
  /*
   * The active page dot's fill is the timer: the next paper comes up when its
   * animation ends. Pausing the animation pauses the cycle, so a hover holds
   * the fill where it is and leaving picks up from there instead of resetting.
   */
  const playing = inView && !held && open == null && pageVisible

  // Which certificate just left the front, so only it plays the drop-away.
  const [shuffle, setShuffle] = useState({ front, from: null, n: 0 })
  if (shuffle.front !== front) setShuffle({ front, from: shuffle.front, n: shuffle.n + 1 })

  const select = (index, { focus = false } = {}) => {
    if (index !== front) setFront(index)
    if (focus) tabs.current[index]?.focus()
  }

  const onKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    let next = null
    if (step) next = (front + step + COUNT) % COUNT
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = COUNT - 1
    if (next == null) return
    event.preventDefault()
    select(next, { focus: true })
  }

  const getOrigin = useCallback(() => {
    const index = research.findIndex((item) => item.id === lifted)
    return cards.current[index]?.querySelector('.rs-sheet')?.getBoundingClientRect()
  }, [lifted])

  const close = useCallback(() => {
    const index = research.findIndex((item) => item.id === open)
    setOpen(null)
    // Back to the certificate that opened it, once it's back in the wallet.
    requestAnimationFrame(() => cards.current[index]?.focus({ preventScroll: true }))
  }, [open])

  const tileVariants = variants && {
    ...variants,
    show: {
      ...variants.show,
      transition: { ...variants.show?.transition, delayChildren: 0.18, staggerChildren: 0.07 },
    },
  }
  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
  }
  const walletVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: EASE } },
  }

  const active = research[front]

  return (
    <motion.article
      ref={ref}
      variants={tileVariants}
      className="tile tile-research"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setHeld(false)}
      onFocus={(event) => event.target.matches(':focus-visible') && setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false)
      }}
    >
      <h3 className="tile-head">Research</h3>

      <div className="rs-list" role="tablist" aria-orientation="vertical" aria-label="Papers" onKeyDown={onKeyDown}>
        {research.map((item, i) => {
          const on = front === i
          return (
            <motion.div key={item.id} className={`rs-row${on ? ' is-on' : ''}`} variants={rowVariants}>
              {on && (
                <GlideLens
                  live={seen}
                  layoutId={`${uid}-lens`}
                  className="rs-lens"
                  transition={reduce ? { duration: 0 } : LENS_SPRING}
                />
              )}
              <button
                ref={(el) => {
                  tabs.current[i] = el
                }}
                id={`${uid}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${uid}-wallet`}
                tabIndex={on ? 0 : -1}
                className="rs-pick"
                onClick={() => select(i)}
              >
                <CalendarIcon date={item.date} />
                <span className="rs-text">
                  <span className="rs-title">{item.title}</span>
                  <span className="rs-venue">
                    {item.venue}
                    <span className="visually-hidden">, presented {item.when}</span>
                  </span>
                </span>
              </button>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="row-icon rs-read"
                aria-label={`Read “${item.title}” (opens in a new tab)`}
              >
                <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        id={`${uid}-wallet`}
        className="rs-wallet"
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${front}`}
        variants={walletVariants}
      >
        <div className="rs-deck" style={{ '--peek': `${PEEK * (COUNT - 1)}px` }}>
          {research.map((item, i) => {
            const depth = (i - front + COUNT) % COUNT
            const isFront = depth === 0
            const target = pose(depth)
            const leaving = !reduce && shuffle.from === i && !isFront
            /*
             * The card leaving the front stays on top while it drops a little
             * and fades out over the one coming forward. Once it's gone it goes
             * to the back and rises from behind the new front card into its
             * strip.
             */
            const animate = leaving ? { y: 18, scale: 0.98, opacity: 0 } : { ...target, opacity: 1 }
            const transition = reduce
              ? { duration: 0 }
              : leaving
                ? { duration: 0.3, ease: 'easeOut' }
                : CARD_SPRING

            return (
              <motion.button
                key={item.id}
                ref={(el) => {
                  cards.current[i] = el
                }}
                type="button"
                className={`rs-card${isFront ? ' is-front' : ''}${leaving ? ' is-leaving' : ''}${
                  lifted === item.id ? ' is-lifted' : ''
                }`}
                style={{ zIndex: leaving ? COUNT + 1 : COUNT - depth }}
                initial={false}
                animate={animate}
                transition={transition}
                onAnimationComplete={() => {
                  if (leaving) setShuffle((prev) => ({ ...prev, from: null }))
                }}
                tabIndex={isFront ? 0 : -1}
                aria-hidden={isFront ? undefined : true}
                aria-label={isFront ? `Open the ${item.title} certificate` : undefined}
                onClick={() => {
                  if (!isFront) return select(i)
                  setLifted(item.id)
                  setOpen(item.id)
                }}
              >
                <span className="rs-lift">
                  <span className="rs-sheet">
                    <img src={item.cert} alt="" loading="lazy" decoding="async" draggable="false" />
                    <motion.span
                      className="rs-dim"
                      initial={false}
                      animate={{ opacity: isFront ? 0 : 1 }}
                      transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                    />
                    {isFront && !reduce && shuffle.n > 0 && <span key={shuffle.n} className="rs-sheen" />}
                  </span>
                  <span className="rs-peek-hint" aria-hidden="true">
                    <Maximize2 size={13} strokeWidth={2.2} />
                    <span className="rs-peek-label">Quick Look</span>
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <div className="rs-pager">
          <p className="rs-when">
            {active.when}
          </p>
          <div className="rs-dots" aria-hidden="true">
            {research.map((item, i) => (
              <button
                key={item.id}
                type="button"
                tabIndex={-1}
                className={`rs-dot${front === i ? ' is-on' : ''}`}
                onClick={() => select(i)}
              >
                {front === i && (
                  <span
                    key={front}
                    className="rs-dot-fill"
                    style={{ '--dur': `${INTERVAL}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                    onAnimationEnd={() => setFront((front + 1) % COUNT)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {canPortal &&
        createPortal(
          <AnimatePresence onExitComplete={() => setLifted(null)}>
            {open != null && (
              <QuickLook
                key={open}
                item={research.find((item) => item.id === open)}
                uid={uid}
                onClose={close}
                getOrigin={getOrigin}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.article>
  )
}

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  motion, // eslint-disable-line no-unused-vars
  AnimatePresence,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import { ArrowUpRight, Maximize2, X } from 'lucide-react'
import { research } from '../data/portfolio'
import { useCycle, usePageVisible } from '../hooks/useCycle'
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
  return { y: -PEEK * depth, scale: 1 - 0.06 * depth, zIndex: COUNT - depth }
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

/*
 * Quick Look: the certificate lifts out of the wallet and grows to fill the
 * screen, with the paper's full title under it. Esc, the backdrop, or the
 * close button put it back.
 */
function QuickLook({ item, uid, onClose }) {
  const closeRef = useRef(null)
  const linkRef = useRef(null)

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
          layoutId={`${uid}-sheet-${item.id}`}
          className="rs-sheet rs-ql-sheet"
          style={{ borderRadius: 16 }}
          transition={SHEET_SPRING}
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
 * paper (or letting the tile cycle) deals its certificate to the front; the
 * one it replaces tucks under and comes back up behind. Clicking the front
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
  const [held, setHeld] = useState(false)
  const [open, setOpen] = useState(null)
  const [mounted, setMounted] = useState(false)

  const running = inView && !held && open == null
  const [front, setFront] = useCycle(COUNT, INTERVAL, running)
  const cycling = running && pageVisible && !reduce

  // Which certificate just left the front, so only it plays the tuck-under.
  const [shuffle, setShuffle] = useState({ front, from: null, n: 0 })
  if (shuffle.front !== front) setShuffle({ front, from: shuffle.front, n: shuffle.n + 1 })

  // Restart the pager's fill each time cycling resumes, so it matches the timer.
  const [run, setRun] = useState(0)
  const [wasCycling, setWasCycling] = useState(cycling)
  if (wasCycling !== cycling) {
    setWasCycling(cycling)
    if (cycling) setRun(run + 1)
  }

  // The Quick Look portal only exists in the browser, after hydration.
  useEffect(() => setMounted(true), [])

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
      onFocus={() => setHeld(true)}
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
                <motion.span
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
            const tucking = !reduce && shuffle.from === i && !isFront
            // The card leaving the front dips under the new one, then rises behind it.
            const animate = tucking
              ? { ...target, y: [0, 34, target.y], scale: [1, 0.97, target.scale] }
              : target
            const transition = reduce
              ? { duration: 0 }
              : tucking
                ? { duration: 0.85, ease: EASE, times: [0, 0.42, 1], zIndex: { duration: 0 } }
                : { ...CARD_SPRING, zIndex: { duration: 0 } }

            return (
              <motion.button
                key={item.id}
                ref={(el) => {
                  cards.current[i] = el
                }}
                type="button"
                className={`rs-card${isFront ? ' is-front' : ''}`}
                initial={false}
                animate={animate}
                transition={transition}
                tabIndex={isFront ? 0 : -1}
                aria-hidden={isFront ? undefined : true}
                aria-label={isFront ? `Open the ${item.title} certificate` : undefined}
                onClick={() => (isFront ? setOpen(item.id) : select(i))}
              >
                <span className="rs-lift">
                  {open !== item.id && (
                    <motion.span
                      layoutId={`${uid}-sheet-${item.id}`}
                      className="rs-sheet"
                      style={{ borderRadius: 14 }}
                      transition={SHEET_SPRING}
                    >
                      <img src={item.cert} alt="" loading="lazy" decoding="async" draggable="false" />
                      <motion.span
                        className="rs-dim"
                        initial={false}
                        animate={{ opacity: isFront ? 0 : 1 }}
                        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                      />
                      {isFront && !reduce && shuffle.n > 0 && (
                        <span key={shuffle.n} className="rs-sheen" />
                      )}
                    </motion.span>
                  )}
                  {isFront && open !== item.id && (
                    <span className="rs-peek-hint" aria-hidden="true">
                      <Maximize2 size={13} strokeWidth={2.2} />
                      <span className="rs-peek-label">Quick Look</span>
                    </span>
                  )}
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
                    key={`${front}-${run}`}
                    className={`rs-dot-fill${cycling ? ' is-running' : ''}`}
                    style={{ '--dur': `${INTERVAL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open != null && (
              <QuickLook
                key={open}
                item={research.find((item) => item.id === open)}
                uid={uid}
                onClose={close}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.article>
  )
}

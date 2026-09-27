import { useEffect, useId, useRef, useState } from 'react'
import {
  motion, // eslint-disable-line no-unused-vars
  AnimatePresence,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { education } from '../data/portfolio'
import { usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import './EducationTile.css'

const EASE = [0.16, 1, 0.3, 1]
const CARD_SPRING = { type: 'spring', bounce: 0, duration: 0.6 }
const HIGHLIGHT_SPRING = { type: 'spring', bounce: 0, duration: 0.42 }
const TILT_SPRING = { stiffness: 170, damping: 22, mass: 0.6 }
const DEAL_MS = 460

// Newest first, like the list, with the numbers the tile works from.
const eras = education.map((item) => {
  const [from, to] = item.period.split('–').map(Number)
  return { ...item, from, to, years: to - from }
})
const COUNT = eras.length
const OLDEST = eras[COUNT - 1]
const NEWEST = eras[0]

// Card poses by depth: the front photo square to the viewer, the two behind it
// fanned out to either side so their edges show.
const POSES = [
  { x: '0%', y: '0%', rotate: 0, scale: 1 },
  { x: '-15%', y: '2%', rotate: -7, scale: 0.9 },
  { x: '15%', y: '4%', rotate: 6, scale: 0.84 },
]

// The picked school's photo goes in front; the rest keep newest-first order.
function depthsFor(front) {
  const order = [front, ...eras.map((_, i) => i).filter((i) => i !== front)]
  return eras.map((_, i) => order.indexOf(i))
}

/*
 * The caption under the bar. While the photos are dealt it builds the route
 * one school at a time; on hover it names the stay; at rest it's the whole run.
 * `stage` counts dealt photos: 0 before the first, COUNT + 1 once settled.
 */
function captionFor(shown, stage) {
  if (shown != null) {
    const era = eras[shown]
    return { label: `${era.years} years in ${era.place}`, range: era.period, at: era.to - 0.5 }
  }
  if (stage === 0) return { label: OLDEST.place, range: String(OLDEST.from), at: OLDEST.from }
  if (stage <= COUNT) {
    const latest = eras[COUNT - stage]
    const label = stage === 1 ? OLDEST.place : `${OLDEST.place} to ${latest.place}`
    return { label, range: `${OLDEST.from}–${latest.to}`, at: latest.to }
  }
  return { label: `${OLDEST.place} to ${NEWEST.place}`, range: `${OLDEST.from}–${NEWEST.to}`, at: NEWEST.to }
}

/*
 * Characters roll the way iOS numeric text does: the new value slides in as
 * the old one slides out, up when time goes forward and down when it goes
 * back. At most two copies exist, so a fast sweep across the rows can't pile
 * them up; the outgoing one is dropped when its animation ends.
 */
function Roll({ value, dir, className }) {
  const [roll, setRoll] = useState({ value, prev: null, n: 0 })
  if (roll.value !== value) setRoll({ value, prev: roll.value, n: roll.n + 1 })
  const n = roll.n

  return (
    <span className={`roll ${className}`} style={{ '--dir': dir }}>
      {roll.prev != null && (
        <span
          key={`out-${n}`}
          className="roll-out"
          aria-hidden="true"
          onAnimationEnd={() => setRoll((r) => (r.n === n ? { ...r, prev: null } : r))}
        >
          {roll.prev}
        </span>
      )}
      <span key={`in-${n}`} className={n > 0 ? 'roll-in' : undefined}>
        {value}
      </span>
    </span>
  )
}

// Years change one digit at a time; only the digits that differ roll.
function RollDigits({ value, dir }) {
  return (
    <span className="span-years">
      {[...value].map((char, i) => (
        <Roll key={i} value={char} dir={dir} className="roll-digit" />
      ))}
    </span>
  )
}

/*
 * The Apple TV focus effect: the stack leans toward the pointer and a sheen
 * slides across the front photo. Mouse only; touch and reduced motion get a
 * flat stack.
 */
function useTilt(enabled) {
  const nx = useMotionValue(0)
  const ny = useMotionValue(0)
  const lit = useMotionValue(0)
  const sx = useSpring(nx, TILT_SPRING)
  const sy = useSpring(ny, TILT_SPRING)
  const glow = useSpring(lit, TILT_SPRING)
  const rotateY = useTransform(sx, (v) => v * 11)
  const rotateX = useTransform(sy, (v) => v * -8)
  const gx = useTransform(sx, (v) => `${50 - v * 40}%`)
  const gy = useTransform(sy, (v) => `${35 - v * 40}%`)
  const sheen = useMotionTemplate`radial-gradient(130% 90% at ${gx} ${gy}, oklch(1 0 0 / 0.34), oklch(1 0 0 / 0) 60%)`

  const onPointerMove = (event) => {
    if (!enabled || event.pointerType !== 'mouse') return
    const r = event.currentTarget.getBoundingClientRect()
    const clamp = (v) => Math.max(-1, Math.min(1, v))
    nx.set(clamp((event.clientX - (r.left + r.width / 2)) / (r.width / 2)))
    ny.set(clamp((event.clientY - (r.top + r.height / 2)) / (r.height / 2)))
    lit.set(1)
  }
  const rest = () => {
    nx.set(0)
    ny.set(0)
    lit.set(0)
  }

  return { rotateX, rotateY, sheen, glow, onPointerMove, rest }
}

/* ── Education ───────────────────────────────────────────────── */
export default function EducationTile({ variants }) {
  const ref = useRef(null)
  const hintId = useId()
  const reduce = useReducedMotion()
  const booted = useBooted()
  const pageVisible = usePageVisible()
  const seen = useInView(ref, { once: true, amount: 0.5 })
  const tilt = useTilt(!reduce)

  // What the pointer is over, what keyboard focus is on, and what a tap or
  // click pinned. The first one set wins; none means the tile is at rest.
  const [hovered, setHovered] = useState(null)
  const [focused, setFocused] = useState(null)
  const [picked, setPicked] = useState(null)
  const shown = hovered ?? focused ?? picked

  // On first view the photos are dealt oldest first, each landing as its
  // stretch of the bar draws in.
  const [step, setStep] = useState(0)
  const stage = reduce ? COUNT + 1 : step
  const ready = seen && booted && pageVisible && !reduce
  useEffect(() => {
    if (!ready || step > COUNT) return undefined
    const id = setTimeout(() => setStep((s) => s + 1), step === 0 ? 280 : DEAL_MS)
    return () => clearTimeout(id)
  }, [ready, step])

  const dealt = (i) => stage >= COUNT - i
  const landing = stage >= 1 && stage <= COUNT ? COUNT - stage : null
  const settled = stage > COUNT
  const depths = depthsFor(shown ?? 0)

  const caption = captionFor(shown, stage)
  const [time, setTime] = useState({ at: caption.at, dir: 1 })
  if (time.at !== caption.at) setTime({ at: caption.at, dir: caption.at > time.at ? 1 : -1 })

  const hoverIn = (i) => (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') setHovered(i)
  }

  return (
    <motion.article
      ref={ref}
      variants={variants}
      className="tile tile-education"
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={() => {
        setHovered(null)
        tilt.rest()
      }}
    >
      <h3 className="tile-head">Education</h3>
      <p id={hintId} className="visually-hidden">
        Brings the photo from this school to the front.
      </p>

      <div className="tile-body edu-body">
        <ol className="edu-list">
          {eras.map((era, i) => {
            const on = shown === i
            return (
              <li key={era.school}>
                <button
                  type="button"
                  className={`edu-row${on ? ' is-on' : ''}`}
                  aria-pressed={picked === i}
                  aria-describedby={hintId}
                  onPointerEnter={hoverIn(i)}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(':focus-visible')) setFocused(i)
                  }}
                  onBlur={(event) => {
                    // Moving between rows goes straight to the next photo, not via the rest state.
                    if (!event.relatedTarget?.classList.contains('edu-row')) setFocused(null)
                  }}
                  onClick={() => setPicked((p) => (p === i ? null : i))}
                >
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        layoutId="edu-highlight"
                        className="edu-highlight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.18 } }}
                        transition={reduce ? { duration: 0 } : HIGHLIGHT_SPRING}
                      />
                    )}
                  </AnimatePresence>
                  <motion.img
                    src={era.logo}
                    alt=""
                    className="edu-logo"
                    loading="lazy"
                    initial={false}
                    animate={{ scale: landing === i ? 1.14 : on ? 1.06 : 1 }}
                    transition={reduce ? { duration: 0 } : CARD_SPRING}
                  />
                  <span className="edu-text">
                    <span className="edu-period">{era.period}</span>
                    <span className="edu-school">{era.school}</span>
                    <span className="edu-detail">{era.detail}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="edu-stack-wrap">
          <motion.div
            className="edu-stack"
            style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 900 }}
          >
            {eras.map((era, i) => {
              const depth = depths[i]
              const pose = POSES[depth]
              const lifted = depth === 0 && shown != null
              return (
                <motion.div
                  key={era.school}
                  className="edu-card"
                  style={{ zIndex: COUNT - depth }}
                  initial={false}
                  animate={
                    dealt(i)
                      ? { ...pose, y: lifted ? '-3%' : pose.y, scale: lifted ? 1.03 : pose.scale, opacity: 1 }
                      : { ...pose, y: '-8%', rotate: pose.rotate + 9, scale: 1.2, opacity: 0 }
                  }
                  transition={
                    reduce ? { duration: 0 } : { ...CARD_SPRING, opacity: { duration: 0.22, ease: 'linear' } }
                  }
                  aria-hidden={depth !== 0 || !dealt(i)}
                >
                  <img
                    src={era.photo.src}
                    alt={era.photo.alt}
                    style={{ objectPosition: era.photo.position }}
                    draggable="false"
                    decoding="async"
                  />
                  {depth === 0 && (
                    <motion.span
                      className="edu-sheen"
                      style={{ backgroundImage: tilt.sheen, opacity: tilt.glow }}
                    />
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* The whole run of school as one bar. Hovering a stretch of it picks that school. */}
      <div className={`edu-span${shown != null ? ' is-scrubbing' : ''}`} aria-hidden="true">
        <p className="span-caption">
          <Roll value={caption.label} dir={time.dir} className="span-label" />
          <RollDigits value={caption.range} dir={time.dir} />
        </p>
        <div className="span-bar">
          {[...eras].reverse().map((era, k) => {
            const i = COUNT - 1 - k
            return (
              <motion.span
                key={era.school}
                className={`span-seg span-age-${k}${shown === i ? ' is-on' : ''}`}
                style={{ flexGrow: era.years }}
                onPointerEnter={hoverIn(i)}
                initial={false}
                animate={{ scaleX: dealt(i) ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE }}
              />
            )
          })}
          <motion.span
            className="span-now"
            initial={false}
            animate={settled ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
          />
        </div>
      </div>
    </motion.article>
  )
}

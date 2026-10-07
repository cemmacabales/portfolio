import { useId, useRef, useState } from 'react'
import {
  motion, // eslint-disable-line no-unused-vars
  useReducedMotion,
} from 'framer-motion'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { experience } from '../data/portfolio'
import PetYard from './PetYard'
import './ExperienceTile.css'

const EASE = [0.16, 1, 0.3, 1]
const LENS_SPRING = { type: 'spring', bounce: 0, duration: 0.45 }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY = 86_400_000

const GROUPS = [
  { id: 'roles', label: 'Roles' },
  { id: 'shipped', label: 'Shipped' },
]
// Tab order follows the sidebar: every role, then everything shipped.
const entries = GROUPS.flatMap((group) => experience.filter((entry) => entry.group === group.id))
const COUNT = entries.length

const parts = (iso) => iso.split('-').map(Number)
const monthYear = ([y, m]) => `${MONTHS[m - 1]} ${y}`

function plural(n, unit) {
  return `${n} ${unit}${n === 1 ? '' : 's'}`
}

function spanOfMonths(n) {
  const years = Math.floor(n / 12)
  const months = n % 12
  return [years && plural(years, 'yr'), months && plural(months, 'mo')].filter(Boolean).join(' ')
}

/*
 * Tenure the way a résumé counts it: a finished role counts its months
 * inclusive (Apr to Jun is 3 mos), and a current one counts from its start
 * to today, in weeks until it's two months old.
 */
function tenure(entry, now) {
  const start = parts(entry.start)
  if (entry.end) {
    const end = parts(entry.end)
    return spanOfMonths((end[0] - start[0]) * 12 + (end[1] - start[1]) + 1)
  }
  const days = Math.max(0, Math.floor((now - new Date(start[0], start[1] - 1, start[2] ?? 1)) / DAY))
  if (days < 61) return plural(Math.max(1, Math.round(days / 7)), 'wk')
  return spanOfMonths(Math.round(days / 30.44))
}

// "Apr – Jun 2026" inside one year, "Sep 2026 – Now" for a current role.
function period(entry) {
  if (!entry.start) return entry.date
  const start = parts(entry.start)
  if (!entry.end) return `${monthYear(start)} – Now`
  const end = parts(entry.end)
  return start[0] === end[0]
    ? `${MONTHS[start[1] - 1]} – ${monthYear(end)}`
    : `${monthYear(start)} – ${monthYear(end)}`
}

// Figures in a point are wrapped in **double asterisks** in the data.
function Figures({ text }) {
  return text.split(/\*\*(.+?)\*\*/).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="xp-fig">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

// The company's own mark, or an Apple Contacts-style monogram when it has none.
function Mark({ entry, className }) {
  if (entry.logo) {
    return <img src={entry.logo} alt="" className={`xp-mark ${className}`} draggable="false" loading="lazy" />
  }
  return (
    <span className={`xp-mark xp-mono ${className}`} aria-hidden="true">
      {entry.monogram}
    </span>
  )
}

function Live({ className = '' }) {
  return <span className={`xp-live ${className}`} aria-hidden="true" />
}

/* ── One entry's detail ──────────────────────────────────────── */
// Pieces of the panel rise into place in turn, from below when the pick moved
// down the sidebar and from above when it moved up.
const panelVariants = {
  on: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
  off: { transition: { staggerChildren: 0 } },
}

const pieceVariants = {
  on: (dir) => ({
    opacity: [0, 1],
    y: [14 * dir, 0],
    filter: ['blur(5px)', 'blur(0px)'],
    transition: { duration: 0.55, ease: EASE },
  }),
  off: (dir) => ({
    opacity: 0,
    y: -8 * dir,
    filter: 'blur(4px)',
    transition: { duration: 0.16, ease: 'easeIn' },
  }),
}

function Panel({ entry, on, dir, now, reduce, tabId, panelId, onSee }) {
  const isRole = entry.group === 'roles'
  const current = isRole && !entry.end
  const see = entry.see && entries.find((e) => e.id === entry.see)
  const piece = reduce ? undefined : pieceVariants

  return (
    <motion.div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      className={`xp-panel${on ? ' is-on' : ''}`}
      inert={!on}
      variants={reduce ? undefined : panelVariants}
      initial={false}
      animate={on ? 'on' : 'off'}
      custom={dir}
    >
      <motion.header className="xp-panel-head" variants={piece} custom={dir}>
        <Mark entry={entry} className="xp-mark-lg" />
        <div className="xp-panel-titles">
          <h4 className="xp-title">{entry.title}</h4>
          <p className="xp-org">
            {isRole ? (
              <>
                {entry.name} <span aria-hidden="true">·</span> {entry.kind}
              </>
            ) : (
              entry.tagline
            )}
          </p>
          <p className="xp-when">
            {isRole ? (
              <>
                {period(entry)} <span aria-hidden="true">·</span> {tenure(entry, now)}
              </>
            ) : (
              <>
                {entry.role && (
                  <>
                    {entry.role} <span aria-hidden="true">·</span>{' '}
                  </>
                )}
                {entry.date}
              </>
            )}
          </p>
          {entry.proof && (
            <p className={`xp-badge xp-proof${entry.id === 'centient' ? ' xp-badge-mint' : ''}`}>{entry.proof}</p>
          )}
        </div>
        {current && (
          <span className="xp-badge xp-badge-now">
            <Live />
            Now
          </span>
        )}
      </motion.header>

      <ul className="xp-points">
        {entry.points.map((point) => (
          <motion.li key={point} variants={piece} custom={dir}>
            <Figures text={point} />
          </motion.li>
        ))}
      </ul>

      {(entry.stack || entry.links || see) && (
        <motion.footer className="xp-panel-foot" variants={piece} custom={dir}>
          {entry.stack && (
            <ul className="xp-stack" aria-label="Built with">
              {entry.stack.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          )}
          {(entry.links || see) && (
            <div className="xp-actions">
              {entry.links?.map((link, i) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-sm ${i === 0 ? 'btn-ink' : 'btn-line'}`}
                >
                  {link.label}
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ))}
              {see && (
                <button type="button" className="btn btn-sm btn-line xp-see" onClick={() => onSee(see.id)}>
                  <Mark entry={see} className="xp-mark-xs" />
                  See {see.name}
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </motion.footer>
      )}
    </motion.div>
  )
}

/* ── Experience ──────────────────────────────────────────────── */
/*
 * An iPad-style split view: a sidebar of roles and shipped software on the
 * left, the picked one's detail on the right. The selection is the same
 * glass lens as the nav and the segmented controls, and it glides between
 * rows. Every panel sits in one grid cell, so the tile is always as tall as
 * the longest one and switching never moves the page.
 */
export default function ExperienceTile({ variants }) {
  const uid = useId()
  const reduce = useReducedMotion()
  const tabs = useRef([])
  const [pick, setPick] = useState({ index: 0, dir: 1 })
  // Read once per visit; tenure only has to be right to the week.
  const [now] = useState(() => Date.now())

  const select = (index, { focus = false } = {}) => {
    if (index !== pick.index) setPick({ index, dir: index > pick.index ? 1 : -1 })
    if (focus) tabs.current[index]?.focus()
  }

  const onKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    let next = null
    if (step) next = (pick.index + step + COUNT) % COUNT
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = COUNT - 1
    if (next == null) return
    event.preventDefault()
    select(next, { focus: true })
  }

  // The sidebar rows deal in after the tile itself lands.
  const tileVariants = variants && {
    ...variants,
    show: {
      ...variants.show,
      transition: { ...variants.show?.transition, delayChildren: 0.18, staggerChildren: 0.06 },
    },
  }
  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
  }

  return (
    <motion.article variants={tileVariants} className="tile tile-experience">
      <h3 className="tile-head">Experience</h3>

      <div className="tile-body xp-body">
        <div
          className="xp-side"
          role="tablist"
          aria-orientation="vertical"
          aria-label="Roles and shipped software"
          onKeyDown={onKeyDown}
        >
          {GROUPS.map((group) => (
            <div key={group.id} className="xp-group">
              <p className="xp-group-label" aria-hidden="true">
                {group.label}
              </p>
              {entries.map((entry, i) => {
                if (entry.group !== group.id) return null
                const on = pick.index === i
                return (
                  <motion.button
                    key={entry.id}
                    ref={(el) => {
                      tabs.current[i] = el
                    }}
                    id={`${uid}-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`${uid}-panel-${i}`}
                    tabIndex={on ? 0 : -1}
                    className={`xp-row${on ? ' is-on' : ''}`}
                    variants={rowVariants}
                    onClick={() => select(i)}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${uid}-lens`}
                        className="xp-lens"
                        transition={reduce ? { duration: 0 } : LENS_SPRING}
                      />
                    )}
                    <Mark entry={entry} className="xp-mark-sm" />
                    <span className="xp-row-text">
                      <span className="xp-row-when">
                        {period(entry)}
                        {entry.group === 'roles' && !entry.end && <Live className="xp-live-sm" />}
                      </span>
                      <span className="xp-row-name">{entry.name}</span>
                      <span className="xp-row-sub">{entry.group === 'roles' ? entry.title : entry.proof}</span>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="xp-detail">
          {entries.map((entry, i) => (
            <Panel
              key={entry.id}
              entry={entry}
              on={pick.index === i}
              dir={pick.dir}
              now={now}
              reduce={reduce}
              tabId={`${uid}-tab-${i}`}
              panelId={`${uid}-panel-${i}`}
              onSee={(id) =>
                select(
                  entries.findIndex((e) => e.id === id),
                  { focus: true }
                )
              }
            />
          ))}
        </div>
      </div>

      <PetYard />
    </motion.article>
  )
}

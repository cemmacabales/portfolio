import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { ArrowUpRight } from 'lucide-react'
import { profile } from '../data/portfolio'
import { useGithubActivity } from '../hooks/useGithubActivity'
import './GithubActivity.css'

const fmtNum = new Intl.NumberFormat('en-US')
const fmtDay = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
const fmtLong = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

// Calendar dates are plain days, so they're read and printed in UTC.
const toDate = (day) => new Date(`${day}T00:00:00Z`)
const plural = (n, word) => `${n === 0 ? 'No' : fmtNum.format(n)} ${word}${n === 1 ? '' : 's'}`

function ago(iso) {
  const seconds = (Date.parse(iso) - Date.now()) / 1000
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

// Weeks the entrance sweep runs across; older ones sit off to the left.
const SWEEP_WEEKS = 34

function summarize(days) {
  // Shade by quartiles of the active days, so one huge day doesn't wash out the rest.
  const active = days.map(([, n]) => n).filter((n) => n > 0).sort((a, b) => a - b)
  const q = (p) => active[Math.floor((active.length - 1) * p)] ?? 0
  const [t1, t2, t3] = [q(0.25), q(0.5), q(0.75)]
  const level = (n) => (n === 0 ? 0 : n <= t1 ? 1 : n <= t2 ? 2 : n <= t3 ? 3 : 4)

  const cells = days.map(([day, count], i) => ({
    i,
    day,
    count,
    level: level(count),
    weekday: toDate(day).getUTCDay(),
  }))

  const weeks = []
  for (const cell of cells) {
    if (!weeks.length || cell.weekday === 0) weeks.push({ cells: [] })
    weeks.at(-1).cells.push(cell)
  }
  weeks.forEach((week, w) => {
    const month = toDate(week.cells[0].day).getUTCMonth()
    const prev = weeks[w - 1] && toDate(weeks[w - 1].cells[0].day).getUTCMonth()
    if (w > 0 && month !== prev) week.month = fmtMonth.format(toDate(week.cells[0].day))
  })

  // Today may still be empty; the streak counts back from the last day that isn't.
  let streak = 0
  for (let i = cells.length - (cells.at(-1).count ? 1 : 2); i >= 0 && cells[i].count > 0; i--) streak++

  const busiest = cells.reduce((best, cell) => (cell.count > best.count ? cell : best), cells[0])
  const total = cells.reduce((sum, cell) => sum + cell.count, 0)

  return { cells, weeks, total, streak, busiest, activeDays: active.length }
}

// Placeholder grid while the calendar loads, so nothing shifts when it lands.
const EMPTY_WEEKS = Array.from({ length: 53 }, () => ({
  cells: Array.from({ length: 7 }, (_, weekday) => ({ weekday })),
}))

const Calendar = memo(function Calendar({ weeks, live, label, onActive }) {
  const scroller = useRef(null)
  // Stays on the newest week until the visitor scrolls back through the year.
  const pinned = useRef(true)

  useLayoutEffect(() => {
    const el = scroller.current
    const edges = () => {
      const max = el.scrollWidth - el.clientWidth
      // Data attributes, not classes: React owns className and would wipe these.
      el.dataset.clipStart = el.scrollLeft > 1
      el.dataset.clipEnd = el.scrollLeft < max - 1
    }
    const pin = () => {
      if (pinned.current) el.scrollLeft = el.scrollWidth
      edges()
    }
    const onScroll = () => {
      pinned.current = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
      edges()
    }
    pin()
    const observer = new ResizeObserver(pin)
    observer.observe(el)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', onScroll)
    }
  }, [weeks])

  const last = weeks.length - 1
  const lastDay = weeks[last].cells.at(-1).i

  return (
    <div
      ref={scroller}
      className={`gh-scroll${live ? ' is-live' : ''}`}
      tabIndex={0}
      role="region"
      aria-label="Contribution calendar, scrollable back through the year"
    >
      <p className="visually-hidden">{label}</p>
      <ol
        className="gh-weeks"
        aria-hidden="true"
        onPointerOver={(event) => {
          const i = event.target.dataset?.i
          if (i !== undefined) onActive(Number(i))
        }}
        onPointerLeave={() => onActive(null)}
      >
        {weeks.map((week, w) => {
          const sweep = Math.max(0, SWEEP_WEEKS - (last - w))
          return (
            <li key={week.cells[0].day ?? w} className="gh-week">
              {week.month && <span className="gh-month">{week.month}</span>}
              {week.cells.map((cell) => (
                <span
                  key={cell.weekday}
                  className={`gh-day${cell.day && cell.i === lastDay ? ' is-today' : ''}`}
                  data-i={cell.i}
                  data-l={cell.level}
                  style={{ gridRow: cell.weekday + 1, '--d': `${sweep * 22 + cell.weekday * 12}ms` }}
                />
              ))}
            </li>
          )
        })}
      </ol>
    </div>
  )
})

export default function GithubActivity({ variants }) {
  const { status, data } = useGithubActivity()
  const summary = useMemo(() => (data ? summarize(data.days) : null), [data])
  const [active, setActive] = useState(null)

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  const handle = profile.github.replace(/^https?:\/\//, '')
  const today = summary?.cells.at(-1)
  // GitHub's calendar can end a day behind Manila; only call it today when it is.
  const localDay = new Intl.DateTimeFormat('en-CA', { timeZone: profile.timeZone }).format(new Date())
  const focus = active !== null && summary ? summary.cells[active] : null

  const meta = []
  if (summary) {
    if (data.lastPush) meta.push(`Pushed to ${data.lastPush.repo} ${ago(data.lastPush.at)}`)
    if (summary.streak >= 3) meta.push(`${summary.streak}-day streak`)
    if (!meta.length) meta.push(`Active on ${summary.activeDays} days`)
  }

  const label = summary
    ? `${fmtNum.format(summary.total)} contributions between ${fmtLong.format(
        toDate(summary.cells[0].day)
      )} and ${fmtLong.format(toDate(today.day))}. Busiest day: ${fmtLong.format(
        toDate(summary.busiest.day)
      )}, with ${fmtNum.format(summary.busiest.count)}.`
    : status === 'error'
      ? 'The contribution calendar didn’t load.'
      : 'Loading the contribution calendar.'

  return (
    <motion.article ref={ref} variants={variants} className="tile tile-github">
      <h3 className="tile-head">GitHub activity</h3>

      <div className="tile-body gh-body">
        <div className="gh-summary">
          {status === 'ready' && (
            <>
              <p className="gh-total">
                <span className="gh-num">{fmtNum.format(summary.total)}</span> contributions in the last year
              </p>
              <p className="gh-meta">
                {meta.map((part, i) => (
                  <span key={part}>
                    {i > 0 && ' · '}
                    <span className="gh-fact">{part}</span>
                  </span>
                ))}
              </p>
            </>
          )}
          {status === 'loading' && (
            <>
              <p className="gh-total is-quiet">Counting contributions…</p>
              <p className="gh-meta">&nbsp;</p>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="gh-total">GitHub didn’t answer just now</p>
              <p className="gh-meta">The full calendar is on the profile below.</p>
            </>
          )}
        </div>

        <div className="gh-cal">
          <Calendar
            weeks={summary?.weeks ?? EMPTY_WEEKS}
            live={inView && status === 'ready'}
            label={label}
            onActive={setActive}
          />
          <div className="gh-readout">
            <p className="gh-focus" aria-hidden="true">
              {focus
                ? `${plural(focus.count, 'contribution')} on ${fmtDay.format(toDate(focus.day))}`
                : today
                  ? `${plural(today.count, 'contribution')} ${
                      today.day === localDay ? 'today' : `on ${fmtDay.format(toDate(today.day))}`
                    }`
                  : ' '}
            </p>
            <p className="gh-legend" aria-hidden="true">
              Less
              {[0, 1, 2, 3, 4].map((l) => (
                <i key={l} data-l={l} />
              ))}
              More
            </p>
          </div>
        </div>
      </div>

      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="row-link gh-link">
        <span className="row-text">
          <span className="row-title">Open GitHub profile</span>
          <span className="row-sub">{handle}</span>
        </span>
        <span className="row-icon row-icon-end" aria-hidden="true">
          <ArrowUpRight size={18} strokeWidth={1.8} />
        </span>
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </motion.article>
  )
}

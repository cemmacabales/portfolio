import { commitsByDay, FIRST_DAY, LAST_DAY, milestones } from './buildDays'

const DAY_MS = 24 * 60 * 60 * 1000

// Every date from the first day to the last, as 'YYYY-MM-DD' (UTC, so the
// prerender and the browser count the same days).
function daysBetween(first, last) {
  const start = Date.parse(`${first}T00:00:00Z`)
  const end = Date.parse(`${last}T00:00:00Z`)
  const days = []
  for (let t = start; t <= end; t += DAY_MS) days.push(new Date(t).toISOString().slice(0, 10))
  return days
}

const DAYS = daysBetween(FIRST_DAY, LAST_DAY)
const TOTAL = Object.values(commitsByDay).reduce((sum, n) => sum + n, 0)

/*
 * Deni's git history as a strip of blisters, one a day: a pill on a day
 * something was committed, an empty well on a day off. Blisters, not rings:
 * Apple keeps rings for Activity, and Deni follows that.
 */
export default function BuildLog() {
  return (
    <figure className="buildlog">
      <ol className="buildlog-days" style={{ '--days': DAYS.length }} aria-hidden="true">
        {DAYS.map((day) => (
          <li key={day} className={commitsByDay[day] ? 'has-pill' : undefined}>
            <span className="blister">
              <span className="deni-capsule" />
            </span>
          </li>
        ))}
      </ol>
      <ol className="buildlog-marks" style={{ '--days': DAYS.length }} aria-label="Milestones">
        {Object.entries(milestones).map(([day, label]) => (
          <li key={day} style={{ gridColumnStart: DAYS.indexOf(day) + 1 }}>
            <span className="buildlog-mark">{label}</span>
            <time dateTime={day}>
              {new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </time>
          </li>
        ))}
      </ol>
      <figcaption>
        {TOTAL} commits from October 3 to November 2, one blister a day. The busiest was October 4, with 13.
      </figcaption>
    </figure>
  )
}

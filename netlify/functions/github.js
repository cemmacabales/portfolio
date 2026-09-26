// GitHub activity for the Background bento: the public contribution calendar
// (the same one on the profile page) plus the most recent public push.
//
// The calendar has no public JSON API without a token, so this reads the HTML
// fragment GitHub's own profile page loads. The CDN caches the result for an
// hour, so GitHub sees at most a request an hour per edge.
//
// ESM on purpose: package.json sets "type": "module", and `exports.handler`
// fails every git build on Netlify.

const USER = 'cemmacabales'
const TIMEOUT_MS = 8000

const ghHeaders = {
  'User-Agent': `${USER}-portfolio`,
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

// Returns [[date, count], ...], oldest first.
async function fetchCalendar() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': ghHeaders['User-Agent'] },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`calendar ${res.status}`)
  const html = await res.text()

  // Each day cell has an id; its count lives in the tooltip that points at it.
  const counts = new Map()
  for (const [, id, text] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = text.match(/^([\d,]+) contributions?/)
    counts.set(id, n ? Number(n[1].replace(/,/g, '')) : 0)
  }

  const days = []
  for (const [cell] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const date = cell.match(/data-date="([^"]+)"/)[1]
    const id = cell.match(/\bid="([^"]+)"/)?.[1]
    days.push([date, counts.get(id) ?? 0])
  }
  if (days.length < 7) throw new Error('calendar markup changed')

  return days.sort((a, b) => (a[0] < b[0] ? -1 : 1))
}

async function fetchLastPush() {
  const res = await fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`, {
    headers: { ...ghHeaders, Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`events ${res.status}`)
  const events = await res.json()
  const push = events
    .filter((e) => e.type === 'PushEvent')
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0]
  return push ? { repo: push.repo.name.split('/').pop(), at: push.created_at } : null
}

export const handler = async () => {
  const [calendar, lastPush] = await Promise.allSettled([fetchCalendar(), fetchLastPush()])

  if (calendar.status === 'rejected') {
    console.error('github activity:', calendar.reason)
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'GitHub activity is unavailable right now.' }),
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
    body: JSON.stringify({
      user: USER,
      days: calendar.value,
      lastPush: lastPush.status === 'fulfilled' ? lastPush.value : null,
    }),
  }
}

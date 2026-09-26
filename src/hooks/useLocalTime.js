import { useEffect, useState } from 'react'

export function useLocalTime(timeZone) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Tick on the minute boundary, then every minute.
    let interval = 0
    const timeout = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(now)
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === 'hour').value)
  const minute = Number(parts.find((p) => p.type === 'minute').value)

  return { time, hour, minute }
}

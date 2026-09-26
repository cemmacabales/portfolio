import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}

// Steps an index through `count` items every `interval` ms while `running`.
// It holds still for reduced motion and while the tab is hidden, and a manual
// setIndex restarts the wait, so a picked item gets its full turn.
export function useCycle(count, interval, running = true) {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const active = running && pageVisible && !reduce && count > 1

  useEffect(() => {
    if (!active) return undefined
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), interval)
    return () => clearTimeout(id)
  }, [active, index, count, interval])

  return [index, setIndex]
}

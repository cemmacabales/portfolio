import { startTransition, useCallback, useEffect, useState } from 'react'
import { useSettled } from './useSettled'

/**
 * Whether to load the sections below the hero yet, and a way to ask for them
 * sooner. They load once the page has settled (see useSettled), so neither
 * their download nor their first render competes with the first screen. The
 * render is a transition, so it yields to anything the visitor does.
 */
export function useBelowFold() {
  const settled = useSettled()
  const [wanted, setWanted] = useState(settled)
  const want = useCallback(() => startTransition(() => setWanted(true)), [])

  useEffect(() => {
    if (settled) want()
  }, [settled, want])

  return [wanted, want]
}

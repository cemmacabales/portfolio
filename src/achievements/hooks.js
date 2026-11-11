import { useSyncExternalStore } from 'react'
import { foundCount } from './core'
import { emit, onEvent } from '../events'

const subscribe = (listener) =>
  onEvent((name) => {
    if (name === 'achievements_changed') listener()
  })

/** How many achievements have been found; 0 until the page is in the browser. */
export function useFoundCount() {
  return useSyncExternalStore(subscribe, foundCount, () => 0)
}

/** Opens the list (src/achievements/Achievements.jsx listens). */
export const openTrophies = () => emit('open_trophies')

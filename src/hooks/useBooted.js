import { useSyncExternalStore } from 'react'
import { isBooted, onBoot } from '../boot'

// True once the boot loader lets go of the page (see src/boot.js). Anything
// that moves on its own in the first screen should wait for it, so nothing
// plays unseen under the loader or competes with the hero's entrance.
export function useBooted() {
  return useSyncExternalStore(onBoot, isBooted, isBooted)
}

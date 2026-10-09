import { useEffect, useState, useSyncExternalStore } from 'react'
import { defersBelowFold, isBooted, onBoot } from '../boot'

/*
 * "Settled": the hero's entrance has played and the page has had a quiet
 * moment. Whatever the first screen doesn't need waits for it (the sections
 * below the hero, images that start off screen, the second portrait), so none
 * of it competes with the first screen for the network or the main thread.
 * Heading down the page (a scroll, a key, a tap) settles it at once.
 */

// About when the hero's entrance has played out: HeroBento's last headline
// word lands roughly 1.5s after the boot loader lets go.
const ENTRANCE_MS = 1600

const INTENT = ['scroll', 'wheel', 'touchmove', 'keydown', 'pointerdown']

const listeners = new Set()
// The build-time prerender renders everything in place.
let settled = typeof window === 'undefined'

function settle() {
  if (settled) return
  settled = true
  for (const type of INTENT) window.removeEventListener(type, settle)
  listeners.forEach((listener) => listener())
}

/** Calls `callback` once the hero's entrance has played out. */
export function afterEntrance(callback) {
  let timer = 0
  const wait = () => {
    timer = setTimeout(callback, ENTRANCE_MS)
  }
  let stop = null
  if (isBooted()) wait()
  else {
    stop = onBoot(() => {
      stop()
      wait()
    })
  }
  return () => {
    stop?.()
    clearTimeout(timer)
  }
}

if (!settled) {
  // On a desktop, or opening anywhere but the top of a fresh page, nothing
  // waits (see defersBelowFold).
  if (!defersBelowFold()) settled = true
  else {
    for (const type of INTENT) window.addEventListener(type, settle, { passive: true })
    const whenIdle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1))
    afterEntrance(() => whenIdle(settle, { timeout: 1000 }))
  }
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSettled = () => settled

/** Calls `callback` once, when the page has settled (at once if it has). */
export function whenSettled(callback) {
  if (settled) {
    callback()
    return
  }
  const stop = subscribe(() => {
    stop()
    callback()
  })
}

export function useSettled() {
  return useSyncExternalStore(subscribe, getSettled, getSettled)
}

/** True once the hero's entrance has played out. */
export function useEntranceDone() {
  const [done, setDone] = useState(false)
  useEffect(() => afterEntrance(() => setDone(true)), [])
  return done
}

/**
 * Whether media in `ref` should load yet: at once if it starts near the
 * screen, otherwise once the page has settled.
 */
export function useDeferredMedia(ref) {
  const isSettled = useSettled()
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (isSettled || near) return undefined
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isSettled, near, ref])

  return isSettled || near
}

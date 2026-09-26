import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

// v2 key: the old site wrote 'theme' on every visit, so reusing it would pin
// returning visitors to whatever the previous design last saved.
export const THEME_KEY = 'theme-v2'

const THEME_COLORS = { light: '#ebefed', dark: '#090b0a' }

const flip = (theme) => (theme === 'dark' ? 'light' : 'dark')

function readInitialTheme() {
  const preset = document.documentElement.dataset.theme
  if (preset === 'light' || preset === 'dark') return preset
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be blocked; fall through to the default.
  }
  return 'light'
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Not persisting is fine; the switch still applies for this visit.
  }
}

// Forward uncovers the reveal's theme; backward shrinks it into the button.
function steer({ animation, target, want }) {
  animation?.updatePlaybackRate(want === target ? 1 : -1)
}

export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme)
  // The reveal in flight: `target` is the theme it uncovers, `want` is where
  // the latest click points.
  const reveal = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  // `origin` is the element the reveal grows from (the toggle button).
  const toggleTheme = useCallback((origin) => {
    // A click mid-reveal turns the running circle around. Starting a second
    // transition would skip this one, and the page would snap to the
    // half-revealed theme while the new snapshot is taken.
    const active = reveal.current
    if (active) {
      active.want = flip(active.want)
      saveTheme(active.want)
      steer(active)
      return
    }

    const next = flip(document.documentElement.dataset.theme)
    saveTheme(next)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion || !origin) {
      setTheme(next)
      return
    }

    const rect = origin.getBoundingClientRect()
    const root = document.documentElement.style
    root.setProperty('--vt-x', `${rect.left + rect.width / 2}px`)
    root.setProperty('--vt-y', `${rect.top + rect.height / 2}px`)
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })

    const current = { target: next, want: next, animation: null }
    reveal.current = current
    const settle = () => {
      if (reveal.current !== current) return
      reveal.current = null
      if (current.want !== current.target) flushSync(() => setTheme(current.want))
    }

    transition.ready.then(
      () => {
        current.animation = document
          .getAnimations()
          .find((animation) => animation.effect?.pseudoElement === '::view-transition-new(root)')
        // The finish event fires before that frame paints, so the theme swaps
        // while the circle is still covering it. `finished` lands a frame late.
        current.animation?.addEventListener('finish', settle)
        steer(current)
      },
      // Skipped (hidden tab, say): `finished` still settles it below.
      () => {},
    )
    transition.finished.then(settle, settle)
  }, [])

  return { theme, toggleTheme }
}

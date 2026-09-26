import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

// v2 key: the old site wrote 'theme' on every visit, so reusing it would pin
// returning visitors to whatever the previous design last saved.
export const THEME_KEY = 'theme-v2'

const THEME_COLORS = { light: '#ebefed', dark: '#090b0a' }

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

export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  // `origin` is the element the reveal grows from (the toggle button).
  const toggleTheme = useCallback((origin) => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // Not persisting is fine; the switch still applies for this visit.
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion || !origin) {
      setTheme(next)
      return
    }

    const rect = origin.getBoundingClientRect()
    const root = document.documentElement.style
    root.setProperty('--vt-x', `${rect.left + rect.width / 2}px`)
    root.setProperty('--vt-y', `${rect.top + rect.height / 2}px`)
    document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })
  }, [])

  return { theme, toggleTheme }
}

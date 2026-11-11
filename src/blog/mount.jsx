import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { loadPostHog } from '../posthog.js'
import { startAchievements } from '../achievements/core'

/*
 * Starts a blog page. The build prerenders each one into #root
 * (scripts/prerender.js), so the reader sees the post before any script runs
 * and React hydrates that markup in place. In dev there is no prerender, so
 * it renders from scratch.
 */
export function mountBlogPage(element) {
  startAchievements()
  const container = document.getElementById('root')
  const app = <StrictMode>{element}</StrictMode>
  if (container.hasChildNodes()) hydrateRoot(container, app)
  else createRoot(container).render(app)

  // Analytics waits for a quiet moment after the page has loaded.
  const whenIdle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1))
  const start = () => whenIdle(loadPostHog, { timeout: 3000 })
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter/opsz.css'
import './index.css'
import App from './App.jsx'
import { loadPostHog } from './posthog.js'
import { startBoot, isBooted, onBoot } from './boot'

startBoot()

// Analytics waits until the hero's entrance has played (about 1.5s from the
// loader letting go, see HeroBento) and the browser has a quiet moment, so
// setting up PostHog never costs the entrance a frame.
const ENTRANCE_MS = 1600
const whenIdle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1))
const startAnalytics = () => setTimeout(() => whenIdle(loadPostHog, { timeout: 3000 }), ENTRANCE_MS)
if (isBooted()) startAnalytics()
else {
  const stop = onBoot(() => {
    stop()
    startAnalytics()
  })
}

// The stylesheets load without blocking the first paint (async-css in
// vite.config.js). Hold the first render until they apply, so nothing mounts
// and measures itself unstyled. The cap is insurance against a load event
// that never comes; in dev there are no such links and this resolves at once.
function stylesReady() {
  const links = [...document.querySelectorAll('link[data-app-css]')]
  const applied = links.map(
    (link) =>
      new Promise((resolve) => {
        const check = () => link.sheet && resolve()
        link.addEventListener('load', check)
        link.addEventListener('error', resolve)
        check()
      }),
  )
  return Promise.race([Promise.all(applied), new Promise((resolve) => setTimeout(resolve, 3000))])
}

stylesReady().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

import { StrictMode, startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter/opsz.css'
import './index.css'
import App from './App.jsx'
import { loadPostHog } from './posthog.js'
import { startBoot } from './boot'
import { afterEntrance, whenSettled } from './hooks/useSettled'

startBoot()

// Analytics waits until the hero's entrance has played and the page has
// settled (see useSettled), then for a quiet moment after the sections below
// the hero have rendered, so setting up PostHog never costs the first screen
// a frame.
const whenIdle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1))
afterEntrance(() => whenSettled(() => whenIdle(loadPostHog, { timeout: 3000 })))

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

// The first render is a transition, so React builds the page in short slices
// (the boot loader keeps animating between them) and only the commit runs in
// one go.
stylesReady().then(() => {
  const root = createRoot(document.getElementById('root'))
  startTransition(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
})

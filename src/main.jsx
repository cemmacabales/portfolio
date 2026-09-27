import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter/opsz.css'
import './index.css'
import App from './App.jsx'
import { loadPostHog } from './posthog.js'
import { startBoot, isBooted, onBoot } from './boot'

startBoot()

// Analytics waits until the hero is up and the browser has a quiet moment.
const whenIdle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1))
const startAnalytics = () => whenIdle(loadPostHog, { timeout: 3000 })
if (isBooted()) startAnalytics()
else {
  const stop = onBoot(() => {
    stop()
    startAnalytics()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

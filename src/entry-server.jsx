import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import BelowFold from './components/BelowFold.jsx'

/*
 * Build-time render for scripts/prerender.js. The HTML it returns goes into
 * #root in dist/index.html, so crawlers that don't run JavaScript (GPTBot,
 * ClaudeBot, PerplexityBot) read the real page instead of the boot loader.
 * main.jsx still uses createRoot, which clears this markup on its first
 * commit and renders fresh: nothing hydrates, so it can never mismatch.
 * The sections below the hero load lazily in the browser; here they're
 * imported directly so the markup has them in full.
 */
export function render() {
  return renderToString(<App belowFold={BelowFold} />)
}

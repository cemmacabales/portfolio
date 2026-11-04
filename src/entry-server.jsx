import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import BelowFold from './components/BelowFold.jsx'
import BlogIndex from './blog/pages/BlogIndex.jsx'
import DeniPost from './blog/posts/deni/DeniPost.jsx'
import ThesisPost from './blog/posts/thesis/ThesisPost.jsx'
import CentientPost from './blog/posts/centient/CentientPost.jsx'

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

/*
 * The blog's pages. Unlike the home, their markup is the page: it shows at
 * once, and src/blog/mount.jsx hydrates it in place.
 */
export const blogPages = {
  'blog/index.html': () => renderToString(<BlogIndex />),
  'blog/deni/index.html': () => renderToString(<DeniPost />),
  'blog/thesis/index.html': () => renderToString(<ThesisPost />),
  'blog/centient/index.html': () => renderToString(<CentientPost />),
}

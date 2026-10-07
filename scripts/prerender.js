import { readFile, rm, writeFile } from 'node:fs/promises'
import process from 'node:process'

/*
 * Runs after both builds (see "build" in package.json). It renders the app
 * once and writes the markup into #root in dist/index.html, so the page that
 * GPTBot, ClaudeBot, PerplexityBot and friends download has the real content
 * instead of an empty root under the boot loader. The browser still boots
 * exactly as before: createRoot clears this markup and renders fresh.
 *
 * It also stamps the sitemap's <lastmod> with the build date, so the sitemap
 * stops contradicting the page's own freshness.
 */

process.env.NODE_ENV = 'production'

const ROOT = '<div id="root" aria-busy="true"></div>'
const INDEX = new URL('../dist/index.html', import.meta.url)
const SITEMAP = new URL('../dist/sitemap.xml', import.meta.url)
const SSR_DIR = new URL('../dist-ssr/', import.meta.url)

const { render } = await import(new URL('entry-server.js', SSR_DIR))
// React hoists a <link rel="preload"> for every eager image it renders. Only
// the hero portrait (fetchpriority="high") earns one: it is the page's largest
// paint, so it goes in <head> where the browser finds it first. The rest would
// pull a dozen below-the-fold images in ahead of the scripts.
const IMAGE_PRELOAD = /<link rel="preload" as="image"[^>]*\/>/g
let markup = render()
const preloads = (markup.match(IMAGE_PRELOAD) ?? []).filter((tag) => /fetchPriority="high"/i.test(tag))
markup = markup
  .replace(IMAGE_PRELOAD, '')
  // Every image in this markup is lazy. With JavaScript on, the markup is
  // display: none (see [data-ssr] in index.html), and lazy images in a hidden
  // subtree never load. React replaces all of it on its first commit.
  .replace(/<img\b(?![^>]*\sloading=)/g, '<img loading="lazy"')

const html = await readFile(INDEX, 'utf8')
if (html.split(ROOT).length !== 2) {
  // Fail the build rather than ship a page that silently lost its content.
  throw new Error(`prerender: expected exactly one ${ROOT} in dist/index.html`)
}
// The wrapper lets index.html hide this copy from JavaScript visitors: they
// get React's render a moment later, and styling and laying out a page that
// is about to be thrown away cost a mid-range phone about a third of a second.
const page = html
  .replace(ROOT, () => ROOT.replace('></div>', `><div data-ssr>${markup}</div></div>`))
  .replace('</head>', () => `${preloads.join('')}\n  </head>`)
await writeFile(INDEX, page)

const today = new Date().toISOString().slice(0, 10)
const sitemap = await readFile(SITEMAP, 'utf8')
await writeFile(SITEMAP, sitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`))

await rm(SSR_DIR, { recursive: true, force: true })

const words = markup.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
console.log(`prerender: wrote ${(markup.length / 1024).toFixed(0)} KB (${words} words) into dist/index.html, ${preloads.length} image preload; sitemap lastmod ${today}`)

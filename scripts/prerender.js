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
const markup = render()

const html = await readFile(INDEX, 'utf8')
if (html.split(ROOT).length !== 2) {
  // Fail the build rather than ship a page that silently lost its content.
  throw new Error(`prerender: expected exactly one ${ROOT} in dist/index.html`)
}
await writeFile(INDEX, html.replace(ROOT, () => ROOT.replace('></div>', `>${markup}</div>`)))

const today = new Date().toISOString().slice(0, 10)
const sitemap = await readFile(SITEMAP, 'utf8')
await writeFile(SITEMAP, sitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`))

await rm(SSR_DIR, { recursive: true, force: true })

const words = markup.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
console.log(`prerender: wrote ${(markup.length / 1024).toFixed(0)} KB (${words} words) into dist/index.html; sitemap lastmod ${today}`)

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

const { render, blogPages } = await import(new URL('entry-server.js', SSR_DIR))
// React hoists a <link rel="preload"> for every eager image it renders. Only
// a page's largest paint (fetchpriority="high": the home's portrait, a post's
// hero phone) earns one, in <head> where the browser finds it first. The rest
// would pull images from far down the page in ahead of the scripts.
const IMAGE_PRELOAD = /<link rel="preload" as="image"[^>]*\/>/g

function splitPreloads(markup) {
  const preloads = (markup.match(IMAGE_PRELOAD) ?? []).filter((tag) => /fetchPriority="high"/i.test(tag))
  return { preloads, markup: markup.replace(IMAGE_PRELOAD, '') }
}

// Fail the build rather than ship a page that silently lost its content.
function expectOne(html, root, file) {
  if (html.split(root).length !== 2) throw new Error(`prerender: expected exactly one ${root} in dist/${file}`)
}

const home = splitPreloads(render())
// Every image in this markup is lazy. With JavaScript on, the markup is
// display: none (see [data-ssr] in index.html), and lazy images in a hidden
// subtree never load. React replaces all of it on its first commit.
const markup = home.markup.replace(/<img\b(?![^>]*\sloading=)/g, '<img loading="lazy"')

const html = await readFile(INDEX, 'utf8')
expectOne(html, ROOT, 'index.html')
// The wrapper lets index.html hide this copy from JavaScript visitors: they
// get React's render a moment later, and styling and laying out a page that
// is about to be thrown away cost a mid-range phone about a third of a second.
const page = html
  .replace(ROOT, () => ROOT.replace('></div>', `><div data-ssr>${markup}</div></div>`))
  .replace('</head>', () => `${home.preloads.join('')}\n  </head>`)
await writeFile(INDEX, page)

// The blog's pages show their markup as it is, and React hydrates it (see
// src/blog/mount.jsx), so their images keep the loading React gave them.
const BLOG_ROOT = '<div id="root"></div>'
for (const [file, renderPage] of Object.entries(blogPages)) {
  const url = new URL(`../dist/${file}`, import.meta.url)
  const blog = splitPreloads(renderPage())
  const source = await readFile(url, 'utf8')
  expectOne(source, BLOG_ROOT, file)
  await writeFile(
    url,
    source
      .replace(BLOG_ROOT, () => `<div id="root">${blog.markup}</div>`)
      .replace('</head>', () => `${blog.preloads.join('')}\n  </head>`)
  )
  console.log(`prerender: wrote ${(blog.markup.length / 1024).toFixed(0)} KB into dist/${file}`)
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = await readFile(SITEMAP, 'utf8')
await writeFile(SITEMAP, sitemap.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`))

await rm(SSR_DIR, { recursive: true, force: true })

const words = markup.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
console.log(`prerender: wrote ${(markup.length / 1024).toFixed(0)} KB (${words} words) into dist/index.html, ${home.preloads.length} image preload; sitemap lastmod ${today}`)

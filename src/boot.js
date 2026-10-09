import ResumePage from './assets/resume-page.webp'
import { featured } from './data/portfolio'
import { barongPhoto, PORTRAIT_SIZES, REEL_SIZES } from './data/photos'

/*
 * The boot loader. index.html paints it before any JS arrives; this module
 * fills it in as the hero's real work finishes, then hands the page to the
 * hero's entrance. No fixed duration: a warm cache clears it in a blink, and
 * CAP_MS keeps a stalled request from holding the page. The cap counts from
 * when this module starts, not from navigation, so a slow bundle download
 * can't use it up before there's anything to wait for.
 *
 * What it waits for is whatever would otherwise stutter the entrance: React's
 * first commit, the web font, the photo on show and the Centient screens
 * decoded (so the slideshows never decode mid-swap), and the WebGPU field
 * compiling its shaders and drawing a first frame. Only what starts on screen
 * holds the page: on a phone the résumé and Centient tiles are far below, so
 * they load on their own while the hero plays.
 */

const CAP_MS = 4000 // once the app is running, never hold the page longer than this
const MIN_MS = 400 // from navigation: long enough to read as intentional, not a flicker
const HOLD_MS = 160 // a beat on the full grid before it lets go
const LEAVE_MS = 550 // keep in step with #boot's transition in index.html

// How much of the percentage each task carries. `below` (the sections below
// the hero) only holds the page when it opens somewhere other than the top.
const TASKS = { app: 1, fonts: 1, portraits: 2, resume: 1, centient: 2, field: 2, below: 0 }
const TOTAL = Object.values(TASKS).reduce((sum, w) => sum + w, 0)

// Each cell of the miniature bento fills once every task behind its tile is done.
const CELLS = {
  main: ['app', 'fonts', 'portraits', 'field'],
  mint: ['app', 'fonts'],
  res: ['resume'],
  gh: ['app', 'fonts'],
  feat: ['centient'],
  about: ['app', 'fonts'],
  skills: ['app', 'fonts'],
}

const done = new Set()
const listeners = new Set()
let booted = false
let finishing = false
let root = null
let pct = null
let shown = 0
let target = 0

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

// Takes the same srcset and sizes as the page's <img>, so it warms the copy the page will draw.
function decode({ src, srcSet, sizes }) {
  const img = new Image()
  img.decoding = 'async'
  if (srcSet) {
    img.sizes = sizes
    img.srcset = srcSet
  }
  img.src = src
  if (img.decode) return img.decode()
  return new Promise((resolve) => {
    img.onload = resolve
    img.onerror = resolve
  })
}

// A failed request still counts as settled: the loader waits for work, not success.
function settle(task, promise) {
  Promise.resolve(promise)
    .catch(() => {})
    .then(() => markReady(task))
}

function settleImages(task, images) {
  settle(task, Promise.allSettled(images.map(decode)))
}

// Waits on a tile's images only if the tile starts on screen. An observer
// rather than a measurement, so it never forces a layout mid-boot.
function settleIfShown(task, selector, images) {
  const el = document.querySelector(selector)
  if (!el || typeof IntersectionObserver === 'undefined') {
    settleImages(task, images)
    return
  }
  const observer = new IntersectionObserver(([entry]) => {
    observer.disconnect()
    if (entry.isIntersecting) settleImages(task, images)
    else markReady(task)
  })
  observer.observe(el)
}

// The percentage eases toward its target, so a burst of finished tasks reads as a count, not a jump.
function tick() {
  if (!root) return
  shown += (target - shown) * 0.18
  if (target - shown < 0.5) shown = target
  pct.textContent = `${Math.round(shown)}%`
  if (!root.classList.contains('is-leaving')) requestAnimationFrame(tick)
}

function paint() {
  if (!root) return
  const weight = [...done].reduce((sum, task) => sum + TASKS[task], 0)
  target = (weight / TOTAL) * 100
  for (const [cell, needs] of Object.entries(CELLS)) {
    if (needs.every((task) => done.has(task))) {
      root.querySelector(`[data-cell="${cell}"]`)?.classList.add('is-on')
    }
  }
}

// A link to a section (/#work, or /work redirected there) opens on it. The
// browser's own jump came and went while the page was still the loader (the
// prerendered copy is hidden), so make it here, under the loader. A reload or
// back/forward keeps the position the browser restored instead.
function jumpToHash() {
  const id = decodeURIComponent(location.hash.slice(1))
  if (!id || performance.getEntriesByType?.('navigation')[0]?.type !== 'navigate') return
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
}

function release() {
  performance.mark?.('boot:release')
  booted = true
  listeners.forEach((listener) => listener())
}

async function finish() {
  if (finishing) return
  finishing = true

  const early = MIN_MS - performance.now()
  if (early > 0) await sleep(early)

  // Let the hero commit and lay out before it has to move.
  await nextFrame()
  await nextFrame()

  jumpToHash()
  target = 100
  root.querySelectorAll('[data-cell]').forEach((cell) => cell.classList.add('is-on'))
  await sleep(HOLD_MS)

  // The hero's entrance starts as the loader fades, so the two overlap.
  shown = 100
  pct.textContent = '100%'
  root.classList.add('is-leaving')
  root.querySelector('[role="status"]').textContent = 'Loaded'
  release()

  await sleep(LEAVE_MS)
  root.remove()
  root = null
  document.documentElement.classList.remove('is-booting')
  document.getElementById('root')?.removeAttribute('aria-busy')
}

/** Marks one boot task finished. Safe to call more than once. */
export function markReady(task) {
  if (!(task in TASKS) || done.has(task)) return
  done.add(task)
  // Shows up in the DevTools Performance panel, to see what held the page.
  performance.mark?.(`boot:${task}`)

  // The web font is only requested once text renders in it, so wait for a
  // painted frame after React's first commit before asking whether it's in.
  if (task === 'app') {
    requestAnimationFrame(() => settle('fonts', document.fonts?.ready))
    settleIfShown('resume', '.resume-sheet', [{ src: ResumePage }])
    settleIfShown('centient', '.reel-screen', [
      { src: featured.logo },
      ...featured.screens.map((screen) => ({ ...screen, sizes: REEL_SIZES })),
    ])
  }

  paint()
  if (done.size === Object.keys(TASKS).length) finish()
}

// A desktop: room to build the sections below the hero under the loader.
const ROOMY = '(min-width: 1024px) and (pointer: fine)'

/**
 * Whether the sections below the hero wait until after its entrance (see
 * useSettled). They do on a phone or tablet opening a fresh page at the top,
 * so they never compete with the first screen. A desktop builds them under
 * the loader instead, where their first layout can't cost the entrance a
 * frame. A link into the page, a reload or back/forward (which restore a
 * scroll position) need the whole page before the loader lets go too.
 */
export function defersBelowFold() {
  // Navigation type covers restored scroll positions; reading scrollY here
  // would force a style pass before there's anything to style.
  if (location.hash) return false
  const type = performance.getEntriesByType?.('navigation')[0]?.type
  if (type && type !== 'navigate') return false
  return !window.matchMedia?.(ROOMY).matches
}

export function startBoot() {
  if (defersBelowFold()) markReady('below')
  root = document.getElementById('boot')

  // The fallback timer in index.html already removed it: nothing to wait for.
  if (!root) {
    release()
    return
  }

  // Tells the fallback timer in index.html that the app is running.
  root.dataset.started = ''
  performance.mark?.('boot:start')
  pct = root.querySelector('[data-pct]')
  // The hero always opens on the barong photo (HeroBento's PORTRAITS[0]).
  settleImages('portraits', [{ ...barongPhoto, sizes: PORTRAIT_SIZES }])
  setTimeout(finish, CAP_MS)
  requestAnimationFrame(tick)
}

export const isBooted = () => booted

export function onBoot(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

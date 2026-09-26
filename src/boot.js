import GradPhoto from './assets/me.jpeg'
import BarongPhoto from './assets/me-barong.jpg'
import ResumePage from './assets/resume-page.jpg'
import { featured } from './data/portfolio'

/*
 * The boot loader. index.html paints it before any JS arrives; this module
 * fills it in as the hero's real work finishes, then hands the page to the
 * hero's entrance. No fixed duration: a warm cache clears it in a blink, and
 * CAP_MS keeps a stalled request from holding the page. The cap counts from
 * when this module starts, not from navigation, so a slow bundle download
 * can't use it up before there's anything to wait for.
 *
 * What it waits for is whatever would otherwise stutter the entrance: React's
 * first commit, the web font, the hero photos and Centient screens decoded
 * (so the slideshows never decode mid-swap), and the WebGPU field compiling
 * its shaders and drawing a first frame.
 */

const CAP_MS = 4000 // once the app is running, never hold the page longer than this
const MIN_MS = 400 // from navigation: long enough to read as intentional, not a flicker
const HOLD_MS = 160 // a beat on the full grid before it lets go
const LEAVE_MS = 550 // keep in step with #boot's transition in index.html

// How much of the percentage each task carries.
const TASKS = { app: 1, fonts: 1, portraits: 2, resume: 1, centient: 2, field: 2 }
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

function decode(src) {
  const img = new Image()
  img.decoding = 'async'
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

function settleImages(task, srcs) {
  settle(task, Promise.allSettled(srcs.map(decode)))
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
  }

  paint()
  if (done.size === Object.keys(TASKS).length) finish()
}

export function startBoot() {
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
  settleImages('portraits', [GradPhoto, BarongPhoto])
  settleImages('resume', [ResumePage])
  settleImages('centient', [featured.logo, ...featured.screens.map((screen) => screen.src)])
  setTimeout(finish, CAP_MS)
  requestAnimationFrame(tick)
}

export const isBooted = () => booted

export function onBoot(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

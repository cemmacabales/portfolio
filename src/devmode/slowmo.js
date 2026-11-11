/*
 * Slow animations, like the switch in iOS's developer settings. Two kinds of
 * motion run on this site:
 *
 * - CSS and Web Animations (most transitions, and framer-motion's opacity
 *   and transform when it hands them to the browser): their playbackRate is
 *   set on every frame, so new ones slow down too.
 * - Anything driven from JavaScript (framer-motion's springs, GSAP, the pet
 *   yard, the hero field): they all read performance.now() or the timestamp
 *   requestAnimationFrame passes in, so both are swapped for a clock that
 *   runs at `rate`. Turning it off puts the real ones back.
 */
let rate = 1
let installed = false
let loop = 0
let realNow
let realRaf
let anchorReal = 0
let anchorVirtual = 0

const virtual = (real) => anchorVirtual + (real - anchorReal) * rate

function install() {
  if (installed) return
  installed = true
  realNow = performance.now.bind(performance)
  realRaf = window.requestAnimationFrame.bind(window)
  anchorReal = anchorVirtual = realNow()
  performance.now = () => virtual(realNow())
  window.requestAnimationFrame = (callback) => realRaf((t) => callback(virtual(t)))
}

function uninstall() {
  if (!installed) return
  installed = false
  delete performance.now
  if (performance.now === undefined) performance.now = realNow
  window.requestAnimationFrame = realRaf
}

function paceAnimations() {
  for (const animation of document.getAnimations()) {
    if (animation.playbackRate !== rate) animation.playbackRate = rate
  }
}

export function setSlow(on) {
  const next = on ? 0.1 : 1
  if (next === rate) return
  if (on) install()
  const real = realNow?.() ?? performance.now()
  anchorVirtual = virtual(real)
  anchorReal = real
  rate = next
  cancelAnimationFrame(loop)
  if (on) {
    const tick = () => {
      paceAnimations()
      loop = realRaf(tick)
    }
    tick()
  } else {
    paceAnimations()
    uninstall()
  }
}

/** The real frame rate, measured with the real clock even while slowed. */
export function watchFrameRate(onRate) {
  const raf = realRaf ?? window.requestAnimationFrame.bind(window)
  const now = realNow ?? performance.now.bind(performance)
  let frames = 0
  let since = now()
  let id = 0
  const tick = () => {
    frames += 1
    const t = now()
    if (t - since >= 500) {
      onRate(Math.round((frames * 1000) / (t - since)))
      frames = 0
      since = t
    }
    id = (realRaf ?? raf)(tick)
  }
  id = raf(tick)
  return () => cancelAnimationFrame(id)
}

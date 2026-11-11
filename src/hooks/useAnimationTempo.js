import { useEffect } from 'react'

// Eases every CSS animation inside `ref` to `rate` times its normal speed.
// It changes playbackRate, not animation-duration, so nothing jumps: each
// animation carries on from where it is, only faster or slower. The ramp
// takes `ms`, on an ease-in-out, so a speed-up feels like gathering pace.
// `prefix` limits it to CSS animations whose name starts with it.
export function useAnimationTempo(ref, rate, ms = 700, prefix = '') {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof el.getAnimations !== 'function') return undefined
    const animations = el
      .getAnimations({ subtree: true })
      .filter((a) => !prefix || a.animationName?.startsWith(prefix))
    if (!animations.length) return undefined

    const from = animations[0].playbackRate
    if (from === rate) return undefined
    let frame = 0
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      const value = from + (rate - from) * eased
      for (const a of animations) a.updatePlaybackRate(value)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [ref, rate, ms, prefix])
}

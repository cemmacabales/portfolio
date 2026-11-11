/*
 * A tiny in-page event bus. Every PostHog capture also goes through here (see
 * src/posthog.js), so the achievements and the Live Activities island can
 * react to what a visitor does without each component knowing about them.
 * A few moments that aren't worth an analytics event (a treat tossed to the
 * pets, a film watched to the end) are emitted directly.
 */
const EVENT = 'site:event'

export function emit(name, props = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { name, props } }))
}

/** Calls `listener(name, props)` for every event. Returns an unsubscribe. */
export function onEvent(listener) {
  if (typeof window === 'undefined') return () => {}
  const handle = (e) => listener(e.detail.name, e.detail.props)
  window.addEventListener(EVENT, handle)
  return () => window.removeEventListener(EVENT, handle)
}

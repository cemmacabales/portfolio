/*
 * PostHog loads after the boot loader lets go of the page (see main.jsx), so
 * the SDK never competes with the hero for the network or the main thread.
 * Calls made before then wait in a queue and replay once it's ready.
 *
 * posthog-js is only ever imported dynamically from loadPostHog, which runs
 * in the browser: the prerender's server build never touches it.
 */

const posthogKey = import.meta.env.VITE_POSTHOG_KEY
const posthogHost = import.meta.env.VITE_POSTHOG_HOST
const configured = Boolean(posthogKey && posthogHost)

const QUEUE_LIMIT = 100

let client
let loading = false
const queue = []

function call(method, args) {
  if (client) return method(client, ...args)
  if (configured && queue.length < QUEUE_LIMIT) queue.push([method, args])
}

export function loadPostHog() {
  if (!posthogKey) {
    if (import.meta.env.DEV) {
      throw new Error('VITE_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_KEY is configured')
    }
    return
  }
  if (!posthogHost) {
    if (import.meta.env.DEV) {
      throw new Error('VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured')
    }
    return
  }
  if (loading) return
  loading = true

  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        defaults: '2026-05-30',
        capture_exceptions: {
          capture_unhandled_errors: true,
          capture_unhandled_rejections: true,
          capture_console_errors: false,
        },
        logs: {
          serviceName: 'portfolio-web',
          environment: import.meta.env.MODE,
        },
      })
      client = posthog
      queue.splice(0).forEach(([method, args]) => method(client, ...args))
    })
    // A blocked or failed download just means no analytics for this visit.
    .catch(() => {
      queue.length = 0
    })
}

const posthog = {
  capture: (...args) => call((c, ...a) => c.capture(...a), args),
  get_distinct_id: () => client?.get_distinct_id(),
  logger: {
    info: (...args) => call((c, ...a) => c.logger.info(...a), args),
    warn: (...args) => call((c, ...a) => c.logger.warn(...a), args),
  },
}

export default posthog

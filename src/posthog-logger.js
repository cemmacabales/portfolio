import posthog from './posthog'

const isPostHogConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST,
)

const emit = (level, message, attributes = {}) => {
  if (!isPostHogConfigured) return

  posthog.logger[level](message, attributes)
}

export const portfolioLogger = {
  info: (message, attributes) => emit('info', message, attributes),
  warn: (message, attributes) => emit('warn', message, attributes),
}

/*
 * Achievements: small rewards for finding the things the site hides (the
 * typing race, the pets, the film, dark mode). They're kept in the visitor's
 * own browser and never sent anywhere except as a PostHog event naming which
 * one was found, so Carl can see what people discover.
 *
 * `startAchievements()` runs once per page (main.jsx, src/blog/mount.jsx). An
 * unlock announces itself through the event bus as `achievement_unlocked`;
 * the Live Activities island shows it, and the footer's cookie line opens
 * the list (src/achievements/Trophies.jsx).
 */
import { emit, onEvent } from '../events'
import posthog from '../posthog'

export const ACHIEVEMENTS = [
  { id: 'night-owl', name: 'Night owl', how: 'Switch to dark mode', icon: 'moon' },
  { id: 'bookworm', name: 'Bookworm', how: 'Read a post to the end', icon: 'book' },
  { id: 'speed-demon', name: 'Speed demon', how: 'Hit 100 wpm in the ⌘K race', icon: 'zap' },
  { id: 'good-dog', name: 'Good dog', how: 'Toss the pets a treat', icon: 'paw' },
  { id: 'movie-night', name: 'Movie night', how: 'Watch Deni’s film to the end', icon: 'film' },
  { id: 'behind-the-desk', name: 'Behind the desk', how: 'Open My setup', icon: 'monitor' },
  { id: 'second-reader', name: 'Second reader', how: 'Open the thesis story', icon: 'scan' },
  { id: 'curious', name: 'Curious', how: 'Ask the assistant three things', icon: 'chat' },
  { id: 'cookie', name: 'Cookie', how: 'Make it to the footer', icon: 'cookie' },
  { id: 'hello', name: 'Hello', how: 'Send Carl a message', icon: 'mail' },
  { id: 'developer', name: 'Developer', how: 'Found the hidden menu', icon: 'wrench', secret: true },
  { id: 'completionist', name: 'Completionist', how: 'Found every other one', icon: 'trophy', secret: true },
]

const KEY = 'achievements'
const QUESTIONS = 'achievements-questions'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function write(found) {
  try {
    localStorage.setItem(KEY, JSON.stringify(found))
  } catch {
    // Private mode: found for this page only.
  }
}

let found = typeof window === 'undefined' ? {} : read()

export const isFound = (id) => Boolean(found[id])
export const foundCount = () => ACHIEVEMENTS.filter((a) => found[a.id]).length

export function unlock(id) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === id)
  if (!achievement || found[id]) return
  found = { ...read(), [id]: Date.now() }
  write(found)
  posthog.capture('achievement_unlocked', { achievement: id, found: foundCount() })
  const rest = ACHIEVEMENTS.filter((a) => a.id !== 'completionist')
  if (id !== 'completionist' && rest.every((a) => found[a.id])) unlock('completionist')
  emit('achievements_changed')
}

// Fires once an element matching `selector` has been on screen. The element
// may not exist yet (the sections below the hero load lazily), and the
// prerendered copy is replaced when React mounts, so it keeps re-finding it.
function whenSeen(selector, callback) {
  if (typeof IntersectionObserver === 'undefined') return
  let watched = null
  let done = false
  const seen = new IntersectionObserver(
    (entries) => {
      if (done || !entries.some((e) => e.isIntersecting)) return
      done = true
      seen.disconnect()
      dom.disconnect()
      callback()
    },
    { threshold: 0.4 },
  )
  const attach = () => {
    const el = document.querySelector(selector)
    if (!el || el === watched) return
    if (watched) seen.unobserve(watched)
    watched = el
    seen.observe(el)
  }
  const dom = new MutationObserver(() => {
    if (!watched?.isConnected) attach()
  })
  dom.observe(document.body, { childList: true, subtree: true })
  attach()
}

let started = false

export function startAchievements() {
  if (started || typeof window === 'undefined') return
  started = true

  onEvent((name, props) => {
    if (name === 'typing_test_finished' && props?.wpm >= 100) unlock('speed-demon')
    // Dark mode, switched to on purpose (not a dark system theme at load).
    if (name === 'theme_switched' && props?.theme === 'dark') unlock('night-owl')
    if (name === 'pet_treat_tossed') unlock('good-dog')
    if (name === 'film_finished') unlock('movie-night')
    if (name === 'setup_desk_opened') unlock('behind-the-desk')
    if (name === 'thesis_story_opened') unlock('second-reader')
    if (name === 'contact_message_sent') unlock('hello')
    if (name === 'dev_settings_opened') unlock('developer')
    if (name === 'assistant_question_sent') {
      let n = 0
      try {
        n = Number(localStorage.getItem(QUESTIONS) || 0) + 1
        localStorage.setItem(QUESTIONS, String(n))
      } catch {
        n = 3
      }
      if (n >= 3) unlock('curious')
    }
  })


  // The home's footer, and the end of a blog post.
  if (!found.cookie) whenSeen('.contact-foot', () => unlock('cookie'))
  if (!found.bookworm && /^\/blog\/[^/]+\/?$/.test(location.pathname)) {
    whenSeen('.blog-footer', () => unlock('bookworm'))
  }
}

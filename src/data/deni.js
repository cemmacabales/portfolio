import DeniPromo from '../assets/deni/promo.mp4'
import DeniPromoPoster from '../assets/deni/promo-poster.webp'
import DeniIcon from '../assets/deni/icon.webp'
import DeniToday from '../assets/deni/today.webp'
import DeniToday480 from '../assets/deni/today-480.webp'
import DeniReminder from '../assets/deni/reminder.webp'
import DeniReminder480 from '../assets/deni/reminder-480.webp'
import DeniAdd from '../assets/deni/add.webp'
import DeniAdd480 from '../assets/deni/add-480.webp'
import DeniInsights from '../assets/deni/insights.webp'
import DeniInsights480 from '../assets/deni/insights-480.webp'
import DeniReport from '../assets/deni/report.webp'
import DeniReport480 from '../assets/deni/report-480.webp'

// Shared by the home (portfolio.js) and the blog's Deni post. The blog
// imports from here, never from portfolio.js, and this module sits in the
// build's `shared` chunk with everything it imports, so a blog page never
// downloads the home's tiles to get Deni's pictures.

export const deniIcon = DeniIcon

// Frames of the real app (800w and 480w), for <img src srcSet>.
const shot = (src, src480) => ({ src, srcSet: `${src480} 480w, ${src} 800w` })

export const deniShots = {
  today: shot(DeniToday, DeniToday480),
  reminder: shot(DeniReminder, DeniReminder480),
  add: shot(DeniAdd, DeniAdd480),
  insights: shot(DeniInsights, DeniInsights480),
  report: shot(DeniReport, DeniReport480),
}

// Deni's 108-second promo, played from the hero, its row and the post (see FilmPlayer).
export const deniFilm = {
  src: DeniPromo,
  poster: DeniPromoPoster,
  title: 'Deni promo film',
  length: '1:48',
}

export const deniAppStore = 'https://apps.apple.com/us/app/deni-medication-tracker/id6821553110'

// The post that tells Deni's story.
export const deniStory = '/blog/deni/'

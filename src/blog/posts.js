import { deniPost } from './posts/deni/meta'
import DeniCover from './posts/deni/DeniCover'
import { thesisPost } from './posts/thesis/meta'
import ThesisCover from './posts/thesis/ThesisCover'

// Newest first. Each post brings its own cover, drawn in its own world.
export const posts = [
  { ...deniPost, Cover: DeniCover },
  { ...thesisPost, Cover: ThesisCover },
]

// "Nov 3, 2026". UTC, so the prerender and the browser agree.
export function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

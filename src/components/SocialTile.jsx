import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { socials } from '../data/portfolio'
import './SocialTile.css'

// Brand marks, drawn white on each app's own color. The LinkedIn and
// Facebook paths are the official marks (via Simple Icons); Instagram's
// glyph is simple enough to draw.
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.6" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  )
}

const GLYPHS = {
  instagram: InstagramGlyph,
  linkedin: LinkedInGlyph,
  facebook: FacebookGlyph,
}

/* ── Socials: one widget per app, each in its own colors ─────── */
export default function SocialTile({ variants }) {
  return (
    <motion.article variants={variants} className="tile tile-social" aria-labelledby="social-title">
      <h2 id="social-title" className="social-title">
        Socials. <span className="social-lede">Say hi wherever you scroll.</span>
      </h2>

      <ul className="social-list">
        {socials.map((item) => {
          const Glyph = GLYPHS[item.id]
          return (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`social social-${item.id}`}
                aria-label={`${item.verb} on ${item.name}: ${item.handle} (opens in a new tab)`}
              >
                <span className="social-top" aria-hidden="true">
                  <span className="social-glyph">
                    <Glyph />
                  </span>
                  <span className="social-verb">{item.verb}</span>
                </span>
                <span className="social-copy" aria-hidden="true">
                  <span className="social-name">{item.name}</span>
                  <span className="social-handle">{item.handle}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </motion.article>
  )
}

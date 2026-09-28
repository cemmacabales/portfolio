import { useEffect, useRef } from 'react'
import {
  motion, // eslint-disable-line no-unused-vars
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { certificates, profile } from '../data/portfolio'
import { useLocalTime } from '../hooks/useLocalTime'
import GithubActivity from './GithubActivity'
import StackTile from './StackTile'
import EducationTile from './EducationTile'
import ExperienceTile from './ExperienceTile'
import ResearchTile from './ResearchTile'
import './BackgroundBento.css'

const EASE = [0.16, 1, 0.3, 1]

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

function dayPart(hour) {
  if (hour < 5) return 'Late night'
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
}

/* ── Local time: the sky over Quezon City, right now ────────── */
function skyPhase(h) {
  if (h >= 5 && h < 6.5) return 'dawn'
  if (h >= 6.5 && h < 16.5) return 'day'
  if (h >= 16.5 && h < 18.75) return 'dusk'
  return 'night'
}

// Star positions in % of the sky, fixed so they don't jump between renders.
const STARS = [
  [7, 22], [15, 44], [22, 14], [31, 33], [39, 8], [47, 26], [55, 12],
  [63, 38], [70, 19], [78, 9], [84, 31], [91, 16], [95, 42], [26, 52],
]

// A made-up skyline: [x, width, height] in a 400 × 60 box.
const BUILDINGS = [
  [0, 26, 28], [24, 18, 42], [40, 30, 22], [68, 14, 52], [80, 26, 34], [104, 20, 26],
  [122, 34, 46], [154, 16, 20], [168, 24, 38], [190, 12, 56], [200, 30, 28], [228, 22, 44],
  [248, 28, 24], [274, 16, 36], [288, 30, 50], [316, 18, 28], [332, 26, 40], [356, 20, 22],
  [374, 26, 34],
]

function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 400 60" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {BUILDINGS.map(([x, w, h]) => (
        <rect key={x} x={x} y={60 - h} width={w + 0.5} height={h} className="bldg" />
      ))}
      {BUILDINGS.filter(([, , h]) => h >= 34).flatMap(([x, w, h], b) =>
        Array.from({ length: Math.floor((h - 8) / 9) }, (_, row) => (
          <rect
            key={`${x}-${row}`}
            x={x + w / 2 - 1.5}
            y={60 - h + 6 + row * 9}
            width="3"
            height="4"
            rx="0.6"
            className="win"
            style={{ '--d': `${((b * 3 + row * 7) % 11) * 0.45}s` }}
          />
        ))
      )}
    </svg>
  )
}

function ClockTile() {
  const { time, hour, minute } = useLocalTime(profile.timeZone)
  const h = hour + minute / 60
  const phase = skyPhase(h)
  const isDay = h >= 6 && h < 18
  // How far the sun (6 AM to 6 PM) or the moon (6 PM to 6 AM) is across the sky.
  const t = isDay ? (h - 6) / 12 : ((h + 6) % 24) / 12

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const progress = useMotionValue(0)

  // On first view the sun or moon climbs from the horizon to where it is now.
  useEffect(() => {
    if (!inView) return undefined
    if (reduce) {
      progress.set(t)
      return undefined
    }
    const controls = animate(progress, t, { duration: 1.8, ease: EASE })
    return () => controls.stop()
  }, [inView, reduce, t, progress])

  const left = useTransform(progress, (v) => `${50 - 46 * Math.cos(Math.PI * v)}%`)
  const top = useTransform(progress, (v) => `${100 - 88 * Math.sin(Math.PI * v)}%`)

  return (
    <motion.article ref={ref} variants={rise} className={`tile tile-clock sky-${phase}`}>
      <div className="sky" aria-hidden="true">
        {phase === 'night' && (
          <div className="stars">
            {STARS.map(([x, y], i) => (
              <i key={i} style={{ left: `${x}%`, top: `${y}%`, '--d': `${(i % 5) * 0.8}s` }} />
            ))}
          </div>
        )}
      </div>
      <h3 className="tile-head">Local time</h3>
      <div className="tile-body clock-body">
        <p className="clock-time">
          <time>{time}</time>
        </p>
        <p className="clock-place">
          {dayPart(hour)} in {profile.location} · GMT+8
        </p>
        <div className="sky-arc" aria-hidden="true">
          <svg viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d="M4 50 A46 44 0 0 1 96 50" vectorEffect="non-scaling-stroke" />
          </svg>
          <motion.span className={`orb ${isDay ? 'orb-sun' : 'orb-moon'}`} style={{ left, top }} />
        </div>
      </div>
      <Skyline />
      <p className="clock-off">Off the clock: video games and building things from scratch.</p>
    </motion.article>
  )
}

export default function BackgroundBento() {
  return (
    <section id="about" className="section shell" aria-labelledby="about-title">
      <motion.header
        className="section-head"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <h2 id="about-title" className="section-title">
          Background. <span className="section-lede">Where I’ve worked, shipped, published, and studied.</span>
        </h2>
      </motion.header>

      <motion.div
        className="background-grid"
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <ExperienceTile variants={rise} />

        <EducationTile variants={rise} />

        <ResearchTile variants={rise} />

        <StackTile variants={rise} />

        <motion.article variants={rise} className="tile tile-certs">
          <h3 className="tile-head">Certificates</h3>
          <ul className="row-list">
            {certificates.map((cert) => (
              <li key={cert.title}>
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="row-link">
                  <span className="row-text">
                    <span className="row-title">{cert.title}</span>
                    <span className="row-sub">
                      {cert.issuer} · {cert.date}
                    </span>
                  </span>
                  <span className="row-icon row-icon-end" aria-hidden="true">
                    <ArrowUpRight size={18} strokeWidth={1.8} />
                  </span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </motion.article>

        <GithubActivity variants={rise} />

        <ClockTile />
      </motion.div>
    </section>
  )
}

import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { ArrowUpRight } from 'lucide-react'
import { education, shipped, research, certificates, stack, profile } from '../data/portfolio'
import { useLocalTime } from '../hooks/useLocalTime'
import IcipcnImage from '../assets/icipcn.png'
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

function ClockTile() {
  const { time, hour } = useLocalTime(profile.timeZone)
  return (
    <motion.article variants={rise} className="tile tile-clock">
      <h3 className="tile-head">Local time</h3>
      <div className="tile-body clock-body">
        <p className="clock-time">
          <time>{time}</time>
        </p>
        <p className="clock-place">
          {dayPart(hour)} in {profile.location} · GMT+8
        </p>
        <p className="clock-off">Off the clock: video games and building things from scratch.</p>
      </div>
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
          Background
        </h2>
        <p className="section-meta">Shipping, research, and study</p>
      </motion.header>

      <motion.div
        className="background-grid"
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.article variants={rise} className="tile tile-shipped">
          <h3 className="tile-head">Software I’ve shipped</h3>
          <ul className="shipped-list">
            {shipped.map((item) => {
              const body = (
                <>
                  <span className="shipped-year">{item.year}</span>
                  <span className="shipped-main">
                    <span className="shipped-name">{item.name}</span>
                    <span className="shipped-what">{item.what}</span>
                  </span>
                  <span className="shipped-proof">{item.proof}</span>
                </>
              )
              return (
                <li key={item.name}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="shipped-row">
                      {body}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <div className="shipped-row">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </motion.article>

        <motion.article variants={rise} className="tile tile-education">
          <h3 className="tile-head">Education</h3>
          <ol className="tile-body edu-list">
            {education.map((item) => (
              <li key={item.school} className="edu-item">
                <img src={item.logo} alt="" className="edu-logo" loading="lazy" />
                <div className="edu-text">
                  <p className="edu-school">{item.school}</p>
                  <p className="edu-detail">{item.detail}</p>
                </div>
                <p className="edu-period">{item.period}</p>
              </li>
            ))}
          </ol>
        </motion.article>

        <motion.article variants={rise} className="tile tile-research">
          <h3 className="tile-head">Research</h3>
          <ul className="row-list">
            {research.map((item) => (
              <li key={item.title}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="row-link">
                  <span className="row-text">
                    <span className="row-title">{item.title}</span>
                    <span className="row-sub">{item.venue}</span>
                  </span>
                  <span className="row-icon row-icon-end" aria-hidden="true">
                    <ArrowUpRight size={18} strokeWidth={1.8} />
                  </span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <figure className="research-figure">
            <img
              src={IcipcnImage}
              alt="IEEE certificate of presentation for the kidney abnormality paper at ICIPCN 2026"
              loading="lazy"
            />
          </figure>
        </motion.article>

        <ClockTile />

        <motion.article variants={rise} className="tile tile-stack">
          <h3 className="tile-head">Tools I reach for</h3>
          <ul className="tile-body stack-grid">
            {stack.map((tool) => (
              <li
                key={tool.name}
                className="stack-item"
                style={tool.tint ? { '--tint': tool.tint } : undefined}
              >
                <span
                  className="stack-glyph"
                  aria-hidden="true"
                  style={{ '--icon': `url("${tool.icon}")` }}
                />
                <span className="stack-name">{tool.name}</span>
              </li>
            ))}
          </ul>
        </motion.article>

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
      </motion.div>
    </section>
  )
}

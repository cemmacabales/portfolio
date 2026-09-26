import { Fragment } from 'react'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { ArrowUpRight, ArrowDown, MessageCircle, Github, Trophy } from 'lucide-react'
import MagnetLines from './MagnetLines'
import ProfileImage from '../assets/me.jpeg'
import { profile, disciplines, featured } from '../data/portfolio'
import './HeroBento.css'

const HEADLINE = 'I build the model, and the product around it.'
const EASE = [0.16, 1, 0.3, 1]

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

// Tiles come into focus rather than slide in: a short rise plus a blur pull.
const rise = {
  hidden: { opacity: 0, y: 26, scale: 0.985, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE },
  },
}

const headline = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.3 } },
}

const word = {
  hidden: { opacity: 0, y: '0.45em', filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
}

// Bar heights for the "token stream" on the assistant tile (0–1).
const BARS = [
  0.35, 0.6, 0.45, 0.8, 0.55, 0.3, 0.7, 0.95, 0.5, 0.65, 0.4, 0.85, 0.6, 0.3, 0.75, 0.5, 0.9,
  0.45, 0.6, 0.35, 0.7, 0.55, 0.8, 0.4, 0.65, 0.5, 0.85, 0.35, 0.6, 0.45,
]

export default function HeroBento({ showField, onOpenProject, onAskAssistant }) {
  const words = HEADLINE.split(' ')

  return (
    <section id="home" className="hero shell" aria-labelledby="hero-title">
      <motion.div className="hero-grid" variants={grid} initial="hidden" animate="show">
        {/* ── Main: who, in one line, plus the portrait ───────────── */}
        <motion.article variants={rise} className="tile tile-main">
          <div className="main-copy">
            {showField && (
              <MagnetLines
                rows={7}
                columns={22}
                width="100%"
                height="48%"
                lineColor="var(--magnet-line)"
                lineWidth="1.5px"
                lineHeight="15px"
                baseAngle={-12}
                className="main-field"
              />
            )}
            <p className="glass chip status-chip" data-sheen>
              <span className="status-dot" aria-hidden="true" />
              Open to AI/ML and software roles
            </p>

            <div className="main-text">
              <p className="main-kicker">
                <span className="main-name">{profile.name}</span>
                <span className="main-role">{profile.role}</span>
              </p>
              <motion.h1 id="hero-title" className="display" variants={headline}>
                {words.map((w, i) => (
                  <Fragment key={i}>
                    <motion.span className="word" variants={word}>
                      {w}
                    </motion.span>
                    {i < words.length - 1 && ' '}
                  </Fragment>
                ))}
              </motion.h1>
              <p className="main-lede">
                Published ML research in medical imaging and clinical NLP, and full-stack products
                on Next.js, PostgreSQL, and Stellar payments.
              </p>
              <div className="main-actions">
                <a href="#work" className="btn btn-ink">
                  View selected work
                  <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </a>
                <a href="#contact" className="btn btn-line">
                  Get in touch
                </a>
              </div>
            </div>
          </div>

          <figure className="main-photo">
            <img src={ProfileImage} alt="Carl in graduation robes" width="1320" height="1365" />
            <figcaption className="glass chip photo-chip">Mapúa CS ’26 · AI specialization</figcaption>
          </figure>
        </motion.article>

        {/* ── Side: assistant, CV, GitHub ─────────────────────────── */}
        <div className="hero-side">
          <motion.button
            variants={rise}
            type="button"
            className="tile tile-mint"
            onClick={onAskAssistant}
          >
            <span className="mint-top">
              <span className="token-bars" aria-hidden="true">
                {BARS.map((h, i) => (
                  <span key={i} style={{ '--h': h, '--i': i }} />
                ))}
              </span>
              <span className="mint-icon" aria-hidden="true">
                <MessageCircle size={20} strokeWidth={2} />
              </span>
            </span>
            <span className="mint-copy">
              <span className="mint-title">Ask my assistant</span>
              <span className="mint-sub">It knows my projects, papers, and stack.</span>
            </span>
          </motion.button>

          <div className="duo">
            <motion.div variants={rise} className="tile tile-cv">
              <p className="cv-mark" aria-hidden="true">
                CV
              </p>
              <a
                href={profile.resume}
                download="Carl-Macabales-CV.pdf"
                className="btn btn-sunk btn-block cv-download"
              >
                <span>
                  Download<span className="visually-hidden"> CV as PDF</span>
                </span>
                <ArrowDown size={18} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </motion.div>

            <motion.a
              variants={rise}
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="tile tile-gh"
            >
              <span className="gh-top">
                <Github size={30} strokeWidth={1.6} aria-hidden="true" />
                <span className="gh-arrow" aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={1.8} />
                </span>
              </span>
              <span className="gh-copy">
                <span className="gh-title">GitHub</span>
                <span className="gh-sub">@cemmacabales</span>
              </span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </motion.a>
          </div>
        </div>

        {/* ── Featured: Centient ─────────────────────────────────── */}
        <motion.article
          variants={rise}
          className="tile tile-featured"
          aria-labelledby="featured-title"
        >
          <div className="featured-copy">
            <div className="featured-top">
              <p className="featured-label">
                <img src={featured.logo} alt="" className="featured-logo" width="40" height="40" />
                Featured project
              </p>
              <p className="award-pill">
                <Trophy size={16} strokeWidth={2} aria-hidden="true" />
                {featured.award}
              </p>
            </div>

            <h2 id="featured-title" className="featured-title">
              {featured.name}
            </h2>
            <p className="featured-tagline">{featured.tagline}</p>
            <p className="featured-pitch">{featured.pitch}</p>

            <ul className="featured-stack" aria-label="Built with">
              {featured.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            <div className="featured-actions">
              <a href={featured.beta} target="_blank" rel="noopener noreferrer" className="btn btn-mint">
                Try the beta
                <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a
                href={`#work-${featured.slug}`}
                className="btn btn-line"
                onClick={(event) => {
                  event.preventDefault()
                  onOpenProject(featured.slug)
                }}
              >
                Read the case study
              </a>
            </div>
          </div>

          <div className="featured-visual">
            <img src={featured.image} alt={featured.imageAlt} className="featured-shot" />
            <p className="glass chip featured-chip" data-sheen>
              <span className="status-dot" aria-hidden="true" />
              Paid per accepted answer, on-chain
            </p>
          </div>
        </motion.article>

        {/* ── About + disciplines ────────────────────────────────── */}
        <motion.article variants={rise} className="tile tile-about">
          <h2 className="tile-head">About</h2>
          <div className="tile-body">
            <p className="about-copy">
              Hi, I’m Carl. I finished my Computer Science degree at Mapúa University in 2026,
              specializing in AI. I work on both sides of the line: training and evaluating models,
              then building the software around them, from the API and database to payments and
              deploys.
            </p>
            <p className="about-copy">
              Two of my ML projects became IEEE papers. On the software side, Centient won a
              $5,000 Instawards grant and Pink Raft took 1st runner-up at the Stellar Hackathon.
            </p>
          </div>
        </motion.article>

        <motion.article variants={rise} className="tile tile-skills">
          <h2 className="tile-head">What I work on</h2>
          <div className="tile-body skills-body">
            {disciplines.map((group) => (
              <div key={group.title} className="skills-group">
                <h3 className="skills-title">{group.title}</h3>
                <ul className="pill-list">
                  {group.items.map((item) => (
                    <li key={item} className="pill">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.article>
      </motion.div>
    </section>
  )
}

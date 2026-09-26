import { Fragment, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { ArrowUpRight, ArrowDown, MessageCircle, Github, Trophy, Pause, Play } from 'lucide-react'
import ShapeWaves from './ShapeWaves'
import GradPhoto from '../assets/me.jpeg'
import BarongPhoto from '../assets/me-barong.jpg'
import ResumePage from '../assets/resume-page.jpg'
import { profile, disciplines, featured } from '../data/portfolio'
import { useCycle, usePageVisible } from '../hooks/useCycle'
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

// `backdrop` is each photo's own top-edge color, so the zoomed-out frame
// blends into the studio background instead of showing a band.
const PORTRAITS = [
  { src: GradPhoto, alt: 'Carl in graduation robes', width: 1320, height: 1365, backdrop: '#0b0b0b' },
  { src: BarongPhoto, alt: 'Carl smiling in a white barong', width: 1320, height: 1342, backdrop: '#2e323d' },
]

const FADE = 0.9
const HOLD = 4

/* ── Portrait: two photos that trade places ─────────────────── */
function Portrait() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [held, setHeld] = useState(false)

  // Rotates unless reduced motion is on or the viewer picked a photo.
  const auto = !reduce && !held
  const running = inView && pageVisible && !hovered

  return (
    <figure
      ref={ref}
      className="main-photo"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {PORTRAITS.map((photo, i) => {
        const on = i === index
        return (
          <motion.div
            key={photo.src}
            className="portrait"
            style={{ '--backdrop': photo.backdrop, zIndex: on ? 2 : 1 }}
            initial={false}
            animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
            // The outgoing photo stays put until the new one has covered it,
            // so the swap never dips through a half-transparent frame.
            transition={
              on
                ? { duration: FADE, ease: EASE }
                : { opacity: { delay: FADE, duration: 0 }, scale: { delay: FADE, duration: 0 } }
            }
            aria-hidden={!on}
          >
            <img
              src={photo.src}
              alt={on ? photo.alt : ''}
              width={photo.width}
              height={photo.height}
              decoding="async"
            />
          </motion.div>
        )
      })}

      <figcaption className="overlay-pill photo-chip">Mapúa CS ’26 · AI specialization</figcaption>

      <button
        type="button"
        className="overlay-pill photo-dots"
        aria-label={`Photo ${index + 1} of ${PORTRAITS.length}. Show the next one`}
        onClick={() => {
          setIndex((index + 1) % PORTRAITS.length)
          setHeld(true)
        }}
      >
        {PORTRAITS.map((photo, i) => {
          const on = i === index
          return (
            <span
              key={photo.src}
              className={`photo-dot${on ? ' is-on' : ''}${on && auto ? ' is-timed' : ''}`}
              aria-hidden="true"
            >
              {on && auto && (
                // The fill is the timer: when it reaches the end, the photos swap.
                <span
                  key={index}
                  className="photo-fill"
                  style={{
                    animationDuration: `${HOLD}s`,
                    animationPlayState: running ? 'running' : 'paused',
                  }}
                  onAnimationEnd={() => setIndex((current) => (current + 1) % PORTRAITS.length)}
                />
              )}
            </span>
          )
        })}
      </button>
    </figure>
  )
}

/* ── Centient: the product, one screen at a time ─────────────── */
const SLIDE = 3.2

function CentientReel({ screens }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const reduce = useReducedMotion()
  const pageVisible = usePageVisible()
  const [index, setIndex] = useState(0)
  const [toggled, setToggled] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Plays by default; with reduced motion it starts paused, and the toggle flips it.
  const playing = reduce ? toggled : !toggled
  const running = playing && inView && pageVisible && !hovered
  const count = screens.length

  return (
    <div
      ref={ref}
      className="featured-visual"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="reel-window">
        <div className="reel-bar" aria-hidden="true">
          <span className="reel-lights">
            <i />
            <i />
            <i />
          </span>
          <span className="reel-url">beta.centient.work</span>
        </div>
        <div className="reel-screen">
          {screens.map((screen, i) => {
            // 0 is showing, count - 1 just left (exits left), the rest wait on the right.
            const offset = (i - index + count) % count
            const state =
              offset === 0
                ? { opacity: 1, x: '0%', filter: 'blur(0px)' }
                : offset === count - 1
                  ? { opacity: 0, x: '-7%', filter: 'blur(6px)' }
                  : { opacity: 0, x: '7%', filter: 'blur(6px)' }
            return (
              <motion.img
                key={screen.src}
                src={screen.src}
                alt={offset === 0 ? screen.alt : ''}
                aria-hidden={offset !== 0}
                className="reel-shot"
                width="1600"
                height="1073"
                decoding="async"
                initial={false}
                animate={state}
                transition={{ duration: 0.7, ease: EASE }}
              />
            )
          })}
        </div>
      </div>

      <p className="overlay-pill featured-chip">
        <span className="status-dot" aria-hidden="true" />
        <span className="chip-roll">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={index}
              className="chip-text"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {screens[index].caption}
            </motion.span>
          </AnimatePresence>
        </span>
      </p>

      <div className="overlay-pill reel-controls" role="group" aria-label="Centient screens">
        {screens.map((screen, i) => (
          <button
            key={screen.src}
            type="button"
            className="reel-pip"
            aria-label={`Screen ${i + 1} of ${count}: ${screen.caption}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
          >
            {i === index && (
              // The fill is the timer: when it finishes, the next screen comes in.
              <span
                key={index}
                className="reel-fill"
                style={{
                  animationDuration: `${SLIDE}s`,
                  animationPlayState: running ? 'running' : 'paused',
                }}
                onAnimationEnd={() => setIndex((current) => (current + 1) % count)}
              />
            )}
          </button>
        ))}
        <button
          type="button"
          className="reel-toggle"
          aria-label={playing ? 'Pause the slideshow' : 'Play the slideshow'}
          onClick={() => setToggled((t) => !t)}
        >
          {playing ? (
            <Pause size={13} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <Play size={13} strokeWidth={2.4} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}

/* ── What I work on: each skill, and where it was used ───────── */
const SKILLS = disciplines.flatMap((group) => group.items)

function SkillsTile() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.45 })
  const [pointing, setPointing] = useState(false)
  const [index, setIndex] = useCycle(SKILLS.length, 3400, inView && !pointing)
  const current = SKILLS[index]

  const point = (i) => {
    setIndex(i)
    setPointing(true)
  }

  return (
    <motion.article ref={ref} variants={rise} className="tile tile-skills">
      <h2 className="tile-head">What I work on</h2>
      <div className="tile-body skills-body">
        <div className="skills-focus" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              className="focus-roll"
              initial={{ y: '45%', opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '-45%', opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.75, ease: EASE }}
            >
              <p className="focus-name">{current.name}</p>
              <p className="focus-where">
                <span className="focus-project">{current.project}</span>
                <span className="focus-sep">·</span>
                {current.where}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="skills-groups" onPointerLeave={() => setPointing(false)}>
          {disciplines.map((group) => (
            <div key={group.title} className="skills-group">
              <h3 className="skills-title">{group.title}</h3>
              <ul className="pill-list">
                {group.items.map((item) => {
                  const i = SKILLS.indexOf(item)
                  const on = i === index
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        className={`pill skill-pill${on ? ' is-on' : ''}`}
                        aria-describedby={`skill-where-${i}`}
                        onPointerEnter={() => point(i)}
                        onFocus={() => point(i)}
                        onBlur={() => setPointing(false)}
                        onClick={() => setIndex(i)}
                      >
                        {on && (
                          <motion.span
                            layoutId="skill-lens"
                            className="skill-lens"
                            style={{ borderRadius: 999 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                          />
                        )}
                        <span className="skill-label">{item.name}</span>
                      </button>
                      <span id={`skill-where-${i}`} hidden>
                        {item.project}: {item.where}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

// Field palettes per theme. The background must match the tile exactly, since
// ShapeWaves paints an opaque surface. Glow is off in light mode: bloom adds
// light, which vanishes on a near-white tile.
const FIELD = {
  light: { backgroundColor: '#fbfdfc', color: '#afbbb7', hoverColor: '#0fae8a', glow: 0 },
  dark: { backgroundColor: '#141716', color: '#3f4947', hoverColor: '#64ffda', glow: 0.35 },
}

export default function HeroBento({ theme, showField, onOpenProject, onAskAssistant }) {
  const words = HEADLINE.split(' ')
  // Without WebGPU (or if it fails), drop the field so the static dot grid shows instead.
  const [fieldOk, setFieldOk] = useState(() => typeof navigator !== 'undefined' && 'gpu' in navigator)

  return (
    <section id="home" className="hero shell" aria-labelledby="hero-title">
      <motion.div className="hero-grid" variants={grid} initial="hidden" animate="show">
        {/* ── Main: who, in one line, plus the portrait ───────────── */}
        <motion.article variants={rise} className="tile tile-main">
          <div className="main-copy">
            {showField && fieldOk && (
              <div className="main-field" aria-hidden="true">
                <ShapeWaves
                  {...(FIELD[theme] ?? FIELD.light)}
                  shapes="mixed"
                  cellSize={10}
                  dotSize={0.75}
                  speed={1}
                  scale={1}
                  contrast={1}
                  brightness={0.4}
                  fade={0.25}
                  splashRadius={40}
                  splashStrength={0.4}
                  introDuration={1.6}
                  onError={() => setFieldOk(false)}
                />
              </div>
            )}
            <p className="glass chip status-chip" data-sheen>
              <span className="status-dot" aria-hidden="true" />
              Open to AI/ML and software roles
            </p>

            <div className="main-text">
              <p className="glass main-kicker">
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

          <Portrait />
        </motion.article>

        {/* ── Side: assistant, résumé, GitHub ─────────────────────── */}
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
            <motion.a
              variants={rise}
              href={profile.resume}
              download="Carl-Macabales-Resume.pdf"
              className="tile tile-resume"
            >
              <span className="resume-stack" aria-hidden="true">
                <span className="resume-under" />
                <img src={ResumePage} alt="" className="resume-sheet" width="360" height="466" />
              </span>
              <span className="resume-badge" aria-hidden="true">
                <ArrowDown size={18} strokeWidth={1.8} />
              </span>
              <span className="resume-copy">
                <span className="resume-title">Résumé</span>
                <span className="resume-sub">One page · PDF</span>
              </span>
              <span className="visually-hidden"> (downloads a PDF)</span>
            </motion.a>

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

          <CentientReel screens={featured.screens} />
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

        <SkillsTile />
      </motion.div>
    </section>
  )
}

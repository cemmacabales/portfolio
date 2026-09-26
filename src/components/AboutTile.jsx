import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { about } from '../data/portfolio'
import { useCycle, usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import { Hoops, Lift, Games, Music, KDrama, Dogs, Cube } from './HobbyScenes'
import './AboutTile.css'

const EASE = [0.16, 1, 0.3, 1]
const HOLD = 5600

// `scene` names in the data map to these.
const SCENES = { hoops: Hoops, lift: Lift, games: Games, music: Music, kdrama: KDrama, dogs: Dogs, cube: Cube }

// The paragraph, with each hobby numbered in the order it's read.
const HOBBIES = about.offClock.filter((part) => typeof part !== 'string')
const PARTS = about.offClock.map((part) =>
  typeof part === 'string' ? part : { ...part, index: HOBBIES.indexOf(part) },
)

/*
 * A short hello, then one paragraph of hobbies. The stage below acts out one
 * hobby at a time; pointing at a word in the paragraph jumps to its scene,
 * and the mint highlight glides to that word (the same lens as the skills).
 */
export default function AboutTile({ variants }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const pageVisible = usePageVisible()
  const reduce = useReducedMotion()
  const booted = useBooted()
  const [pointing, setPointing] = useState(false)
  const [index, setIndex] = useCycle(HOBBIES.length, HOLD, booted && inView && !pointing)

  const current = HOBBIES[index]
  const Scene = SCENES[current.scene]
  const playing = booted && inView && pageVisible && !reduce

  const point = (i) => {
    setIndex(i)
    setPointing(true)
  }

  return (
    <motion.article ref={ref} variants={variants} className="tile tile-about">
      <h2 className="tile-head">What I do for fun</h2>

      <div className="tile-body about-body">
        <p className="about-hello">{about.hello}</p>
        <p className="about-copy">{about.from}</p>
        <p className="about-copy about-hobbies" onPointerLeave={() => setPointing(false)}>
          {PARTS.map((part) => {
            if (typeof part === 'string') return part
            const on = part.index === index
            return (
              <button
                key={part.scene}
                type="button"
                className={`hobby${on ? ' is-on' : ''}`}
                onPointerEnter={() => point(part.index)}
                onFocus={() => point(part.index)}
                onBlur={() => setPointing(false)}
                onClick={() => setIndex(part.index)}
              >
                {on && (
                  <motion.span
                    layoutId="hobby-lens"
                    className="hobby-lens"
                    style={{ borderRadius: 8 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                {part.text}
              </button>
            )
          })}
        </p>
      </div>

      {/* Decorative: the paragraph above already says everything shown here. */}
      <div className="about-stage" data-paused={playing ? undefined : ''} aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.scene}
            className="about-scene"
            initial={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              scale: 1.02,
              filter: 'blur(6px)',
              transition: { duration: 0.3, ease: 'easeIn' },
            }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <Scene playing={playing} />
          </motion.div>
        </AnimatePresence>

        <p className="overlay-pill about-chip">
          <span className="status-dot" />
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
                {current.label}
              </motion.span>
            </AnimatePresence>
          </span>
        </p>
      </div>
    </motion.article>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Plus } from 'lucide-react'
import { thesis } from '../data/portfolio'
import { useBooted } from '../hooks/useBooted'
import posthog from '../posthog'
import ThesisScan from './ThesisScan'
import { CLASS_NAMES, SLICE_CLASSES } from './thesisClasses'
import DiceBars from './ThesisDice'
import ThesisStory from './ThesisStory'
import './ThesisTile.css'

/*
 * Thesis: the kidney CT model. On first view a scan line sweeps the slice and
 * paints in what the model found while the Dice bars grow beside it. The tile
 * (or its Expand button) opens the full story, App Store Today style: the card
 * grows into a sheet and the scan flies into its header.
 */
export default function ThesisTile({ variants }) {
  const ref = useRef(null)
  const scanRef = useRef(null)
  const toggleRef = useRef(null)
  const booted = useBooted()
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const [swept, setSwept] = useState(false)
  const [focus, setFocus] = useState(null)
  const [open, setOpen] = useState(false)
  // The tile's scan hides while its stand-in is out flying.
  const [lifted, setLifted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Hidden ahead of time once JS is running, then swept in on first view.
  // Without JS, or with reduced motion, the finished overlay simply shows.
  const state = reduce || swept || !booted ? 'done' : inView ? 'run' : 'armed'
  const barState = reduce || !booted ? 'done' : inView ? 'run' : 'armed'

  const openStory = () => {
    if (open) return
    setLifted(true)
    setOpen(true)
    posthog.capture('thesis_story_opened')
  }

  const close = useCallback(() => setOpen(false), [])

  // The story hands focus back to Expand as it unmounts, once the page is
  // no longer inert (focusing it any sooner silently fails).
  const returnFocus = useCallback(() => toggleRef.current?.focus({ preventScroll: true }), [])

  const getOrigin = useCallback(
    () => ({
      card: ref.current?.getBoundingClientRect(),
      scan: scanRef.current?.getBoundingClientRect(),
    }),
    []
  )

  const found = SLICE_CLASSES.map((id) => CLASS_NAMES[id])
  const missing = focus && !SLICE_CLASSES.includes(focus)

  return (
    <motion.article
      ref={ref}
      variants={variants}
      className={`tile tile-thesis th-scope${open ? ' is-open' : ''}`}
      aria-labelledby="thesis-title"
      onClick={openStory}
    >
      <div className="tile-head th-head">
        <h3 id="thesis-title">Thesis</h3>
        <button
          ref={toggleRef}
          type="button"
          className={`th-expand${open ? ' is-open' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation()
            openStory()
          }}
        >
          <span className="th-expand-label">
            <span>Expand</span>
          </span>
          <span className="visually-hidden"> the thesis story</span>
          <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <div className="tile-body th-body">
        <div className="th-copy">
          <p className="th-meta">{thesis.meta}</p>
          <h4 className="th-title">{thesis.headline}</h4>
          <p className="th-summary">{thesis.summary}</p>
          <DiceBars state={barState} onFocus={setFocus} />
          <p className="th-note">
            <i className="th-dot" data-cls="kidney" aria-hidden="true" />
            Kidney: {thesis.kidney.toFixed(3)}, the anchor the other three learn around.
          </p>
        </div>

        <figure className="th-figure">
          <ThesisScan
            ref={scanRef}
            className={`th-scan-tile${lifted ? ' is-lifted' : ''}`}
            state={state}
            focus={focus}
            onSwept={() => setSwept(true)}
          >
            <span className="th-hud th-hud-slice" aria-hidden="true">
              Axial · {thesis.scan.slice}/{thesis.scan.of}
            </span>
            <span className={`th-hud th-hud-legend${state === 'done' ? ' is-shown' : ''}`} aria-hidden="true">
              {SLICE_CLASSES.map((id) => (
                <span key={id} className="th-chip" data-cls={id}>
                  <i className="th-dot" data-cls={id} />
                  {CLASS_NAMES[id]}
                </span>
              ))}
            </span>
            <span className={`th-hud th-hud-none${missing ? ' is-shown' : ''}`} aria-hidden="true">
              No {focus && CLASS_NAMES[focus]?.toLowerCase()} on this slice
            </span>
          </ThesisScan>
          <figcaption className="visually-hidden">
            {thesis.scan.alt} Found on this slice: {found.join(' and ')}.
          </figcaption>
        </figure>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence onExitComplete={() => setLifted(false)}>
            {open && <ThesisStory key="story" onClose={close} getOrigin={getOrigin} returnFocus={returnFocus} />}
          </AnimatePresence>,
          document.body
        )}
    </motion.article>
  )
}

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Plus } from 'lucide-react'
import { setup } from '../data/portfolio'
import { usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import { AppMark, RigParts } from './SetupArt'
import './SetupTile.css'

/*
 * My setup: About This Mac, plus a Dock of what stays open. The + in the
 * corner (or anywhere on the tile) opens the whole desk; HeroDesk runs that.
 */
export default function SetupTile({ variants, expanded = false, spinning = false, onExpand, onSpun, toggleRef }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const booted = useBooted()
  const pageVisible = usePageVisible()
  const live = booted && inView && pageVisible && !expanded

  return (
    <motion.article
      ref={ref}
      variants={variants}
      className={`tile tile-setup rig-host${live ? ' is-live' : ''}`}
      aria-labelledby="setup-title"
      onClick={onExpand}
    >
      <div className="tile-head setup-head">
        <h2 id="setup-title">My setup</h2>
        <button
          ref={toggleRef}
          type="button"
          className={`setup-toggle${spinning ? ' is-spinning' : ''}`}
          aria-expanded={expanded}
          aria-busy={spinning || undefined}
          onClick={(event) => {
            event.stopPropagation()
            onExpand?.()
          }}
          onAnimationEnd={(event) => {
            if (event.animationName === 'setup-spin') onSpun?.()
          }}
        >
          <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          <span className="visually-hidden">Show my whole desk</span>
        </button>
      </div>

      <div className="tile-body setup-body">
        <figure className="rig-figure">
          <svg className="rig-art" viewBox="0 0 360 168" aria-hidden="true">
            <RigParts />
          </svg>
          <figcaption className="rig-captions">
            <span className="rig-caption">
              <span className="setup-name">{setup.machine.name}</span>
              <span className="setup-role">{setup.machine.detail}</span>
            </span>
            <span className="rig-caption rig-caption-end">
              <span className="setup-name">{setup.server.name}</span>
              <span className="setup-role">{setup.server.detail}</span>
            </span>
          </figcaption>
        </figure>

        <ul className="dock" aria-label="Apps I keep open">
          {setup.apps.map((app) => (
            <li key={app.id} className="dock-app">
              <span className={`dock-icon app-icon app-icon-${app.id}`} aria-hidden="true">
                <AppMark id={app.id} />
              </span>
              <span className="dock-run" aria-hidden="true" />
              <span className="dock-text">
                <span className="setup-name">{app.name}</span>
                <span className="setup-role">{app.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

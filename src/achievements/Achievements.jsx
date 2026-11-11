import { useEffect, useRef, useState } from 'react'
import {
  Moon,
  BookOpen,
  Zap,
  PawPrint,
  Film,
  Monitor,
  ScanLine,
  MessageCircle,
  Cookie,
  Mail,
  Wrench,
  Trophy,
  Lock,
  X,
} from 'lucide-react'
import { ACHIEVEMENTS, foundCount, isFound } from './core'
import { onEvent } from '../events'
import { useFoundCount } from './hooks'
import './Achievements.css'

/*
 * The quiet side of the achievements (src/achievements/core.js): a small note
 * in the corner when one unlocks, gone in a few seconds, and the list itself,
 * opened from the footer's cookie line or from the note. Nothing moves on its
 * own beyond that.
 */

const ICONS = {
  moon: Moon,
  book: BookOpen,
  zap: Zap,
  paw: PawPrint,
  film: Film,
  monitor: Monitor,
  scan: ScanLine,
  chat: MessageCircle,
  cookie: Cookie,
  mail: Mail,
  wrench: Wrench,
  trophy: Trophy,
}

const NOTE_MS = 4000

function Trophies({ open, onClose }) {
  const ref = useRef(null)
  useFoundCount() // re-render as they unlock

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const count = foundCount()

  return (
    <dialog
      ref={ref}
      className="trophies"
      aria-labelledby="trophies-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
      <div className="trophies-card">
        <header className="trophies-head">
          <h2 id="trophies-title">Achievements</h2>
          <p>
            {count} of {ACHIEVEMENTS.length} found
          </p>
          <button type="button" className="trophies-x" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>
        <div className="trophies-meter" aria-hidden="true">
          <i style={{ width: `${(count / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
        <ul className="trophies-grid">
          {ACHIEVEMENTS.map((a) => {
            const got = isFound(a.id)
            const hidden = a.secret && !got
            const Icon = got ? ICONS[a.icon] : Lock
            return (
              <li key={a.id} className={got ? 'is-found' : undefined}>
                <span className="trophy-medal" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.9} />
                </span>
                <b>{hidden ? 'Secret' : a.name}</b>
                <span>{hidden ? 'Keep exploring' : a.how}</span>
                <span className="visually-hidden">{got ? 'Found' : 'Not found yet'}</span>
              </li>
            )
          })}
        </ul>
        <p className="trophies-foot">Kept in this browser only.</p>
      </div>
      )}
    </dialog>
  )
}

export default function Achievements() {
  const [note, setNote] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(
    () =>
      onEvent((name, props) => {
        if (name === 'open_trophies') setOpen(true)
        if (name === 'achievement_unlocked') {
          const a = ACHIEVEMENTS.find((x) => x.id === props?.achievement)
          if (a) setNote({ ...a, key: Date.now() })
        }
      }),
    [],
  )

  useEffect(() => {
    if (!note) return undefined
    const t = setTimeout(() => setNote(null), NOTE_MS)
    return () => clearTimeout(t)
  }, [note])

  const Icon = note ? ICONS[note.icon] : Trophy

  return (
    <>
      <div className="achievement-note-slot" role="status" aria-live="polite">
        {note && (
          <button
            key={note.key}
            type="button"
            className="glass achievement-note"
            onClick={() => {
              setNote(null)
              setOpen(true)
            }}
          >
            <span className="achievement-note-icon" aria-hidden="true">
              <Icon size={14} strokeWidth={2} />
            </span>
            <span>
              Achievement: <b>{note.name}</b>
            </span>
          </button>
        )}
      </div>
      <Trophies open={open} onClose={() => setOpen(false)} />
    </>
  )
}

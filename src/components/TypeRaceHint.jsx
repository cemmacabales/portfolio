import { useEffect, useState } from 'react'
import { useBooted } from '../hooks/useBooted'
import { isMacLike } from '../utils/platform'
import { CARL_BEST } from '../data/typing'
import './TypeRaceHint.css'

const PEEK_KEY = 'type-race-peeked'

/*
 * The ⌘K hint, perched on the assistant's launcher. Two keycaps in a small
 * glass pill that mirror the real keys: hold ⌘ and its cap goes down. Once a
 * visit it plays the shortcut and says what it's for, then folds back to the
 * caps. Hover brings the label back. Only shown where there's a keyboard.
 */
export default function TypeRaceHint({ onOpen, onIntent }) {
  const booted = useBooted()
  const [mac, setMac] = useState(null)
  const [mod, setMod] = useState(false)
  const [k, setK] = useState(false)
  const [peek, setPeek] = useState(false)

  useEffect(() => setMac(isMacLike()), [])

  useEffect(() => {
    if (mac === null) return undefined
    const modKey = mac ? 'Meta' : 'Control'
    const down = (e) => {
      if (e.key === modKey) setMod(true)
      else if (e.code === 'KeyK' && (mac ? e.metaKey : e.ctrlKey)) setK(true)
    }
    const up = (e) => {
      // macOS drops K's keyup while ⌘ is held, so letting go of ⌘ lifts both.
      if (e.key === modKey) {
        setMod(false)
        setK(false)
      } else if (e.code === 'KeyK') setK(false)
    }
    const reset = () => {
      setMod(false)
      setK(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', reset)
    }
  }, [mac])

  useEffect(() => {
    if (!booted) return undefined
    try {
      if (sessionStorage.getItem(PEEK_KEY) === '1') return undefined
      sessionStorage.setItem(PEEK_KEY, '1')
    } catch {
      /* storage blocked: peek anyway */
    }
    const show = setTimeout(() => setPeek(true), 1600)
    const hide = setTimeout(() => setPeek(false), 6200)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [booted])

  if (!booted || mac === null) return null

  return (
    <button
      type="button"
      className="race-hint"
      data-peek={peek}
      onClick={onOpen}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      aria-label={`Typing test (${mac ? 'Command' : 'Control'} K)`}
      aria-keyshortcuts={mac ? 'Meta+K' : 'Control+K'}
    >
      <span className="race-hint-label" aria-hidden="true">
        <span>
          <span>
            Beat my <b>{CARL_BEST[15].wpm}</b> wpm
          </span>
        </span>
      </span>
      <span className="race-hint-keys" aria-hidden="true">
        <kbd data-on={mod} className={mac ? undefined : 'is-word'}>
          {mac ? '⌘' : 'ctrl'}
        </kbd>
        <kbd data-on={k}>K</kbd>
      </span>
    </button>
  )
}

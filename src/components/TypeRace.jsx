import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Segmented from './Segmented'
import { CARL_BEST, CARL_HIGHLIGHTS, DURATIONS, makeWords } from '../data/typing'
import { isMacLike } from '../utils/platform'
import posthog from '../posthog'
import './TypeRace.css'

const CLOSE_MS = 220
// Enough words that nobody runs out: four a second is 240 wpm.
const wordsFor = (duration) => makeWords(duration * 4)

const DURATION_OPTIONS = DURATIONS.map((d) => ({ id: d, label: `${d}s` }))

// A Mac-proportioned board, every row 15 units wide. Single characters are
// centered like letter caps; named keys sit bottom-left like modifiers.
const CHAR_ROWS = [
  [..."`1234567890-="].concat([['delete', 'Backspace', 2]]),
  [['tab', 'Tab', 1.5], ...'qwertyuiop[]', ['\\', 'Backslash', 1.5]],
  [['caps lock', 'CapsLock', 1.75], ..."asdfghjkl;'", ['return', 'Enter', 2.25]],
  [['shift', 'ShiftLeft', 2.25], ...'zxcvbnm,./', ['shift', 'ShiftRight', 2.75]],
]
const MAC_MODS = [
  ['control', 'ControlLeft', 1.5],
  ['option', 'AltLeft', 1.5],
  ['command', 'MetaLeft', 1.75],
  ['', 'Space', 5.5],
  ['command', 'MetaRight', 1.75],
  ['option', 'AltRight', 1.5],
  ['control', 'ControlRight', 1.5],
]
const PC_MODS = [
  ['ctrl', 'ControlLeft', 1.5],
  ['win', 'MetaLeft', 1.5],
  ['alt', 'AltLeft', 1.75],
  ['', 'Space', 5.5],
  ['alt', 'AltRight', 1.75],
  ['menu', 'ContextMenu', 1.5],
  ['ctrl', 'ControlRight', 1.5],
]

const NAMED = { '`': 'Backquote', '-': 'Minus', '=': 'Equal', '[': 'BracketLeft', ']': 'BracketRight', ';': 'Semicolon', "'": 'Quote', ',': 'Comma', '.': 'Period', '/': 'Slash', '\\': 'Backslash' }
const codeFor = (ch) => NAMED[ch] ?? (/\d/.test(ch) ? `Digit${ch}` : `Key${ch.toUpperCase()}`)
const toKey = (entry) => (typeof entry === 'string' ? [entry, codeFor(entry), 1] : entry)

const Keyboard = memo(function Keyboard({ boardRef, mac }) {
  const rows = [...CHAR_ROWS, mac ? MAC_MODS : PC_MODS]
  return (
    <div ref={boardRef} className="race-keys" aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="race-row">
          {row.map(toKey).map(([label, code, units]) => (
            <span
              key={code}
              data-code={code}
              className={`race-key${label.length === 1 ? ' is-char' : ''}`}
              style={units === 1 ? undefined : { '--u': units }}
            >
              {label}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
})

// The countdown and live speed tick on their own, so the passage only
// re-renders when a key lands.
function Clock({ running, startedAt, duration, correct }) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (!running) return undefined
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [running])
  const elapsed = running && now ? Math.max(0, (now - startedAt) / 1000) : 0
  const left = Math.max(0, Math.ceil(duration - elapsed))
  const wpm = elapsed >= 1 ? Math.round(correct / 5 / (elapsed / 60)) : null
  return (
    <div className="race-clock">
      <span className="race-time" aria-label={`${left} seconds left`}>
        {left}
      </span>
      <span className="race-wpm">
        {wpm ?? '–'} <span>wpm</span>
      </span>
    </div>
  )
}

function useCountUp(target) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 700)
      setValue(Math.round(target * (1 - (1 - p) ** 3)))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value
}

function verdict(you, carl) {
  const gap = Math.abs(you - carl)
  if (you > carl) return [`You beat Carl by ${gap} wpm.`, 'He’ll want a rematch.']
  if (you === carl) return ['Dead even with Carl.', 'Run it back.']
  return [`${gap} wpm behind Carl.`, gap <= 15 ? 'Close. One more?' : 'Warm up and go again.']
}

function Results({ result, againRef, onAgain, onClose }) {
  const carl = CARL_BEST[result.duration].wpm
  const shown = useCountUp(result.wpm)
  const [line, sub] = verdict(result.wpm, carl)
  const scale = Math.max(result.wpm, carl) / 0.88
  return (
    <div className="race-result" aria-live="polite">
      <div className="race-score-row">
        <div>
          <p className="race-label">wpm</p>
          <p className="race-score">{shown}</p>
        </div>
        <div className="race-stat">
          <p className="race-label">accuracy</p>
          <p>{result.acc}%</p>
        </div>
        <div className="race-stat">
          <p className="race-label">raw</p>
          <p>{result.raw}</p>
        </div>
        <p className="race-verdict">
          {line}
          <span>{sub}</span>
        </p>
      </div>

      <div className="race-bars">
        <span>you</span>
        <span className="race-bar">
          <span className="is-you" style={{ '--w': result.wpm / scale }} />
        </span>
        <span>{result.wpm}</span>
        <span>Carl</span>
        <span className="race-bar">
          <span style={{ '--w': carl / scale }} />
        </span>
        <span>{carl}</span>
      </div>

      <dl className="race-carl">
        {CARL_HIGHLIGHTS.map((h) => (
          <div key={h.label}>
            <dt>{h.label}</dt>
            <dd>
              {h.value}
              <span>{h.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="race-actions">
        <button ref={againRef} type="button" className="race-btn is-primary" onClick={onAgain}>
          Try again
        </button>
        <button type="button" className="race-btn" onClick={onClose}>
          Back to portfolio
        </button>
      </div>
    </div>
  )
}

/*
 * A Monkeytype-style speed test in a modal <dialog>, opened with ⌘K. The
 * board below the passage lights each key as it goes down (mint when it was
 * right, red when it wasn't), and the result is held up against Carl's best
 * for the same length.
 */
export default function TypeRace({ open, onClose }) {
  const dialogRef = useRef(null)
  const passageRef = useRef(null)
  const innerRef = useRef(null)
  const caretRef = useRef(null)
  const boardRef = useRef(null)
  const againRef = useRef(null)
  const lineHeight = useRef(0)
  const strokes = useRef({ total: 0, correct: 0 })
  const typedRef = useRef('')

  const [mac] = useState(isMacLike)
  const [duration, setDuration] = useState(15)
  const [text, setText] = useState(() => wordsFor(15))
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState('ready')
  const [startedAt, setStartedAt] = useState(0)
  const [result, setResult] = useState(null)
  const [closing, setClosing] = useState(false)

  typedRef.current = typed

  const focusPassage = () =>
    requestAnimationFrame(() => passageRef.current?.focus({ preventScroll: true }))

  const restart = useCallback((next) => {
    const d = next ?? duration
    setDuration(d)
    setText(wordsFor(d))
    setTyped('')
    setPhase('ready')
    setStartedAt(0)
    setResult(null)
    strokes.current = { total: 0, correct: 0 }
    focusPassage()
  }, [duration])

  // Opening always deals a fresh passage.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      restart()
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
    if (!open) setClosing(false)
    // restart is only wanted on the transition, not when duration changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const requestClose = useCallback(() => setClosing(true), [])

  useEffect(() => {
    if (!closing) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(onClose, reduce ? 0 : CLOSE_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  const finish = useCallback(() => {
    const t = typedRef.current
    let correct = 0
    for (let i = 0; i < t.length; i++) if (t[i] === text[i]) correct++
    const minutes = duration / 60
    const { total, correct: hits } = strokes.current
    const next = {
      duration,
      wpm: Math.round(correct / 5 / minutes),
      raw: Math.round(t.length / 5 / minutes),
      acc: total ? Math.round((hits / total) * 100) : 0,
    }
    setResult(next)
    setPhase('done')
    posthog.capture('typing_test_finished', {
      duration_seconds: duration,
      wpm: next.wpm,
      accuracy: next.acc,
      beat_carl: next.wpm > CARL_BEST[duration].wpm,
    })
  }, [duration, text])

  useEffect(() => {
    if (phase !== 'running') return undefined
    const timer = setTimeout(finish, Math.max(0, startedAt + duration * 1000 - Date.now()))
    return () => clearTimeout(timer)
  }, [phase, startedAt, duration, finish])

  useEffect(() => {
    if (phase === 'done') againRef.current?.focus({ preventScroll: true })
  }, [phase])

  // The caret glides to the next character, and the passage rolls up a line
  // whenever the caret reaches the third, so the line you're on stays second.
  useLayoutEffect(() => {
    if (!open || phase === 'done') return
    const inner = innerRef.current
    const at = inner?.querySelector(`[data-i="${typed.length}"]`)
    if (!at) return
    if (!lineHeight.current) lineHeight.current = parseFloat(getComputedStyle(inner).lineHeight)
    const lh = lineHeight.current
    caretRef.current.style.transform = `translate(${at.offsetLeft}px, ${at.offsetTop}px)`
    caretRef.current.style.height = `${at.offsetHeight}px`
    const line = Math.floor(at.offsetTop / lh)
    inner.style.transform = `translateY(${-Math.max(0, line - 1) * lh}px)`
  }, [open, phase, typed, text])

  const keyEl = (code) => boardRef.current?.querySelector(`[data-code="${code}"]`)
  const press = (code, miss) => {
    const key = keyEl(code)
    if (!key) return
    key.classList.remove('is-on', 'is-miss')
    key.classList.add(miss ? 'is-miss' : 'is-on')
  }
  const releaseAll = () =>
    boardRef.current?.querySelectorAll('.is-on, .is-miss').forEach((k) => k.classList.remove('is-on', 'is-miss'))

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      e.stopPropagation()
      requestClose()
      return
    }
    // Tab restarts from anywhere, results included, as in Monkeytype.
    if (e.key === 'Tab') {
      e.preventDefault()
      restart()
      return
    }
    if (phase === 'done') return
    if (e.metaKey || e.ctrlKey || e.altKey) {
      press(e.code)
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      press(e.code)
      setTyped((t) => t.slice(0, -1))
      return
    }
    if (e.key.length !== 1) {
      press(e.code)
      return
    }
    e.preventDefault()
    const at = typedRef.current.length
    if (at >= text.length) return
    const hit = e.key === text[at]
    press(e.code, !hit)
    strokes.current.total++
    if (hit) strokes.current.correct++
    if (phase === 'ready') {
      setPhase('running')
      setStartedAt(Date.now())
    }
    setTyped((t) => t + e.key)
  }

  const onKeyUp = (e) => {
    // macOS swallows the keyup of anything pressed while ⌘ is down.
    if (e.key === 'Meta') return releaseAll()
    keyEl(e.code)?.classList.remove('is-on', 'is-miss')
  }

  const words = useMemo(() => text.split(' '), [text])
  const correct = useMemo(() => {
    let n = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) n++
    return n
  }, [typed, text])

  const state = (i) => (i >= typed.length ? '' : typed[i] === text[i] ? ' is-ok' : ' is-no')
  let index = 0
  const passage = words.map((word, w) => {
    const letters = [...word].map((ch) => {
      const i = index++
      return (
        <span key={i} data-i={i} className={`race-ch${state(i)}`}>
          {ch}
        </span>
      )
    })
    const space = index++
    return (
      <Fragment key={w}>
        <span className="race-word">{letters}</span>
        {w < words.length - 1 && (
          <span data-i={space} className={`race-ch is-space${state(space)}`}>
            {' '}
          </span>
        )}
      </Fragment>
    )
  })

  const best = CARL_BEST[duration].wpm

  return (
    <dialog
      ref={dialogRef}
      className={`race${closing ? ' is-closing' : ''}`}
      data-phase={phase}
      aria-label="Typing test"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={releaseAll}
    >
      <div className="race-sheet">
        <div className="race-head">
          <Segmented
            options={DURATION_OPTIONS}
            value={duration}
            onChange={(d) => restart(d)}
            label="Test length"
            className="race-lengths"
          />
          {phase !== 'done' && (
            <Clock running={phase === 'running'} startedAt={startedAt} duration={duration} correct={correct} />
          )}
          <button type="button" className="race-esc" onClick={requestClose} aria-label="Close typing test">
            esc
          </button>
        </div>

        {phase === 'done' && result ? (
          <Results result={result} againRef={againRef} onAgain={() => restart()} onClose={requestClose} />
        ) : (
          <>
            <div
              ref={passageRef}
              className="race-passage"
              tabIndex={-1}
              autoFocus
              aria-label={`Type this passage. ${duration} seconds, starting with your first key.`}
            >
              <div ref={innerRef} className="race-inner">
                {passage}
                <span ref={caretRef} className="race-caret" aria-hidden="true" />
              </div>
            </div>
            <Keyboard boardRef={boardRef} mac={mac} />
            <div className="race-foot">
              <span>
                Carl’s best at {duration}s <b>{best} wpm</b> · beat it
              </span>
              <span>
                <kbd>tab</kbd> restart
              </span>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

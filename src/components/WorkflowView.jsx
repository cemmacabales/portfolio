import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { BrainCircuit, ChartSpline, Check, Hammer, ListChecks, Play, Square } from 'lucide-react'
import { workflow } from '../data/portfolio'
import { usePageVisible } from '../hooks/useCycle'
import { AppMark } from './SetupArt'
import WorkflowScene from './WorkflowScenes'
import KaggleLogo from '../assets/brands/kaggle.svg'
import ColabLogo from '../assets/brands/colab.svg'
import NetlifyLogo from '../assets/brands/netlify.svg'
import HuggingFaceLogo from '../assets/brands/huggingface.svg'
import PyTorchLogo from 'devicon/icons/pytorch/pytorch-original.svg'
import './WorkflowView.css'

/*
 * My setup's second view: how work moves across the desk. Each workflow is
 * a Shortcut; running it steps through its actions while the stage shows
 * the app doing that step. Pointing at a step holds it there, tapping one
 * takes over, and tapping a Shortcut runs it again from the top. The list
 * is the accessible version: the stage only repeats it.
 */

const STEP_MS = 5600
const CANVAS = { w: 720, h: 480 }
const GLYPHS = { ship: Hammer, train: BrainCircuit }
const LOGOS = {
  kaggle: KaggleLogo,
  colab: ColabLogo,
  netlify: NetlifyLogo,
  hf: HuggingFaceLogo,
  pytorch: PyTorchLogo,
}

function StepIcon({ app }) {
  if (app === 'claude' || app === 'codex' || app === 'cursor') {
    return (
      <span className={`wf-icon app-icon app-icon-${app}`}>
        <AppMark id={app} />
      </span>
    )
  }
  if (app === 'check' || app === 'chart') {
    const Glyph = app === 'check' ? ListChecks : ChartSpline
    return (
      <span className={`wf-icon app-icon wf-glyph wf-glyph-${app}`}>
        <Glyph strokeWidth={2.2} />
      </span>
    )
  }
  return (
    <span className="wf-icon app-icon wf-logo">
      <img src={LOGOS[app]} alt="" width="20" height="20" />
    </span>
  )
}

/* ── The stage: every scene on one canvas, scaled to fit ──────── */
function Stage({ flow, step, live }) {
  const ref = useRef(null)
  const [fit, setFit] = useState(null)

  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return undefined
    const measure = () => {
      const w = box.clientWidth
      const h = box.clientHeight
      if (!w || !h) return
      const k = Math.min(w / CANVAS.w, h / CANVAS.h)
      setFit({ k, x: (w - CANVAS.w * k) / 2, y: (h - CANVAS.h * k) / 2 })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`wf-stage${live ? ' is-live' : ''}`} aria-hidden="true">
      <div
        className="wf-canvas"
        style={fit ? { '--k': fit.k, '--cx': `${fit.x}px`, '--cy': `${fit.y}px` } : undefined}
        data-ready={fit ? '' : undefined}
      >
        {workflow.map((f) =>
          f.steps.map((s, i) => (
            <div key={`${f.id}-${s.id}`} className={`ws-scene${f.id === flow && i === step ? ' is-on' : ''}`}>
              <WorkflowScene id={s.id} />
            </div>
          )),
        )}
      </div>
    </div>
  )
}

/* ── A Shortcut tile, with its run button's progress ring ─────── */
function ShortcutTile({ flow, index, on, running, done, progress, runnable, onRun }) {
  const Glyph = GLYPHS[flow.id]
  const state = on && running ? 'running' : on && done ? 'done' : 'idle'
  return (
    <button
      type="button"
      className={`wf-tile wf-tile-${flow.id}${on ? ' is-on' : ''}`}
      style={{ '--i': index }}
      aria-pressed={on}
      onClick={onRun}
    >
      <span className="wf-tile-top">
        <Glyph className="wf-tile-glyph" size={20} strokeWidth={2.1} aria-hidden="true" />
        {runnable && (
          <span className={`wf-run is-${state}`} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle className="wf-run-track" cx="12" cy="12" r="10.5" />
              <circle
                className="wf-run-ring"
                cx="12"
                cy="12"
                r="10.5"
                pathLength="1"
                style={{ '--p': on ? progress : 0 }}
              />
            </svg>
            {state === 'running' ? (
              <Square size={8} strokeWidth={0} fill="currentColor" />
            ) : state === 'done' ? (
              <Check size={11} strokeWidth={3} />
            ) : (
              <Play size={9} strokeWidth={0} fill="currentColor" />
            )}
          </span>
        )}
      </span>
      <span className="wf-tile-name">{flow.name}</span>
      <span className="wf-tile-count">{flow.steps.length} steps</span>
    </button>
  )
}

/* ── Both together ────────────────────────────────────────────── */
export default function WorkflowView({ className = '', active = true, paused = false, stage = true }) {
  const ref = useRef(null)
  const listRef = useRef(null)
  const inView = useInView(ref, { amount: 0.2 })
  const pageVisible = usePageVisible()
  const reduce = useReducedMotion()

  const [flowIndex, setFlowIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [held, setHeld] = useState(false)
  const [done, setDone] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [tick, setTick] = useState(0)
  const [lens, setLens] = useState(null)
  const started = useRef(false)
  const chained = useRef(false)

  const flow = workflow[flowIndex]
  const last = flow.steps.length - 1

  // The first time the view is shown, the first Shortcut runs by itself.
  useEffect(() => {
    if (!active || !stage || started.current) return
    started.current = true
    if (!reduce) setRunning(true)
  }, [active, stage, reduce])

  const live = active && stage && !paused && inView && pageVisible && running && !held && !reduce

  const advance = useCallback(() => {
    if (step < last) {
      setStep(step + 1)
      return
    }
    // Left alone, the first Shortcut hands over to the second, once.
    if (!chained.current && flowIndex < workflow.length - 1) {
      chained.current = true
      setFlowIndex(flowIndex + 1)
      setStep(0)
      return
    }
    setRunning(false)
    setDone(true)
  }, [step, last, flowIndex])

  useEffect(() => {
    if (!live) return undefined
    setTick((t) => t + 1)
    const id = setTimeout(advance, STEP_MS)
    return () => clearTimeout(id)
  }, [live, advance, runKey])

  // The lens glides to the lit step; the thread fills down to it.
  useLayoutEffect(() => {
    const list = listRef.current
    const row = list?.querySelector(`[data-step="${step}"]`)
    const first = list?.querySelector('[data-step="0"]')
    if (!row || !first) return
    setLens({
      x: row.offsetLeft,
      y: row.offsetTop,
      w: row.offsetWidth,
      h: row.offsetHeight,
      top: first.offsetTop + first.offsetHeight / 2,
      fill: row.offsetTop + row.offsetHeight / 2 - (first.offsetTop + first.offsetHeight / 2),
    })
  }, [step, flowIndex])

  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const observer = new ResizeObserver(() => {
      const row = list.querySelector('.wf-step.is-on')
      const first = list.querySelector('[data-step="0"]')
      if (!row || !first) return
      setLens((current) => ({
        ...current,
        x: row.offsetLeft,
        y: row.offsetTop,
        w: row.offsetWidth,
        h: row.offsetHeight,
        top: first.offsetTop + first.offsetHeight / 2,
        fill: row.offsetTop + row.offsetHeight / 2 - (first.offsetTop + first.offsetHeight / 2),
      }))
    })
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  // Without a stage (phones) a Shortcut only picks which steps to list.
  const run = (i) => {
    chained.current = true
    setFlowIndex(i)
    setStep(0)
    setDone(false)
    setHeld(false)
    setRunning(stage && !reduce)
    setRunKey((k) => k + 1)
  }

  const point = (i) => {
    setStep(i)
    setHeld(true)
  }

  const release = () => {
    setHeld(false)
    setRunKey((k) => k + 1)
  }

  const progress = running || done ? (step + 1) / flow.steps.length : 0

  // data-shown plays the entrance each time the view comes up.
  return (
    <div ref={ref} className={`wf${stage ? '' : ' is-list'} ${className}`} data-shown={active || undefined}>
      <div className="wf-grid">
        {stage && <Stage flow={flow.id} step={step} live={active && !paused && inView && pageVisible} />}

        <div className="wf-side">
          <div className="wf-tiles" role="group" aria-label="Workflows">
            {workflow.map((f, i) => (
              <ShortcutTile
                key={f.id}
                flow={f}
                index={i}
                on={i === flowIndex}
                running={running}
                done={done}
                progress={progress}
                runnable={stage}
                onRun={() => run(i)}
              />
            ))}
          </div>

          <ol
            ref={listRef}
            className="wf-steps"
            aria-label={flow.name}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'touch' && held) release()
            }}
            onBlur={(event) => {
              if (held && !event.currentTarget.contains(event.relatedTarget)) release()
            }}
          >
            {stage && (
              <li
                className="wf-thread"
                style={lens ? { '--top': `${lens.top}px`, '--fill': `${lens.fill}px` } : undefined}
                aria-hidden="true"
              />
            )}
            {stage && (
              <li
                className={`wf-lens${lens ? ' is-on' : ''}`}
                style={
                  lens
                    ? {
                        '--x': `${lens.x}px`,
                        '--y': `${lens.y}px`,
                        '--w': `${lens.w}px`,
                        '--h': `${lens.h}px`,
                      }
                    : undefined
                }
                aria-hidden="true"
              />
            )}
            {flow.steps.map((s, i) => {
              const on = stage && i === step
              const body = (
                <>
                  <StepIcon app={s.app} />
                  <span className="wf-text">
                    <span className="wf-name">{s.name}</span>
                    <span className="wf-detail">{s.detail}</span>
                  </span>
                  {on && running && (
                    <span
                      key={tick}
                      className={`wf-progress${live ? ' is-live' : ''}`}
                      style={{ '--ms': `${STEP_MS}ms` }}
                      aria-hidden="true"
                    />
                  )}
                </>
              )
              return (
                <li
                  key={`${flow.id}-${s.id}`}
                  className={`wf-step${on ? ' is-on' : ''}`}
                  style={{ '--i': i }}
                  data-step={i}
                >
                  {stage ? (
                    <button
                      type="button"
                      className="wf-row"
                      aria-current={on ? 'step' : undefined}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== 'touch') point(i)
                      }}
                      onFocus={() => point(i)}
                      onClick={() => {
                        setStep(i)
                        setRunning(false)
                        setDone(false)
                      }}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="wf-row">{body}</div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Segmented from './Segmented'
import { afReplay as run } from '../data/afReplay'
import './RagReplay.css'

/*
 * "See how it answers": the AF Guideline Assistant's pipeline, one real run
 * replayed a step at a time inside its work row. Nothing moves on its own;
 * the visitor steps through.
 */

const STEPS = [
  { id: 'ask', label: 'Ask' },
  { id: 'expand', label: 'Expand' },
  { id: 'retrieve', label: 'Retrieve' },
  { id: 'rerank', label: 'Rerank' },
  { id: 'answer', label: 'Answer' },
]

function Step({ id }) {
  const searches = [run.question, ...run.expansions]
  switch (id) {
    case 'ask':
      return (
        <>
          <p className="rr-q">{run.question}</p>
          <p className="rr-note">One of the app’s example questions, and the answer it really gave. Step through to see how it got there.</p>
        </>
      )
    case 'expand':
      return (
        <>
          <p className="rr-lead">
            One search can miss. The question becomes <b>{searches.length} searches</b>: the original, plus three
            rewrites for anything about AF-CARE.
          </p>
          <ol className="rr-list">
            {searches.map((s, i) => (
              <li key={s}>
                <span className="rr-n">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </>
      )
    case 'retrieve':
      return (
        <>
          <p className="rr-lead">
            The guideline is split into chunks of {run.chunkChars.toLocaleString('en-US')} characters. MedCPT, an
            encoder trained on PubMed searches, turns each search into a vector, and FAISS returns the{' '}
            <b>{run.perSearch} closest chunks</b> for each.
          </p>
          <p className="rr-note">
            {searches.length} searches × {run.perSearch} chunks, with repeats dropped: up to{' '}
            {searches.length * run.perSearch} candidates.
          </p>
        </>
      )
    case 'rerank':
      return (
        <>
          <p className="rr-lead">
            A cross-encoder (BGE reranker) reads the question and each candidate together and scores how well they
            match. The top <b>{run.kept} chunks</b> are kept. They come from these pages, best first:
          </p>
          <ol className="rr-pages" aria-label="Pages, in rank order">
            {run.pages.map((p) => (
              <li key={p} className={p === run.cited ? 'is-cited' : undefined}>
                p. {p}
                {p === run.cited && <span>cited</span>}
              </li>
            ))}
          </ol>
        </>
      )
    default:
      return (
        <>
          <div className="rr-a">
            <p>{run.answerIntro}</p>
            <ol>
              {run.pillars.map(([letter, text]) => (
                <li key={letter}>
                  <b>[{letter}]</b> {text}
                </li>
              ))}
            </ol>
            <p>{run.answerOutro}</p>
          </div>
          <p className="rr-note">
            Llama 3 8B, at temperature 0.1, told to answer only from those chunks and to cite their pages.
          </p>
        </>
      )
  }
}

export default function RagReplay() {
  const [step, setStep] = useState('ask')
  const i = STEPS.findIndex((s) => s.id === step)
  const go = (d) => setStep(STEPS[Math.min(STEPS.length - 1, Math.max(0, i + d))].id)

  return (
    <div className="rr">
      <div className="rr-top">
        <Segmented options={STEPS} value={step} onChange={setStep} label="Pipeline step" className="rr-steps" />
        <div className="rr-nav">
          <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous step">
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} disabled={i === STEPS.length - 1} aria-label="Next step">
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="rr-body" aria-live="polite">
        <Step id={step} />
      </div>
    </div>
  )
}

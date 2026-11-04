import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import BlogPage from '../../BlogPage'
import posthog from '../../../posthog'
import { thesis } from '../../../data/thesis'
import { formatDate } from '../../posts'
import { useChapterProgress } from '../../useChapterProgress'
import { thesisPost } from './meta'
import { CHAPTERS } from './chapters'
import { CASES } from './cases'
import { budget } from './budget'
import Film from './Film'
import SliceStack from './SliceStack'
import { Epochs, Race, Subscriptions } from './BudgetFigures'
import './thesis-tokens.css'
import './thesis.css'

const IDS = CHAPTERS.map((chapter) => chapter.id)
const CASE_SIZES = '(max-width: 760px) 100vw, 720px'
const RESULTS = Object.fromEntries(thesis.results.map((result) => [result.id, result]))

// A chapter opens on its slice number, the way a viewer labels the slice on
// screen.
function Chapter({ chapter, children }) {
  const index = CHAPTERS.indexOf(chapter)
  return (
    <section id={chapter.id} className="lb-chapter" aria-labelledby={`${chapter.id}-title`}>
      <p className="lb-chapter-n" aria-hidden="true">
        Slice {index + 1} / {CHAPTERS.length}
      </p>
      <h2 id={`${chapter.id}-title`} className="lb-chapter-title">
        {chapter.title}
      </h2>
      <div className="lb-prose">{children}</div>
    </section>
  )
}

// The 290 scans by what's in them, one bar.
function Dataset() {
  const total = thesis.dataset.reduce((sum, part) => sum + part.n, 0)
  return (
    <figure className="lb-dataset">
      <div className="lb-dataset-bar" aria-hidden="true">
        {thesis.dataset.map((part) => (
          <span key={part.id} data-cls={part.id} style={{ flexGrow: part.n }} />
        ))}
      </div>
      <ul className="lb-dataset-key">
        {thesis.dataset.map((part) => (
          <li key={part.id} data-cls={part.id}>
            <b>{part.n}</b> {part.label.toLowerCase()}
          </li>
        ))}
      </ul>
      <figcaption>{total} CT volumes, each a full 3D scan of the abdomen.</figcaption>
    </figure>
  )
}

// Dice for each finding, trained alone and trained together. Every value is
// printed: stone's gold is too light to carry a bar on its own.
function Together() {
  return (
    <figure className="lb-dice">
      <table>
        <caption className="visually-hidden">Dice score for each finding, trained alone and together</caption>
        <thead>
          <tr>
            <th scope="col">Finding</th>
            <th scope="col">Alone</th>
            <th scope="col">Together</th>
          </tr>
        </thead>
        <tbody>
          {thesis.results.map((result) => (
            <tr key={result.id} data-cls={result.id}>
              <th scope="row">{result.name}</th>
              <td>
                <span className="lb-dice-bar is-alone" aria-hidden="true">
                  <i style={{ width: `${result.alone * 100}%` }} />
                </span>
                <b>{result.alone.toFixed(3)}</b>
              </td>
              <td>
                <span className="lb-dice-bar" aria-hidden="true">
                  <i style={{ width: `${result.together * 100}%` }} />
                </span>
                <b>{result.together.toFixed(3)}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Dice, from 0 (no overlap with the radiologist’s label) to 1 (a perfect match), averaged over the five folds.
        The kidney itself scored {thesis.kidney}.
      </figcaption>
    </figure>
  )
}

function CaseRead({ item }) {
  return (
    <article className="lb-case" aria-labelledby={`case-${item.id}`}>
      <div className="lb-plate lb-case-film">
        <img src={item.src} srcSet={item.srcSet} sizes={CASE_SIZES} alt={item.alt} width="1175" height="598" loading="lazy" decoding="async" />
      </div>
      <div className="lb-case-body">
        <header className="lb-case-head">
          <h3 id={`case-${item.id}`}>
            {item.id} <span>· {item.label}</span>
          </h3>
          <p className="lb-case-verdict">{item.verdict}</p>
        </header>
        <dl className="lb-case-scores">
          {item.scores.map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <ul className="lb-case-reads">
          {item.reads.map((read) => (
            <li key={read.who}>
              <blockquote>“{read.said}”</blockquote>
              <p>{read.who}</p>
            </li>
          ))}
        </ul>
        <p className="lb-case-slice">{item.slice}</p>
      </div>
    </article>
  )
}

export default function ThesisPost() {
  const progress = useChapterProgress(IDS)
  const [why, scans, money, together, read, tryIt] = CHAPTERS
  const [slow, fast] = budget.runs

  const open = (event, source) => () =>
    posthog.capture(event, { project_slug: 'thesis', source })

  return (
    <BlogPage>
      <article className="lb-post">
        <header className="lb-hero">
          <div className="lb-hero-inner">
            <div className="lb-hero-copy">
              <a href="/blog/" className="lb-back">
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                All posts
              </a>
              <h1 className="lb-title">{thesisPost.title}</h1>
              <p className="lb-dek">{thesisPost.dek}</p>
              <p className="lb-byline">
                <span>
                  <b>Carl Macabales</b>, with Yñikko Aguas and Robin Macatangay
                </span>
                <span className="lb-nowrap">
                  <time dateTime={thesisPost.date}>{formatDate(thesisPost.date)}</time> · {thesisPost.readMinutes} min
                  read
                </span>
              </p>
            </div>
            <Film className="lb-hero-film" annotate priority />
          </div>
        </header>

        <div className="lb-body">
          <SliceStack chapters={CHAPTERS} progress={progress} variant="rail" />
          <SliceStack chapters={CHAPTERS} progress={progress} variant="strip" />

          <div className="lb-column">
            <Chapter chapter={why}>
              <p>
                A CT scan of the abdomen can show a kidney stone, a cyst and a tumor at once. Most segmentation work
                trains one model for each: a stone model that only knows stones, a tumor model that only knows tumors.
                Our thesis asked whether one model that learns the kidney and all three findings together does better
                than three that each learn one.
              </p>
              <p>
                It mattered most for stones. Trained alone, our stone model found them for a few dozen epochs, then
                gave up. In every one of the five folds, its stone score fell back to zero between epoch 25 and 39,
                and never came back. A stone is a few voxels in a scan of millions, and answering “no stone”
                everywhere is the easiest way to look right.
              </p>
            </Chapter>

            <Chapter chapter={scans}>
              <p>
                We built one dataset out of two that were never meant to meet. Tumors came from KiTS23, a kidney
                tumor challenge collected across hospitals. Scans with more than one finding came from MSWAL, which
                labels lesions across the whole abdomen. Extra stone and cyst cases came with no masks at all, so we
                drew them ourselves in 3D Slicer. Every label then had to agree on one map: background, kidney, cyst,
                stone, tumor.
              </p>
              <Dataset />
              <p>
                A radiologist checked them before any training. Dr. Nathaniel F. Paragas, an interventional
                radiologist at Capitol Medical Center and associate professor at the Mapúa University School of
                Medicine, supervised the ground truth.
              </p>
            </Chapter>

            <Chapter chapter={money}>
              <p>
                nnU-Net plans its own training: it reads the dataset and picks a patch size, a network and a batch
                size to fit the GPU. What it can’t plan around is a student budget. We trained on {budget.plan}, on a
                single A100, and every hour of it came out of five subscriptions.
              </p>
              <Subscriptions />
              <p>
                The work adds up fast. Each model trains five times, once per fold of the cross-validation, and each
                fold is {budget.epochs.toLocaleString('en-US')} epochs. We needed four models: the multi-class one, and
                the stone, cyst and tumor models it was measured against. That’s 20 folds and 20,000 epochs.
              </p>
              <p>
                Our first runs used a batch size of {slow.batch}, to make use of the A100’s memory, and an epoch took
                about {slow.epoch} seconds. That sounds like the fast way: twelve patches at a time instead of two.
                But an nnU-Net epoch isn’t one pass over the data. It’s a fixed {budget.batchesPerEpoch} batches, so
                twelve patches a batch is six times the work in every epoch, for the same{' '}
                {budget.epochs.toLocaleString('en-US')} epochs.
              </p>
              <Epochs />
              <p>
                At batch {slow.batch}, one fold would have taken about {slow.fold} hours, and all 20 about{' '}
                {slow.all.toLocaleString('en-US')}: at least {budget.needed} subscriptions’ worth. So we dropped the
                batch to {fast.batch}. Epochs fell to about {fast.epoch} seconds, a fold to under 8 hours, and all 20
                folds to about {fast.all}. That fit in five.
              </p>
              <Race />
            </Chapter>

            <Chapter chapter={together}>
              <p>
                Seeing the kidney and all three findings at once raised the Dice score for every finding.
              </p>
              <Together />
              <p>
                <strong>Stones went from nothing to {RESULTS.stone.together}.</strong> Trained together, the model
                kept finding stones through all {budget.epochs.toLocaleString('en-US')} epochs, in every fold, and{' '}
                84% of the stones it flags are real.
              </p>
              <p>
                <strong>Cysts more than doubled.</strong> Alone, the model marked the bladder and gallbladder as
                kidney cysts. With the kidney beside it, cyst precision rose from 0.27 to 0.71.
              </p>
              <p>
                <strong>Tumors rose from {RESULTS.tumor.alone} to {RESULTS.tumor.together}.</strong> The model finds
                89% of tumors, and 86% of what it marks as tumor is one.
              </p>
              <p>
                None of the three gains is luck: a paired Wilcoxon test over every scan with that finding puts each
                below p = 10<sup>−11</sup>. It’s faster too: one pass over a scan instead of three, {thesis.latency.together} seconds a volume instead of{' '}
                {thesis.latency.alone}.
              </p>
            </Chapter>

            <Chapter chapter={read}>
              <p>
                Dice says how a prediction compares with a label. It doesn’t tell a doctor whether to trust the model
                on a scan that has no label. So we asked radiologists something narrower: does the model’s own score
                match what they see?
              </p>
              <p>
                Dr. Paragas reviewed 15 predicted cases. So did Dr. Marc Gabriel P. Meriño, a radiology resident at
                Veterans Memorial Medical Center (VMMC), supervised by Dr. Bernardo G. Bringas, Jr., head of its
                Department of Radiology and Radiotherapy. Three of their cases, as they saw them: the plain slice on
                the left, the model’s prediction on the right, in the thesis’s own colors (kidney blue, cyst green,
                tumor red).
              </p>
              <div className="lb-cases">
                {CASES.map((item) => (
                  <CaseRead key={item.id} item={item} />
                ))}
              </div>
              <p>
                The two reads don’t always agree, and that’s why we asked two. A low score that’s honest, like
                multi_106’s, still tells a doctor where to look twice. One that’s confident and, by one reading,
                wrong, like multi_118’s tumor, is the case a tool in a clinic has to flag.
              </p>
            </Chapter>

            <Chapter chapter={tryIt}>
              <p>
                The code, the training notebooks and the evaluation figures are public. The demo film shows the app
                we built on top of the model: axial, coronal and sagittal views of a scan with the outlines on, and a 3D
                surface.
              </p>
            </Chapter>

            <aside className="lb-end" aria-labelledby="lb-end-title">
              <h2 id="lb-end-title" className="lb-end-title">
                {thesis.title}
              </h2>
              <p className="lb-end-meta">
                {thesis.authors.join(', ')}. Advised by {thesis.adviser}. {thesis.meta}.
              </p>
              <div className="lb-end-links">
                <a
                  href={thesis.links.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn lb-btn"
                  onClick={open('project_code_opened', 'blog')}
                >
                  Code on GitHub
                  <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a
                  href={thesis.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn lb-btn lb-btn-quiet"
                  onClick={open('project_demo_opened', 'blog')}
                >
                  Watch the demo
                  <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </div>
              <p className="lb-end-note">
                A research model, not a medical device: it doesn’t diagnose anyone.
              </p>
            </aside>
          </div>
        </div>
      </article>
    </BlogPage>
  )
}

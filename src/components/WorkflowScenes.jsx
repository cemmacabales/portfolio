import {
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Heart,
  Lock,
  MessageSquare,
  Plus,
} from 'lucide-react'
import { AppMark } from './SetupArt'
import ColabLogo from '../assets/brands/colab.svg'
import NetlifyLogo from '../assets/brands/netlify.svg'
import HuggingFaceLogo from '../assets/brands/huggingface.svg'
import PostHogLogo from '../assets/brands/posthog.svg'
import './WorkflowScenes.css'

/*
 * What each workflow step looks like on screen: the real app, drawn in HTML
 * on a 720 × 480 canvas that WorkflowView scales to its stage. Everything is
 * at rest in its finished state; the reveals only run while a scene is on
 * (`.ws-scene.is-on`), each element starting `--d` seconds in. So reduced
 * motion, or a scene caught mid-way, still reads whole.
 */

const at = (seconds) => ({ '--d': seconds })

/* ── Chrome ───────────────────────────────────────────────────── */
function Win({ className = '', dark = false, title, url, children }) {
  return (
    <div className={`ws-win${dark ? ' ws-dark' : ''} ${className}`}>
      <div className={`ws-bar${url ? ' ws-bar-browser' : ''}`}>
        <span className="ws-lights">
          <i />
          <i />
          <i />
        </span>
        {url ? (
          <span className="ws-url">
            <Lock size={8} strokeWidth={3} />
            {url}
          </span>
        ) : (
          <span className="ws-title">{title}</span>
        )}
      </div>
      <div className="ws-body">{children}</div>
    </div>
  )
}

// Typed out a character at a time, in the terminal's own font.
function Typed({ text, delay = 0, per = 0.028 }) {
  return (
    <span className="ws-type" style={{ '--n': text.length, '--d': delay, '--t': text.length * per }}>
      {text}
    </span>
  )
}

// Something in progress that resolves at `--d`: a spinner, then a check.
function Resolves({ at: when, children }) {
  return (
    <span className="ws-resolve">
      <span className="ws-spinner ws-until" style={at(when)} />
      <span className="ws-resolved ws-in" style={at(when)}>
        {children}
      </span>
    </span>
  )
}

/* A little syntax color for JSX, so the diff reads like an editor. */
const JSX_TOKENS = /(<\/?[A-Za-z][\w.]*|\/?>)|([A-Za-z]+)(?==)|('[^']*'|"[^"]*")|(&&|\|\||!==|===|!)|(\{|\}|\(|\))/g

function Code({ children }) {
  const text = children
  const out = []
  let last = 0
  let match
  JSX_TOKENS.lastIndex = 0
  while ((match = JSX_TOKENS.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const kind = match[1] ? 'tag' : match[2] ? 'attr' : match[3] ? 'str' : match[4] ? 'op' : 'punc'
    out.push(
      <span key={match.index} className={`tk-${kind}`}>
        {match[0]}
      </span>,
    )
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <code>{out}</code>
}

/* ── 1 · Plan it: Claude Code in plan mode ────────────────────── */
const PROMPT = 'Add a Workflow view to My setup, same stage as the gear'
const PLAN = [
  'Gear | Workflow switch in the panel’s title bar',
  'Workflow reuses the desk’s stage and list grid',
  'Closing snaps back to Gear, so the pull-back lands',
  'Phones get the list on its own',
]

function PlanScene() {
  return (
    <Win dark className="ws-term" title="~/portfolio · claude">
      <div className="ws-mono ws-claude">
        <p className="ws-prompt">
          <span className="ws-dim">&gt;</span> <Typed text={PROMPT} delay={0.3} />
        </p>
        <p className="ws-in" style={at(2)}>
          <span className="ws-ok">⏺</span> <b>Explore</b>
          <span className="ws-dim">(HeroDesk, SetupDesk and the sheet)</span>
        </p>
        <p className="ws-in ws-dim ws-indent" style={at(2.4)}>
          ⎿&nbsp; Done (14 tool uses · 41.2k tokens · 38s)
        </p>
        <div className="ws-plan ws-in" style={at(2.9)}>
          <p>
            <b>Ready to code?</b>
          </p>
          <p className="ws-dim">Here is Claude’s plan:</p>
          <div className="ws-plan-body">
            <p>
              <b>Workflow view for My setup</b>
            </p>
            {PLAN.map((line, i) => (
              <p key={line}>
                {i + 1}. {line}
              </p>
            ))}
          </div>
          <p>Would you like to proceed?</p>
          <p className="ws-opt is-picked">❯ 1. Yes, and auto-accept edits</p>
          <p className="ws-opt">&nbsp; 2. Yes, and manually approve edits</p>
          <p className="ws-opt">&nbsp; 3. No, keep planning</p>
        </div>
        <p className="ws-mode ws-in" style={at(2.9)}>
          ⏸ plan mode on <span className="ws-dim">(shift+tab to cycle)</span>
        </p>
      </div>
    </Win>
  )
}

/* ── 2 · Build in parallel: Cursor's agents, one worktree each ─── */
const AGENTS = [
  {
    name: 'Workflow view',
    branch: 'feat/workflow',
    add: 186,
    del: 12,
    done: 3.1,
  },
  {
    name: 'Segmented control',
    branch: 'feat/segmented',
    add: 64,
    del: 41,
    done: 1.5,
  },
  { name: 'Sheet on phones', branch: 'feat/sheet', add: 38, del: 6, done: 2.3 },
]

const DIFF = [
  [' ', 399, '  <div className="setup-panel-body">'],
  ['-', 400, '    <SetupDesk sceneRef={sceneRef} paused={!stage} />'],
  ['+', 400, '    <div className="setup-views" data-view={view}>'],
  ['+', 401, '      <SetupDesk'],
  ['+', 402, '        sceneRef={sceneRef}'],
  ['+', 403, "        paused={!stage || view !== 'gear'}"],
  ['+', 404, '      />'],
  ['+', 405, '      {flowSeen && ('],
  ['+', 406, "        <WorkflowView active={view === 'workflow'} />"],
  ['+', 407, '      )}'],
  ['+', 408, '    </div>'],
  [' ', 409, '  </div>'],
  [' ', 410, '</section>'],
]

function BuildScene() {
  return (
    <Win dark className="ws-cursor" title="portfolio · Cursor">
      <div className="ws-cursor-grid">
        <aside className="ws-agents">
          <p className="ws-agents-head">
            Agents <Plus size={11} strokeWidth={2.2} />
          </p>
          {AGENTS.map((agent) => (
            <div key={agent.name} className="ws-agent">
              <Resolves at={agent.done}>
                <Check size={10} strokeWidth={3} />
              </Resolves>
              <span className="ws-agent-text">
                <span className="ws-agent-name">{agent.name}</span>
                <span className="ws-agent-meta">
                  <GitBranch size={9} strokeWidth={2.2} />
                  {agent.branch}
                </span>
                <span className="ws-agent-meta ws-in" style={at(agent.done)}>
                  <span className="ws-add">+{agent.add}</span> <span className="ws-del">−{agent.del}</span>
                </span>
              </span>
            </div>
          ))}
        </aside>

        <div className="ws-editor">
          <div className="ws-tabs">
            <span className="ws-tab is-on">HeroDesk.jsx</span>
            <span className="ws-tab">WorkflowView.jsx</span>
            <span className="ws-tab">Segmented.jsx</span>
          </div>
          <p className="ws-crumbs">src › components › HeroDesk.jsx</p>
          <div className="ws-code ws-mono">
            {DIFF.map(([sign, n, text], i) => (
              <p
                key={`${sign}${n}`}
                className={`ws-diff${sign === '+' ? ' is-add' : sign === '-' ? ' is-del' : ''}${sign === ' ' ? '' : ' ws-in'}`}
                style={at(0.5 + i * 0.13)}
              >
                <span className="ws-ln">{n}</span>
                <span className="ws-sign">{sign}</span>
                <Code>{text}</Code>
              </p>
            ))}
          </div>
          <div className="ws-review ws-in" style={at(3.3)}>
            <span>3 files</span>
            <span className="ws-add">+288</span>
            <span className="ws-del">−59</span>
            <span className="ws-review-btn">Undo all</span>
            <span className="ws-review-btn is-primary">Keep all</span>
          </div>
        </div>
      </div>
    </Win>
  )
}

/* ── 3 · Check it runs: lint, build, and a browser at three sizes ─ */
const RUNS = [
  { cmd: 'npm run lint', out: [['ok', 'No problems']] },
  { cmd: 'npm run build', out: [['ok', 'built in 4.81s']] },
  {
    cmd: 'npx playwright test setup',
    out: [
      ['ok', 'desktop › Workflow opens (1.9s)'],
      ['ok', 'tablet › the sheet switches views (2.2s)'],
      ['ok', 'phone › the list stands alone (1.4s)'],
      ['sum', '3 passed (5.1s)'],
    ],
  },
]

function CheckScene() {
  let t = 0.3
  const lines = []
  for (const run of RUNS) {
    lines.push({ kind: 'cmd', text: run.cmd, d: t })
    t += 0.45
    for (const [kind, text] of run.out) {
      lines.push({ kind, text, d: t })
      t += 0.4
    }
  }

  return (
    <>
      <Win url="localhost:3000" className="ws-safari">
        <MiniSite />
        <span className="ws-flash" style={at(t + 0.1)} />
      </Win>
      <Win dark className="ws-term ws-check" title="~/portfolio · zsh">
        <div className="ws-mono">
          {lines.map((line) => (
            <p key={line.text} className={`ws-in ws-run-${line.kind}`} style={at(line.d)}>
              {line.kind === 'cmd' && <span className="ws-dim">$ </span>}
              {line.kind === 'ok' && <span className="ws-ok">✓ </span>}
              {line.text}
            </p>
          ))}
        </div>
      </Win>
    </>
  )
}

// This site, small: the hero row with My setup open on Workflow.
function MiniSite() {
  return (
    <div className="ws-site">
      <div className="ws-site-nav">
        <i />
        <span />
        <span />
        <span />
      </div>
      <div className="ws-site-row">
        <div className="ws-site-strip">
          <i />
          <i />
        </div>
        <div className="ws-site-panel">
          <div className="ws-site-head">
            <b>My setup</b>
            <span className="ws-site-seg">
              <span>Gear</span>
              <span className="is-on">Workflow</span>
            </span>
            <i />
          </div>
          <div className="ws-site-body">
            <div className="ws-site-stage">
              <span />
            </div>
            <div className="ws-site-list">
              <span className="ws-site-tiles">
                <i />
                <i />
              </span>
              {[0, 1, 2, 3, 4].map((n) => (
                <span key={n} className={n === 2 ? 'is-on' : undefined} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 4 · Get a second opinion: Codex reviews the pull request ──── */
function ReviewScene() {
  return (
    <Win url="github.com/cemmacabales/portfolio/pull/58" className="ws-gh">
      <div className="ws-gh-page">
        <h3 className="ws-gh-title">
          Add a Workflow view to My setup <span>#58</span>
        </h3>
        <p className="ws-gh-meta">
          <span className="ws-gh-open">
            <GitPullRequest size={11} strokeWidth={2.4} /> Open
          </span>
          <span>
            <b>cemmacabales</b> wants to merge 3 commits into <code>main</code> from <code>feat/workflow</code>
          </span>
        </p>
        <nav className="ws-gh-tabs">
          <span className="is-on">
            <MessageSquare size={11} strokeWidth={2.2} /> Conversation <i>2</i>
          </span>
          <span>
            Commits <i>3</i>
          </span>
          <span>
            Checks <i>3</i>
          </span>
          <span>
            Files changed <i>6</i>
          </span>
          <span className="ws-gh-diff">
            <b className="ws-add">+288</b> <b className="ws-del">−59</b>
          </span>
        </nav>

        <div className="ws-gh-event ws-in" style={at(0.4)}>
          <span className="ws-gh-avatar app-icon-codex">
            <AppMark id="codex" />
          </span>
          <p>
            <b>chatgpt-codex-connector</b> <span className="ws-gh-bot">bot</span> reviewed{' '}
            <span className="ws-dim">just now</span>
          </p>
        </div>
        <div className="ws-gh-card ws-in" style={at(0.8)}>
          <p className="ws-gh-file ws-mono">src/components/HeroDesk.jsx</p>
          <p className="ws-gh-snippet ws-mono">
            <span className="ws-ln">226</span> const close = useCallback(() =&gt; {'{'}
            <br />
            <span className="ws-ln">227</span> &nbsp; setOpen(false)
          </p>
          <div className="ws-gh-comment">
            <p>
              <span className="ws-p2">P2</span> <b>Closing from Workflow shrinks a hidden desk</b>
            </p>
            <p>
              The pull-back measures the gear drawing while Workflow covers it. Switch to Gear before the spring runs.
            </p>
            <p className="ws-dim">Useful? React with 👍 / 👎.</p>
          </div>
        </div>
        <div className="ws-gh-commit ws-in" style={at(2)}>
          <GitCommitHorizontal size={13} strokeWidth={2} />
          <span>
            <b>cemmacabales</b> added 1 commit
          </span>
          <code>fix: closing from Workflow snaps back to Gear</code>
          <Check size={11} strokeWidth={3} className="ws-ok" />
        </div>

        <div className="ws-gh-merge ws-in" style={at(2.5)}>
          <span className="ws-gh-status">
            <span className="ws-gh-pending ws-until" style={at(3.3)} />
            <span className="ws-gh-passed ws-in" style={at(3.3)}>
              <Check size={13} strokeWidth={3} />
            </span>
          </span>
          <span className="ws-gh-merge-text">
            <b>All checks have passed</b>
            <span className="ws-dim">3 successful checks</span>
          </span>
          <span className="ws-gh-btn">Squash and merge</span>
        </div>
      </div>
    </Win>
  )
}

/* ── 5 · Ship it: Netlify publishes main, PostHog watches ──────── */
const DEPLOY = [
  ['Initializing', '1s'],
  ['Building', '38s'],
  ['Deploying', '9s'],
  ['Cleanup', '1s'],
  ['Post-processing', '3s'],
]

// A trend that climbs the way a fresh feature's first hour does. Not data.
const TREND = 'M0 46 C 30 44 44 40 66 41 S 110 30 136 33 S 176 18 204 21 S 244 9 280 6'

function ShipScene() {
  return (
    <>
      <Win url="app.netlify.com" className="ws-netlify">
        <div className="ws-nf-page">
          <p className="ws-nf-crumbs">
            <img src={NetlifyLogo} alt="" width="16" height="16" />
            Deploys <ChevronRight size={11} /> Production
          </p>
          <h3 className="ws-nf-title">
            Production: <span className="ws-mono">main@4e1b9c2</span>
            <span className="ws-nf-pill ws-in" style={at(3.2)}>
              Published
            </span>
          </h3>
          <p className="ws-dim ws-nf-sub">fix: closing from Workflow snaps back to Gear · Deployed in 52s</p>
          <p className="ws-nf-label">Deploy log</p>
          <div className="ws-nf-log">
            {DEPLOY.map(([step, took], i) => (
              <p key={step} className="ws-nf-step">
                <Resolves at={0.5 + i * 0.55}>
                  <Check size={10} strokeWidth={3} />
                </Resolves>
                <span>{step}</span>
                <span className="ws-dim ws-in" style={at(0.5 + i * 0.55)}>
                  Complete · {took}
                </span>
              </p>
            ))}
          </div>
          <p className="ws-nf-live ws-in" style={at(3.2)}>
            <span className="ws-live-dot" /> cemmacabales.com
          </p>
        </div>
      </Win>
      <div className="ws-card ws-posthog ws-in" style={at(3.6)}>
        <p className="ws-ph-head">
          <img src={PostHogLogo} alt="" width="18" height="18" />
          <b>Trends</b>
          <span className="ws-live-dot" />
        </p>
        <p className="ws-mono ws-ph-event">setup_view_switched</p>
        <svg className="ws-ph-chart" viewBox="0 0 280 52" preserveAspectRatio="none">
          <path className="ws-ph-fill" d={`${TREND} L 280 52 L 0 52 Z`} />
          <path className="ws-ph-line ws-draw" d={TREND} pathLength="1" style={at(3.9)} />
        </svg>
      </div>
    </>
  )
}

/* ── Colab, shared by the four notebook steps ─────────────────── */
function Colab({ className = '', files = false, resources = false, status, children }) {
  return (
    <Win url="colab.research.google.com" className={`ws-colab ${className}`}>
      <div className="ws-co-top">
        <img src={ColabLogo} alt="" width="26" height="26" />
        <span className="ws-co-name">
          <b>thesis_nnunet.ipynb</b>
          <span className="ws-co-menu">File Edit View Insert Runtime Tools Help</span>
        </span>
        <span className="ws-co-ram">
          <Check size={10} strokeWidth={3} />
          <span>
            RAM <i />
          </span>
          <span>
            Disk <i />
          </span>
        </span>
      </div>
      <div className={`ws-co-main${files ? ' has-files' : ''}${resources ? ' has-resources' : ''}`}>
        {files && (
          <aside className="ws-co-files">
            <p className="ws-co-pane">Files</p>
            <p>
              <ChevronDown size={10} /> <Folder size={11} /> ..
            </p>
            <p className="ws-co-nest">
              <ChevronRight size={10} /> <Folder size={11} /> drive
            </p>
            <p className="ws-co-nest">
              <ChevronRight size={10} /> <Folder size={11} /> sample_data
            </p>
            <p className="ws-co-nest ws-co-file">kaggle.json</p>
          </aside>
        )}
        <div className="ws-co-cells">{children}</div>
        {resources}
      </div>
      {status && <p className="ws-co-status">{status}</p>}
    </Win>
  )
}

function Cell({ run = 'done', code, children }) {
  return (
    <div className="ws-cell">
      <span className={`ws-cell-run is-${run}`}>
        {run === 'busy' ? <span className="ws-spinner" /> : run === 'done' ? <Check size={9} strokeWidth={3} /> : null}
      </span>
      <div className="ws-cell-main">
        <pre className="ws-cell-code ws-mono">{code}</pre>
        {children && <div className="ws-cell-out ws-mono">{children}</div>}
      </div>
    </div>
  )
}

/* ── 6 · Get the data: a Kaggle dataset, straight into Colab ───── */
const SLICES = [
  { k: 0.8, s: 0.9 },
  { k: 1, s: 1 },
  { k: 1.15, s: 1.05 },
  { k: 1.05, s: 1.1 },
  { k: 0.85, s: 1 },
]

function DataScene() {
  return (
    <Colab files>
      <Cell
        code={
          <>
            <span className="tk-kw">import</span> kagglehub{'\n\n'}
            path = kagglehub.dataset_download(DATASET){'\n'}
            <span className="tk-fn">print</span>(<span className="tk-str">"Path to dataset files:"</span>, path)
          </>
        }
      >
        <p className="ws-in" style={at(0.4)}>
          Downloading from https://www.kaggle.com/api/v1/datasets/download/…
        </p>
        <p className="ws-in ws-tqdm" style={at(0.7)}>
          <span className="ws-tqdm-bar">
            <i />
          </span>{' '}
          2.41G/2.41G [00:41&lt;00:00, 58.9MB/s]
        </p>
        <p className="ws-in" style={at(2.2)}>
          Extracting files...
        </p>
        <p className="ws-in" style={at(2.6)}>
          Path to dataset files: /root/.cache/kagglehub/datasets/…/versions/1
        </p>
      </Cell>
      <Cell code="show_slices(path, n=5)">
        <div className="ws-slices">
          {SLICES.map((slice, i) => (
            <figure key={i} className="ws-slice ws-in" style={{ ...at(3 + i * 0.12), '--k': slice.k, '--s': slice.s }}>
              <span />
              <figcaption>slice {40 + i * 12}</figcaption>
            </figure>
          ))}
        </div>
      </Cell>
    </Colab>
  )
}

/* ── 7 · Pick the GPU: Colab's runtime chooser ─────────────────── */
const ACCELERATORS = ['CPU', 'T4 GPU', 'L4 GPU', 'G4 GPU', 'A100 GPU', 'H100 GPU', 'v5e-1 TPU', 'v6e-1 TPU']
const MINE = [
  {
    id: 'T4 GPU',
    chip: 'T4',
    mem: '16 GB',
    note: 'Light work: data prep, quick runs, inference',
  },
  {
    id: 'L4 GPU',
    chip: 'L4',
    mem: '24 GB',
    note: 'Fine-tunes that want bf16 or more memory',
  },
  {
    id: 'A100 GPU',
    chip: 'A100',
    mem: '40 GB',
    note: 'Heavy training. My thesis ran here.',
  },
]

function GpuScene() {
  return (
    <>
      <Colab className="ws-co-dim">
        <Cell code="!nvidia-smi" run="idle" />
        <Cell code={'!nnUNetv2_plan_and_preprocess -d 1 --verify_dataset_integrity'} run="idle" />
      </Colab>
      <div className="ws-dialog">
        <p className="ws-dialog-title">Change runtime type</p>
        <p className="ws-dialog-label">Runtime type</p>
        <p className="ws-select">
          Python 3 <ChevronDown size={12} />
        </p>
        <p className="ws-dialog-label">Hardware accelerator</p>
        <div className="ws-radios">
          {ACCELERATORS.map((name) => {
            const mine = MINE.findIndex((m) => m.id === name)
            return (
              <span key={name} className={`ws-radio${mine >= 0 ? ` is-mine is-pick-${mine}` : ''}`}>
                <i />
                {name}
              </span>
            )
          })}
        </div>
        <p className="ws-dialog-note">
          Want access to premium GPUs? <span>Purchase additional compute units</span>
        </p>
        <p className="ws-dialog-actions">
          <span>Cancel</span>
          <span className="ws-save">Save</span>
        </p>
      </div>
      <div className="ws-card ws-picks">
        <p className="ws-picks-head">What I run where</p>
        {MINE.map((m, i) => (
          <p key={m.id} className={`ws-pick is-pick-${i}`}>
            <span className="ws-chip">{m.chip}</span>
            <span className="ws-pick-text">
              <b>{m.mem}</b>
              <span>{m.note}</span>
            </span>
          </p>
        ))}
      </div>
    </>
  )
}

/* ── 8 · Train: nnU-Net v2 on the A100 ─────────────────────────── */
// nnU-Net's poly schedule, so the log's learning rate is the real one.
const lr = (epoch) => (0.01 * (1 - epoch / 1000) ** 0.9).toFixed(5)
// Values are illustrative, in the shape nnU-Net prints them.
const EPOCHS = [
  {
    n: 212,
    at: '21:06:11',
    tr: '-0.8117',
    val: '-0.7392',
    time: '124.03',
    best: '0.8214',
  },
  {
    n: 213,
    at: '21:08:15',
    tr: '-0.8124',
    val: '-0.7416',
    time: '123.87',
    best: '0.8231',
  },
]
const stamp = (time, micro) => `2026-01-14 ${time}.${micro}:`

function TrainScene() {
  const log = []
  EPOCHS.forEach((e, i) => {
    const base = 0.9 + i * 1.5
    const end = EPOCHS[i + 1]?.at ?? '21:10:19'
    log.push([stamp(e.at, '482193'), `Epoch ${e.n}`, base])
    log.push([stamp(e.at, '482760'), `Current learning rate: ${lr(e.n)}`, base + 0.15])
    log.push([stamp(end, '109334'), `train_loss ${e.tr}`, base + 0.6])
    log.push([stamp(end, '109781'), `val_loss ${e.val}`, base + 0.75])
    log.push([stamp(end, '110129'), `Epoch time: ${e.time} s`, base + 0.9])
    log.push([stamp(end, '110402'), `Yayy! New best EMA pseudo Dice: ${e.best}`, base + 1.05, 'best'])
  })

  return (
    <Colab
      resources={<Resources />}
      status={
        <>
          <span className="ws-spinner" /> Executing (7h 04m) <span className="ws-dim">nnUNetv2_train</span>
        </>
      }
    >
      <Cell code="!nvidia-smi --query-gpu=name,memory.total --format=csv">
        <p>name, memory.total [MiB]</p>
        <p className="ws-strong">NVIDIA A100-SXM4-40GB, 40960 MiB</p>
      </Cell>
      <Cell code="!nnUNetv2_train 1 3d_fullres 0" run="busy">
        <div className="ws-log">
          {log.map(([time, text, when, kind]) => (
            <p key={text} className={`ws-in${kind ? ` ws-log-${kind}` : ''}`} style={at(when)}>
              <span className="ws-dim">{time} </span>
              {text}
            </p>
          ))}
        </div>
      </Cell>
    </Colab>
  )
}

function Resources() {
  return (
    <aside className="ws-co-res">
      <p className="ws-co-pane">Resources</p>
      <p className="ws-dim">Python 3 Google Compute Engine backend (GPU)</p>
      {[
        ['System RAM', '9.8 / 83.5 GB', 0.12],
        ['GPU RAM', '11.2 / 40.0 GB', 0.28],
        ['Disk', '64.3 / 235.7 GB', 0.27],
      ].map(([name, used, share]) => (
        <div key={name} className="ws-res">
          <p>
            <b>{name}</b> <span className="ws-dim">{used}</span>
          </p>
          <span className="ws-res-bar" style={{ '--v': share }}>
            <i />
          </span>
        </div>
      ))}
    </aside>
  )
}

/* ── 9 · Read the curves: nnU-Net's progress.png ──────────────── */
// A seeded walk, so the curves look like a real run and never change.
function seeded(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PLOT = { x: 44, w: 560 }

function series(fn, noise, seed, ys) {
  const rand = seeded(seed)
  const points = []
  let ema = null
  for (let i = 0; i <= 120; i++) {
    const t = i / 120
    let v = fn(t) + (rand() - 0.5) * noise
    if (ys.spikes && rand() > 0.94) v += 6 + rand() * 9
    if (ys.ema) {
      ema = ema == null ? v : ema * 0.8 + v * 0.2
      v = ema
    }
    const x = PLOT.x + t * PLOT.w
    const y = ys.top + ys.h * (1 - (v - ys.min) / (ys.max - ys.min))
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return `M${points.join(' L')}`
}

const PANEL_LOSS = { top: 14, h: 116, min: -0.9, max: 0.1 }
const PANEL_DICE = { ...PANEL_LOSS, min: 0, max: 1 }
const PANEL_TIME = { top: 166, h: 54, min: 100, max: 150 }
const PANEL_LR = { top: 256, h: 54, min: 0, max: 0.01 }

const dice = (t) => 0.86 - 0.62 * Math.exp(-t * 9)
const CURVES = {
  train: series((t) => -0.86 + 0.84 * Math.exp(-t * 7), 0.03, 7, PANEL_LOSS),
  val: series((t) => -0.76 + 0.7 * Math.exp(-t * 6.5), 0.06, 11, PANEL_LOSS),
  dice: series(dice, 0.09, 3, PANEL_DICE),
  ema: series(dice, 0.09, 3, { ...PANEL_DICE, ema: true }),
  time: series(() => 122, 3, 5, { ...PANEL_TIME, spikes: true }),
  lr: series((t) => 0.01 * (1 - t) ** 0.9, 0, 1, PANEL_LR),
}

function Axes({ top, h, label, ticks, right }) {
  return (
    <g className="ws-axes">
      <rect x={PLOT.x} y={top} width={PLOT.w} height={h} />
      {ticks.map(([v, t]) => (
        <text key={t} x={PLOT.x - 5} y={top + h * (1 - v) + 3} textAnchor="end">
          {t}
        </text>
      ))}
      <text className="ws-axis-name" transform={`translate(10 ${top + h / 2}) rotate(-90)`} textAnchor="middle">
        {label}
      </text>
      {right && (
        <text className="ws-axis-name" transform={`translate(630 ${top + h / 2}) rotate(90)`} textAnchor="middle">
          {right}
        </text>
      )}
      {[0, 200, 400, 600, 800, 1000].map((e) => (
        <text key={e} x={PLOT.x + (e / 1000) * PLOT.w} y={top + h + 11} textAnchor="middle">
          {e}
        </text>
      ))}
      <text className="ws-axis-name" x={PLOT.x + PLOT.w / 2} y={top + h + 21} textAnchor="middle">
        epoch
      </text>
    </g>
  )
}

function CurvesScene() {
  const drawn = (key, cls, when) => (
    <path className={`ws-curve ${cls} ws-draw`} d={CURVES[key]} pathLength="1" style={at(when)} />
  )
  return (
    <Colab>
      <Cell code={'Image(f"{results}/fold_0/progress.png")'}>
        <figure className="ws-progress">
          <svg viewBox="0 0 640 336" aria-hidden="true">
            <Axes
              top={PANEL_LOSS.top}
              h={PANEL_LOSS.h}
              label="loss"
              right="pseudo dice"
              ticks={[
                [0.9, '0.0'],
                [0.5, '-0.4'],
                [0.1, '-0.8'],
              ]}
            />
            <Axes
              top={PANEL_TIME.top}
              h={PANEL_TIME.h}
              label="time [s]"
              ticks={[
                [0.8, '140'],
                [0.2, '110'],
              ]}
            />
            <Axes
              top={PANEL_LR.top}
              h={PANEL_LR.h}
              label="learning rate"
              ticks={[
                [1, '0.01'],
                [0, '0'],
              ]}
            />
            {drawn('train', 'is-blue', 0.3)}
            {drawn('val', 'is-red', 0.45)}
            {drawn('dice', 'is-green is-dotted', 0.6)}
            {drawn('ema', 'is-green is-thick', 0.75)}
            {drawn('time', 'is-blue is-thin', 1.1)}
            {drawn('lr', 'is-blue', 1.3)}
            <g className="ws-legend ws-in" style={at(2.2)}>
              <rect x="470" y="20" width="126" height="54" rx="2" />
              {[
                ['is-blue', 'loss_tr'],
                ['is-red', 'loss_val'],
                ['is-green is-dotted', 'pseudo dice'],
                ['is-green is-thick', 'pseudo dice (mov. avg.)'],
              ].map(([cls, name], i) => (
                <g key={name} transform={`translate(478 ${31 + i * 12})`}>
                  <line className={`ws-curve ${cls}`} x1="0" x2="16" y1="0" y2="0" />
                  <text x="21" y="3">
                    {name}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </figure>
      </Cell>
    </Colab>
  )
}

/* ── 10 · Put it online: the Space, live on Hugging Face ───────── */
// Carl's own Space (johnnydang88/QWEN3), in its Gradio Soft theme. The
// strings are the app's: header, question box, and its status lines.
const QUESTION = 'What are the four treatment pillars of AF-CARE?'
const STATUS = [
  '🔍 Retrieving relevant documents (multi-query expansion)...',
  '📊 Reranking with CrossEncoder (CPU)...',
  '🧠 Generating with Qwen3 (ZeroGPU H200)...',
]
const PILLARS = [
  ['C', 'Comorbidity and risk factor management'],
  ['A', 'Avoid stroke and thromboembolism'],
  ['R', 'Reduce symptoms by rate and rhythm control'],
  ['E', 'Evaluation and dynamic reassessment'],
]

function ShareScene() {
  return (
    <Win url="huggingface.co/spaces/johnnydang88/QWEN3" className="ws-hf">
      <div className="ws-hf-nav">
        <img src={HuggingFaceLogo} alt="" width="20" height="20" />
        <b>Hugging Face</b>
        <span className="ws-hf-search">Search models, datasets, users…</span>
      </div>
      <div className="ws-hf-space">
        <span className="ws-dim">Spaces:</span>
        <b>johnnydang88/QWEN3</b>
        <span className="ws-hf-like">
          <Heart size={10} strokeWidth={2.4} /> like
        </span>
        <span className="ws-hf-run">
          <span className="ws-live-dot" /> Running on Zero
        </span>
        <span className="ws-hf-tabs">
          <span className="is-on">App</span>
          <span>Files</span>
          <span>Community</span>
        </span>
      </div>
      <div className="ws-gradio">
        <h3>🌌 Cardiology AI Assistant (ESC 2024)</h3>
        <p className="ws-gradio-sub">⚡ Powered by Alibaba Qwen3-4B · ZeroGPU H200</p>
        <div className="ws-gradio-row">
          <div className="ws-gradio-box">
            <span className="ws-gradio-label">Your Clinical Question</span>
            <span className="ws-gradio-input">
              <Typed text={QUESTION} delay={0.4} per={0.03} />
            </span>
          </div>
          <span className="ws-gradio-btn">🔍 Analyze Guidelines</span>
        </div>
        <div className="ws-gradio-out">
          {STATUS.map((line, i) => (
            <p key={line} className="ws-gradio-status ws-flash-line" style={{ '--d': 2.1 + i * 0.7 }}>
              ⏳ <b>Status:</b> {line}
            </p>
          ))}
          <div className="ws-gradio-answer ws-in" style={at(4.3)}>
            <p className="ws-gradio-h">🌌 Answer</p>
            {PILLARS.map(([letter, text]) => (
              <p key={letter}>
                <b>{letter}</b> · {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Win>
  )
}

const SCENES = {
  plan: PlanScene,
  build: BuildScene,
  check: CheckScene,
  review: ReviewScene,
  ship: ShipScene,
  data: DataScene,
  gpu: GpuScene,
  train: TrainScene,
  curves: CurvesScene,
  share: ShareScene,
}

// One step's scene, by the step's id in `workflow`.
export default function WorkflowScene({ id }) {
  const Scene = SCENES[id]
  return <Scene />
}

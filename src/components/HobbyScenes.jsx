import { useEffect, useId, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/*
 * One small animated scene per hobby, drawn for the About tile's stage.
 *
 * Every scene shares a 400 × 192 box whose top 12 units (y < 0) stay empty,
 * so the stage caption never covers the drawing. Motion is CSS keyframes in
 * AboutTile.css, which the stage pauses off-screen and drops for reduced
 * motion; each element's resting style is its still pose. The cube is the
 * exception: its stickers run on the Web Animations API, since each one needs
 * its own timing inside a shared loop.
 */

function Scene({ name, children }) {
  return (
    <svg
      viewBox="0 -12 400 192"
      className={`scene-svg scene-${name}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

// useId output isn't safe inside url(#…), so keep only plain characters.
function useSvgId(prefix) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
}

// Counts loops of the animation it's attached to, so a counter in the scene
// ticks in step with the motion (and stops when the stage pauses).
function useLoops(max, start = 1) {
  const [n, setN] = useState(start)
  const onAnimationIteration = (event) => {
    if (event.target === event.currentTarget) setN((c) => (c % max) + 1)
  }
  return [n, onAnimationIteration]
}

/* ── Basketball: a shot along its arc, then the swish ────────────── */
export function Hoops() {
  return (
    <Scene name="hoops">
      <line className="sc-floor" x1="-400" y1="158" x2="800" y2="158" />
      {/* The ball flies a true parabola; this is the same curve. */}
      <path className="hoops-arc" d="M80 130 Q195 -54 310 66" />
      <path className="sc-line" d="M358 158 V54 H336" />
      <line className="hoops-board" x1="334" y1="24" x2="334" y2="88" />

      <g className="hoops-x">
        <g className="hoops-y">
          <g className="hoops-spin">
            <circle className="sc-ball" r="12" />
            <path
              className="sc-seam"
              d="M-12 0 H12 M0 -12 V12 M-8 -9 Q-2.5 0 -8 9 M8 -9 Q2.5 0 8 9"
            />
          </g>
        </g>
      </g>

      <g className="hoops-net">
        <path
          className="sc-net"
          d="M292 70 L298 102 M301 70 L303.5 102 M310 70 V102 M319 70 L316.5 102 M328 70 L322 102 M293.5 81 H326.5 M296 92 H324"
        />
      </g>
      <line className="hoops-rim" x1="288" y1="70" x2="333" y2="70" />
      <text className="hoops-score" x="262" y="46">
        +2
      </text>
    </Scene>
  )
}

/* ── Lifting: reps off the floor, with a counter ─────────────────── */
const PLATES = [
  { x: 100, w: 13, h: 76 },
  { x: 115, w: 13, h: 76 },
  { x: 130, w: 9, h: 52, small: true },
]

export function Lift() {
  const [rep, onLoop] = useLoops(5)

  return (
    <Scene name="lift">
      <line className="sc-floor" x1="-400" y1="158" x2="800" y2="158" />
      <g className="lift-dust">
        {[96, 118, 136, 264, 282, 304].map((x, i) => (
          <circle key={x} cx={x} cy={i % 3 === 1 ? 150 : 154} r="4" />
        ))}
      </g>

      <g className="lift-bar" onAnimationIteration={onLoop}>
        <line className="lift-shaft" x1="84" y1="0" x2="316" y2="0" />
        {PLATES.flatMap((p) => [p, { ...p, x: 400 - p.x - p.w }]).map((p) => (
          <rect
            key={p.x}
            className={p.small ? 'lift-plate is-small' : 'lift-plate'}
            x={p.x}
            y={-p.h / 2}
            width={p.w}
            height={p.h}
            rx="3.5"
          />
        ))}
        <rect className="lift-collar" x="141" y="-8" width="7" height="16" rx="2" />
        <rect className="lift-collar" x="252" y="-8" width="7" height="16" rx="2" />
      </g>

      <text key={rep} className="lift-count" x="364" y="52" textAnchor="end">
        {rep}
      </text>
      <text className="lift-label" x="364" y="70" textAnchor="end">
        {rep === 1 ? 'rep' : 'reps'}
      </text>
    </Scene>
  )
}

/* ── Games: flick, hit, next target ──────────────────────────────── */
const TARGETS = [
  { x: 100, y: 96, label: 'FPS' },
  { x: 200, y: 70, label: 'MOBA' },
  { x: 300, y: 100, label: 'RPG' },
]

export function Games() {
  return (
    <Scene name="games">
      {TARGETS.map((t, i) => (
        <g key={t.label} transform={`translate(${t.x} ${t.y})`} className={`games-target games-t${i + 1}`}>
          <g className="games-ring">
            <circle className="games-outer" r="22" />
            <circle className="games-core" r="12" />
            <circle className="games-bull" r="4" />
          </g>
          <g className="games-hit">
            <path d="M-17 -17 L-10 -10 M17 -17 L10 -10 M-17 17 L-10 10 M17 17 L10 10" />
          </g>
          <text className="games-label" y="42" textAnchor="middle">
            {t.label}
          </text>
        </g>
      ))}

      <g className="games-aim">
        <g className="games-recoil">
          <circle className="games-reticle" r="15" />
          <path className="games-reticle" d="M-25 0 H-9 M9 0 H25 M0 -25 V-9 M0 9 V25" />
          <circle className="games-dot" r="2.4" />
        </g>
      </g>
    </Scene>
  )
}

/* ── Music: a record at 33⅓ rpm and a live meter ─────────────────── */
const EQ = [
  { lo: 0.25, hi: 0.8, dur: 0.9 },
  { lo: 0.4, hi: 1, dur: 0.7 },
  { lo: 0.2, hi: 0.65, dur: 1.1 },
  { lo: 0.35, hi: 0.95, dur: 0.8 },
  { lo: 0.15, hi: 0.7, dur: 1.25 },
  { lo: 0.3, hi: 0.9, dur: 0.75 },
  { lo: 0.2, hi: 0.6, dur: 1 },
  { lo: 0.1, hi: 0.5, dur: 1.35 },
]

export function Music() {
  return (
    <Scene name="music">
      <g transform="translate(140 94)">
        <g className="music-spin">
          <circle className="music-record" r="64" />
          {[56, 48, 40, 32].map((r) => (
            <circle key={r} className="music-groove" r={r} />
          ))}
          <circle className="music-label" r="20" />
          <path className="music-print" d="M-11 -7 A13 13 0 0 1 4 -12.4" />
          <circle className="music-hole" r="2.6" />
        </g>
      </g>
      <path className="music-glare" d="M94 62 A56 56 0 0 1 121 41" />

      <g className="music-arm">
        <path className="music-weight" d="M236 40 L242 20" />
        <path className="sc-line music-tone" d="M236 40 L218 104 L190 121" />
        <path className="music-head" d="M193 118 L182 130" />
        <circle className="music-pivot" cx="236" cy="40" r="9" />
        <circle className="music-pin" cx="236" cy="40" r="2.8" />
      </g>

      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${188 + i * 22} ${54 + i * 6})`}>
          <g className={`music-note n${i + 1}`}>
            <ellipse cx="0" cy="0" rx="4.6" ry="3.4" transform="rotate(-22)" />
            <path d="M4 -1 V-17 Q10 -13 11 -7" />
          </g>
        </g>
      ))}

      <g className="music-eq">
        {EQ.map((bar, i) => (
          <rect
            key={i}
            x={272 + i * 13}
            y="80"
            width="7"
            height="70"
            rx="3.5"
            style={{ '--lo': bar.lo, '--hi': bar.hi, '--dur': `${bar.dur}s` }}
          />
        ))}
      </g>
    </Scene>
  )
}

/* ── K-dramas: the lean-in, then “next episode” ──────────────────── */
const PETALS = [
  { x: 110, dx: 18, dur: 3.4, delay: 0 },
  { x: 150, dx: -10, dur: 4.2, delay: 1.1 },
  { x: 190, dx: 14, dur: 3.8, delay: 2.3 },
  { x: 232, dx: -16, dur: 4.6, delay: 0.6 },
  { x: 268, dx: 10, dur: 3.6, delay: 1.8 },
  { x: 296, dx: -12, dur: 4, delay: 2.9 },
  { x: 130, dx: 22, dur: 4.4, delay: 3.3 },
]

export function KDrama() {
  const clip = useSvgId('kd-clip')
  const [episode, onLoop] = useLoops(16, 7)

  return (
    <Scene name="kdrama">
      <defs>
        <clipPath id={clip}>
          <rect x="92" y="34" width="216" height="132" rx="12" />
        </clipPath>
      </defs>
      <rect className="kd-screen" x="92" y="34" width="216" height="132" rx="12" />

      <g clipPath={`url(#${clip})`}>
        <circle className="kd-moon" cx="268" cy="64" r="13" />
        {[
          [124, 58],
          [158, 48],
          [214, 56],
          [290, 92],
        ].map(([x, y]) => (
          <circle key={x} className="kd-star" cx={x} cy={y} r="1.3" />
        ))}

        <g transform="translate(172 140)">
          <g className="kd-lean-l">
            <circle className="kd-figure" cy="-52" r="11" />
            <path className="kd-figure" d="M-24 34 C-24 -26 -15 -38 0 -38 C15 -38 24 -26 24 34 Z" />
          </g>
        </g>
        <g transform="translate(228 140)">
          <g className="kd-lean-r">
            <circle className="kd-figure" cy="-55" r="11.5" />
            <path className="kd-figure" d="M-25 34 C-25 -28 -16 -40 0 -40 C16 -40 25 -28 25 34 Z" />
          </g>
        </g>

        {PETALS.map((p) => (
          <g key={p.x + p.delay} transform={`translate(${p.x} 22)`}>
            <ellipse
              className="kd-petal"
              rx="3.2"
              ry="2"
              style={{ '--dx': `${p.dx}px`, '--dur': `${p.dur}s`, '--delay': `${p.delay}s` }}
            />
          </g>
        ))}

        <text className="kd-sub" x="200" y="146" textAnchor="middle">
          [soft piano music]
        </text>
        <text className="kd-ep" x="106" y="54">
          EP {episode}
        </text>

        <rect className="kd-track" x="104" y="156" width="192" height="3" rx="1.5" />
        <rect className="kd-played" x="104" y="156" width="192" height="3" rx="1.5" />

        <rect
          className="kd-dim"
          x="92"
          y="34"
          width="216"
          height="132"
          onAnimationIteration={onLoop}
        />
        <g className="kd-next">
          <rect className="kd-card" x="142" y="84" width="116" height="30" rx="15" />
          <circle className="kd-ring-track" cx="160" cy="99" r="7" />
          <circle className="kd-ring" cx="160" cy="99" r="7" transform="rotate(-90 160 99)" />
          <text className="kd-next-text" x="174" y="102.5">
            Next episode
          </text>
        </g>
      </g>
    </Scene>
  )
}

/* ── Two dogs: two trails of prints chasing a ball ───────────────── */
const TRAILS = [
  { tone: 'a', x0: 64, y: 84, lead: 0.3 },
  { tone: 'b', x0: 50, y: 126, lead: 0.4 },
]

export function Dogs() {
  const paw = useSvgId('paw')

  return (
    <Scene name="dogs">
      <defs>
        {/* A print pointing right: the pad, then four toes in an arc. */}
        <g id={paw}>
          <ellipse rx="7" ry="8" />
          <ellipse cx="9.2" cy="-9.8" rx="3" ry="2.5" />
          <ellipse cx="13.2" cy="-3.4" rx="3" ry="2.5" />
          <ellipse cx="13.2" cy="3.4" rx="3" ry="2.5" />
          <ellipse cx="9.2" cy="9.8" rx="3" ry="2.5" />
        </g>
      </defs>

      {TRAILS.map((trail) =>
        Array.from({ length: 10 }, (_, i) => (
          // Positioned by the group, so the print's scale stays centered on it.
          <g
            key={`${trail.tone}${i}`}
            transform={`translate(${trail.x0 + i * 30} ${trail.y + (i % 2 ? 8 : -8) * (trail.tone === 'a' ? 1 : -1)})`}
          >
            <use
              href={`#${paw}`}
              className={`dogs-paw tone-${trail.tone}`}
              style={{ '--delay': `${trail.lead + i * 0.12}s` }}
            />
          </g>
        )),
      )}

      <g className="dogs-ball">
        <g className="dogs-roll">
          <circle className="sc-ball" r="7.5" />
          <path className="sc-seam" d="M-5.5 -5 Q0 0 -5.5 5 M5.5 -5 Q0 0 5.5 5" />
        </g>
      </g>
    </Scene>
  )
}

/* ── Rubik’s cube: solved layer by layer, then scrambled again ───── */
const LOOP = 5200

// Isometric cube: F is the front corner of the top face; A and B run to the
// top face's right and left corners, C runs down the front edge.
const F = [200, 96]
const A = [57.16, -33]
const B = [-57.16, -33]
const C = [0, 66]
const add = (p, q, s = 1) => [p[0] + q[0] * s, p[1] + q[1] * s]

const FACES = {
  top: { origin: F, p: A, q: B, solved: 'a', mixed: 'cabacbbaa' },
  left: { origin: add(F, B), p: [-B[0], -B[1]], q: C, solved: 'b', mixed: 'abcbcabba' },
  right: { origin: F, p: A, q: C, solved: 'c', mixed: 'bcacabacc' },
}

function sticker(face, i, j) {
  const { origin, p, q } = FACES[face]
  const inset = 0.09
  return [
    [i + inset, j + inset],
    [i + 1 - inset, j + inset],
    [i + 1 - inset, j + 1 - inset],
    [i + inset, j + 1 - inset],
  ]
    .map(([u, v]) => add(add(origin, p, u / 3), q, v / 3))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
}

// Solve order, like a beginner's method: the sides from the bottom row up,
// then the top face.
const STICKERS = [
  ...[2, 1, 0].flatMap((j) =>
    ['left', 'right'].flatMap((face) => [0, 1, 2].map((i) => ({ face, i, j }))),
  ),
  ...[0, 1, 2, 3, 4].flatMap((d) =>
    [0, 1, 2].flatMap((i) => (d - i >= 0 && d - i <= 2 ? [{ face: 'top', i, j: d - i }] : [])),
  ),
].map((s, k) => ({
  ...s,
  points: sticker(s.face, s.i, s.j),
  mixed: FACES[s.face].mixed[s.i + s.j * 3],
  solved: FACES[s.face].solved,
  at: (350 + k * 50) / LOOP,
}))

const BODY = [add(F, add(A, B)), add(F, A), add(add(F, A), C), add(F, C), add(add(F, B), C), add(F, B)]
  .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
  .join(' ')

export function Cube({ playing }) {
  const layer = useRef(null)
  const anims = useRef([])
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !layer.current || typeof Element.prototype.animate !== 'function') return undefined
    anims.current = [...layer.current.children].map((el, k) => {
      const at = STICKERS[k].at
      return el.animate(
        [
          { offset: 0, opacity: 0, transform: 'scale(0.3)' },
          { offset: at, opacity: 0, transform: 'scale(0.3)', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          { offset: at + 0.07, opacity: 1, transform: 'scale(1)' },
          { offset: 0.86, opacity: 1, transform: 'scale(1)', easing: 'ease-in' },
          { offset: 0.9, opacity: 0, transform: 'scale(0.85)' },
          { offset: 1, opacity: 0, transform: 'scale(0.3)' },
        ],
        { duration: LOOP, iterations: Infinity },
      )
    })
    return () => {
      anims.current.forEach((a) => a.cancel())
      anims.current = []
    }
  }, [reduce])

  useEffect(() => {
    anims.current.forEach((a) => (playing ? a.play() : a.pause()))
  }, [playing, reduce])

  return (
    <Scene name="cube">
      <ellipse className="cube-shadow" cx="200" cy="172" rx="52" ry="5" />
      <g className="cube-turn">
        <polygon className="cube-body" points={BODY} />
        <g>
          {STICKERS.map((s) => (
            <polygon key={`m${s.face}${s.i}${s.j}`} className={`cube-st c-${s.mixed}`} points={s.points} />
          ))}
        </g>
        <g ref={layer}>
          {STICKERS.map((s) => (
            <polygon
              key={`s${s.face}${s.i}${s.j}`}
              className={`cube-st cube-solved c-${s.solved}`}
              points={s.points}
            />
          ))}
        </g>
      </g>
      {[
        [276, 42],
        [124, 56],
        [284, 134],
      ].map(([x, y], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path
            className="cube-spark"
            style={{ '--delay': `${i * 0.08}s` }}
            d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
          />
        </g>
      ))}
    </Scene>
  )
}

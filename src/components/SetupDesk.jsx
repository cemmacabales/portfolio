import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { profile, setup } from '../data/portfolio'
import { useCycle, usePageVisible } from '../hooks/useCycle'
import { useLocalTime } from '../hooks/useLocalTime'
import { AppMark, RigParts } from './SetupArt'
import './SetupDesk.css'

/*
 * The whole desk, drawn face on like the tile it grows out of, with the gear
 * listed beside it. Pointing at a row or an object lights that object and
 * dims the rest; the PS5 also switches the monitor over to its home screen.
 * The list is the accessible version: the drawing repeats it.
 */

const GAME_HOLD = 2600

// What stays lit with each object: the things it visibly acts on.
const LIT = {
  mac: ['mac', 'link'],
  pi: ['pi', 'link'],
  monitor: ['monitor'],
  keyboard: ['keyboard', 'mat'],
  mouse: ['mouse', 'mat', 'monitor'],
  phone: ['phone'],
  ps5: ['ps5', 'monitor'],
}

/* ── The G75, projected onto the desk ─────────────────────────── */
// A 75% layout in key units, back row first. Widths per row sum to 16.
const ROWS = [
  Array(16).fill(1),
  [...Array(13).fill(1), 2, 1],
  [1.5, ...Array(12).fill(1), 1.5, 1],
  [1.75, ...Array(11).fill(1), 2.25, 1],
  [2.25, ...Array(10).fill(1), 1.75, 1, 1],
  [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1],
]
const PLANE_W = 16.8
const PLANE_D = 6.8

// Square-to-quad homography: the keyboard's plane seen from the chair.
function homography([p0, p1, p2, p3]) {
  const dx1 = p1[0] - p2[0]
  const dx2 = p3[0] - p2[0]
  const dx3 = p0[0] - p1[0] + p2[0] - p3[0]
  const dy1 = p1[1] - p2[1]
  const dy2 = p3[1] - p2[1]
  const dy3 = p0[1] - p1[1] + p2[1] - p3[1]
  const den = dx1 * dy2 - dx2 * dy1
  const g = (dx3 * dy2 - dx2 * dy3) / den
  const h = (dx1 * dy3 - dx3 * dy1) / den
  const a = p1[0] - p0[0] + g * p1[0]
  const b = p3[0] - p0[0] + h * p3[0]
  const d = p1[1] - p0[1] + g * p1[1]
  const e = p3[1] - p0[1] + h * p3[1]
  return (x, y) => {
    const s = x / PLANE_W
    const t = y / PLANE_D
    const w = g * s + h * t + 1
    return [(a * s + b * t + p0[0]) / w, (d * s + e * t + p0[1]) / w]
  }
}

// Back-left, back-right, front-right, front-left.
const project = homography([
  [452, 488],
  [772, 488],
  [798, 566],
  [426, 566],
])

const pts = (corners) =>
  corners
    .map(([x, y]) => project(x, y))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

const KEYS = ROWS.flatMap((row, r) => {
  let x = 0.4
  const y0 = 0.4 + r
  return row.map((w, i) => {
    const x0 = x + 0.05
    const x1 = x + w - 0.05
    x += w
    const [, backY] = project(x0, y0 + 0.05)
    const [, frontY] = project(x0, y0 + 0.95)
    // The cap's top sits back from its skirt and stands up off the case.
    const lift = (frontY - backY) * 0.42
    const top = [
      [x0 + 0.13, y0 + 0.12],
      [x1 - 0.13, y0 + 0.12],
      [x1 - 0.13, y0 + 0.8],
      [x0 + 0.13, y0 + 0.8],
    ]
      .map(([px, py]) => project(px, py))
      .map(([px, py]) => `${px.toFixed(1)},${(py - lift).toFixed(1)}`)
      .join(' ')
    return {
      id: `${r}-${i}`,
      col: Math.round(x0),
      row: r,
      base: pts([
        [x0, y0 + 0.05],
        [x1, y0 + 0.05],
        [x1, y0 + 0.95],
        [x0, y0 + 0.95],
      ]),
      top,
    }
  })
})

const CASE = pts([
  [0, 0],
  [PLANE_W, 0],
  [PLANE_W, PLANE_D],
  [0, PLANE_D],
])
const [FL, FR] = [project(0, PLANE_D), project(PLANE_W, PLANE_D)]
const CASE_FRONT = `${FL[0]},${FL[1]} ${FR[0]},${FR[1]} ${FR[0] - 1},${FR[1] + 7} ${FL[0] + 1},${FL[1] + 7}`

function Keyboard() {
  return (
    <g className="kb">
      <ellipse className="dev-shadow" cx="612" cy="576" rx="196" ry="5" />
      <polygon className="kb-front" points={CASE_FRONT} />
      <polygon className="kb-case" points={CASE} />
      {KEYS.map((key) => (
        <g key={key.id} className="kb-key" style={{ '--c': key.col, '--r': key.row }}>
          <polygon className="kb-skirt" points={key.base} />
          <polygon className="kb-cap" points={key.top} />
        </g>
      ))}
    </g>
  )
}

/* ── The monitor's two inputs ─────────────────────────────────── */
function MacDesktop({ ids }) {
  return (
    <g className="scr-mac">
      <rect width="428" height="241" fill={`url(#${ids.wall})`} />
      <rect width="428" height="241" fill={`url(#${ids.glowA})`} />
      <rect width="428" height="241" fill={`url(#${ids.glowB})`} />
      <rect className="scr-menubar" width="428" height="9" />
      <g className="scr-menu">
        <rect x="8" y="3" width="6" height="3" rx="1.5" />
        <rect x="20" y="3" width="14" height="3" rx="1.5" />
        <rect x="40" y="3" width="10" height="3" rx="1.5" />
        <rect x="56" y="3" width="12" height="3" rx="1.5" />
        <rect x="380" y="3" width="36" height="3" rx="1.5" />
      </g>

      {/* Cursor, with its agent pane */}
      <rect className="win win-editor" x="16" y="22" width="262" height="180" rx="5" />
      <rect className="win-bar" x="16.5" y="22.5" width="261" height="12" rx="4.5" />
      <rect className="win-editor-side" x="16.5" y="34.5" width="44" height="167" />
      <rect className="win-agent" x="210" y="34.5" width="67.5" height="167" />
      <g className="side-rows">
        <rect x="23" y="42" width="26" height="2.6" rx="1.3" />
        <rect x="27" y="50" width="22" height="2.6" rx="1.3" />
        <rect x="27" y="58" width="28" height="2.6" rx="1.3" />
        <rect x="23" y="66" width="20" height="2.6" rx="1.3" />
        <rect x="27" y="74" width="24" height="2.6" rx="1.3" />
      </g>
      <g className="code">
        <rect x="70" y="44" width="58" height="3" rx="1.5" />
        <rect x="78" y="53" width="92" height="3" rx="1.5" />
        <rect className="code-hi" x="78" y="62" width="70" height="3" rx="1.5" />
        <rect x="86" y="71" width="104" height="3" rx="1.5" />
        <rect x="86" y="80" width="64" height="3" rx="1.5" />
        <rect x="78" y="89" width="40" height="3" rx="1.5" />
        <rect x="70" y="104" width="82" height="3" rx="1.5" />
        <rect x="78" y="113" width="112" height="3" rx="1.5" />
        <rect x="78" y="122" width="56" height="3" rx="1.5" />
        <rect x="70" y="137" width="30" height="3" rx="1.5" />
      </g>
      <g className="agent">
        <rect className="agent-me" x="236" y="44" width="36" height="12" rx="5" />
        <rect className="agent-them" x="216" y="62" width="54" height="22" rx="5" />
        <rect className="agent-me" x="244" y="90" width="28" height="12" rx="5" />
        <rect className="agent-field" x="215" y="182" width="58" height="14" rx="5" />
      </g>

      {/* Safari, with this site open */}
      <rect className="win win-safari" x="232" y="52" width="178" height="150" rx="5" />
      <rect className="win-bar-light" x="232.5" y="52.5" width="177" height="14" rx="4.5" />
      <rect className="url" x="286" y="56.5" width="70" height="6" rx="3" />
      <g className="site">
        <rect x="240" y="74" width="104" height="62" rx="4" />
        <rect className="site-photo" x="306" y="78" width="34" height="54" rx="3" />
        <rect x="348" y="74" width="54" height="29" rx="4" />
        <rect className="site-mint" x="348" y="107" width="54" height="29" rx="4" />
        <rect x="240" y="140" width="162" height="34" rx="4" />
        <rect x="240" y="178" width="80" height="18" rx="4" />
        <rect x="324" y="178" width="78" height="18" rx="4" />
        <rect className="site-ink" x="246" y="84" width="40" height="4" rx="2" />
        <rect className="site-ink" x="246" y="92" width="52" height="4" rx="2" />
      </g>

      {/* The Dock */}
      <rect className="scr-dock" x="172" y="220" width="84" height="16" rx="5" />
      <rect x="177" y="223" width="10" height="10" rx="2.6" fill="#2f7bea" />
      <rect x="196" y="223" width="10" height="10" rx="2.6" fill="#d97757" />
      <rect x="215" y="223" width="10" height="10" rx="2.6" fill="#0b0b0b" />
      <rect x="234" y="223" width="10" height="10" rx="2.6" fill="#26241e" />

      {/* The pointer, which the mouse moves */}
      <g className="pointer">
        <circle className="pointer-ring" cx="0" cy="0" r="6" />
        <path className="pointer-arrow" d="M0 0 L0 12.5 L3.2 9.4 L5.6 14.6 L7.6 13.7 L5.3 8.6 L9.6 8.6 Z" />
      </g>
    </g>
  )
}

function PlayStationHome({ game, time, ids }) {
  return (
    <g className="scr-ps">
      <rect width="428" height="241" fill="#05070c" />
      {setup.games.map((g, i) => {
        // Full width, cropped to the band around the cover's focus.
        const h = (428 * g.size[1]) / g.size[0]
        const y = Math.min(0, Math.max(241 - h, 120.5 - g.focus * h))
        return (
          <image
            key={g.id}
            className={`ps-art${i === game ? ' is-on' : ''}`}
            href={g.cover}
            y={y.toFixed(1)}
            width="428"
            height={h.toFixed(1)}
          />
        )
      })}
      <rect width="428" height="241" fill={`url(#${ids.psV})`} />
      <rect width="428" height="241" fill={`url(#${ids.psH})`} />

      <text className="ps-tab ps-tab-on" x="14" y="16">
        Games
      </text>
      <text className="ps-tab" x="44" y="16">
        Media
      </text>
      <text className="ps-time" x="414" y="16" textAnchor="end">
        {time}
      </text>

      {setup.games.map((g, i) => (
        <g key={g.id} className={`ps-icon${i === game ? ' is-on' : ''}`} style={{ '--x': `${14 + i * 38}px` }}>
          <image
            href={g.cover}
            width="32"
            height="32"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${ids.round})`}
          />
          <rect className="ps-icon-ring" width="32" height="32" rx="6.5" />
        </g>
      ))}
      <g className="ps-library" transform="translate(132 26)">
        <rect width="28" height="28" rx="6" />
        <g className="ps-library-grid">
          <rect x="8" y="8" width="5" height="5" rx="1" />
          <rect x="15" y="8" width="5" height="5" rx="1" />
          <rect x="8" y="15" width="5" height="5" rx="1" />
          <rect x="15" y="15" width="5" height="5" rx="1" />
        </g>
      </g>

      {setup.games.map((g, i) => (
        <text key={g.id} className={`ps-title${i === game ? ' is-on' : ''}`} x="14" y="192">
          {g.title}
        </text>
      ))}
      <rect className="ps-play" x="14" y="202" width="46" height="17" rx="8.5" />
      <text className="ps-play-label" x="37" y="213.5" textAnchor="middle">
        Play
      </text>
      <circle className="ps-more" cx="72" cy="210.5" r="8.5" />
      <g className="ps-more-dots">
        <circle cx="68.6" cy="210.5" r="1" />
        <circle cx="72" cy="210.5" r="1" />
        <circle cx="75.4" cy="210.5" r="1" />
      </g>
    </g>
  )
}

/* ── The rest of the desk ─────────────────────────────────────── */
function Monitor({ ids, ps5, game, osd, time }) {
  return (
    <>
      <ellipse className="dev-shadow" cx="612" cy="472" rx="84" ry="3" />
      <rect className="mon-neck" x="600" y="372" width="24" height="94" rx="3" />
      <path className="mon-base" d="M548 471 Q 612 458 676 471 L 676 473 Q 612 470 548 473 Z" />
      <rect className="mon-body" x="392" y="118" width="440" height="262" rx="7" />
      <circle className="mon-led" cx="612" cy="373" r="1.3" />
      <svg
        x="398"
        y="124"
        width="428"
        height="241"
        viewBox="0 0 428 241"
        className={`mon-screen${ps5 ? ' is-ps5' : ''}`}
      >
        <defs>
          <clipPath id={ids.round} clipPathUnits="objectBoundingBox">
            <rect width="1" height="1" rx="0.2" />
          </clipPath>
          <linearGradient id={ids.psV} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.6" />
            <stop offset="0.32" stopColor="#000" stopOpacity="0" />
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.82" />
          </linearGradient>
          <linearGradient id={ids.psH} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.45" />
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="428" height="241" fill="#020303" />
        <MacDesktop ids={ids} />
        <PlayStationHome game={game} time={time} ids={ids} />
        {osd && (
          <g key={osd} className="osd">
            <rect x={416 - (osd.length * 5.2 + 20)} y="206" width={osd.length * 5.2 + 20} height="22" rx="7" />
            <text x="406" y="220.5" textAnchor="end">
              {osd}
            </text>
          </g>
        )}
      </svg>
    </>
  )
}

function Phone({ turned, clock, date, wall }) {
  // Only animate the turn back once it has turned at least once.
  const [ever, setEver] = useState(false)
  if (turned && !ever) setEver(true)
  const state = turned ? ' is-turned' : ever ? ' is-unturned' : ''

  return (
    <>
      <ellipse className="dev-shadow" cx="875" cy="470" rx="22" ry="2.6" />
      <path className="stand" d="M858 470 Q 875 462 892 470 Z" />
      <rect className="stand" x="872" y="392" width="6" height="74" rx="2" />
      <g className={`phone${state}`} transform="translate(848 296)">
        <g className="phone-spin">
          <g className="phone-front">
            <rect className="phone-rim" width="54" height="114" rx="9.5" />
            <rect className="phone-glass" x="1.8" y="1.8" width="50.4" height="110.4" rx="7.8" />
            <rect x="1.8" y="1.8" width="50.4" height="110.4" rx="7.8" fill={`url(#${wall})`} />
            <rect x="20" y="5.6" width="14" height="4.2" rx="2.1" fill="#000" />
            <text className="phone-date" x="27" y="20.5" textAnchor="middle">
              {date}
            </text>
            <text className="phone-clock" x="27" y="37" textAnchor="middle">
              {clock}
            </text>
            <circle className="phone-btn" cx="10" cy="103" r="4" />
            <circle className="phone-btn" cx="44" cy="103" r="4" />
            <rect x="19" y="108.6" width="16" height="1.3" rx="0.65" fill="#fff" opacity="0.7" />
          </g>
          <g className="phone-back">
            <rect className="phone-rim" width="54" height="114" rx="9.5" />
            <rect className="phone-window" x="7" y="40" width="40" height="66" rx="4" />
            <rect className="phone-plateau" x="2" y="2" width="50" height="33" rx="7.8" />
            {[
              [12.5, 11],
              [12.5, 25],
              [25, 18],
            ].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`}>
                <circle className="lens-ring" cx={cx} cy={cy} r="5.6" />
                <circle className="lens-glass" cx={cx} cy={cy} r="3.7" />
                <circle cx={cx - 1.1} cy={cy - 1.1} r="0.9" fill="#fff" opacity="0.35" />
              </g>
            ))}
            <circle className="lens-flash" cx="41" cy="11" r="2.6" />
            <circle className="lens-glass" cx="41" cy="25" r="2.2" />
          </g>
        </g>
      </g>
    </>
  )
}

function PlayStation({ on, ids }) {
  return (
    <g transform="translate(924 185)" className={`ps5${on ? ' is-on' : ''}`}>
      <ellipse className="dev-shadow" cx="38" cy="287" rx="36" ry="3" />
      <rect className="ps5-foot" x="20" y="279" width="36" height="6" rx="3" />
      <rect className="ps5-core" x="24.5" y="16" width="27" height="260" rx="3" />
      {/* The covers stand taller than the core and sweep out into fins at the top. */}
      <path
        className="ps5-wing"
        fill={`url(#${ids.wingL})`}
        d="M25 20 C 19 15 7 7 0.6 0.6 C 2.4 26 6.6 56 8.4 104 L 11 272 C 15.5 276.5 20.5 276.5 25 275 Z"
      />
      <path
        className="ps5-wing"
        fill={`url(#${ids.wingR})`}
        d="M51 20 C 57 15 69 7 75.4 0.6 C 73.6 26 69.4 56 67.6 104 L 66.8 168 C 72.2 174 73.4 244 67.4 262 L 65 272 C 60.5 276.5 55.5 276.5 51 275 Z"
      />
      <path className="ps5-slot" d="M70.2 186 L 69.8 246" />
      <line className="ps5-bar" x1="25.6" y1="22" x2="25.6" y2="270" />
      <line className="ps5-bar" x1="50.4" y1="22" x2="50.4" y2="270" />
      <rect className="ps5-port" x="30.5" y="238" width="7" height="3" rx="0.6" />
      <rect className="ps5-port" x="40.5" y="238.4" width="4.6" height="2.2" rx="1.1" />
    </g>
  )
}

function Mouse() {
  return (
    <g transform="translate(828 514)">
      <ellipse className="dev-shadow" cx="25" cy="60" rx="26" ry="3.2" />
      <path
        className="mouse-body"
        d="M5 58 C 3.5 45 4 23 10 11 C 13 4.5 19 2 24.5 4 C 34 8.5 44 23 46.5 39 C 47.6 47 46.8 53 45 58 Z"
      />
      <path className="mouse-palm" d="M5 58 C 3.5 45 4 23 10 11 C 12 7 15 4.8 18.5 4 C 13.5 14 12 34 14 58 Z" />
      <g className="mouse-click">
        <path className="mouse-seam" d="M24 4.6 C 31 9 38 18 42.6 30" />
        <rect
          className="mouse-wheel"
          x="26.5"
          y="8.5"
          width="3.6"
          height="8"
          rx="1.8"
          transform="rotate(-36 28.3 12.5)"
        />
      </g>
      <rect className="mouse-side" x="6.4" y="24" width="2.4" height="8" rx="1.2" />
      <rect className="mouse-side" x="6.2" y="34" width="2.4" height="8" rx="1.2" />
    </g>
  )
}

/* ── The drawing ──────────────────────────────────────────────── */
function DeskScene({ active, game, osd, lit, onPoint, onLeave }) {
  const uid = useId()
  const ids = {
    wall: `${uid}w`,
    glowA: `${uid}a`,
    glowB: `${uid}b`,
    round: `${uid}r`,
    psV: `${uid}v`,
    psH: `${uid}h`,
    lock: `${uid}l`,
    wingL: `${uid}wl`,
    wingR: `${uid}wr`,
  }
  const { hour, minute } = useLocalTime(profile.timeZone)
  const clock = `${hour % 12 || 12}:${String(minute).padStart(2, '0')}`
  const time = `${clock} ${hour < 12 ? 'AM' : 'PM'}`
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: profile.timeZone,
  }).format(new Date())

  const dev = (id) => ({
    className: 'dev',
    'data-dev': id,
    'data-lit': lit.has(id) || undefined,
  })

  const pick = (event) => event.target.closest?.('[data-dev]')?.getAttribute('data-dev')

  return (
    <svg
      className="desk-scene"
      viewBox="12 108 1000 490"
      data-active={active || undefined}
      onPointerOver={(event) => {
        if (event.pointerType === 'touch') return
        const id = pick(event)
        if (id && LIT[id]) onPoint(id)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') onLeave()
      }}
      onClick={(event) => {
        const id = pick(event)
        if (id && LIT[id]) onPoint(id)
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={ids.wall} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d3b34" />
          <stop offset="1" stopColor="#041b18" />
        </linearGradient>
        <radialGradient id={ids.glowA} cx="0.8" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#64ffda" stopOpacity="0.45" />
          <stop offset="1" stopColor="#64ffda" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.glowB} cx="0.1" cy="1" r="0.65">
          <stop offset="0" stopColor="#2fd6b3" stopOpacity="0.3" />
          <stop offset="1" stopColor="#2fd6b3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.lock} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#3a4f7e" />
          <stop offset="0.55" stopColor="#16203a" />
          <stop offset="1" stopColor="#07090f" />
        </linearGradient>
        <linearGradient id={ids.wingL} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fdfdfd" />
          <stop offset="1" stopColor="#d7dbdf" />
        </linearGradient>
        <linearGradient id={ids.wingR} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fdfdfd" />
          <stop offset="1" stopColor="#d7dbdf" />
        </linearGradient>
      </defs>

      <g className="desk-more">
        <g {...dev('mat')}>
          <path className="mat" d="M422 484 L 884 484 L 906 590 L 402 590 Z" />
        </g>
      </g>

      <g transform="translate(24 312.5)">
        <RigParts lit={lit} />
      </g>

      <g className="desk-more">
        <g {...dev('monitor')}>
          <Monitor ids={ids} ps5={active === 'ps5'} game={game} osd={osd} time={time} />
        </g>

        <g {...dev('phone')}>
          <Phone turned={active === 'phone'} clock={clock} date={date} wall={ids.lock} />
        </g>

        <g {...dev('ps5')}>
          <PlayStation on={active === 'ps5'} ids={ids} />
        </g>

        <g {...dev('keyboard')}>
          <Keyboard />
        </g>

        <g {...dev('mouse')}>
          <Mouse />
        </g>
      </g>
    </svg>
  )
}

/* ── The list ─────────────────────────────────────────────────── */
function GearList({ active, game, onPoint, onLeave, onGame, onGameLeave }) {
  const listRef = useRef(null)
  const [lens, setLens] = useState(null)

  // The lens is one element that glides to whichever row is lit.
  useLayoutEffect(() => {
    const row = active && listRef.current?.querySelector(`[data-gear="${active}"]`)
    if (!row) {
      setLens((current) => (current ? { ...current, on: false } : null))
      return
    }
    setLens({ x: row.offsetLeft, y: row.offsetTop, w: row.offsetWidth, h: row.offsetHeight, on: true })
  }, [active])

  const point = (id) => (event) => {
    if (event.pointerType !== 'touch') onPoint(id)
  }

  return (
    <ul
      ref={listRef}
      className="gear"
      aria-label="Everything on my desk"
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') onLeave()
      }}
    >
      <li
        className={`gear-lens${lens?.on ? ' is-on' : ''}`}
        style={
          lens ? { '--x': `${lens.x}px`, '--y': `${lens.y}px`, '--w': `${lens.w}px`, '--h': `${lens.h}px` } : undefined
        }
        aria-hidden="true"
      />
      {setup.gear.map((item) => {
        const on = active === item.id
        const ps5 = item.id === 'ps5'
        const detail = ps5 && on ? setup.games[game].title : item.detail
        return (
          <li key={item.id} className={`gear-item gear-${item.id}`} data-gear={item.id}>
            <button
              type="button"
              className={`gear-row${on ? ' is-on' : ''}`}
              onPointerEnter={point(item.id)}
              onFocus={() => onPoint(item.id)}
              onClick={() => onPoint(item.id)}
            >
              <span className="gear-name">{item.name}</span>
              <span className="gear-detail" key={detail}>
                {detail}
              </span>
            </button>

            {item.id === 'mac' && (
              <span className="gear-apps" aria-hidden="true">
                {setup.apps.map((app) => (
                  <span key={app.id} className={`app-icon app-icon-${app.id}`}>
                    <AppMark id={app.id} />
                  </span>
                ))}
              </span>
            )}

            {item.id === 'phone' && <span className="gear-swatch" aria-hidden="true" />}

            {ps5 && (
              <span className="gear-games" onPointerLeave={onGameLeave}>
                {setup.games.map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`gear-game${on && i === game ? ' is-on' : ''}`}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== 'touch') onGame(i)
                    }}
                    onFocus={() => onGame(i)}
                    onBlur={onGameLeave}
                    onClick={() => onGame(i)}
                  >
                    <img src={g.cover} alt="" width="288" height="346" loading="lazy" decoding="async" />
                    <span className="visually-hidden">{g.title}</span>
                  </button>
                ))}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ── Both together ────────────────────────────────────────────── */
export default function SetupDesk({ className = '', sceneRef }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2 })
  const pageVisible = usePageVisible()
  const [active, setActive] = useState(null)
  const [held, setHeld] = useState(false)
  const [game, setGame] = useCycle(setup.games.length, GAME_HOLD, active === 'ps5' && !held)
  const [osd, setOsd] = useState(null)
  const input = useRef('USB-C')

  // The monitor says which input it switched to, the way a real one does.
  useEffect(() => {
    const next = active === 'ps5' ? 'HDMI 1' : 'USB-C'
    if (next === input.current) return
    input.current = next
    setOsd(next)
  }, [active])

  useEffect(() => {
    if (!osd) return undefined
    const id = setTimeout(() => setOsd(null), 1600)
    return () => clearTimeout(id)
  }, [osd])

  const lit = new Set(active ? LIT[active] : [])
  const monitorOsd = active === 'monitor' ? '27″ · 2560 × 1440 · 120 Hz' : osd

  const pickGame = (i) => {
    setActive('ps5')
    setHeld(true)
    setGame(i)
  }

  const point = (id) => {
    // Moving from the PS5 onto the monitor keeps the games up: it's showing them.
    setActive((current) => (current === 'ps5' && id === 'monitor' ? current : id))
    if (id !== 'ps5') setHeld(false)
  }

  return (
    <div ref={ref} id="setup-desk" className={`desk rig-host${inView && pageVisible ? ' is-live' : ''} ${className}`}>
      <div className="desk-grid">
        <div className="desk-stage">
          <div ref={sceneRef} className="desk-stage-move">
            <DeskScene
              active={active}
              game={game}
              osd={monitorOsd}
              lit={lit}
              onPoint={point}
              onLeave={() => {
                setActive(null)
                setHeld(false)
              }}
            />
          </div>
        </div>
        <GearList
          active={active}
          game={game}
          onPoint={point}
          onLeave={() => {
            setActive(null)
            setHeld(false)
          }}
          onGame={pickGame}
          onGameLeave={() => setHeld(false)}
        />
      </div>
    </div>
  )
}

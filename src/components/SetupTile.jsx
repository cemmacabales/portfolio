import { useRef } from 'react'
import { motion, useInView } from 'framer-motion' // eslint-disable-line no-unused-vars
import { setup } from '../data/portfolio'
import { usePageVisible } from '../hooks/useCycle'
import { useBooted } from '../hooks/useBooted'
import './SetupTile.css'

/* ── App marks (official shapes, via tech-stack-icons) ───────── */
const CLAUDE_SPARK = [
  'm95.815 38.848 3.465 1.98v1.486l-.99 3.465-42.08 9.901-3.956-9.83z',
  'm80.076 9.73 4.845 1.016 1.286 1.585 1.226 3.799-.508 2.422-28.239 38.613-9.406-9.406 26.04-34.17z',
  'm55.716 3.7 2.97-1.98 2.475.99 2.475 3.465-6.78 40.755-4.605-3.131-1.98-5.446L53.736 7.66z',
  'M23.959 4.352 27.01.454 29 0l3.95.577 1.949 1.526L49.102 33.59l5.137 14.961-6.01 3.342L25.32 10.322z',
  'm9.18 25.979-.99-3.962 2.972-3.465 3.465.495h.99L36.41 34.393l6.435 4.95 8.911 6.931-4.95 8.416-4.455-3.465-2.97-2.97-28.714-20.298z',
  'M3.24 51.72 1 49.244v-2.202l2.24-.768 25.248 1.485 24.753 1.98-.804 4.93-47.216-2.454z',
  'M18.092 77.488h-4.95l-1.968-2.266v-2.71l8.404-5.94 34.166-21.75 3.458 5.907z',
  'm27.498 91.324-1.98.495-2.97-1.486.495-2.475 29.208-38.614 3.96 5.446L34.43 83.403z',
  'm52.25 96.274-1.485 1.98-2.97.99-2.475-1.98-1.486-2.97 7.426-40.1 4.456.496z',
  'M77.499 85.383v3.96l-.495 1.485-1.98.99-3.466-.46-23.796-35.416 9.439-7.193 7.92 14.357.744 5.197z',
  'm88.885 79.442.495 2.475-1.485 1.98-1.485-.495-8.416-5.94-12.871-11.387-9.901-6.93 2.97-9.406 4.95 2.97 2.97 5.445z',
  'm82.448 54.195 12.377.99 2.97 1.98 1.98 2.97v2.138L94.33 64.59l-27.723-6.93-11.386-.496 2.97-10.396 7.921 5.94z',
]

function ClaudeMark() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor">
      {CLAUDE_SPARK.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function OpenAIMark() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor">
      <path d="M93.06 40.937c1.25-3.438 1.563-6.875 1.25-10.313-.312-3.437-1.562-6.875-3.125-10-2.812-4.687-6.875-8.437-11.562-10.625-5-2.187-10.313-2.812-15.625-1.562-2.5-2.5-5.313-4.688-8.438-6.25S48.685-.001 45.248-.001c-5.313 0-10.625 1.563-15 4.688a24.16 24.16 0 0 0-9.063 12.5c-3.75.937-6.875 2.5-10 4.374-2.812 2.188-5 5-6.875 7.813-2.812 4.688-3.75 10-3.125 15.313a27.2 27.2 0 0 0 6.25 14.375c-1.25 3.437-1.562 6.874-1.25 10.312s1.563 6.875 3.125 10c2.813 4.688 6.875 8.438 11.563 10.625 5 2.188 10.312 2.813 15.625 1.563 2.5 2.5 5.312 4.687 8.437 6.25s6.875 2.187 10.313 2.187c5.312 0 10.625-1.562 15-4.687s7.5-7.5 9.062-12.5c3.438-.626 6.875-2.188 9.688-4.376 2.812-2.187 5.312-4.687 6.875-7.812 2.812-4.687 3.75-10 3.125-15.312-.625-5.313-2.5-10.313-5.938-14.375m-37.5 52.5c-5 0-8.75-1.563-12.187-4.376 0 0 .312-.312.625-.312l20-11.562c.625-.313.937-.626 1.25-1.25.312-.626.312-.938.312-1.563V46.249l8.438 5v23.125c.312 10.938-8.438 19.063-18.438 19.063M15.248 76.249c-2.188-3.75-3.125-8.125-2.188-12.5 0 0 .313.312.625.312l20 11.563c.625.313.938.313 1.563.313s1.25 0 1.562-.313l24.375-14.062v9.687L40.873 83.124c-4.375 2.5-9.375 3.125-14.063 1.875-5-1.25-9.062-4.375-11.562-8.75M9.935 32.812c2.188-3.75 5.625-6.563 9.688-8.125v23.75c0 .625 0 1.25.312 1.562.313.625.625.938 1.25 1.25L45.56 65.311l-8.437 5-20-11.562c-4.375-2.5-7.5-6.562-8.75-11.25s-.938-10.312 1.562-14.687m69.063 15.937L54.623 34.687l8.437-5 20 11.562c3.125 1.875 5.625 4.375 7.188 7.5s2.5 6.563 2.187 10.313c-.312 3.437-1.562 6.874-3.75 9.687s-5 5-8.437 6.25v-23.75c0-.625 0-1.25-.313-1.562 0 0-.312-.625-.937-.938m8.437-12.5s-.312-.312-.625-.312l-20-11.563c-.625-.312-.937-.312-1.562-.312s-1.25 0-1.563.312L39.31 38.437v-9.688l20.313-11.875c3.125-1.875 6.562-2.5 10.312-2.5 3.438 0 6.875 1.25 10 3.437 2.813 2.188 5.313 5 6.563 8.125s1.562 6.876.937 10.313m-52.5 17.5-8.437-5V25.311c0-3.437.937-7.187 2.812-10 1.875-3.124 4.688-5.312 7.813-6.874 3.125-1.563 6.875-2.188 10.312-1.563 3.438.313 6.875 1.875 9.688 4.063 0 0-.313.312-.625.312l-20 11.562c-.625.313-.938.625-1.25 1.25s-.313.938-.313 1.563zm4.375-10 10.938-6.25 10.937 6.25v12.5l-10.937 6.25-10.938-6.25z" />
    </svg>
  )
}

// Cursor's cube: the lit faces are white at partial opacity, so the icon's
// dark body shows through them.
function CursorMark() {
  return (
    <svg viewBox="0 0 100 100">
      <defs>
        <linearGradient id="cursor-b" x1="50" x2="50" y1="50.136" y2="100.136" gradientUnits="userSpaceOnUse">
          <stop offset=".16" stopColor="#fff" stopOpacity=".39" />
          <stop offset=".658" stopColor="#fff" stopOpacity=".8" />
        </linearGradient>
        <linearGradient id="cursor-c" x1="93.438" x2="50.001" y1="25.291" y2="50.761" gradientUnits="userSpaceOnUse">
          <stop offset=".182" stopColor="#fff" stopOpacity=".31" />
          <stop offset=".715" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cursor-d" x1="50" x2="6.562" y1=".137" y2="75.136" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".6" />
          <stop offset=".667" stopColor="#fff" stopOpacity=".22" />
        </linearGradient>
      </defs>
      <path fill="url(#cursor-b)" d="m50 100.136 43.437-25-43.437-25-43.438 25z" />
      <path fill="url(#cursor-c)" d="M93.438 75.137v-50L50 .136v50z" />
      <path fill="url(#cursor-d)" d="m50 .137-43.438 25v50l43.438-25z" />
      <path fill="#c3c3c3" d="m93.438 25.137-43.437 75v-50z" />
      <path fill="#fff" d="M93.437 25.137 50 50.137l-43.438-25z" />
    </svg>
  )
}

const MARKS = { claude: ClaudeMark, codex: OpenAIMark, cursor: CursorMark }

/* ── The desk: the Air, the Pi, and the link between them ─────── */
// One loop, told in three beats: the agent types in the terminal, the file
// crosses to the Pi, and the Pi's activity light blinks as it lands.
function Rig() {
  return (
    <svg className="rig-art" viewBox="0 0 360 168" aria-hidden="true">
      <defs>
        <linearGradient id="rig-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d3b34" />
          <stop offset="1" stopColor="#041b18" />
        </linearGradient>
        <radialGradient id="rig-glow-a" cx="0.8" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#64ffda" stopOpacity="0.5" />
          <stop offset="1" stopColor="#64ffda" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rig-glow-b" cx="0.1" cy="1" r="0.65">
          <stop offset="0" stopColor="#2fd6b3" stopOpacity="0.32" />
          <stop offset="1" stopColor="#2fd6b3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rig-alu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="alu-hi" />
          <stop offset="1" className="alu-lo" />
        </linearGradient>
        <clipPath id="rig-display">
          <rect x="15" y="13" width="210" height="130" rx="4.5" />
        </clipPath>
      </defs>

      {/* MacBook Air, face on */}
      <ellipse className="rig-shadow" cx="120" cy="160" rx="114" ry="3.2" />
      <rect className="lid-rim" x="9" y="7" width="222" height="142" rx="10.5" />
      <rect className="lid-bezel" x="10.2" y="8.2" width="219.6" height="139.6" rx="9.4" />

      <g clipPath="url(#rig-display)">
        <rect x="15" y="13" width="210" height="130" fill="url(#rig-wall)" />
        <rect x="15" y="13" width="210" height="130" fill="url(#rig-glow-a)" />
        <rect x="15" y="13" width="210" height="130" fill="url(#rig-glow-b)" />
        <rect className="scr-menubar" x="15" y="13" width="210" height="6.5" />

        {/* Cursor, behind */}
        <rect className="win win-editor" x="104" y="28" width="110" height="84" rx="4" />
        <rect className="win-editor-side" x="104.5" y="37.5" width="19" height="74" />
        <rect className="win-bar" x="104.5" y="28.5" width="109" height="9" rx="3.5" />
        <g className="code">
          <rect x="129" y="44" width="34" height="2.6" rx="1.3" />
          <rect x="135" y="51" width="52" height="2.6" rx="1.3" />
          <rect className="code-hi" x="135" y="58" width="40" height="2.6" rx="1.3" />
          <rect x="135" y="65" width="60" height="2.6" rx="1.3" />
          <rect x="129" y="72" width="22" height="2.6" rx="1.3" />
          <rect x="129" y="83" width="44" height="2.6" rx="1.3" />
          <rect x="135" y="90" width="30" height="2.6" rx="1.3" />
        </g>
        <g className="side-rows">
          <rect x="108" y="43" width="11" height="2" rx="1" />
          <rect x="108" y="49" width="9" height="2" rx="1" />
          <rect x="108" y="55" width="12" height="2" rx="1" />
          <rect x="108" y="61" width="8" height="2" rx="1" />
        </g>

        {/* Claude Code, in the terminal up front */}
        <rect className="win win-term" x="26" y="38" width="102" height="72" rx="4" />
        <circle cx="32" cy="43.5" r="1.5" fill="#ff5f57" />
        <circle cx="37" cy="43.5" r="1.5" fill="#febc2e" />
        <circle cx="42" cy="43.5" r="1.5" fill="#28c840" />
        <g className="term">
          <rect className="t-line t-prompt" style={{ '--n': 0 }} x="32" y="52" width="26" height="3" rx="1.5" />
          <rect className="t-line" style={{ '--n': 1 }} x="32" y="60" width="82" height="3" rx="1.5" />
          <rect className="t-line" style={{ '--n': 2 }} x="32" y="68" width="66" height="3" rx="1.5" />
          <rect className="t-line" style={{ '--n': 3 }} x="32" y="76" width="88" height="3" rx="1.5" />
          <rect className="t-line t-done" style={{ '--n': 4 }} x="32" y="84" width="48" height="3" rx="1.5" />
          <rect className="t-caret" x="32" y="93" width="3.5" height="5" rx="0.6" />
        </g>

        {/* The same three apps, on the Air's own dock */}
        <rect className="scr-dock" x="97" y="127" width="46" height="12.5" rx="4" />
        <rect x="101" y="130" width="7.5" height="7.5" rx="2" fill="#d97757" />
        <rect x="116.25" y="130" width="7.5" height="7.5" rx="2" fill="#0b0b0b" />
        <rect x="131.5" y="130" width="7.5" height="7.5" rx="2" fill="#26241e" />
      </g>

      <rect className="lid-bezel" x="109" y="11" width="22" height="7" rx="2.6" />
      <rect className="base-hinge" x="14" y="148" width="212" height="3" rx="1" />
      <rect x="2" y="150" width="236" height="7.5" rx="3.75" fill="url(#rig-alu)" />
      <rect className="base-scoop" x="101" y="150" width="38" height="2.6" rx="1.3" />

      {/* The link: files leave the Air and land on the Pi */}
      <path className="link-line" d="M238 70 C 292 66 316 88 316 114" />
      <path className="link-packet" pathLength="100" d="M238 70 C 292 66 316 88 316 114" />

      {/* Raspberry Pi in the official case: white lid, raspberry base */}
      <ellipse className="rig-shadow" cx="316" cy="160" rx="38" ry="2.4" />
      <rect className="pi-lid" x="282" y="119" width="68" height="21" rx="5" />
      <rect x="282" y="135" width="68" height="22.5" rx="4.5" fill="#c51a4a" />
      <rect x="282" y="135" width="68" height="1.4" fill="#a3143c" />
      <rect className="pi-port" x="289" y="140.5" width="12" height="12" rx="1.6" />
      <rect x="291" y="143" width="8" height="2.4" rx="0.5" fill="#2f7bea" />
      <rect x="291" y="148" width="8" height="2.4" rx="0.5" fill="#2f7bea" />
      <rect className="pi-port" x="304" y="140.5" width="12" height="12" rx="1.6" />
      <rect className="pi-tongue" x="306" y="143" width="8" height="2.4" rx="0.5" />
      <rect className="pi-tongue" x="306" y="148" width="8" height="2.4" rx="0.5" />
      <rect className="pi-port" x="320" y="139.5" width="16" height="13.5" rx="1.6" />
      <rect className="pi-tongue" x="325" y="149.5" width="6" height="3.5" />
      <g className="pi-logo">
        <ellipse cx="290" cy="124.4" rx="2.3" ry="1.2" fill="#75a928" transform="rotate(-24 290 124.4)" />
        <ellipse cx="294.6" cy="124.4" rx="2.3" ry="1.2" fill="#75a928" transform="rotate(24 294.6 124.4)" />
        <circle cx="290.4" cy="127.6" r="1.35" fill="#c51a4a" />
        <circle cx="294.2" cy="127.6" r="1.35" fill="#c51a4a" />
        <circle cx="292.3" cy="126.8" r="1.35" fill="#c51a4a" />
        <circle cx="291" cy="130.2" r="1.35" fill="#c51a4a" />
        <circle cx="293.6" cy="130.2" r="1.35" fill="#c51a4a" />
        <circle cx="292.3" cy="132.4" r="1.2" fill="#c51a4a" />
      </g>
      <circle className="pi-led-off" cx="341" cy="128" r="1.9" />
      <circle className="pi-led" cx="341" cy="128" r="1.9" />
    </svg>
  )
}

/* ── My setup: About This Mac, plus a Dock of what stays open ─── */
export default function SetupTile({ variants }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const booted = useBooted()
  const pageVisible = usePageVisible()
  const live = booted && inView && pageVisible

  return (
    <motion.article
      ref={ref}
      variants={variants}
      className={`tile tile-setup${live ? ' is-live' : ''}`}
      aria-labelledby="setup-title"
    >
      <h2 id="setup-title" className="tile-head">
        My setup
      </h2>

      <div className="tile-body setup-body">
        <figure className="rig">
          <Rig />
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
          {setup.apps.map((app) => {
            const Mark = MARKS[app.id]
            return (
              <li key={app.id} className="dock-app">
                <span className={`dock-icon dock-icon-${app.id}`} aria-hidden="true">
                  <Mark />
                </span>
                <span className="dock-run" aria-hidden="true" />
                <span className="dock-text">
                  <span className="setup-name">{app.name}</span>
                  <span className="setup-role">{app.role}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.article>
  )
}

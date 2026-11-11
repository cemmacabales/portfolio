import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { stack } from '../data/portfolio'
import './StackTile.css'

/*
 * Tools I reach for, as a kiss-cut sticker sheet. The tile is the backing
 * sheet; every tool is a die-cut sticker on it. Peel one (click, tap, Enter)
 * and the slot it leaves on the backing says where that tool shipped. Tools
 * that shipped in a project are foil, the rest plain vinyl. With a mouse the
 * light follows the cursor; any sticker can be dragged off and stuck down
 * elsewhere (on a phone, after a short hold, so a swipe still scrolls); and
 * the projects along the bottom filter the sheet down to what each one used.
 *
 * Nothing moves on its own. The prerendered tile lays the stickers out in a
 * plain wrap; once the tile is measured, they're packed like a real sheet.
 */

const SHAPE = {
  Python: 'round', PyTorch: 'sq', TensorFlow: 'round', 'scikit-learn': 'pill', OpenCV: 'pill',
  NumPy: 'pill', pandas: 'round', FastAPI: 'pill', Flask: 'pill', TypeScript: 'pill',
  JavaScript: 'sq', React: 'round', 'Next.js': 'pill', 'Node.js': 'pill', PostgreSQL: 'sq',
  Prisma: 'round', Redis: 'sq', Firebase: 'round', Docker: 'sq', Git: 'round',
}
// Black and white marks have no tint in the data; these read as their brands.
const UNTINTED = { Flask: '#3b4a54', 'Next.js': '#161616' }
// Light stickers take dark ink, so the name and mark hold contrast.
const DARK_INK = new Set(['JavaScript', 'Firebase', 'scikit-learn'])
// Short names, for the small print in a sticker's slot.
const SHORT = { 'Kidney CT thesis': 'Thesis', 'Renal CT Detection': 'Renal CT', 'Edge Exercise Coach': 'Edge Coach' }

const TOOLS = stack.map((tool) => {
  const shipped = tool.shipped || []
  return {
    ...tool,
    shipped,
    shape: SHAPE[tool.name] || 'round',
    color: tool.tint || UNTINTED[tool.name] || '#3b4a54',
    label: shipped.length ? `${tool.name}, shipped in ${shipped.join(', ')}` : `${tool.name}, in the toolbox`,
  }
})
const PROJECTS = [...new Set(TOOLS.flatMap((t) => t.shipped))]

// Base sticker sizes (px at scale 1). Pills are as wide as their name.
const ROUND = 100
const SQUARE = 92
const PILL_H = 46
const PILL_EXTRA = 66 // mark, gap, padding and border around a pill's name
const GAP = 10 // clear space between stickers, at scale 1
const HEAD = 54 // space for the title above the sheet's stickers
const FOOT = 64 // space for the project chips below them
const HOLD = 260 // ms a finger rests on a sticker before it can be dragged

const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Packs the stickers like a real kiss-cut sheet: in a shuffled (but fixed)
// order, each drops to the highest spot where its rotated box clears the rest.
function pack(width, height, s, pillWidths) {
  const r = rng(29)
  const items = TOOLS.map((t, i) => {
    const w = t.shape === 'round' ? ROUND * s : t.shape === 'sq' ? SQUARE * s : (pillWidths[i] + PILL_EXTRA) * s
    const h = t.shape === 'pill' ? PILL_H * s : w
    const rot = (r() - 0.5) * (t.shape === 'pill' ? 16 : 20)
    const a = (Math.abs(rot) * Math.PI) / 180
    return { i, w, h, rot, bw: w * Math.cos(a) + h * Math.sin(a), bh: w * Math.sin(a) + h * Math.cos(a), k: r() }
  }).sort((a, b) => a.k - b.k)

  const m = GAP * s
  const placed = []
  const clear = (x, y, it) =>
    placed.every((p) => Math.abs(p.x - x) * 2 >= p.bw + it.bw + m * 2 || Math.abs(p.y - y) * 2 >= p.bh + it.bh + m * 2)

  for (const it of items) {
    if (it.bw > width) return null
    let best = null
    for (let x = it.bw / 2; x <= width - it.bw / 2; x += 5) {
      // The highest clear spot is the top, or just below a sticker in this column.
      const ys = [it.bh / 2, ...placed.filter((p) => Math.abs(p.x - x) * 2 < p.bw + it.bw + m * 2).map((p) => p.y + (p.bh + it.bh) / 2 + m + 0.01)].sort((a, b) => a - b)
      const y = ys.find((cy) => clear(x, cy, it))
      if (y === undefined) continue
      const score = y + Math.abs(x - width / 2) * 0.02 + r() * 6
      if (!best || score < best.score) best = { x, y, score }
    }
    if (!best) return null
    placed.push({ ...it, x: best.x, y: best.y })
  }

  const top = Math.min(...placed.map((p) => p.y - p.bh / 2))
  const bottom = Math.max(...placed.map((p) => p.y + p.bh / 2))
  if (bottom - top > height) return null
  const left = Math.min(...placed.map((p) => p.x - p.bw / 2))
  const right = Math.max(...placed.map((p) => p.x + p.bw / 2))
  const ox = (width - (right - left)) / 2 - left
  const oy = (height - (bottom - top)) / 2 - top
  const out = []
  placed.forEach((p) => {
    out[p.i] = { x: p.x + ox, y: p.y + oy, w: p.w, h: p.h, r: p.rot }
  })
  return out
}

// The largest scale whose packing fits the sheet.
function layOut(width, height, pillWidths) {
  let lo = 0.4
  let hi = 1.5
  let best = pack(width, height, lo, pillWidths)
  let bestS = lo
  for (let n = 0; n < 9; n++) {
    const mid = (lo + hi) / 2
    const items = pack(width, height, mid, pillWidths)
    if (items) {
      best = items
      bestS = mid
      lo = mid
    } else hi = mid
  }
  return best && { s: bestS, items: best, width, height }
}

export default function StackTile({ variants }) {
  const tileRef = useRef(null)
  const areaRef = useRef(null)
  const stickerRefs = useRef([])
  const drag = useRef(null)
  const light = useRef({ raf: 0, x: 0, y: 0 })
  const reduce = useReducedMotion()

  const [layout, setLayout] = useState(null)
  const [peeled, setPeeled] = useState(-1)
  const [lift, setLift] = useState({ x: 0, y: 0 })
  const [moved, setMoved] = useState({})
  const [filter, setFilter] = useState(null)
  const [hover, setHover] = useState(-1)
  const [slap, setSlap] = useState({})

  /* ── Packing: measured on the client, redone when the sheet resizes ── */
  useEffect(() => {
    const area = areaRef.current
    let pillWidths = null
    let last = ''
    const run = () => {
      const width = area.clientWidth
      const height = area.clientHeight
      const key = `${width}x${height}`
      if (!width || !height || key === last) return
      last = key
      if (!pillWidths) {
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.font = `750 16px ${getComputedStyle(area).fontFamily}`
        pillWidths = TOOLS.map((t) => (t.shape === 'pill' ? ctx.measureText(t.name).width : 0))
      }
      const next = layOut(width, height, pillWidths)
      if (!next) return
      setLayout(next)
      setPeeled(-1)
      setMoved({})
    }
    // The observer reports after layout and before paint, so pack right there.
    const observer = new ResizeObserver(run)
    observer.observe(area)
    let alive = true
    // Pill widths need the real font; measure again once it's in.
    document.fonts?.ready.then(() => {
      if (!alive) return
      pillWidths = null
      last = ''
      run()
    })
    return () => {
      alive = false
      observer.disconnect()
    }
  }, [])

  // A finger held on a sticker to drag it must not scroll the page. React's
  // touch handlers are passive, so this one is added by hand.
  useEffect(() => {
    const area = areaRef.current
    const stop = (event) => {
      if (drag.current?.dragging) event.preventDefault()
    }
    area.addEventListener('touchmove', stop, { passive: false })
    return () => area.removeEventListener('touchmove', stop)
  }, [])

  /* ── Peel and re-stick ─────────────────────────────────────── */
  const bump = (i) => setSlap((s) => ({ ...s, [i]: (s[i] || 0) + 1 }))

  const unpeel = () => {
    if (peeled < 0) return
    bump(peeled)
    setPeeled(-1)
  }

  const peel = (i) => {
    if (!layout) return
    const it = layout.items[i]
    const { width, height } = layout
    // Lift it toward whichever side has room, so its slot shows and it stays on the sheet.
    const fits = ([cx, cy]) => {
      const nx = it.x + cx * it.w
      const ny = it.y + cy * it.h
      return nx - it.w * 0.58 > -12 && nx + it.w * 0.58 < width + 12 && ny - it.h * 0.58 > -10 && ny + it.h * 0.58 < height + 10
    }
    const dir = [[0.58, -0.92], [-0.58, -0.92], [0.58, 0.92], [-0.58, 0.92], [1.05, 0], [-1.05, 0], [0.42, -0.7], [-0.42, 0.7]].find(fits) || [0, -0.6]
    setLift({ x: dir[0] * it.w, y: dir[1] * it.h })
    if (peeled >= 0 && peeled !== i) bump(peeled)
    setPeeled(i)
  }

  const goHome = (i) => {
    setMoved(({ [i]: _gone, ...rest }) => rest) // eslint-disable-line no-unused-vars
    bump(i)
  }

  const resetAll = () => {
    Object.keys(moved).forEach((i) => bump(+i))
    setMoved({})
  }

  const toggle = (i) => {
    if (moved[i]) return goHome(i)
    if (peeled === i) return unpeel()
    return peel(i)
  }

  /* ── Drag ──────────────────────────────────────────────────── */
  const startDrag = (i, el) => {
    const d = drag.current
    d.dragging = true
    // A peeled sticker is picked up from where it's held.
    if (peeled === i) {
      d.dx0 += lift.x
      d.dy0 += lift.y
      setPeeled(-1)
    }
    el.classList.add('is-dragging')
    try {
      el.setPointerCapture(d.id)
    } catch {
      // The pointer already left; the drag ends on the next up.
    }
  }

  // A dragged sticker's center stays on the sheet.
  const keepOnSheet = (i, dx, dy) => {
    const it = layout.items[i]
    const pad = Math.min(it.w, it.h) * 0.3
    return {
      dx: Math.min(Math.max(it.x + dx, pad), layout.width - pad) - it.x,
      dy: Math.min(Math.max(it.y + dy, pad - 20), layout.height + 20 - pad) - it.y,
    }
  }

  const onDown = (event, i) => {
    if (event.button || !layout) return
    const el = event.currentTarget
    const start = moved[i] || { dx: 0, dy: 0 }
    drag.current = { i, x: event.clientX, y: event.clientY, dx0: start.dx, dy0: start.dy, dragging: false, touch: event.pointerType !== 'mouse', id: event.pointerId }
    if (drag.current.touch) {
      drag.current.timer = setTimeout(() => drag.current?.i === i && startDrag(i, el), HOLD)
    } else {
      try {
        el.setPointerCapture(event.pointerId)
      } catch {
        // No live pointer (a synthetic event); the drag still works without capture.
      }
    }
  }

  const onMove = (event, i) => {
    const d = drag.current
    if (!d || d.i !== i) return
    const mx = event.clientX - d.x
    const my = event.clientY - d.y
    if (!d.dragging) {
      if (Math.hypot(mx, my) < 5) return
      // A finger that moves before the hold is a scroll, not a drag.
      if (d.touch) {
        clearTimeout(d.timer)
        drag.current = null
        return
      }
      startDrag(i, event.currentTarget)
    }
    const el = event.currentTarget
    const { dx, dy } = keepOnSheet(i, d.dx0 + mx, d.dy0 + my)
    el.style.setProperty('--dx', `${dx}px`)
    el.style.setProperty('--dy', `${dy}px`)
  }

  const onUp = (event, i) => {
    const d = drag.current
    if (!d || d.i !== i) return
    clearTimeout(d.timer)
    drag.current = null
    const el = event.currentTarget
    if (!d.dragging) return toggle(i)
    el.classList.remove('is-dragging')
    const { dx, dy } = keepOnSheet(i, d.dx0 + event.clientX - d.x, d.dy0 + event.clientY - d.y)
    // Dropped near its own slot, it snaps home.
    if (Math.hypot(dx, dy) < 28) {
      el.style.setProperty('--dx', '0px')
      el.style.setProperty('--dy', '0px')
      return goHome(i)
    }
    setMoved((m) => ({ ...m, [i]: { dx, dy } }))
    bump(i)
  }

  const onCancel = (event) => {
    const d = drag.current
    if (!d) return
    clearTimeout(d.timer)
    drag.current = null
    event.currentTarget.classList.remove('is-dragging')
  }

  // Keyboard: Enter and Space arrive as a click with no pointer behind them.
  const onClick = (event, i) => {
    if (event.detail === 0) toggle(i)
  }

  /* ── Light follows the cursor (a mouse only, one frame per move) ── */
  const paintLight = () => {
    const L = light.current
    L.raf = 0
    const tile = tileRef.current
    const area = areaRef.current
    if (!tile || !area || !layout) return
    const tb = tile.getBoundingClientRect()
    const ab = area.getBoundingClientRect()
    tile.style.setProperty('--lx', `${(((L.x - tb.left) / tb.width) * 100).toFixed(1)}%`)
    tile.style.setProperty('--ly', `${(((L.y - tb.top) / tb.height) * 100).toFixed(1)}%`)
    const px = L.x - ab.left
    const py = L.y - ab.top
    layout.items.forEach((it, i) => {
      const el = stickerRefs.current[i]
      if (!el) return
      const off = moved[i] || { dx: 0, dy: 0 }
      const cx = it.x + off.dx
      const cy = it.y + off.dy
      const dx = cx - px
      const dy = cy - py
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 260)
      el.style.setProperty('--sx', `${((dx / d) * 5 * k).toFixed(1)}px`)
      el.style.setProperty('--sy', `${((dy / d) * 5 * k + 1).toFixed(1)}px`)
      el.style.setProperty('--gx', `${(((px - cx) / it.w) * 100 + 50).toFixed(0)}%`)
      el.style.setProperty('--gy', `${(((py - cy) / it.h) * 100 + 50).toFixed(0)}%`)
      if (TOOLS[i].shipped.length && !reduce) {
        el.style.setProperty('--hx', `${(50 - (dx / ab.width) * 160).toFixed(0)}%`)
        el.style.setProperty('--hy', `${(50 - (dy / ab.height) * 160).toFixed(0)}%`)
      }
    })
  }
  const onTilePointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const L = light.current
    L.x = event.clientX
    L.y = event.clientY
    if (!L.raf) L.raf = requestAnimationFrame(paintLight)
  }
  useEffect(() => () => cancelAnimationFrame(light.current.raf), [])

  // A click on the bare sheet, or Escape, sticks a peeled sticker back down.
  const onTilePointerDown = (event) => {
    if (!event.target.closest('.sticker, .sheet-chips, .sheet-reset')) unpeel()
  }
  const onTileKeyDown = (event) => {
    if (event.key === 'Escape' && peeled >= 0) unpeel()
  }

  /* ── What the header says ─────────────────────────────────── */
  const focus = peeled >= 0 ? peeled : hover
  const tool = TOOLS[focus]
  const anyMoved = Object.keys(moved).length > 0
  const s = layout?.s ?? 1

  let caption
  if (tool) {
    caption = (
      <>
        <b>{tool.name}</b> · {tool.shipped.length ? tool.shipped.join(', ') : 'in the toolbox'}
      </>
    )
  } else if (filter) {
    caption = (
      <>
        <b>{filter}</b> · {TOOLS.filter((t) => t.shipped.includes(filter)).map((t) => t.name).join(', ')}
      </>
    )
  } else {
    caption = (
      <>
        <span className="sheet-hint-mouse">Peel a sticker to see where it shipped</span>
        <span className="sheet-hint-touch">Tap a sticker to peel it. Hold one to move it</span>
      </>
    )
  }

  return (
    <motion.article
      ref={tileRef}
      variants={variants}
      className={`tile tile-stack${layout ? ' is-packed' : ''}${filter ? ' is-filtering' : ''}`}
      onPointerMove={onTilePointerMove}
      onPointerDown={onTilePointerDown}
      onKeyDown={onTileKeyDown}
    >
      <i className="sheet-crop is-tl" aria-hidden="true" />
      <i className="sheet-crop is-tr" aria-hidden="true" />
      <i className="sheet-crop is-bl" aria-hidden="true" />
      <i className="sheet-crop is-br" aria-hidden="true" />

      <header className="sheet-head">
        <h3 id="stack-title" className="sheet-title">
          Tools I reach for
        </h3>
        <p className="sheet-cap" aria-hidden="true">
          {caption}
        </p>
      </header>

      <button type="button" className={`sheet-reset${anyMoved ? ' is-on' : ''}`} onClick={resetAll} tabIndex={anyMoved ? 0 : -1}>
        Put them all back
      </button>

      <ul ref={areaRef} className="sheet-area" style={{ '--head': `${HEAD}px`, '--foot': `${FOOT}px` }} aria-labelledby="stack-title">
        {TOOLS.map((t, i) => {
          const it = layout?.items[i]
          const pos = it
            ? { '--x': `${it.x.toFixed(1)}px`, '--y': `${it.y.toFixed(1)}px`, '--w': `${it.w.toFixed(1)}px`, '--h': `${it.h.toFixed(1)}px`, '--r': `${it.r.toFixed(1)}deg` }
            : { '--r': `${((i * 37) % 13) - 6}deg` }
          const off = moved[i] || { dx: 0, dy: 0 }
          const isPeeled = peeled === i
          const match = filter && t.shipped.includes(filter)
          return (
            <li key={t.name} className="sheet-item">
              {it && (
                <span className={`sheet-slot is-${t.shape}`} style={{ ...pos, '--s': s }} aria-hidden="true">
                  {t.shape === 'pill' ? (
                    <i>{t.shipped.length ? t.shipped.map((p) => SHORT[p] || p).join(' · ') : 'In the toolbox'}</i>
                  ) : (
                    <>
                      <b>{t.name}</b>
                      {t.shipped.length ? t.shipped.map((p) => <i key={p}>{SHORT[p] || p}</i>) : <i>Toolbox</i>}
                    </>
                  )}
                </span>
              )}
              <button
                ref={(el) => {
                  stickerRefs.current[i] = el
                }}
                type="button"
                className={[
                  'sticker',
                  `is-${t.shape}`,
                  t.shipped.length ? 'is-foil' : '',
                  DARK_INK.has(t.name) ? 'is-dark-ink' : '',
                  isPeeled ? 'is-peeled' : '',
                  moved[i] ? 'is-moved' : '',
                  match ? 'is-match' : '',
                  slap[i] ? `is-slap-${slap[i] % 2}` : '',
                ].filter(Boolean).join(' ')}
                style={{
                  ...pos,
                  '--s': s,
                  '--c': t.color,
                  '--src': `url("${t.icon}")`,
                  '--dx': `${off.dx}px`,
                  '--dy': `${off.dy}px`,
                  '--lift-x': isPeeled ? `${lift.x}px` : '0px',
                  '--lift-y': isPeeled ? `${lift.y}px` : '0px',
                }}
                aria-label={t.label}
                aria-pressed={isPeeled}
                onPointerDown={(event) => onDown(event, i)}
                onPointerMove={(event) => onMove(event, i)}
                onPointerUp={(event) => onUp(event, i)}
                onPointerCancel={onCancel}
                onClick={(event) => onClick(event, i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(-1)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(-1)}
                onContextMenu={(event) => event.preventDefault()}
              >
                <span className="sticker-face">
                  <span className="sticker-mark" />
                  {t.shape === 'pill' && <span className="sticker-name">{t.name}</span>}
                  <span className="sticker-foil" />
                  <span className="sticker-glare" />
                </span>
                <span className="sticker-curl" />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="sheet-chips" role="group" aria-label="Show the tools a project used">
        {PROJECTS.map((p) => (
          <button
            key={p}
            type="button"
            className={tool?.shipped.includes(p) ? 'is-lit' : undefined}
            aria-pressed={filter === p}
            onClick={() => setFilter((f) => (f === p ? null : p))}
          >
            {p}
          </button>
        ))}
      </div>

      <span className="sheet-micro" aria-hidden="true">
        Kiss-cut · sheet 1 of 1
      </span>
    </motion.article>
  )
}

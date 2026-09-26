import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import './PetYard.css'

/*
 * The QA team: three pixel pets that live under the shipped list.
 *
 * Sprites are string grids, one character per pixel. A single rAF loop
 * moves the pets by writing transforms and data attributes straight to
 * the DOM, so React renders the yard once and never per frame.
 */

const PX = 3 // screen pixels per sprite pixel
const GROUND = 18 // px from the bottom of the field to the pets' feet
const GRAVITY = 700
const HOP_V = 200
const EDGE = 6
const MAX_TREATS = 6
const BUBBLE_S = 2.2 // keep in step with the pet-say animation

// Sprite character → CSS class. Classes map to theme tokens, so the pets
// are dark on the light theme and light on the dark one.
const FILL = { '#': 'px-i', k: 'px-k', w: 'px-w', o: 'px-o', g: 'px-g' }

const swap = (rows, from, to) => rows.map((row) => row.replaceAll(from, to))

/* ── Sprites (all face right) ─────────────────────────────────── */
const CAT_HEAD = ['...........#..#.', '...........####.', '..........######']
const CAT_BODY = ['..###########...', '..############..', '..############..']
const CAT_WALK = [
  ...CAT_HEAD,
  '#.........#w##w#',
  '#.........######',
  '.#.........####.',
  ...CAT_BODY,
]
const CAT_STAND = [
  '#..........#..#.',
  '#..........####.',
  '.#........######',
  '.#........#w##w#',
  '..#.......######',
  '..#........####.',
  ...CAT_BODY,
  '..#..#....#..#..',
  '..#..#....#..#..',
]

const DOG_HEAD = [
  '..........###...',
  '.........#####..',
  '........kk#w####',
  '#.......kk######',
  '#.......kk###o..',
  '.#.......####...',
]
const DOG_BODY = ['.#############..', '..############..', '..###kk#######..']
const DOG_STAND = [...DOG_HEAD, ...DOG_BODY, '..#..#.....#..#.', '..#..#.....#..#.']

const BOT_TOP = [
  '.....###.....',
  '.....#o#.....',
  '......#......',
  '..#########..',
  '..#wwwwwww#..',
]
const BOT_LOWER = [
  '..#wwwwwww#..',
  '..#########..',
  '...#######...',
  '.###########.',
  '.#.#######.#.',
]
const BOT_STAND = [...BOT_TOP, '..#www#w#w#..', ...BOT_LOWER, '...##...##...', '...##...##...']

const SPRITES = {
  cat: {
    w: 16,
    h: 11,
    frames: {
      idle: CAT_STAND,
      blink: swap(CAT_STAND, 'w', 'k'),
      walk1: [...CAT_WALK, '..#..#....#..#..', '.#....#..#....#.'],
      walk2: [...CAT_WALK, '...#.#....#.#...', '...##......##...'],
      sleep: [
        '................',
        '................',
        '................',
        '................',
        '...........#..#.',
        '.....####.######',
        '...########k##k#',
        '..##############',
        '..##############',
        '#.##############',
        '.##############.',
      ],
    },
  },
  dog: {
    w: 16,
    h: 11,
    frames: {
      idle: DOG_STAND,
      blink: swap(DOG_STAND, 'w', '#'),
      walk1: [...DOG_HEAD, ...DOG_BODY, '..#..#.....#..#.', '.#....#...#....#'],
      walk2: [...DOG_HEAD, ...DOG_BODY, '...#.#.....#.#..', '...##.......##..'],
      sit: [
        '..........###...',
        '.........#####..',
        '........kk#w####',
        '........kk######',
        '........kk###o..',
        '.........####...',
        '........#####...',
        '......#######...',
        '.....#########..',
        '.#..#####.#..#..',
        '..#######.##.##.',
      ],
    },
  },
  bot: {
    w: 13,
    h: 13,
    frames: {
      idle: BOT_STAND,
      blink: [...BOT_TOP, '..#wwwwwww#..', ...BOT_LOWER, '...##...##...', '...##...##...'],
      scan: [...BOT_TOP, '..#w#w#www#..', ...BOT_LOWER, '...##...##...', '...##...##...'],
      walk1: [...BOT_TOP, '..#www#w#w#..', ...BOT_LOWER, '..##.....##..', '..##.....##..'],
      walk2: [...BOT_TOP, '..#www#w#w#..', ...BOT_LOWER, '....##.##....', '....##.##....'],
    },
  },
}

const HEART = ['.##.##.', '#oo#oo#', '#ooooo#', '.#ooo#.', '..#o#..', '...#...']
const BONE = ['.##.....##.', '#oo#####oo#', '.#ooooooo#.', '#oo#####oo#', '.##.....##.']
const TUFT = ['..g..', 'g.g.g', '.ggg.']
const TREAT_W = BONE[0].length * PX
const TREAT_H = BONE.length * PX

// Merge each row's runs of one character into a single rect.
function toRects(rows) {
  const rects = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const c = row[x]
      let end = x + 1
      while (row[end] === c) end += 1
      if (FILL[c]) rects.push({ x, y, w: end - x, c: FILL[c] })
      x = end
    }
  })
  return rects
}

for (const [name, sprite] of Object.entries(SPRITES)) {
  sprite.rects = {}
  for (const [frame, rows] of Object.entries(sprite.frames)) {
    if (import.meta.env.DEV && rows.some((row) => row.length !== sprite.w)) {
      console.warn(`PetYard: ${name}.${frame} has a row that isn't ${sprite.w} wide`)
    }
    sprite.rects[frame] = toRects(rows)
  }
}

const PETS = [
  {
    id: 'dog',
    name: 'Biscuit',
    kind: 'dog',
    start: 0.2,
    walk: 70,
    run: 200,
    stride: 0.13,
    runStride: 0.07,
    lines: ['Woof! Tests pass!', 'Found a bug! Can I keep it?', 'Deploy? DEPLOY!', 'Good build!'],
  },
  {
    id: 'cat',
    name: 'Mochi',
    kind: 'cat',
    start: 0.55,
    walk: 32,
    run: 140,
    stride: 0.2,
    runStride: 0.09,
    lines: ['LGTM.', 'mrrp. ship it.', 'I sat on the keyboard. Fixed it.'],
  },
  {
    id: 'bot',
    name: 'Unit',
    kind: 'robot',
    start: 0.84,
    walk: 40,
    run: 115,
    stride: 0.2,
    runStride: 0.1,
    lines: ['Beep. 0 bugs found.', 'Coverage: 100%. Probably.', 'Running inference…', 'Hello, human.'],
  },
]

const SLEEPY_LINE = 'Mrrp. I was compiling.'

function Sprite({ species }) {
  const { w, h, rects } = SPRITES[species]
  return (
    <svg
      className="pet-sprite"
      width={w * PX}
      height={h * PX}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {Object.entries(rects).map(([frame, list]) => (
        <g key={frame} className={`f f-${frame}`}>
          {list.map((r) => (
            <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" className={r.c} />
          ))}
        </g>
      ))}
    </svg>
  )
}

function PixelArt({ rows, scale = PX, className }) {
  const w = rows[0].length
  const h = rows.length
  return (
    <svg
      className={className}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {toRects(rows).map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1" className={r.c} />
      ))}
    </svg>
  )
}

// Replay a CSS animation from the start.
function restart(el) {
  el.classList.remove('is-on')
  void el.offsetWidth
  el.classList.add('is-on')
}

export default function PetYard() {
  const reduce = useReducedMotion()
  const fieldRef = useRef(null)
  const liveRef = useRef(null)
  const petEls = useRef({})
  const treatEls = useRef([])
  const api = useRef(null)

  useEffect(() => {
    const field = fieldRef.current
    const live = liveRef.current
    if (!field) return undefined

    let W = field.clientWidth
    let H = field.clientHeight
    let fieldLeft = 0
    let pointer = null
    let raf = 0
    let last = 0
    let running = false

    const rand = (a, b) => a + Math.random() * (b - a)
    const maxX = (w) => Math.max(EDGE, W - w - EDGE)
    const clampX = (x, w) => Math.min(maxX(w), Math.max(EDGE, x))
    const center = (p) => p.x + p.w / 2

    const pets = PETS.map((cfg) => {
      const el = petEls.current[cfg.id]
      const w = SPRITES[cfg.id].w * PX
      const asleep = reduce && cfg.id === 'cat'
      return {
        ...cfg,
        el,
        bubble: el.querySelector('.pet-bubble'),
        heart: el.querySelector('.pet-heart'),
        w,
        x: clampX(W * cfg.start - w / 2, w),
        y: 0,
        vy: 0,
        dir: cfg.id === 'bot' ? -1 : 1,
        mode: asleep ? 'sleep' : 'idle',
        timer: asleep ? Infinity : rand(0.3, 1.4),
        target: 0,
        treat: null,
        moving: false,
        sitting: false,
        legT: 0,
        leg: 0,
        blinkT: 0,
        flipped: false,
        line: 0,
        bubbleT: 0,
        bubbleW: 0,
        shown: {},
      }
    })
    const byId = Object.fromEntries(pets.map((p) => [p.id, p]))
    const treats = treatEls.current.map((el) => ({
      el,
      on: false,
      x: 0,
      y: 0,
      vy: 0,
      bounced: false,
      landed: false,
      born: 0,
    }))

    const announce = (text) => {
      live.textContent = text
    }

    function anchor(p) {
      const c = center(p)
      const half = p.bubbleW / 2
      const side = c - half < 4 ? 'l' : c + half > W - 4 ? 'r' : 'c'
      if (side !== p.shown.anchor) p.el.dataset.anchor = p.shown.anchor = side
    }

    // One speaker at a time, so bubbles never stack on top of each other.
    function say(p, text) {
      for (const q of pets) {
        if (q !== p && q.bubbleT > 0) {
          q.bubble.classList.remove('is-on')
          q.bubbleT = 0
        }
      }
      p.bubble.textContent = text
      p.bubbleW = p.bubble.offsetWidth
      p.bubbleT = BUBBLE_S
      anchor(p)
      restart(p.bubble)
    }

    function rest(p, a = 1, b = 2.6) {
      p.mode = 'idle'
      p.timer = rand(a, b)
      p.treat = null
    }

    function decide(p) {
      const r = Math.random()
      if (p.id === 'cat' && r < 0.3) {
        p.mode = 'sleep'
        p.timer = rand(6, 10)
        return
      }
      if (p.id === 'bot' && r < 0.3) {
        p.mode = 'scan'
        p.timer = 1.6
        p.flipped = false
        return
      }
      let t = rand(EDGE, maxX(p.w))
      if (Math.abs(t - p.x) < 50) t = p.x < W / 2 ? p.x + rand(60, 160) : p.x - rand(60, 160)
      p.mode = 'walk'
      p.target = clampX(t, p.w)
    }

    function nearest(p, within = Infinity) {
      let best = null
      let bestD = within
      for (const t of treats) {
        if (!t.on) continue
        const d = Math.abs(t.x + TREAT_W / 2 - center(p))
        if (d < bestD) {
          best = t
          bestD = d
        }
      }
      return best
    }

    function retarget(p) {
      const t = nearest(p)
      if (t) {
        p.mode = 'chase'
        p.treat = t
      } else {
        rest(p)
      }
    }

    // Send every pet that's awake (or asleep but close) after its nearest treat.
    function assign() {
      for (const p of pets) {
        if (p.mode === 'eat') continue
        const t = nearest(p, p.mode === 'sleep' ? 90 : Infinity)
        if (t) {
          p.mode = 'chase'
          p.treat = t
        }
      }
    }

    function eat(p, t) {
      t.on = false
      t.el.removeAttribute('data-on')
      p.mode = 'eat'
      p.timer = 0.6
      p.treat = null
      restart(p.heart)
      say(p, 'Nom!')
      announce(`${p.name} got the treat.`)
      for (const q of pets) {
        if (q !== p && q.mode === 'chase' && q.treat === t) retarget(q)
      }
    }

    function step(p, target, speed, stride, dt) {
      const dx = target - p.x
      if (Math.abs(dx) < 1) {
        p.x = target
        return true
      }
      p.dir = dx > 0 ? 1 : -1
      p.x += p.dir * Math.min(Math.abs(dx), speed * dt)
      p.moving = true
      p.legT += dt
      if (p.legT >= stride) {
        p.legT = 0
        p.leg ^= 1
      }
      return false
    }

    function update(p, dt) {
      p.moving = false
      p.sitting = false
      if (p.blinkT > 0) p.blinkT -= dt
      if (p.bubbleT > 0) p.bubbleT -= dt
      if (p.y > 0 || p.vy > 0) {
        p.vy -= GRAVITY * dt
        p.y = Math.max(0, p.y + p.vy * dt)
        if (p.y === 0) p.vy = 0
      }

      switch (p.mode) {
        case 'idle':
        case 'walk':
          if (p.id === 'dog' && pointer !== null) {
            p.mode = 'follow'
            break
          }
          if (p.mode === 'walk') {
            if (step(p, p.target, p.walk, p.stride, dt)) rest(p)
            break
          }
          if (Math.random() < dt * 0.4) p.blinkT = 0.14
          p.timer -= dt
          if (p.timer <= 0) decide(p)
          break
        case 'follow': {
          if (pointer === null) {
            rest(p, 0.4, 1.2)
            break
          }
          const target = clampX(pointer - p.w / 2, p.w)
          if (Math.abs(target - p.x) > 22) {
            step(p, target, p.run * 0.7, p.runStride, dt)
          } else {
            p.sitting = true
            p.dir = pointer >= center(p) ? 1 : -1
          }
          break
        }
        case 'chase': {
          const t = p.treat
          if (!t || !t.on) {
            retarget(p)
            break
          }
          if (step(p, clampX(t.x + TREAT_W / 2 - p.w / 2, p.w), p.run, p.runStride, dt)) {
            p.dir = t.x + TREAT_W / 2 >= center(p) ? 1 : -1
            if (t.landed || t.y < 3) eat(p, t)
          }
          break
        }
        case 'eat':
          p.timer -= dt
          if (p.timer <= 0) retarget(p)
          break
        case 'sleep':
          p.timer -= dt
          if (p.timer <= 0) rest(p, 0.8, 2)
          break
        case 'scan':
          p.timer -= dt
          if (p.timer <= 0.8 && !p.flipped) {
            p.dir *= -1
            p.flipped = true
          }
          if (p.timer <= 0) rest(p)
          break
        default:
          break
      }
    }

    function updateTreats(dt) {
      for (const t of treats) {
        if (!t.on || t.landed) continue
        t.vy -= GRAVITY * dt
        t.y += t.vy * dt
        if (t.y <= 0) {
          t.y = 0
          if (!t.bounced && t.vy < -60) {
            t.vy = -t.vy * 0.35
            t.bounced = true
          } else {
            t.vy = 0
            t.landed = true
          }
        }
      }
    }

    function frameOf(p) {
      if (p.y > 0) return 'walk2'
      if (p.mode === 'sleep') return 'sleep'
      if (p.moving) return p.leg ? 'walk2' : 'walk1'
      if (p.mode === 'scan') return Math.floor(p.timer / 0.35) % 2 ? 'scan' : 'idle'
      if (p.sitting) return 'sit'
      if (p.blinkT > 0) return 'blink'
      return 'idle'
    }

    function render() {
      for (const p of pets) {
        const frame = frameOf(p)
        if (frame !== p.shown.frame) p.el.dataset.frame = p.shown.frame = frame
        const dir = p.dir < 0 ? 'l' : 'r'
        if (dir !== p.shown.dir) p.el.dataset.dir = p.shown.dir = dir
        if (p.mode !== p.shown.mode) p.el.dataset.mode = p.shown.mode = p.mode
        if (p.bubbleT > 0) anchor(p)
        p.el.style.transform = `translate3d(${Math.round(p.x)}px, ${-Math.round(p.y)}px, 0)`
      }
      for (const t of treats) {
        if (t.on) t.el.style.transform = `translate3d(${Math.round(t.x)}px, ${-Math.round(t.y)}px, 0)`
      }
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      for (const p of pets) update(p, dt)
      updateTreats(dt)
      render()
      raf = requestAnimationFrame(tick)
    }

    function start() {
      if (running || reduce) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    function drop(x, y) {
      let t = treats.find((s) => !s.on)
      if (!t) t = treats.reduce((a, b) => (a.born <= b.born ? a : b))
      Object.assign(t, {
        on: true,
        x: Math.min(W - TREAT_W, Math.max(0, x - TREAT_W / 2)),
        y: Math.min(H - GROUND - TREAT_H, Math.max(0, y)),
        vy: 0,
        bounced: false,
        landed: false,
        born: performance.now(),
      })
      t.el.dataset.on = ''
      assign()
      render()
    }

    function poke(p) {
      if (p.mode === 'sleep') {
        say(p, SLEEPY_LINE)
        announce(`${p.name}: ${SLEEPY_LINE}`)
        return
      }
      if (!reduce) {
        if (p.y === 0) p.vy = HOP_V
        restart(p.heart)
      }
      const line = p.lines[p.line % p.lines.length]
      p.line += 1
      say(p, line)
      announce(`${p.name}: ${line}`)
    }

    function onClick(e) {
      const petEl = e.target.closest('.pet')
      if (petEl) {
        poke(byId[petEl.dataset.pet])
        return
      }
      if (reduce) return
      const rect = field.getBoundingClientRect()
      drop(e.clientX - rect.left, rect.bottom - GROUND - e.clientY - TREAT_H / 2)
    }

    function onEnter() {
      fieldLeft = field.getBoundingClientRect().left
    }

    function onMove(e) {
      if (e.pointerType === 'mouse') pointer = e.clientX - fieldLeft
    }

    function onLeave() {
      pointer = null
    }

    const ro = new ResizeObserver(() => {
      W = field.clientWidth
      H = field.clientHeight
      fieldLeft = field.getBoundingClientRect().left
      for (const p of pets) {
        p.x = clampX(p.x, p.w)
        p.target = clampX(p.target, p.w)
      }
      for (const t of treats) t.x = Math.min(W - TREAT_W, Math.max(0, t.x))
      render()
    })
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))

    render()
    ro.observe(field)
    io.observe(field)
    field.addEventListener('click', onClick)
    if (!reduce) {
      field.addEventListener('pointerenter', onEnter)
      field.addEventListener('pointermove', onMove)
      field.addEventListener('pointerleave', onLeave)
    }
    api.current = { toss: () => drop(rand(TREAT_W, W - TREAT_W), H) }

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      field.removeEventListener('click', onClick)
      field.removeEventListener('pointerenter', onEnter)
      field.removeEventListener('pointermove', onMove)
      field.removeEventListener('pointerleave', onLeave)
      api.current = null
    }
  }, [reduce])

  return (
    <div className="pet-yard">
      <div className="yard-head">
        <p className="yard-label">
          QA team
          <span className="yard-hint">
            <span className="hint-fine">Click</span>
            <span className="hint-touch">Tap</span> a pet to say hi
          </span>
        </p>
        {!reduce && (
          <button type="button" className="yard-toss" onClick={() => api.current?.toss()}>
            <PixelArt rows={BONE} scale={2} className="yard-toss-icon" />
            Toss a treat
          </button>
        )}
      </div>

      <div ref={fieldRef} className="yard-field">
        <span className="yard-ground" aria-hidden="true" />
        {[7, 33, 64, 91].map((left) => (
          <span key={left} className="yard-tuft" style={{ left: `${left}%` }} aria-hidden="true">
            <PixelArt rows={TUFT} scale={2} />
          </span>
        ))}
        {Array.from({ length: MAX_TREATS }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              treatEls.current[i] = el
            }}
            className="treat"
            aria-hidden="true"
          >
            <PixelArt rows={BONE} />
          </span>
        ))}
        {PETS.map((pet) => (
          <button
            key={pet.id}
            ref={(el) => {
              petEls.current[pet.id] = el
            }}
            type="button"
            className={`pet pet-${pet.id}`}
            data-pet={pet.id}
            data-frame="idle"
            data-anchor="c"
            aria-label={`Say hi to ${pet.name} the ${pet.kind}`}
            style={{ '--pw': `${SPRITES[pet.id].w * PX}px` }}
          >
            <span className="pet-bubble" aria-hidden="true" />
            {pet.id === 'cat' && (
              <span className="pet-z" aria-hidden="true">
                <i>z</i>
                <i>z</i>
                <i>z</i>
              </span>
            )}
            <span className="pet-body">
              <PixelArt rows={HEART} className="pet-heart" />
              <Sprite species={pet.id} />
            </span>
          </button>
        ))}
      </div>

      <p ref={liveRef} className="visually-hidden" aria-live="polite" />
    </div>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import './Segmented.css'

/*
 * An iOS segmented control. The thumb is one element that glides to the
 * picked segment instead of remounting under it, so it stays put inside
 * things that move themselves (the My setup sheet drags).
 */
export default function Segmented({ options, value, onChange, label, className = '' }) {
  const ref = useRef(null)
  const measured = useRef(false)
  const [thumb, setThumb] = useState(null)

  useLayoutEffect(() => {
    const group = ref.current
    if (!group) return undefined
    const measure = () => {
      const on = group.querySelector('.segment.is-on')
      if (!on) return
      // The first measure places it; only later ones glide.
      setThumb({
        x: on.offsetLeft,
        w: on.offsetWidth,
        glide: measured.current,
      })
      measured.current = true
    }
    // A pick measures at once. The first placement waits for the observer,
    // which reports once the group is laid out and before it paints: reading
    // offsetLeft here would force a layout of the whole page mid-mount, and of
    // a section the browser is skipping while it's off screen.
    if (measured.current) measure()
    const observer = new ResizeObserver(() => flushSync(measure))
    observer.observe(group)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className={`segmented ${className}`} role="group" aria-label={label}>
      <span
        className="segment-thumb"
        style={thumb ? { '--x': `${thumb.x}px`, '--w': `${thumb.w}px` } : undefined}
        data-glide={thumb?.glide || undefined}
        hidden={!thumb}
        aria-hidden="true"
      />
      {options.map((option) => {
        const on = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            className={`segment${on ? ' is-on' : ''}`}
            aria-pressed={on}
            onClick={() => onChange(option.id)}
          >
            <span className="segment-label" data-label={option.label}>
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

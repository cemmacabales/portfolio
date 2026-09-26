import { useEffect } from 'react'

// Moves the specular highlight on any `.glass[data-sheen]` element to follow
// the cursor. One delegated listener for the whole page; fine pointers only.
export function useGlassSheen() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = 0
    let pending = null

    const apply = () => {
      frame = 0
      if (!pending) return
      const { target, x, y } = pending
      const rect = target.getBoundingClientRect()
      target.style.setProperty('--sx', `${x - rect.left}px`)
      target.style.setProperty('--sy', `${y - rect.top}px`)
    }

    const onMove = (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-sheen]') : null
      if (!target) return
      pending = { target, x: event.clientX, y: event.clientY }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
    }
  }, [])
}

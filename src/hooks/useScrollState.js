import { useEffect, useState } from 'react'

// Tracks which section sits under the reading line (40% down the viewport)
// and whether the page has scrolled at all. One rAF-throttled listener.
export function useScrollState(sectionIds) {
  const [state, setState] = useState({ active: sectionIds[0], scrolled: false })
  const key = sectionIds.join('|')

  useEffect(() => {
    const ids = key.split('|')
    let frame = 0

    const measure = () => {
      frame = 0
      const { scrollY, innerHeight } = window
      const line = scrollY + innerHeight * 0.4
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4
      let active = ids[0]

      if (atBottom) {
        active = ids[ids.length - 1]
      } else {
        for (const id of ids) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top + scrollY <= line) active = id
        }
      }

      const scrolled = scrollY > 8
      setState((prev) =>
        prev.active === active && prev.scrolled === scrolled ? prev : { active, scrolled }
      )
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key])

  return state
}

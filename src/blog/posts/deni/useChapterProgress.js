import { useEffect, useState } from 'react'

/*
 * How far into the post the reader is. `current` is the chapter under the
 * reading line (40% down the viewport). A chapter counts as read once its
 * end has scrolled above 60% of the viewport, or the page has reached its
 * bottom, and it stays read: a blister doesn't refill. One rAF-throttled
 * listener, like useScrollState.
 */
export function useChapterProgress(ids) {
  const [state, setState] = useState(() => ({ current: 0, read: ids.map(() => false) }))
  const key = ids.join('|')

  useEffect(() => {
    const list = key.split('|')
    let frame = 0

    const measure = () => {
      frame = 0
      const { innerHeight, scrollY } = window
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4
      let current = 0
      const reached = list.map((id, index) => {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        if (!rect) return false
        if (rect.top <= innerHeight * 0.4) current = index
        return rect.bottom <= innerHeight * 0.6 || (atEnd && rect.top < innerHeight)
      })

      setState((prev) => {
        const read = prev.read.map((was, index) => was || reached[index])
        const same = prev.current === current && read.every((value, index) => value === prev.read[index])
        return same ? prev : { current, read }
      })
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

  return { ...state, count: state.read.filter(Boolean).length, complete: state.read.every(Boolean) }
}

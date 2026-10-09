import { useEffect } from 'react'

/*
 * Sections below the hero skip rendering while they're off screen (App.css),
 * holding an estimated height until they first render. A smooth scroll to a
 * link target renders them on its way past, and their real heights would
 * move the target out from under the scroll. So just before scrolling to a
 * section, lay them all out once; the browser remembers each real height.
 */
export function layOutSections() {
  const root = document.documentElement
  if (root.classList.contains('sections-laid-out')) return
  root.classList.add('sections-laid-out')
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('sections-laid-out')))
}

// Does that for every link into the page, before the browser follows it.
export function useSectionLinks() {
  useEffect(() => {
    const onClick = (event) => {
      if (event.target.closest?.('a[href^="#"]')) layOutSections()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}

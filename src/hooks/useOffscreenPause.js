import { useEffect } from 'react'

// Marks every tile that's off screen with `data-offscreen`, and App.css holds
// the looping animations inside it still (twinkling stars, lit windows, status
// pings). A paused animation costs nothing; a running one restyles, and on SVG
// repaints, every frame even where no one can see it. The margin wakes a tile
// a little before it scrolls in, so it's already moving when it appears.
export function useOffscreenPause() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting)
      },
      { rootMargin: '50px 0px' },
    )
    for (const tile of document.querySelectorAll('.tile')) observer.observe(tile)
    return () => observer.disconnect()
  }, [])
}

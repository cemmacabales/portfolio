import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import './FilmPlayer.css'

const CLOSE_MS = 220

/*
 * A project's promo film in a modal <dialog>. The top layer keeps it above
 * every tile, and the browser handles Escape, focus, and making the page
 * inert. The <video> only exists while the dialog is open, so the file is
 * never fetched until someone asks to watch.
 */
export default function FilmPlayer({ film, open, onClose }) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    if (!open) setClosing(false)
  }, [open])

  // The click that opened the dialog allows sound. If the browser still
  // refuses (iOS can, once React has left the gesture), play muted instead.
  useEffect(() => {
    const video = videoRef.current
    if (!open || !video) return
    video.play()?.catch(() => {
      video.muted = true
      video.play()?.catch(() => {})
    })
  }, [open])

  // Fade out, then close for real.
  const requestClose = useCallback(() => setClosing(true), [])

  useEffect(() => {
    if (!closing) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(onClose, reduce ? 0 : CLOSE_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  return (
    <dialog
      ref={dialogRef}
      className={`film${closing ? ' is-closing' : ''}`}
      aria-label={film.title}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      // Escape can still close it natively (a second press, say).
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
    >
      <div className="film-stage">
        <div className="film-bar">
          <p className="film-title">
            {film.title}
            <span className="film-length">{film.length}</span>
          </p>
          <button type="button" className="film-close" onClick={requestClose} aria-label="Close">
            <X size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
        <div className="film-frame">
          {open && (
            <video
              ref={videoRef}
              src={film.src}
              poster={film.poster}
              controls
              playsInline
              preload="auto"
            />
          )}
        </div>
      </div>
    </dialog>
  )
}

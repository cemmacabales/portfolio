import { useEffect, useState } from 'react'
import { Wrench, X } from 'lucide-react'
import { setSlow, watchFrameRate } from './slowmo'
import './DevSettings.css'

/*
 * The hidden Developer menu (tap the footer's © line seven times), styled
 * after the one in iOS Settings. Its switches last for this visit only.
 * Closed with a switch still on, it leaves a small chip in the corner to
 * come back to.
 */

const KEY = 'dev-settings'
const OFF = { slow: false, bounds: false, fps: false }

function read() {
  try {
    return { ...OFF, ...JSON.parse(sessionStorage.getItem(KEY) || '{}') }
  } catch {
    return OFF
  }
}

function Switch({ label, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="dev-row" onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className={`dev-switch${checked ? ' is-on' : ''}`} aria-hidden="true" />
    </button>
  )
}

export default function DevSettings({ open, onOpen, onClose }) {
  const [settings, setSettings] = useState(read)
  const [fps, setFps] = useState(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      // Private mode: lasts for this page.
    }
    setSlow(settings.slow)
    document.documentElement.classList.toggle('dev-bounds', settings.bounds)
  }, [settings])

  useEffect(() => {
    if (!settings.fps) {
      setFps(null)
      return undefined
    }
    return watchFrameRate(setFps)
  }, [settings.fps])

  // Turn it all off if the menu goes away.
  useEffect(
    () => () => {
      setSlow(false)
      document.documentElement.classList.remove('dev-bounds')
    },
    [],
  )

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }))
  const anyOn = settings.slow || settings.bounds || settings.fps

  return (
    <div className="dev-host">
      {open ? (
        <section className="dev-panel" aria-label="Developer settings">
          <header className="dev-head">
            <h2>Developer</h2>
            <button type="button" className="dev-x" onClick={onClose} aria-label="Close developer settings">
              <X size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </header>
          <p className="dev-group-label">Animation</p>
          <div className="dev-group">
            <Switch label="Slow animations" checked={settings.slow} onChange={set('slow')} />
          </div>
          <p className="dev-note">Everything moves at a tenth of its speed.</p>
          <p className="dev-group-label">Drawing</p>
          <div className="dev-group">
            <Switch label="Show layout bounds" checked={settings.bounds} onChange={set('bounds')} />
            <Switch label="Show frame rate" checked={settings.fps} onChange={set('fps')} />
          </div>
          <p className="dev-note">These last for this visit only.</p>
        </section>
      ) : (
        anyOn && (
          <button type="button" className="glass dev-chip" onClick={onOpen}>
            <Wrench size={13} strokeWidth={2} aria-hidden="true" />
            Developer
            {fps !== null && <span className="dev-fps">{fps} fps</span>}
          </button>
        )
      )}
      {open && fps !== null && (
        <p className="glass dev-chip dev-chip-solo" aria-live="off">
          <span className="dev-fps">{fps} fps</span>
        </p>
      )}
    </div>
  )
}

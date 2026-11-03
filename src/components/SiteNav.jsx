import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Sun, Moon, House, Layers, UserRound, BookOpen, Mail } from 'lucide-react'
import { useScrollState } from '../hooks/useScrollState'
import './SiteNav.css'

// `href` is for a link to another page; the rest are sections of the home.
const LINKS = [
  { id: 'work', label: 'Work', icon: Layers },
  { id: 'about', label: 'About', icon: UserRound },
  { id: 'blog', label: 'Blog', icon: BookOpen, href: '/blog/' },
  { id: 'contact', label: 'Contact', icon: Mail },
]

const TABS = [{ id: 'home', label: 'Home', icon: House }, ...LINKS]

// On the home, a section is an anchor in the page. On a blog page it's the
// home's anchor, and Home is the home itself.
function hrefFor(item, page) {
  if (item.href) return item.href
  if (page === 'home') return `#${item.id}`
  return item.id === 'home' ? '/' : `/#${item.id}`
}

// The selection "lens" is one element that glides between items, like the
// selection droplet in iOS segmented controls, rather than a per-item fill.
const LENS_SPRING = { type: 'spring', stiffness: 460, damping: 38, mass: 0.9 }

function useLens(active, itemRefs) {
  const [lens, setLens] = useState({ x: 0, width: 0, visible: false, instant: true })
  const placed = useRef(false)
  // The first time it shows, the lens appears in place instead of gliding in
  // from the left edge: arriving from another page, the nav holds still.
  const shown = useRef(false)

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active]
      if (!el || el.offsetWidth === 0) {
        setLens((prev) => (prev.visible ? { ...prev, visible: false } : prev))
        return
      }
      setLens({ x: el.offsetLeft, width: el.offsetWidth, visible: true, instant: !shown.current })
      shown.current = true
    }
    // A new section measures at once. The first placement waits for the
    // observer, which reports once the items are laid out and before they
    // paint, instead of forcing a layout of the page mid-mount. It reports
    // again when the web font swaps in and the items change width.
    if (placed.current) measure()
    placed.current = true
    const observer = new ResizeObserver(() => flushSync(measure))
    for (const el of Object.values(itemRefs.current)) if (el) observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [active, itemRefs])

  return lens
}

function Lens({ lens, className }) {
  return (
    <motion.span
      className={className}
      aria-hidden="true"
      initial={false}
      animate={{ x: lens.x, width: lens.width, opacity: lens.visible ? 1 : 0 }}
      transition={
        lens.instant
          ? { duration: 0 }
          : { x: LENS_SPRING, width: LENS_SPRING, opacity: { duration: 0.25 } }
      }
    />
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="glass nav-circle"
      data-sheen
      onClick={(event) => onToggle(event.currentTarget)}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="nav-circle-icon"
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

const SECTIONS = ['home', 'work', 'about', 'contact']
// A blog page has no sections: the lens rests on Blog.
const BLOG = ['blog']

// `page` is 'home' or 'blog'.
export default function SiteNav({ theme, onToggleTheme, page = 'home' }) {
  // Tracked here, not in App: crossing into a section re-renders the nav
  // alone instead of the whole page.
  const { active, scrolled } = useScrollState(page === 'home' ? SECTIONS : BLOG)
  const linkRefs = useRef({})
  const tabRefs = useRef({})
  const linkLens = useLens(active, linkRefs)
  const tabLens = useLens(active, tabRefs)

  return (
    <>
      <header className={`site-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="site-nav-inner">
          <a href={page === 'home' ? '#home' : '/'} className="glass nav-brand" data-sheen>
            <span className="nav-brand-name">Carl Macabales</span>
            <span className="nav-brand-role">
              <span aria-hidden="true">/ </span>AI &amp; software engineer
            </span>
          </a>

          <div className="nav-actions">
            <nav className="glass nav-links" aria-label="Sections" data-sheen>
              <Lens lens={linkLens} className="nav-lens" />
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  ref={(el) => (linkRefs.current[link.id] = el)}
                  href={hrefFor(link, page)}
                  className={`nav-link${active === link.id ? ' is-active' : ''}`}
                  aria-current={active === link.id ? (link.href ? 'page' : 'location') : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      <nav className="glass tab-bar" aria-label="Sections">
        <Lens lens={tabLens} className="tab-lens" />
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <a
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              href={hrefFor(tab, page)}
              className={`tab${active === tab.id ? ' is-active' : ''}`}
              aria-current={active === tab.id ? (tab.href ? 'page' : 'location') : undefined}
            >
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <span className="tab-label">{tab.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}

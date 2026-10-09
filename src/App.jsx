import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import SiteNav from './components/SiteNav'
import HeroBento from './components/HeroBento'
import GradualBlur from './components/GradualBlur'
import ModelSelectionModal from './components/ModelSelectionModal'
import AiChatbot from './components/AiChatbot'
import { useTheme } from './hooks/useTheme'
import { useGlassSheen } from './hooks/useGlassSheen'
import { useOffscreenPause } from './hooks/useOffscreenPause'
import { useBelowFold } from './hooks/useBelowFold'
import { layOutSections, useSectionLinks } from './hooks/useSectionLinks'
import { useMobileDetection } from './mobile-detection'
import { openAssistant } from './utils/assistant'
import { defersBelowFold, markReady } from './boot'
import posthog from './posthog'
import { portfolioLogger } from './posthog-logger'
import './App.css'

const loadBelowFold = () => import('./components/BelowFold')
const LazyBelowFold = lazy(loadBelowFold)
// When they're wanted from the start (a desktop, or a link into the page),
// fetch them alongside the first render instead of after it.
if (typeof window !== 'undefined' && !defersBelowFold()) loadBelowFold()

const SECTION_IDS = ['work', 'about', 'contact']

// Stand-ins for the sections below the hero until their code arrives: the
// same ids, so a link to one still lands, and about the same heights, so the
// page is as tall as it will be.
function SectionShells() {
  return SECTION_IDS.map((id) => <section key={id} id={id} className="section shell section-shell" />)
}

// The build-time prerender (src/entry-server.jsx) passes the sections below
// the hero in directly, so it renders them in place; the browser loads them
// lazily.
function App({ belowFold }) {
  const BelowFold = belowFold ?? LazyBelowFold
  const { theme, toggleTheme } = useTheme()
  const isMobile = useMobileDetection()
  const [openSlug, setOpenSlug] = useState(null)
  const [modelProject, setModelProject] = useState(null)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)

  const [belowWanted, wantBelow] = useBelowFold()
  const [belowMounted, setBelowMounted] = useState(false)
  // Where to scroll once the sections below the hero are in: a project opened
  // from the hero, or a link into the page followed before they arrived
  // (it scrolled to a stand-in, and the real section can be a different height).
  const pendingScroll = useRef(null)

  useGlassSheen()
  useOffscreenPause(belowMounted)
  useSectionLinks()

  useEffect(() => {
    if (belowMounted) return undefined
    const onHash = () => {
      pendingScroll.current = decodeURIComponent(location.hash.slice(1)) || null
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [belowMounted])

  // First commit is in; the boot loader can count the app as rendered.
  useEffect(() => {
    markReady('app')
    portfolioLogger.info('portfolio_app_rendered', { entry_point: 'main' })
  }, [])

  const toggleProject = useCallback((slug) => {
    setOpenSlug((current) => (current === slug ? null : slug))
  }, [])

  // From a hero tile: open that project's row and bring it into view, once
  // the work list is in.
  const openProject = useCallback(
    (slug) => {
      setOpenSlug(slug)
      if (!belowMounted) {
        pendingScroll.current = `work-${slug}`
        wantBelow()
        return
      }
      layOutSections()
      requestAnimationFrame(() => {
        document.getElementById(`work-${slug}`)?.scrollIntoView({ block: 'start' })
      })
    },
    [belowMounted, wantBelow],
  )

  const onBelowMount = useCallback(() => {
    setBelowMounted(true)
    markReady('below')
    const id = pendingScroll.current
    pendingScroll.current = null
    if (id) {
      layOutSections()
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' })
      })
    }
  }, [])

  const showModels = useCallback((project) => {
    posthog.capture('project_model_selector_opened', { project_slug: project.slug })
    setModelProject(project)
    setIsModelModalOpen(true)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Softens content as it scrolls under the floating nav, like iOS scroll edges. */}
      <GradualBlur
        target="page"
        position="top"
        height="5.5rem"
        strength={1.6}
        divCount={5}
        curve="bezier"
        zIndex={30}
      />

      <SiteNav theme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        <HeroBento
          theme={theme}
          showField={!isMobile}
          onOpenProject={openProject}
          onAskAssistant={openAssistant}
        />
        <Suspense fallback={<SectionShells />}>
          {belowWanted ? (
            <BelowFold
              openSlug={openSlug}
              onToggle={toggleProject}
              onShowModels={showModels}
              onMount={onBelowMount}
            />
          ) : (
            <SectionShells />
          )}
        </Suspense>
      </main>

      <ModelSelectionModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        project={modelProject}
      />
      <AiChatbot />
    </MotionConfig>
  )
}

export default App

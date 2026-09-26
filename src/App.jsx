import { useCallback, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import SiteNav from './components/SiteNav'
import HeroBento from './components/HeroBento'
import WorkList from './components/WorkList'
import BackgroundBento from './components/BackgroundBento'
import ContactPanel from './components/ContactPanel'
import GradualBlur from './components/GradualBlur'
import ModelSelectionModal from './components/ModelSelectionModal'
import AiChatbot from './components/AiChatbot'
import { useTheme } from './hooks/useTheme'
import { useScrollState } from './hooks/useScrollState'
import { useGlassSheen } from './hooks/useGlassSheen'
import { useMobileDetection } from './mobile-detection'
import { openAssistant } from './utils/assistant'
import './App.css'

const SECTIONS = ['home', 'work', 'about', 'contact']

function App() {
  const { theme, toggleTheme } = useTheme()
  const { active, scrolled } = useScrollState(SECTIONS)
  const isMobile = useMobileDetection()
  const [openSlug, setOpenSlug] = useState(null)
  const [modelProject, setModelProject] = useState(null)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)

  useGlassSheen()

  const toggleProject = useCallback((slug) => {
    setOpenSlug((current) => (current === slug ? null : slug))
  }, [])

  // From a hero tile: open that project's row and bring it into view.
  const openProject = useCallback((slug) => {
    setOpenSlug(slug)
    requestAnimationFrame(() => {
      document.getElementById(`work-${slug}`)?.scrollIntoView({ block: 'start' })
    })
  }, [])

  const showModels = useCallback((project) => {
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

      <SiteNav active={active} scrolled={scrolled} theme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        <HeroBento
          showField={!isMobile}
          onOpenProject={openProject}
          onAskAssistant={openAssistant}
        />
        <WorkList openSlug={openSlug} onToggle={toggleProject} onShowModels={showModels} />
        <BackgroundBento />
        <ContactPanel />
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

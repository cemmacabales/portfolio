import { MotionConfig } from 'framer-motion'
import SiteNav from '../components/SiteNav'
import GradualBlur from '../components/GradualBlur'
import { useTheme } from '../hooks/useTheme'
import { useGlassSheen } from '../hooks/useGlassSheen'
import BlogFooter from './BlogFooter'
import '../App.css'
import './blog.css'

/*
 * The frame every blog page shares with the home: the same nav, theme and
 * blur under the nav. What sits inside <main> belongs to the page, and a
 * post brings its own world there (see posts/<slug>/).
 */
export default function BlogPage({ children }) {
  const { theme, toggleTheme } = useTheme({ hydrate: true })
  useGlassSheen()

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <GradualBlur
        target="page"
        position="top"
        height="5.5rem"
        strength={1.6}
        divCount={5}
        curve="bezier"
        zIndex={30}
      />

      <SiteNav theme={theme} onToggleTheme={toggleTheme} page="blog" />

      <main id="main" className="blog-main">
        {children}
      </main>

      <BlogFooter />
    </MotionConfig>
  )
}

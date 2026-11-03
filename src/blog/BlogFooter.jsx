import { ArrowLeft, ArrowRight } from 'lucide-react'

// The way out of every blog page: the other posts, and the work itself.
export default function BlogFooter() {
  return (
    <footer className="blog-footer shell">
      <nav className="blog-footer-links" aria-label="More">
        <a href="/blog/" className="btn btn-line">
          <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          All posts
        </a>
        <a href="/#work" className="btn btn-line">
          See my work
          <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </nav>
      <p className="blog-footer-note">Carl Macabales · AI &amp; software engineer · Quezon City</p>
    </footer>
  )
}

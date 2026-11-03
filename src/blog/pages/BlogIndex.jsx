import { ArrowRight } from 'lucide-react'
import BlogPage from '../BlogPage'
import { formatDate, posts } from '../posts'
import './blog-index.css'

// A post as a cover: its own world on one side, what it is on the other.
function PostCover({ post }) {
  const { Cover } = post
  return (
    <a href={post.href} className="tile post-cover">
      <div className="post-cover-art">
        <Cover />
      </div>
      <div className="post-cover-copy">
        <p className="post-cover-meta">
          <img src={post.icon} alt="" width="44" height="44" />
          <span>
            {post.project}
            <br />
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readMinutes} min read
          </span>
        </p>
        <h2 className="post-cover-title">{post.title}</h2>
        <p className="post-cover-dek">{post.dek}</p>
        <div className="post-cover-foot">
          <ul className="post-cover-tags" aria-label="Topics">
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <span className="post-cover-cta" aria-hidden="true">
            Read the story
            <ArrowRight size={16} strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </a>
  )
}

export default function BlogIndex() {
  return (
    <BlogPage>
      <header className="blog-head shell">
        <h1 className="blog-title">How the work got made.</h1>
        <p className="blog-lede">Why each project exists, what I tried, and what shipped.</p>
      </header>

      <ol className="post-list shell" aria-label="Posts">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCover post={post} />
          </li>
        ))}
      </ol>
    </BlogPage>
  )
}

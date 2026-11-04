import { Check } from 'lucide-react'
import { Stub } from './Stub'

/*
 * The post's contents, as the receipt's line items: one per chapter, with the
 * figure it comes to. The line under the reading line is bold, and one the
 * reader has finished gets a green stamp. On a wide screen it's a stub beside
 * the story; narrower, a strip of stamps that stays under the nav.
 */
export default function LineItems({ chapters, progress, variant }) {
  const { current, read } = progress
  const total = chapters.length
  const pad = (n) => String(n).padStart(2, '0')

  const list = (
    <ol className="cn-items-list">
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <a
            href={`#${chapter.id}`}
            className={`cn-item${read[index] ? ' is-read' : ''}${current === index ? ' is-current' : ''}`}
            aria-current={current === index ? 'location' : undefined}
          >
            <span className="cn-item-n" aria-hidden="true">
              {pad(index + 1)}
            </span>
            <span className="cn-item-title">{chapter.short}</span>
            <span className={`cn-item-figure${chapter.money ? ' cn-money' : ''}`} aria-hidden="true">
              {chapter.figure}
            </span>
            <span className="cn-stamp" aria-hidden="true">
              <Check size={12} strokeWidth={3} />
            </span>
            {read[index] && <span className="visually-hidden"> (read)</span>}
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === 'strip') {
    return (
      <nav className="cn-items cn-items-strip" aria-label="Chapters">
        {list}
        <p className="cn-items-now" aria-hidden="true">
          {chapters[current].title}
        </p>
        <p className="cn-items-count" aria-hidden="true">
          {pad(current + 1)} <span>/ {pad(total)}</span>
        </p>
      </nav>
    )
  }

  return (
    <nav className="cn-items cn-items-rail" aria-label="Chapters">
      <Stub>
        <p className="cn-micro">In this post · {total} lines</p>
        {list}
      </Stub>
    </nav>
  )
}

/*
 * The post's contents, as a stack of CT slices: one per chapter. The slice
 * under the reading line is lit, and one the reader has finished gets its
 * outline, the way the model outlines what it finds. On a wide screen it's a
 * rail beside the story; narrower, a strip that stays under the nav.
 */
export default function SliceStack({ chapters, progress, variant }) {
  const { current, read } = progress
  const total = chapters.length

  return (
    <nav className={`lb-stack lb-stack-${variant}`} aria-label="Chapters">
      <p className="lb-stack-count">
        <span className="lb-stack-caption">Slice</span>
        <span className="lb-stack-num">{current + 1}</span>
        <span className="lb-stack-of"> / {total}</span>
      </p>
      <ol className="lb-stack-list">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              className={`lb-stack-cell${read[index] ? ' is-read' : ''}${current === index ? ' is-current' : ''}`}
              aria-current={current === index ? 'location' : undefined}
            >
              <span className="lb-slice" aria-hidden="true" />
              <span className="lb-stack-text">
                <span className="lb-stack-n">Slice {index + 1}</span>
                <span className="lb-stack-title">{chapter.title}</span>
              </span>
              {read[index] && <span className="visually-hidden"> (read)</span>}
            </a>
          </li>
        ))}
      </ol>
      <p className="lb-stack-now" aria-hidden="true">
        {chapters[current].title}
      </p>
    </nav>
  )
}

/*
 * The post's contents, as Deni's pearl foil pack: a blister per chapter.
 * A chapter the reader has finished presses its blister in and drops its
 * pill, the way taking a dose does in the app; when the last one goes, one
 * sweep of light crosses the foil. On a wide screen it's a rail beside the
 * story; narrower, a strip that stays under the nav.
 */
export default function Pack({ chapters, progress, variant }) {
  const { current, read, count, complete } = progress
  const total = chapters.length

  return (
    <nav
      className={`pack pack-${variant}${complete ? ' is-complete' : ''}`}
      aria-label="Chapters"
    >
      <p className="pack-count">
        <span className="pack-num">{count}</span>
        <span className="pack-of"> of {total}</span>
        <span className="pack-caption">chapters read</span>
      </p>
      <ol className="pack-list">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              className={`pack-cell${read[index] ? ' is-read' : ''}${current === index ? ' is-current' : ''}`}
              aria-current={current === index ? 'location' : undefined}
            >
              <span className="blister" aria-hidden="true">
                <span className="deni-capsule" />
              </span>
              <span className="pack-text">
                <span className="pack-time">{chapter.time}</span>
                <span className="pack-title">{chapter.title}</span>
              </span>
              {read[index] && <span className="visually-hidden"> (read)</span>}
            </a>
          </li>
        ))}
      </ol>
      <p className="pack-now" aria-hidden="true">
        {chapters[current].title}
      </p>
    </nav>
  )
}

/*
 * An iPhone drawn in CSS around a real screen, the same build as the hero's
 * PhoneReel (frame in cqw, so it keeps its proportions at any width). Set
 * its width with --phone-w. `vt` names it for the page-to-page transition
 * (App.css); `priority` marks the one screen that is the page's largest paint.
 */
export default function Phone({ src, srcSet, sizes, alt, priority = false, vt, className = '', style }) {
  return (
    <div
      className={`phone ${className}`.trim()}
      style={vt ? { ...style, viewTransitionName: vt } : style}
      data-vt={vt ? '' : undefined}
    >
      <div className="phone-frame">
        <div className="phone-screen">
          <span className="phone-island" aria-hidden="true" />
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
          />
        </div>
      </div>
    </div>
  )
}

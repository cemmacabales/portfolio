/*
 * A receipt stub (centient-tokens.css): the wrapper carries the shadow, the
 * stub itself is cut by the mask.
 */
export function Stub({ className = '', children }) {
  return (
    <div className={`cn-stub-wrap ${className}`}>
      <div className="cn-stub">{children}</div>
    </div>
  )
}

// One receipt row: field name, dotted leader, value. Goes inside a <dl>.
export function Row({ name, tone, children }) {
  return (
    <div className="cn-row">
      <dt>{name}</dt>
      <dd className={tone ? `cn-${tone}` : undefined}>{children}</dd>
    </div>
  )
}

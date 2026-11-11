import './LivingGradient.css'

// Five glows on their own paths, riding a slowly turning field.
const GLOWS = ['g1', 'g2', 'g3', 'g4', 'g5']

// The living grainy gradient behind the Ask tile and the chat's welcome: a
// base gradient, big soft glows melting together, film grain over the top.
// It fills its positioned parent; colors come from --lg-* custom properties
// (see LivingGradient.css), so each place can tint it for its theme.
// `children` sit above the glows and under the grain.
export default function LivingGradient({ className = '', children }) {
  return (
    <span className={`lg ${className}`} aria-hidden="true">
      <span className="lg-swirl">
        {GLOWS.map((g) => (
          <span key={g} className={`lg-glow is-${g}`} />
        ))}
      </span>
      {children}
      <span className="lg-grain" />
    </span>
  )
}

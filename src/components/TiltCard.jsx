import { forwardRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion
} from 'framer-motion'

/**
 * TiltCard — wraps a project card so it tilts toward the cursor in 3D and lights a
 * mint spotlight that tracks the pointer. Keeps the existing entrance + hover-lift so
 * it layers onto, rather than replaces, the current motion. Forwards its ref to the
 * underlying node so the GSAP category-transition system keeps working unchanged.
 *
 * Reduced motion: no tilt, no spotlight — just the hover lift.
 */
const TiltCard = forwardRef(function TiltCard(
  { index = 0, className = '', children, ...rest },
  ref
) {
  const reduceMotion = useReducedMotion()

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6.5, 6.5]), {
    stiffness: 150,
    damping: 18
  })
  const rotateX = useSpring(useTransform(my, [0, 1], [6.5, -6.5]), {
    stiffness: 150,
    damping: 18
  })

  const handleMove = (e) => {
    if (reduceMotion) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    mx.set(px)
    my.set(py)
    e.currentTarget.style.setProperty('--glow-x', `${px * 100}%`)
    e.currentTarget.style.setProperty('--glow-y', `${py * 100}%`)
  }

  const handleLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  const tiltStyle = reduceMotion
    ? undefined
    : { rotateX, rotateY, transformPerspective: 900 }

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={tiltStyle}
      {...rest}
    >
      {children}
    </motion.div>
  )
})

export default TiltCard

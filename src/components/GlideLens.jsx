import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars

/*
 * A row's selection highlight, which glides to the next row through a shared
 * layoutId. Until its list has come into view (`live`) it's a plain span that
 * looks the same: a layout-animated element mounting off screen makes
 * framer-motion measure every animated element on the page to place it, and
 * lay out the sections the browser is skipping while they're off screen.
 */
export default function GlideLens({ live, layoutId, className, transition }) {
  if (!live) return <span className={className} />
  return <motion.span layoutId={layoutId} className={className} transition={transition} />
}

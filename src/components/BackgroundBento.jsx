import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import GithubActivity from './GithubActivity'
import ThesisTile from './ThesisTile'
import StackTile from './StackTile'
import EducationTile from './EducationTile'
import ExperienceTile from './ExperienceTile'
import ResearchTile from './ResearchTile'
import './BackgroundBento.css'

const EASE = [0.16, 1, 0.3, 1]

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

export default function BackgroundBento() {
  return (
    <section id="about" className="section shell" aria-labelledby="about-title">
      <motion.header
        className="section-head"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <h2 id="about-title" className="section-title">
          Background. <span className="section-lede">Where I’ve worked, shipped, published, and studied.</span>
        </h2>
      </motion.header>

      <motion.div
        className="background-grid"
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <ExperienceTile variants={rise} />

        <EducationTile variants={rise} />

        <ResearchTile variants={rise} />

        <StackTile variants={rise} />

        <GithubActivity variants={rise} />

        <ThesisTile variants={rise} />
      </motion.div>
    </section>
  )
}

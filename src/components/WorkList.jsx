import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { ArrowUpRight, Plus } from 'lucide-react'
import { projects } from '../data/portfolio'
import posthog from '../posthog'
import './WorkList.css'

const EASE = [0.16, 1, 0.3, 1]

function ExternalButton({ href, variant, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn btn-sm ${variant}`}>
      {children}
      <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

function WorkRow({ project, index, open, onToggle, onShowModels }) {
  const panelId = `work-panel-${project.slug}`
  const { demo, paper, code } = project.links

  return (
    <motion.li
      id={`work-${project.slug}`}
      className={`work-row${open ? ' is-open' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: EASE, delay: Math.min(index, 3) * 0.05 }}
    >
      <h3 className="work-heading">
        <button
          type="button"
          className="work-head"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (!open) {
              posthog.capture('project_case_study_opened', {
                project_slug: project.slug,
                project_category: project.category,
              })
            }
            onToggle(project.slug)
          }}
        >
          <span className="work-thumb" aria-hidden="true">
            <img src={project.thumb ?? project.image} alt="" loading="lazy" decoding="async" />
          </span>
          <span className="work-name">{project.name}</span>
          <span className="work-sub">
            <span className="work-category">{project.category}</span>
            <span className="work-year">{project.year}</span>
          </span>
          <span className="work-toggle" aria-hidden="true">
            <Plus size={18} strokeWidth={2} />
          </span>
        </button>
      </h3>

      {/* Always mounted, so search and AI crawlers can read every case study.
          A closed panel is collapsed to nothing and inert: no focus, no
          find-in-page, no screen reader. */}
      <motion.div
        id={panelId}
        className="work-panel"
        initial={false}
        animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ height: { duration: 0.6, ease: EASE }, opacity: { duration: 0.3 } }}
        inert={!open}
      >
        <div className="work-panel-inner">
          <figure className="work-figure">
            <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" />
          </figure>

          <div className="work-detail">
            <p className="work-summary">{project.summary}</p>

            {project.metrics.length > 0 && (
              <dl className="work-metrics">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="work-metric">
                    <dt>{metric.label}</dt>
                    <dd>{metric.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <ul className="work-tech" aria-label="Built with">
              {project.tech.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            <div className="work-actions">
              {project.models && (
                <button
                  type="button"
                  className="btn btn-sm btn-mint"
                  onClick={() => onShowModels(project)}
                >
                  Try the models
                  <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
              )}
              {demo && (
                <ExternalButton href={demo} variant="btn-mint">
                  {project.demoLabel ?? 'Live demo'}
                </ExternalButton>
              )}
              {paper && (
                <ExternalButton href={paper} variant="btn-line">
                  Read the paper
                </ExternalButton>
              )}
              {code && (
                <ExternalButton href={code} variant="btn-line">
                  Source code
                </ExternalButton>
              )}
              {project.note && <p className="work-note">{project.note}</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.li>
  )
}

export default function WorkList({ openSlug, onToggle, onShowModels }) {
  return (
    <section id="work" className="section shell" aria-labelledby="work-title">
      <motion.header
        className="section-head"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <h2 id="work-title" className="section-title">
          Selected work. <span className="section-lede">What&nbsp;I’ve&nbsp;built since 2025.</span>
        </h2>
      </motion.header>

      <ol className="work-list">
        {projects.map((project, index) => (
          <WorkRow
            key={project.slug}
            project={project}
            index={index}
            open={openSlug === project.slug}
            onToggle={onToggle}
            onShowModels={onShowModels}
          />
        ))}
      </ol>
    </section>
  )
}

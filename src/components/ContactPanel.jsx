import { useRef, useState } from 'react'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import emailjs from '@emailjs/browser'
import { Mail, Github, Linkedin, Phone, ArrowUp, Send } from 'lucide-react'
import { validateFormData, sanitizeFormData, checkRateLimit } from '../utils/validation'
import { profile } from '../data/portfolio'
import './ContactPanel.css'

const EASE = [0.16, 1, 0.3, 1]
const EMPTY = { name: '', email: '', subject: '', message: '' }
const FIELD_ORDER = ['name', 'email', 'subject', 'message']

function Field({ id, label, error, as = 'input', ...props }) {
  const Control = as
  const errorId = `${id}-error`
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <Control
        id={id}
        name={id}
        className="field-control"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ContactPanel() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const formRef = useRef(null)

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const clean = sanitizeFormData(form)
    const { isValid, errors: found } = validateFormData(clean)

    if (!isValid) {
      setErrors(found)
      setStatus({ state: 'idle', message: '' })
      const first = FIELD_ORDER.find((field) => found[field])
      formRef.current?.querySelector(`[name="contact-${first}"]`)?.focus()
      return
    }

    if (!checkRateLimit()) {
      setStatus({
        state: 'error',
        message: 'That’s three messages in a minute. Give it a moment, then try again.',
      })
      return
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing')
      setStatus({
        state: 'error',
        message: `The form can’t send right now. Email me at ${profile.email} instead.`,
      })
      return
    }

    setStatus({ state: 'sending', message: 'Sending…' })
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: clean.name,
          email: clean.email,
          reply_to: clean.email,
          subject: clean.subject,
          message: clean.message,
          projectType: '',
          timeline: '',
          budget: '',
        },
        publicKey
      )
      setForm(EMPTY)
      setErrors({})
      setStatus({ state: 'sent', message: `Sent. I’ll reply to ${clean.email}.` })
    } catch (error) {
      console.error('Email send failed:', error)
      setStatus({
        state: 'error',
        message: `Your message didn’t send. Try again, or email me at ${profile.email}.`,
      })
    }
  }

  const sending = status.state === 'sending'

  return (
    <section id="contact" className="section shell" aria-labelledby="contact-title">
      <motion.div
        className="tile contact-tile"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="contact-grid">
          <div className="contact-intro">
            <p className="contact-kicker">Contact</p>
            <h2 id="contact-title" className="contact-title">
              Have a model stuck in a notebook? Let’s get it shipped.
            </h2>
            <p className="contact-lede">
              I’m looking for AI/ML and full-stack roles, freelance work, and research
              collaborations.
            </p>

            <div className="contact-links">
              <a href={`mailto:${profile.email}`} className="btn contact-email">
                <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
                {profile.email}
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-circle"
                aria-label="GitHub (opens in a new tab)"
              >
                <Github size={18} strokeWidth={1.8} />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-circle"
                aria-label="LinkedIn (opens in a new tab)"
              >
                <Linkedin size={18} strokeWidth={1.8} />
              </a>
              <a href={profile.phoneHref} className="contact-circle" aria-label={`Call ${profile.phone}`}>
                <Phone size={18} strokeWidth={1.8} />
              </a>
            </div>
          </div>

          <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="field-row">
              <Field
                id="contact-name"
                label="Name"
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                error={errors.name}
                required
              />
              <Field
                id="contact-email"
                label="Email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
                required
              />
            </div>
            <Field
              id="contact-subject"
              label="Subject"
              value={form.subject}
              onChange={update('subject')}
              error={errors.subject}
              required
            />
            <Field
              id="contact-message"
              label="Message"
              as="textarea"
              rows={5}
              value={form.message}
              onChange={update('message')}
              error={errors.message}
              required
            />
            <div className="form-foot">
              <button type="submit" className="btn btn-mint" disabled={sending}>
                {sending ? 'Sending…' : 'Send message'}
                <Send size={16} strokeWidth={1.9} aria-hidden="true" />
              </button>
              <p className={`form-status is-${status.state}`} role="status" aria-live="polite">
                {status.state === 'sending' ? '' : status.message}
              </p>
            </div>
          </form>
        </div>

        <footer className="contact-foot">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <p className="contact-cookie">If you made it this far, you deserve a cookie.</p>
          <a href="#home" className="back-top">
            Back to top
            <ArrowUp size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </footer>
      </motion.div>
    </section>
  )
}

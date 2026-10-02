import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion, // eslint-disable-line no-unused-vars
  useAnimationControls,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  Mail,
  Github,
  Linkedin,
  Phone,
  ArrowUp,
  Send,
  Check,
  Copy,
  MailCheck,
  SquarePen,
} from 'lucide-react'
import {
  validateFormData,
  validateEmail,
  sanitizeFormData,
  checkRateLimit,
} from '../utils/validation'
import { profile } from '../data/portfolio'
import posthog from '../posthog'
import './ContactPanel.css'

const EASE = [0.16, 1, 0.3, 1]
// Leaving the screen accelerates, the way Mail's sent window does.
const AWAY = [0.55, 0, 0.8, 0.25]
const EMPTY = { name: '', email: '', subject: '', message: '' }
const FIELD_ORDER = ['name', 'email', 'subject', 'message']
// sanitizeInput cuts every field at 1000 characters, so the box stops there too.
const MESSAGE_MAX = 1000
const COUNT_FROM = 800

const rise = (reduce, delay = 0) => ({
  hidden: reduce ? { opacity: 0 } : { opacity: 0, y: '0.45em', filter: 'blur(12px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: reduce ? 0.3 : 0.9, ease: EASE, delay },
  },
})

// The compose window zooms open like a new macOS window and, once sent,
// shrinks away up and to the right.
const windowMotion = (reduce) => ({
  hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 56, scale: 0.93, filter: 'blur(10px)' },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: reduce ? 0.3 : 0.95,
      ease: EASE,
      delay: reduce ? 0 : 0.18,
    },
  },
  gone: reduce
    ? { opacity: 0, transition: { duration: 0.2 } }
    : {
        opacity: 0,
        x: '34%',
        y: '-58%',
        scale: 0.3,
        rotate: -4,
        filter: 'blur(3px)',
        transition: { duration: 0.6, ease: AWAY },
      },
})

const tokenPop = (reduce) => ({
  hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 },
  shown: {
    opacity: 1,
    scale: 1,
    transition: reduce
      ? { duration: 0.2 }
      : { type: 'spring', stiffness: 520, damping: 30, delay: 0.75 },
  },
})

function Row({ id, label, error, children }) {
  return (
    <div className={`mail-row${error ? ' has-error' : ''}`}>
      <label htmlFor={`contact-${id}`} className="mail-label">
        {label}
      </label>
      <div className="mail-value">{children}</div>
      {error && (
        <p id={`contact-${id}-error`} className="mail-error">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ContactPanel() {
  const reduce = useReducedMotion()
  const tileRef = useRef(null)
  const seen = useInView(tileRef, { once: true, amount: 0.25 })
  const show = seen ? 'shown' : 'hidden'

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ state: 'idle', message: null })
  const [emailFocused, setEmailFocused] = useState(false)
  // 'compose' shows the window; 'sent' shows the notification after it flies off.
  const [phase, setPhase] = useState('compose')
  const [windowKey, setWindowKey] = useState(0)
  const [sentTo, setSentTo] = useState('')
  const [hold, setHold] = useState(null)
  const [announce, setAnnounce] = useState('')
  const [copied, setCopied] = useState(false)
  const [kbd, setKbd] = useState(null)

  const formRef = useRef(null)
  const stageRef = useRef(null)
  const composeRef = useRef(null)
  const copiedTimer = useRef(0)
  const shake = useAnimationControls()

  // The send shortcut reads the platform, which only exists in the browser.
  useEffect(() => {
    const platform = navigator.userAgentData?.platform || navigator.platform || ''
    setKbd(/mac|iphone|ipad/i.test(platform) ? '⌘' : 'Ctrl')
  }, [])

  useEffect(() => () => clearTimeout(copiedTimer.current), [])

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const nudge = () => {
    if (reduce) return
    shake.start({
      x: [0, -12, 10, -7, 4, -2, 0],
      transition: { duration: 0.5, ease: 'easeOut' },
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status.state === 'sending') return
    const clean = sanitizeFormData(form)
    const { isValid, errors: found } = validateFormData(clean)

    if (!isValid) {
      setErrors(found)
      setStatus({ state: 'idle', message: null })
      nudge()
      const first = FIELD_ORDER.find((field) => found[field])
      formRef.current?.querySelector(`[name="contact-${first}"]`)?.focus()
      return
    }

    if (!checkRateLimit()) {
      posthog.capture('contact_message_failed', { reason: 'rate_limited' })
      nudge()
      setStatus({
        state: 'error',
        message: 'That’s three messages in a minute. Give it a moment, then try again.',
      })
      return
    }

    posthog.capture('contact_form_submitted')
    setStatus({ state: 'sending', message: null })
    try {
      // Netlify Forms takes the submission (the form is declared in
      // public/__forms.html) and emails it on. Its notification uses a
      // "subject" field as the email's subject line and "email" as Reply-To.
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          name: clean.name,
          email: clean.email,
          subject: `Portfolio: ${clean.subject}`,
          message: clean.message,
        }).toString(),
      })
      if (!response.ok) throw new Error(`Form submission failed with ${response.status}`)
      posthog.capture('contact_message_sent')
      // Keep the stage at the window's height so the page doesn't jump
      // while the window flies off.
      setHold(stageRef.current?.offsetHeight ?? null)
      setSentTo(clean.email)
      setForm(EMPTY)
      setErrors({})
      setStatus({ state: 'idle', message: null })
      setAnnounce(`Message sent. I’ll reply to ${clean.email}.`)
      setPhase('sent')
    } catch (error) {
      posthog.capture('contact_message_failed', { reason: 'delivery_error' })
      console.error('Email send failed:', error)
      nudge()
      setStatus({
        state: 'error',
        message: (
          <>
            Your message didn’t send. Try again, or email{' '}
            <a href={`mailto:${profile.email}`}>{profile.email}</a>.
          </>
        ),
      })
    }
  }

  // ⌘/Ctrl + Return sends from any field, as it does in Mail.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  const writeAnother = () => {
    setAnnounce('')
    setPhase('compose')
    setWindowKey((k) => k + 1)
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setAnnounce('Email address copied.')
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const sending = status.state === 'sending'
  const ready = FIELD_ORDER.every((field) => form[field].trim())
  const chip = !emailFocused && validateEmail(form.email)
  const count = form.message.length
  const title = form.subject.trim() || 'New Message'

  const fieldProps = (field) => ({
    id: `contact-${field}`,
    name: `contact-${field}`,
    value: form[field],
    onChange: update(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    required: true,
  })

  return (
    <section id="contact" className="section shell" aria-labelledby="contact-title">
      <div ref={tileRef} className="tile contact-tile">
        <motion.div className="contact-grid" initial="hidden" animate={show}>
          <div className="contact-intro">
            <h2 id="contact-title" className="contact-title">
              <motion.span className="contact-line" variants={rise(reduce)}>
                Have an idea that needs building?
              </motion.span>{' '}
              <motion.span className="contact-line contact-dim" variants={rise(reduce, 0.09)}>
                Let’s get it shipped.
              </motion.span>
            </h2>
            <motion.p className="contact-lede" variants={rise(reduce, 0.18)}>
              I’m looking for AI/ML and full-stack roles, freelance work, and research
              collaborations.
            </motion.p>

            <motion.div className="contact-links" variants={rise(reduce, 0.26)}>
              <button
                type="button"
                className="contact-copy"
                data-copied={copied || undefined}
                onClick={copyEmail}
              >
                <span className="contact-copy-icon" aria-hidden="true">
                  <Mail className="copy-ic-mail" size={18} strokeWidth={1.8} />
                  <Copy className="copy-ic-copy" size={18} strokeWidth={1.8} />
                  <Check className="copy-ic-done" size={18} strokeWidth={2.2} />
                </span>
                <span className="contact-copy-address">{profile.email}</span>
                <span className="contact-copy-tag">
                  <span className="contact-copy-roll">
                    <span>Copy</span>
                    <span aria-hidden="true">Copied</span>
                  </span>
                </span>
              </button>
              <div className="contact-socials">
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
                <a
                  href={profile.phoneHref}
                  className="contact-circle"
                  aria-label={`Call ${profile.phone}`}
                >
                  <Phone size={18} strokeWidth={1.8} />
                </a>
              </div>
            </motion.div>
          </div>

          <div
            ref={stageRef}
            className="mail-stage"
            style={hold && phase === 'sent' ? { minHeight: hold } : undefined}
          >
            <AnimatePresence mode="wait" initial={false}>
              {phase === 'compose' ? (
                <motion.div
                  key={`window-${windowKey}`}
                  className="mail-shell"
                  variants={windowMotion(reduce)}
                  initial="hidden"
                  animate={show}
                  exit="gone"
                  onAnimationComplete={(name) => {
                    // A fresh window after "New message" takes focus in its first field.
                    if (name === 'shown' && windowKey > 0) {
                      formRef.current
                        ?.querySelector('[name="contact-name"]')
                        ?.focus({ preventScroll: true })
                    }
                  }}
                >
                  <motion.form
                    ref={formRef}
                    className="mail"
                    aria-label={`New message to ${profile.name}`}
                    animate={shake}
                    onSubmit={handleSubmit}
                    onKeyDown={handleKeyDown}
                    noValidate
                  >
                    <div className="mail-bar">
                      <span className="mail-lights" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <p className="mail-title" aria-hidden="true">
                        {title}
                      </p>
                      <button
                        type="submit"
                        className="mail-send"
                        data-ready={ready || undefined}
                        data-sending={sending || undefined}
                        disabled={sending}
                      >
                        <span className="mail-plane" aria-hidden="true">
                          <Send size={15} strokeWidth={2} />
                        </span>
                        {sending ? 'Sending' : 'Send'}
                      </button>
                    </div>

                    <div className="mail-head">
                      <div className="mail-row">
                        <span className="mail-label">To:</span>
                        <div className="mail-value">
                          <motion.span className="mail-token" variants={tokenPop(reduce)}>
                            Carl Macabales
                          </motion.span>
                        </div>
                      </div>
                      <Row id="name" label="Name:" error={errors.name}>
                        <input
                          className="mail-input"
                          autoComplete="name"
                          placeholder="Your name"
                          {...fieldProps('name')}
                        />
                      </Row>
                      <Row
                        id="email"
                        label={
                          <>
                            From:
                            <span className="visually-hidden"> your email</span>
                          </>
                        }
                        error={errors.email}
                      >
                        <input
                          type="email"
                          className={`mail-input${chip ? ' is-chip' : ''}`}
                          autoComplete="email"
                          inputMode="email"
                          placeholder="your@email.com"
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                          {...fieldProps('email')}
                        />
                        {chip && (
                          <span className="mail-chip" aria-hidden="true">
                            {form.email.trim()}
                          </span>
                        )}
                      </Row>
                      <Row id="subject" label="Subject:" error={errors.subject}>
                        <input
                          className="mail-input"
                          placeholder="What it’s about"
                          maxLength={100}
                          {...fieldProps('subject')}
                        />
                      </Row>
                    </div>

                    <div className={`mail-body${errors.message ? ' has-error' : ''}`}>
                      <label htmlFor="contact-message" className="visually-hidden">
                        Message
                      </label>
                      <textarea
                        className="mail-text"
                        rows={8}
                        maxLength={MESSAGE_MAX}
                        placeholder={'Hi Carl,\n\n'}
                        {...fieldProps('message')}
                      />
                      {errors.message && (
                        <p id="contact-message-error" className="mail-error">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <div className="mail-foot">
                      <p
                        className={`mail-status is-${status.state}`}
                        role="status"
                        aria-live="polite"
                      >
                        {status.message}
                      </p>
                      {count >= COUNT_FROM ? (
                        <span className="mail-count" data-full={count >= MESSAGE_MAX || undefined}>
                          {count}/{MESSAGE_MAX}
                        </span>
                      ) : (
                        kbd && (
                          <span className="mail-hint" aria-hidden="true">
                            <kbd>{kbd}</kbd>
                            <kbd>Return</kbd>
                            to send
                          </span>
                        )
                      )}
                    </div>
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div
                  key="sent"
                  className="mail-sent"
                  initial="hidden"
                  animate="shown"
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="mail-banner"
                    variants={{
                      hidden: reduce
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: 56,
                            scale: 0.96,
                            filter: 'blur(8px)',
                          },
                      shown: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: reduce
                          ? { duration: 0.3 }
                          : {
                              type: 'spring',
                              stiffness: 260,
                              damping: 28,
                              delay: 0.05,
                            },
                      },
                    }}
                  >
                    <span className="mail-banner-icon" aria-hidden="true">
                      <MailCheck size={20} strokeWidth={1.9} />
                    </span>
                    <div className="mail-banner-text">
                      <p className="mail-banner-app">
                        Mail <span>now</span>
                      </p>
                      <p className="mail-banner-title">Message sent</p>
                      <p className="mail-banner-body">It’s in my inbox. I’ll reply to {sentTo}.</p>
                    </div>
                  </motion.div>
                  <motion.button
                    ref={composeRef}
                    type="button"
                    className="mail-compose"
                    onClick={writeAnother}
                    variants={rise(reduce, 0.35)}
                    onAnimationComplete={() => composeRef.current?.focus({ preventScroll: true })}
                  >
                    <SquarePen size={17} strokeWidth={1.9} aria-hidden="true" />
                    New message
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="visually-hidden" role="status" aria-live="polite">
          {announce}
        </p>

        <footer className="contact-foot">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="contact-cookie">If you made it this far, you deserve a cookie.</p>
          <a href="#home" className="back-top">
            Back to top
            <ArrowUp size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  )
}

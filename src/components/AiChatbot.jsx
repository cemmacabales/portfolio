import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Bot, X, Send, MessageCircle } from 'lucide-react'
import './AiChatbot.css'

const WINDOW_SIZE = 10

const panelVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.88, y: 8, transition: { duration: 0.15 } },
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const panelRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 60)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    const panel = panelRef.current
    const getFocusables = () =>
      Array.from(panel.querySelectorAll('button, textarea, [tabindex="0"]'))
    const trap = (e) => {
      if (e.key !== 'Tab') return
      const focusables = getFocusables()
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    panel.addEventListener('keydown', trap)
    return () => panel.removeEventListener('keydown', trap)
  }, [isOpen])

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg = { role: 'user', content: text, timestamp: new Date(), id: Date.now() }
    let snapshot
    setMessages(prev => {
      snapshot = [...prev, userMsg]
      return snapshot
    })
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    const payload = snapshot
      .slice(-WINDOW_SIZE)
      .map(({ role, content }) => ({ role: role === 'error' ? 'assistant' : role, content }))

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })
      const data = await res.json()

      if (!res.ok) {
        const text = res.status === 503
          ? "I'm a bit overwhelmed right now — try again in a moment."
          : "Something went wrong. Check your connection."
        setMessages((prev) => [...prev, { role: 'error', content: text, timestamp: new Date(), id: Date.now() }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content, timestamp: new Date(), id: Date.now() }])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: "Something went wrong. Check your connection.", timestamp: new Date(), id: Date.now() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chatbot-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot-panel"
            ref={panelRef}
            className="chatbot-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originX: 1, originY: 1 }}
            role="dialog"
            aria-label="Portfolio assistant"
            aria-modal="true"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-status-dot" aria-hidden="true" />
                <div>
                  <div className="chatbot-header-title">Ask about Carl</div>
                  <div className="chatbot-header-subtitle">Portfolio assistant</div>
                </div>
              </div>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages or empty state */}
            {messages.length === 0 && (
              <div className="chatbot-empty">
                <MessageCircle size={28} className="chatbot-empty-icon" aria-hidden="true" />
                <p className="chatbot-empty-text">
                  Ask me anything about Carl — his projects, skills, or background.
                </p>
              </div>
            )}
            <div
              className="chatbot-messages"
              role="log"
              aria-live="polite"
              aria-label="Conversation history"
              style={messages.length === 0 ? { display: 'none' } : undefined}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbot-message ${msg.role}`}>
                  <div className="chatbot-bubble">{msg.content}</div>
                  <span className="chatbot-timestamp" aria-hidden="true">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-message assistant">
                  <div className="chatbot-typing" aria-label="Assistant is typing">
                    <div className="chatbot-typing-dot" />
                    <div className="chatbot-typing-dot" />
                    <div className="chatbot-typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            {/* Input */}
            <div className="chatbot-input-area">
              <textarea
                ref={textareaRef}
                className="chatbot-textarea"
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Carl…"
                rows={1}
                maxLength={500}
                disabled={isLoading}
                aria-label="Message input"
              />
              <button
                className="chatbot-send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="chatbot-hint">Shift + Enter for new line</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        className="chatbot-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label={isOpen ? 'Close assistant' : 'Open portfolio assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex' }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex' }}
            >
              <Bot size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

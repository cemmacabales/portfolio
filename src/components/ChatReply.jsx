// Renders an assistant reply. The model answers in light Markdown, so this
// turns a small, safe subset of it (paragraphs, lists, bold, italics, code,
// links) into React elements; nothing is ever injected as HTML. While a reply
// writes itself in, every word is wrapped so it can blur in word by word, the
// way Apple Intelligence writes (see .chat-md.is-revealing in AiChatbot.css).
// Once the last word is in, the reply renders as plain text again: a finished
// reply full of animated spans would keep costing a GPU layer per word.

import { memo, useEffect, useMemo, useState } from 'react'

const SAFE_HREF = /^(https?:|mailto:)/i
const TOKEN =
  /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s<]+|[\w.+-]+@[\w-]+\.[\w.-]*\w|\*[^*\s][^*]*\*)/g
const TRAILING_PUNCTUATION = /[.,;:!?)]+$/

// The whole reply takes at most this long to write itself in.
const REVEAL_MS = 900
const MAX_STEP_MS = 26
// Match .chat-md.is-revealing .w in AiChatbot.css.
const WORD_DELAY_MS = 140
const WORD_MS = 500

function parseBlocks(source) {
  const blocks = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'p', lines: paragraph })
    paragraph = []
  }
  const flushList = () => {
    if (list) blocks.push(list)
    list = null
  }

  const lines = source.replace(/\r/g, '').split('\n').map((line) => line.trim())
  const isRule = (line) => /^[|\s:*_-]+$/.test(line) && /-{3}|\*{3}|_{3}/.test(line)

  for (let n = 0; n < lines.length; n++) {
    const line = lines[n]
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    // Horizontal rules and table separator rows carry no words.
    if (isRule(line)) continue

    // A table becomes a list, one row per item. Its header row only names
    // the columns, so it's dropped.
    if (line.startsWith('|')) {
      if (isRule(lines[n + 1] ?? '')) continue
      flushParagraph()
      if (!list || list.type !== 'ul') {
        flushList()
        list = { type: 'ul', items: [], start: 1 }
      }
      list.items.push(line.split('|').map((cell) => cell.trim()).filter(Boolean).join(' · '))
      continue
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/)
    const numbered = line.match(/^(\d+)[.)]\s+(.*)$/)
    if (bullet || numbered) {
      flushParagraph()
      const type = bullet ? 'ul' : 'ol'
      if (!list || list.type !== type) {
        flushList()
        list = { type, items: [], start: numbered ? Number(numbered[1]) : 1 }
      }
      list.items.push(bullet ? bullet[1] : numbered[2])
      continue
    }

    flushList()
    const heading = line.match(/^#{1,6}\s+(.*)$/)
    if (heading) {
      flushParagraph()
      blocks.push({ type: 'h', text: heading[1] })
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  flushList()
  return blocks
}

// Wraps each word in a span carrying its reveal index, while revealing.
function words(text, counter) {
  if (!counter.wrap) return text
  return text.split(/(\s+)/).map((part, i) =>
    !part || /^\s+$/.test(part) ? (
      part
    ) : (
      <span key={i} className="w" style={{ '--i': counter.n++ }}>
        {part}
      </span>
    ),
  )
}

function linkLabel(url) {
  return url.replace(/^https?:\/\//, '').replace(/^mailto:/, '').replace(/\/$/, '')
}

function inline(text, counter) {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null
    if (i % 2 === 0) return words(part, counter)

    if (/^(\*\*|__)/.test(part)) return <strong key={i}>{words(part.slice(2, -2), counter)}</strong>
    if (part.startsWith('`')) {
      return counter.wrap ? (
        <code key={i} className="w" style={{ '--i': counter.n++ }}>
          {part.slice(1, -1)}
        </code>
      ) : (
        <code key={i}>{part.slice(1, -1)}</code>
      )
    }
    if (part.startsWith('[')) {
      const [, label, href] = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (!SAFE_HREF.test(href)) return words(label, counter)
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer">
          {words(label, counter)}
        </a>
      )
    }
    if (/^https?:\/\//.test(part)) {
      const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? ''
      const href = trailing ? part.slice(0, -trailing.length) : part
      return [
        <a key={i} href={href} target="_blank" rel="noopener noreferrer">
          {words(linkLabel(href), counter)}
        </a>,
        <span key={`${i}-end`}>{words(trailing, counter)}</span>,
      ]
    }
    if (part.includes('@')) {
      return (
        <a key={i} href={`mailto:${part}`}>
          {words(part, counter)}
        </a>
      )
    }
    return <em key={i}>{words(part.slice(1, -1), counter)}</em>
  })
}

function render(text, wrap) {
  const counter = { n: 0, wrap }
  const blocks = parseBlocks(text)

  const content = blocks.map((block, b) => {
    if (block.type === 'h') {
      return (
        <p key={b}>
          <strong>{inline(block.text, counter)}</strong>
        </p>
      )
    }
    if (block.type === 'p') {
      return (
        <p key={b}>
          {block.lines.map((line, l) => (
            <span key={l}>
              {l > 0 && <br />}
              {inline(line, counter)}
            </span>
          ))}
        </p>
      )
    }
    const List = block.type
    return (
      <List key={b} start={block.type === 'ol' && block.start !== 1 ? block.start : undefined}>
        {block.items.map((item, i) => (
          <li key={i}>{inline(item, counter)}</li>
        ))}
      </List>
    )
  })

  return { content, count: counter.n }
}

function ChatReply({ text, reveal = true }) {
  const [revealing, setRevealing] = useState(
    () => reveal && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const { content, count } = useMemo(() => render(text, revealing), [text, revealing])
  const step = Math.min(MAX_STEP_MS, REVEAL_MS / Math.max(count, 1))

  useEffect(() => {
    if (!revealing) return
    const timer = setTimeout(
      () => setRevealing(false),
      WORD_DELAY_MS + count * step + WORD_MS + 60,
    )
    return () => clearTimeout(timer)
  }, [revealing, count, step])

  return (
    <div
      className={`chat-md${revealing ? ' is-revealing' : ''}`}
      style={revealing ? { '--step': `${step.toFixed(2)}ms` } : undefined}
    >
      {content}
    </div>
  )
}

export default memo(ChatReply)

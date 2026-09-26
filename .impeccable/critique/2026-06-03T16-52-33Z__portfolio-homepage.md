---
target: portfolio homepage
total_score: 22
p0_count: 0
p1_count: 4
timestamp: 2026-06-03T16-52-33Z
slug: portfolio-homepage
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Multi-step form progress is clear; browser alert() for submission errors breaks the feedback loop |
| 2 | Match System / Real World | 3 | Language is mostly plain; "getResume()" and "FAISS/MedCPT" require translation for non-technical visitors |
| 3 | User Control and Freedom | 3 | Section nav is solid; contact form has back navigation; no escape from alert dialogs |
| 4 | Consistency and Standards | 2 | ML and software project cards use different HTML structure; emoji alert vs styled error states; inconsistent button patterns |
| 5 | Error Prevention | 2 | Form validation exists but uses alert() for rate limit and submission errors; form inputs have placeholder-only labels (no label elements); steps aren't validated before advancing |
| 6 | Recognition Rather Than Recall | 2 | Mobile dock is icon-only (labels hidden on mobile); no persistent way to see which section you're in when scrolled mid-page |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; no direct section URL sharing; no back-to-top for long page |
| 8 | Aesthetic and Minimalist Design | 2 | Every section uses identical motion treatment (DecryptedText + ScrambledText); project cards identical in structure; multiple competing attention layers active simultaneously |
| 9 | Error Recovery | 1 | alert() for rate limiting and send failures -- browser modal interrupts flow, loses context, gives no styled recovery path |
| 10 | Help and Documentation | 2 | No contextual help; technical project descriptions assume ML literacy; no guidance on what the contact form steps are for before starting |
| **Total** | | **22/40** | **Acceptable -- significant improvements needed** |

## Anti-Patterns Verdict

**Partially AI-generated feel.** The distinctive interactions (MagnetLines, SpotlightCard, magnetic CTA) are genuinely original. The scaffolding underneath -- identical card grid, uniform DecryptedText+ScrambledText on every section header, "Hi, I'm" hero opener -- is template. Detector found: overused font (Inter, App.css:25), gradient text (App.css:1587-1588, 1595-1597). Both gradient text instances are genuine findings, not false positives.

## Priority Issues

**[P1] Gradient text on project card h3 titles** (App.css:1587-1597). Two detector hits. Absolute ban -- most recognized AI tell. Fix: solid var(--accent-primary) or var(--text-primary), color transition on hover. /impeccable polish

**[P1] Every section uses the same two-component title motion** (DecryptedText + ScrambledText on About, Projects, Skills, Contact). Uniform reflex = AI grammar. Fix: keep DecryptedText for About only; each section earns its own arrival. /impeccable animate

**[P1] Browser alert() for errors, rate limiting, and maintenance messages** (three callsites in App.jsx). Fix: inline styled toast or formErrors-based messaging. /impeccable harden

**[P1] Identical project card grid** (6 cards, same structure). Fix: two tiers -- featured treatment for RAG chatbot + kidney detection, compact for others. /impeccable bolder

**[P2] Purple (#8b5cf6) in TextType hero cycling** (App.jsx:665) violates One Signal Rule. Fix: replace with ["#64ffda", "#4ecdc4", "#ffffff"]. /impeccable polish

## Persona Red Flags

**Jordan (First-Timer):** Hero text cycles to "A Developer" -- least specific description possible during deletion phase. Four-step contact form is high friction for casual outreach. Technical project descriptions have no plain-language hook.

**Sam (Accessibility):** Form inputs use placeholder only, no label elements -- screen readers lose field name on type. alt="Profile" is meaningless. Social icon links need aria-label. Framer Motion animations not connected to useReducedMotion -- prefers-reduced-motion CSS rule doesn't stop JS animations.

**Technical Recruiter (Project-Specific):** RAG Clinical Chatbot is research-grade work but gets same visual treatment as a Streamlit Python tool. No methodology, results, or benchmark data visible. "400+ Hours of Learning" is not meaningful to a technical reviewer.

## Minor Observations

- Headings missing text-wrap: balance
- "getResume()" button label will confuse non-technical visitors
- About stats in hero-metric format (SpotlightCards with numbers)
- 3-second Loader is long for a static page
- Hero p tag restates h2 content
- project-content max-height: 400px clips longer descriptions silently

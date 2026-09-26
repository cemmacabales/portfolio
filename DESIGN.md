---
name: Carl Macabales Portfolio
description: Personal portfolio for a CS student specializing in AI/ML. Dark, precise, energetically interactive.
colors:
  void: "#000000"
  surface: "#1a1a1a"
  electric-mint: "#64ffda"
  mint-deep: "#4ecdc4"
  ink-bright: "#ffffff"
  ink-muted: "#a0a0a0"
  light-canvas: "#f5f5f7"
  light-surface: "#ffffff"
  light-accent: "#00897b"
  light-ink: "#111111"
  light-ink-muted: "#666666"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "clamp(1.2rem, 3vw, 1.8rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "clamp(1rem, 2.5vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "1.5rem"
  full: "50%"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.electric-mint}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.mint-deep}"
    textColor: "{colors.light-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-bright}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.electric-mint}"
    textColor: "{colors.light-ink}"
  card-spotlight:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "{colors.ink-bright}"
    rounded: "{rounded.lg}"
    padding: "2rem"
  dock-panel:
    backgroundColor: "rgba(20,20,20,0.8)"
    textColor: "{colors.ink-bright}"
    rounded: "{rounded.md}"
    padding: "0.5rem"
  dock-item-active:
    backgroundColor: "rgba(100,255,218,0.1)"
    textColor: "{colors.electric-mint}"
    rounded: "10px"
    size: "50px"
---

# Design System: Carl Macabales Portfolio

## 1. Overview

**Creative North Star: "The Curious Machine"**

This is an interface built at the intersection of precision and exploration. The void-black canvas is not a backdrop — it is the working environment. The electric-mint accent is the signal: alive, responsive, energetic. Every interaction reveals that something is running, thinking, responding beneath the surface.

The system rejects the legible categories: it is not a terminal (no green-on-black aesthetics, no all-monospace copy), not corporate (no metric tiles, no grid of identically weighted cards), not the warm-minimal of 2026 (no sand tones, no Notion-adjacent quietness), and emphatically not the generic neon-teal portfolio template. The difference from template is not in the accent color — it is in how that color behaves. The teal here earns its place through motion, state, and response.

Tone is calibrated confidence. The portfolio shows depth in AI/ML not by listing tools, but by demonstrating the quality of thinking. The interface itself is evidence. WCAG 2.1 AAA is the accessibility target; all body text must reach ≥7:1 contrast. (Note: `--text-secondary` / `#a0a0a0` on `#000000` is ~3.7:1 — below even AA for normal body text. Labels using `ink-muted` at body size must be bumped toward `#c8c8c8` or higher to meet the AAA baseline.)

**Key Characteristics:**
- Void black as active canvas, not passive void
- Electric-mint is the sole accent; its rarity and reactivity are the point
- All motion is deliberate — every animation reveals state or rewards attention
- Depth through interaction, not through layering (minimal shadows, maximal response)
- Single typeface (Inter) doing all the heavy lifting through weight contrast alone

## 2. Colors: The Signal Palette

A binary palette: absolute darkness anchored by a single energetic accent. The accent owns the interaction layer entirely.

### Primary
- **Electric Mint** (`#64ffda`): The exclusive accent. Hover states, active nav items, text highlights, glow halos, interactive CTAs. Used on at most 10% of any screen at rest. Its rarity makes it mean something.
- **Mint Deep** (`#4ecdc4`): Secondary presence of the accent — used in gradient transitions, hover progressions, and light-mode expression of the same role. Never used simultaneously with Electric Mint on the same element.

### Neutral
- **Void** (`#000000`): The body background. Not a design choice — an environment. Everything that exists on this surface is deliberate.
- **Surface** (`#1a1a1a`): Secondary surfaces. Cards, inputs, secondary panels when tonal layering is needed.
- **Ink Bright** (`#ffffff`): Primary body text and all labels that need maximum contrast.
- **Ink Muted** (`#a0a0a0`): Secondary text — use only for captions, metadata, and large-format labels where 3.7:1 contrast is acceptable by context. **Do not use at normal body text sizes** — fails WCAG AAA and AA. Bump to `#c8c8c8` minimum for body-sized secondary text.

### Named Rules
**The One Signal Rule.** Electric Mint is the only accent. No purple gradients, no orange highlights, no secondary brand colors in the dark theme. Every appearance of the accent is intentional and carries weight. Diluting it with a second accent destroys the hierarchy.

**The AAA Correction Rule.** `#a0a0a0` on void-black fails WCAG AAA for normal text. Secondary body text must use `#c8c8c8` or lighter. The token exists for decorative and large-format use only.

## 3. Typography

**Body Font:** Inter (with -apple-system, BlinkMacSystemFont, 'Segoe UI' fallbacks)

One family, all the way down. No display face, no separate mono stack. The hierarchy lives entirely in weight contrast (400 → 600 → 800) and size scale.

**Character:** Inter's geometric neutrality leans technical — this is correct. The portfolio is for an engineer. The typographic system should feel like someone who chose carefully and then committed: one tool, used with full expertise.

### Hierarchy
- **Display** (weight 800, `clamp(2.5rem, 6vw, 4rem)`, line-height 1.2): Hero headlines only. The name, the primary hook. Maximum three lines.
- **Headline** (weight 600, `clamp(1.2rem, 3vw, 1.8rem)`, line-height 1.3): Section titles, project names, career entries.
- **Body** (weight 400, `clamp(1rem, 2.5vw, 1.3rem)`, line-height 1.7): All descriptive copy. Line length capped at 65–75ch.
- **Label** (weight 400, `0.75rem`, line-height 1.4): Dock tooltips, metadata chips, small tag text.

### Named Rules
**The One-Family Rule.** Inter is the only typeface. Never introduce a second family — not for "display flair," not for code blocks. If mono is needed for code snippets, Inter has a monospace variant. The constraint is the identity.

**The Weight Ceiling.** Display weight is 800, maximum. Nothing heavier. The scale works because the jump from 400 to 800 is decisive.

## 4. Elevation

The system is primarily flat. Depth is conveyed through tonal contrast (the canvas is void; surfaces are surface-gray), not through shadows. Shadows appear only as a response to state — specifically, the electric-mint glow on hover. This makes the glow meaningful: it signals activation, not decoration.

### Shadow Vocabulary
- **Accent glow** (`0 8px 32px rgba(100, 255, 218, 0.3)`): The primary interactive shadow. Used on primary buttons, hovered profile image, active spotlight cards. Electric-mint in color, so the shadow itself is part of the accent system.
- **Elevated glow** (`0 12px 40px rgba(100, 255, 218, 0.3)`): Used on hover of primary CTA — slightly larger than accent glow. A step up, not a different kind of thing.
- **Ambient micro** (`0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)`): Dock items at rest. Neutral shadow, provides only minimal lift. Not accent-colored.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The accent glow appears only in response to interaction. A shadow that's always visible is decoration; a shadow that appears on hover is feedback. Build the second, not the first.

**The Monochrome Shadow Rule.** The only colored shadow in the system is the accent glow. All ambient shadows are `rgba(0,0,0,X)`. A purple drop shadow or warm-brown halo is a design error in this system.

## 5. Components

### Buttons
The interaction layer is the portfolio's personality. Buttons respond physically.

- **Shape:** Gently rounded (8px radius). Not pill-shaped, not sharp-cornered.
- **Primary:** Electric-mint fill (`#64ffda`), near-black ink text (`#111111`), `12px 24px` padding. The fill is only applied to the primary action.
- **Primary (magnetic CTA variant):** Gradient fill from Electric Mint to Mint Deep, `box-shadow: 0 8px 32px rgba(100, 255, 218, 0.3)`. On hover: glow expands to `0 12px 40px`, and a radial glow blooms from the button center. On click: particle emission. This is the hero CTA treatment — not every button.
- **Secondary / Ghost:** Transparent background, Electric Mint border (2px), white ink text. On hover: fills with Electric Mint, text becomes dark ink.
- **Never:** Outlined-only buttons without hover fill. Never a button that doesn't respond visually to hover.

### SpotlightCard
The primary card component. The spotlight effect is what separates this from a generic card grid.

- **Corner Style:** Prominently rounded (1.5rem / 24px). Softer than the button to differentiate by function.
- **Background:** `rgba(255, 255, 255, 0.05)` — barely-there translucent surface. The void bleeds through.
- **Border:** 1px, `rgba(255, 255, 255, 0.1)`. Whisper-thin. Provides structure without weight.
- **Spotlight:** On hover, a radial gradient (`accent-hover` color) traces the mouse position. Opacity transitions from 0 to 0.6. This is the distinguishing interaction — it should be preserved and refined, not removed.
- **Internal Padding:** 2rem.

### Dock Navigation
The MacOS-inspired bottom bar. Its backdrop blur is the only glassmorphism in the system — permitted here because it's functional (the dock floats above content).

- **Style:** Fixed, bottom-centered. Blurred translucent panel (`rgba(20, 20, 20, 0.8)`, `backdrop-filter: blur(10px)`), 1rem border-radius.
- **Dock item:** 50px × 50px, 10px radius, `card-bg` fill at rest. On hover: `accent-hover` fill, accent-colored border glow.
- **Active state:** Electric Mint border + tint fill + Electric Mint icon color. The active item's color is the only on-screen use of Electric Mint in the nav.
- **Magnification:** Items scale on hover (GSAP/framer-motion driven). The physical response is part of the personality.

### Inputs / Fields
- **Style:** Translucent fill (`rgba(255,255,255,0.05)`), 1px `card-border` stroke, 8px radius.
- **Focus:** Electric Mint border color + accent glow shadow.
- **Error:** Red-spectrum border and label (not yet tokenized; use `#ff6b6b` for error state when implementing).

### MagnetLines (Signature Background)
The interactive SVG field that responds to cursor movement on desktop. Lines rotate toward the cursor position, creating a magnetic field effect.

- **Color:** `var(--magnet-line)` — white in dark mode, black in light mode. Pure contrast.
- **Behavior:** 20×20 grid of lines. Skipped on mobile (performance). This is the hero differentiator for the site; preserve it.
- **Named Rule:** **The Motion Authenticity Rule.** The MagnetLines background only exists because it responds. A static version of the same field would be decoration. If performance constraints require removal, remove it entirely rather than freeze it.

## 6. Do's and Don'ts

### Do:
- **Do** use `#64ffda` (Electric Mint) exclusively as the interaction accent. One color, complete commitment.
- **Do** apply the accent glow (`rgba(100, 255, 218, 0.3)`) as the shadow for all accent-colored interactive elements.
- **Do** ensure all body-weight text meets ≥7:1 contrast (WCAG 2.1 AAA). Use `#ffffff` for primary copy; `#c8c8c8` minimum for secondary body copy on void-black.
- **Do** keep button interactions physical: the primary CTA has glow, perspective shift, and particle response. This tactility is the brand personality in action.
- **Do** apply the SpotlightCard's mouse-tracking radial gradient to every primary card component.
- **Do** preserve the MagnetLines background on desktop. It is the page's most distinctive interaction.
- **Do** use `text-wrap: balance` on h1–h3 headings to prevent awkward orphans at narrower viewports.
- **Do** include `@media (prefers-reduced-motion: reduce)` alternatives for every animation; collapse to crossfades or instant transitions.

### Don't:
- **Don't** use a second accent color alongside Electric Mint in the dark theme. No purple gradients, no gold highlights, no orange on hover.
- **Don't** use dark + neon-teal card grids — the generic AI-developer-portfolio template. The visual identity must break this pattern: the teal is present, but its behavior (spotlight tracking, physical buttons, responsive field) must be unmistakably intentional, not template-default.
- **Don't** use cream, sand, warm-neutral, or any warm-tinted near-white (`oklch L 0.84–0.97, C < 0.06, hue 40–100`) backgrounds. The warmth in this brand is in the interaction, not the canvas.
- **Don't** build a hacker-terminal aesthetic — no all-caps monospace headers, no green text, no blinking cursors as primary navigation.
- **Don't** create a corporate-SaaS layout — no metric tiles, no hero-number templates, no navy/gray palette.
- **Don't** introduce a second typeface. Inter handles all roles through weight contrast. Adding a serif display or a second sans is a distraction.
- **Don't** use `border-left` greater than 1px as a colored stripe on cards, blockquotes, or section markers.
- **Don't** apply gradient text (`background-clip: text` with a gradient). Use solid Electric Mint for accent text.
- **Don't** use `#a0a0a0` (`ink-muted`) for normal body text. It fails WCAG AA and AAA at standard sizes. Decorative and large-format only.
- **Don't** remove the MagnetLines background and replace it with a static geometric pattern. If it must be removed for performance, remove it entirely and let the void canvas stand alone.

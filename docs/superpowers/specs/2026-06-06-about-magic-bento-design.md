# About Section — MagicBento Integration

**Date:** 2026-06-06  
**Branch:** `feature/about-magic-bento`

## Goal

Replace the left-side text block in the About Me section with a `MagicBento` interactive card grid. The bento uses a featured layout (one wide hero card + four smaller cards) with Electric Mint glow effects matching the portfolio design system.

## Files

| File | Action | Notes |
|---|---|---|
| `src/components/MagicBento.jsx` | Create | Generic component from React Bits spec — no content changes |
| `src/components/MagicBento.css` | Create | Component CSS with purple vars replaced by Electric Mint |
| `src/components/AboutBento.jsx` | Create | Thin wrapper — owns Carl's cardData and passes `glowColor` |
| `src/App.jsx` | Modify | Replace `motion.div.about-text` with `<AboutBento />` |
| `src/App.css` | Modify | Override `.about-text` so bento fills left column width correctly |
| `.gitignore` | Done | `.superpowers/` added |

## Card Data (5 cards)

Defined in `AboutBento.jsx`, passed to `MagicBento` as a prop (or hardcoded in the `cardData` array inside `MagicBento.jsx` — see Architecture).

| # | Label | Title | Description | Grid role |
|---|---|---|---|---|
| 1 | AI / ML | Machine Learning | Building intelligent systems | Large — spans full width (2 cols) |
| 2 | Student | Mapúa University | 3rd-year CS, AI specialization | Small |
| 3 | Dev | Full-Stack | End-to-end digital solutions | Small |
| 4 | Hobbies | Gaming & Making | Games, open-source & making things | Small |
| 5 | Drive | Problem Solving | Tackling challenging problems | Small |

## Architecture

### MagicBento.jsx
Copy the component source verbatim from the React Bits spec. The only change: accept a `cardData` prop (defaulting to the original placeholder data) so `AboutBento.jsx` can inject Carl's content without touching the generic component.

### MagicBento.css
Copy the CSS from spec. Replace all purple color values:
- `rgba(132, 0, 255, ...)` → `rgba(100, 255, 218, ...)`
- `--purple-primary` / `--purple-glow` / `--purple-border` → mint equivalents
- Card background `#120F17` → `#0d0d14`
- `--border-color: #2F293A` → matches portfolio border (keep as-is, it's close enough)
- `.magic-bento-card--border-glow:hover` box-shadow → mint glow

### AboutBento.jsx
```jsx
import MagicBento from './MagicBento';

const cardData = [ /* 5 cards above */ ];

const AboutBento = () => (
  <MagicBento
    cardData={cardData}
    glowColor="100, 255, 218"
    textAutoHide={true}
    enableStars={true}
    enableSpotlight={true}
    enableBorderGlow={true}
    enableTilt={false}
    enableMagnetism={true}
    clickEffect={true}
    spotlightRadius={300}
    particleCount={12}
  />
);

export default AboutBento;
```

### Grid Layout
The default `card-grid` uses 4 columns at ≥1024px. Since the bento lives in the left half of the about section (a 2-column layout), override to 2 columns via App.css:

```css
.about-text .card-grid {
  grid-template-columns: repeat(2, 1fr);
  max-width: 100%;
  padding: 0;
}
```

The featured card (card 1) spans both columns. Cards 2–5 fill the 2×2 below. Achieved via nth-child CSS override scoped under `.about-text`:

```css
.about-text .magic-bento-card:nth-child(1) {
  grid-column: 1 / -1;
  aspect-ratio: 16/5;
}
```

### App.jsx Change
Replace:
```jsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  viewport={{ once: true }}
  className="about-text"
>
  <div className="about-text-group">
    ...
  </div>
  <ScrambledText ...>...</ScrambledText>
</motion.div>
```

With:
```jsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  viewport={{ once: true }}
  className="about-text"
>
  <AboutBento />
</motion.div>
```

The `motion.div` wrapper and `about-text` class are kept so the entrance animation and layout positioning are unchanged.

## Props Passed to MagicBento

| Prop | Value | Reason |
|---|---|---|
| `glowColor` | `"100, 255, 218"` | Electric Mint — sole accent per design system |
| `enableTilt` | `false` | Off by default; cards are small in this context |
| `enableMagnetism` | `true` | Subtle card attraction adds life |
| `enableSpotlight` | `true` | Cursor-following spotlight |
| `enableBorderGlow` | `true` | Border traces cursor proximity |
| `enableStars` | `true` | Particle animation on hover |
| `clickEffect` | `true` | Ripple on click |
| `textAutoHide` | `true` | Text clips to card bounds |

## Mobile Behavior

`MagicBento` internally detects mobile (`useMobileDetection`) and disables all animations below 768px. The `about-content` grid already collapses to single column on mobile (per existing App.css media queries), so the bento will stack full-width below the CareerTimeline on small screens — no additional mobile work needed.

## Dependencies

`gsap` is already installed in this project (used by `useProjectAnimations` in App.jsx). No new dependencies.

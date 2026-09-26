# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000 (not 5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build at http://localhost:4173
npm run lint      # ESLint
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the three EmailJS keys:

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

Without these, the contact form will error on submit. All env vars must be prefixed `VITE_` to be accessible in the browser.

## Architecture

This is a single-page portfolio with no router — all sections (home, about, projects, skills, contact) live in one `App.jsx` and are navigated via `scrollIntoView`. The `Dock` component is the nav bar; it calls `scrollToSection` which also updates `activeSection` state for highlighting.

**`src/App.jsx`** — monolithic entry point containing all section JSX, state, and two custom hooks:
- `useProjectAnimations` — manages GSAP-based card entrance/exit when switching between `ml` and `software` project categories. Has a 2-second safety timeout to un-stick `isTransitioning` if GSAP callbacks don't fire.
- `useIsMobile` — aliased from `src/mobile-detection.js`; drives conditional rendering (MagnetLines background is desktop-only; form layout adjusts on mobile).

**`src/components/`** — each component ships with a paired `.css` file. Notable ones:
- `MagnetLines` — interactive SVG background; skipped on mobile for performance
- `DecryptedText` / `ScrambledText` / `TextType` — text animation effects used in section headers
- `CareerTimeline` — timeline in the About section
- `TechStack` / `Certificates` — content components in the Skills section
- `ModelSelectionModal` — modal for the RAG chatbot project that has multiple hosted model variants
- `Loader` — shown for 3 seconds on initial mount before App renders

**`src/utils/validation.js`** — client-side form validation and rate limiting (`checkRateLimit`) for the contact form. Rate limit state is in-memory (resets on page reload).

**`src/mobile-detection.js`** — custom hook (`useMobileDetection`) exported and aliased as `useIsMobile` in App.jsx.

## Theming

Dark/light mode is toggled via `data-theme="light"` on `<html>` and persisted to `localStorage`. CSS variables (`--accent-primary`, `--text-primary`, `--bg-primary`, etc.) drive all theming — define both theme variants in `src/index.css` when adding new colors.

## Deployment

Deployed to Netlify. `netlify.toml` sets `publish = "dist"` and `command = "npm run build"`. Pushing to `main` triggers automatic deploy to [cemmacabales.com](https://cemmacabales.com/). The `public/` directory is copied verbatim into `dist/` — static files like `MacabalesResume1.pdf`, `robots.txt`, and `_redirects` live there.

## Build Notes

- `console.log` calls are stripped by Terser in production builds — debug logging in the source is safe to leave.
- Chunks are manually split in `vite.config.js` (`vendor`, `animations`, `icons`, `email`, `components`, `ui`). If you add a heavy new dependency, consider adding it to `manualChunks`.
- Source maps are disabled in production (`sourcemap: false`).

## Design Context

This project has a full impeccable design system. Read these before any UI work:

- **`PRODUCT.md`** — register (brand), users, purpose, brand personality ("Curious, creative, driven"), anti-references, and 5 design principles.
- **`DESIGN.md`** — visual tokens (colors, typography, elevation, components), Named Rules, Do's and Don'ts. The Creative North Star is **"The Curious Machine"**.
- **`.impeccable/design.json`** — machine-readable sidecar with tonal ramps, shadow/motion tokens, and self-contained component HTML+CSS for the live panel.
- **`.impeccable/live/config.json`** — live mode pre-configured for Vite/React SPA (Vite entry: `index.html`).

Key constraints: Electric Mint (`#64ffda`) is the sole accent. WCAG 2.1 AAA contrast target. Single typeface (Inter). MagnetLines background preserved on desktop. No gradient text, no side-stripe borders, no second accent color.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000 (not 5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build at http://localhost:4173
npm run lint      # ESLint
```

## Environment Variables

The contact form uses **Netlify Forms**, so it needs no keys. `public/__forms.html` declares the `contact` form for Netlify's deploy-time scan; `ContactPanel` posts to it with fetch. Field names must match between the two. Submissions only work on a Netlify deploy (not `npm run dev`); email notifications and form detection are set in the Netlify dashboard. The `subject` field becomes the notification's subject line and `email` its Reply-To.

PostHog analytics needs `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` (dev throws if they're missing; production silently skips analytics). On Netlify they must be scoped to Functions too, since `netlify/functions/chat.js` reads them for AI generation events. `src/posthog.js` is the only import point: it loads `posthog-js` after the boot loader releases and queues calls made before then. Chat events never carry the visitor's messages or the replies.

## Architecture

This is a single-page portfolio with no router — all sections (home, about, projects, skills, contact) live in one `App.jsx` and are navigated via `scrollIntoView`. The `Dock` component is the nav bar; it calls `scrollToSection` which also updates `activeSection` state for highlighting.

**Blog** — real pages beside the one-page home, not routes in it: `blog/index.html` (`/blog/`) and `blog/<slug>/index.html` (`/blog/<slug>/`, always with the trailing slash), listed in `rollupOptions.input` in `vite.config.js`. `scripts/prerender.js` renders each one (from `blogPages` in `src/entry-server.jsx`) straight into `#root`, and `src/blog/mount.jsx` hydrates it. `src/blog/BlogPage.jsx` is the shared frame (`SiteNav page="blog"`, theme, footer); each post's own world (paper, colors, CSS) lives in `src/blog/posts/<slug>/` and loads only there. Posts are listed in `src/blog/posts.js`; a new one also needs its HTML entry, a `blogPages` entry and a sitemap URL.
- Blog code must never import `src/data/portfolio.js`: anything it shares with the home goes in a module listed in the `shared` manual chunk (like `src/data/deni.js`), or the page downloads the home's `ui` chunk.
- Pages morph into each other with cross-document view transitions (`@view-transition` and the names `site-nav`, `tab-bar`, `deni-sky`, `deni-phone`, `deni-copy` in `App.css`). `src/pageReveal.js`, inlined into every page's `<head>` by the `page-reveal` plugin in `vite.config.js`, tags each one `forward` (deeper: home → blog → post) or `back` by path depth. Either way the old page sinks and fades out, then (only once it's gone) the new one fades in rising from below, and a named piece with no partner on the other page moves with it. Browsers without page-to-page view transitions (Firefox, Zen) get the same motion by hand: `pageReveal.js` delays a followed link 220ms behind `html.is-leaving`, and the next page rises in under `html.is-entering`. A followed link sets `html.is-navigating`, which fades in an iOS-style page spinner (`.page-spinner`, rendered by `SiteNav`) if the next page takes a moment. Reduced motion gets a 0.2s cross-fade only. The theme switch's circular reveal is scoped to `:root.is-theming`, which `useTheme` sets, and carries no type. The page-to-page timings are scoped to `:root:not(.is-theming)`, and `useTheme` keeps the class until the transition has finished: dropping it mid-transition restarts the default cross-fade, which flashed the old theme after the reveal. Neither dev mode (Vite injects CSS after the first render) nor the desktop app's browser pane runs the page-to-page morph: check it in a production build in real Chrome.
- Each page's `<script type="speculationrules">` prerenders `/blog/*` on hover and only prefetches `/` (prerendering the home would start its WebGPU field). A prerendered page runs its scripts, so `loadPostHog` waits for `prerenderingchange`. Any DevTools session (CDP included) disables prerendering (`PrerenderingDisabledByDevTools`), so test it without one.

**`src/App.jsx`** — monolithic entry point containing all section JSX, state, and two custom hooks:
- `useProjectAnimations` — manages GSAP-based card entrance/exit when switching between `ml` and `software` project categories. Has a 2-second safety timeout to un-stick `isTransitioning` if GSAP callbacks don't fire.
- `useIsMobile` — aliased from `src/mobile-detection.js`; drives conditional rendering (MagnetLines background is desktop-only; form layout adjusts on mobile).

**`src/components/`** — each component ships with a paired `.css` file. Notable ones:
- `MagnetLines` — interactive SVG background; skipped on mobile for performance
- `DecryptedText` / `ScrambledText` / `TextType` — text animation effects used in section headers
- `CareerTimeline` — timeline in the About section
- `TechStack` / `Certificates` — content components in the Skills section
- `ModelSelectionModal` — modal for the RAG chatbot project that has multiple hosted model variants
- Boot loader — not a component: its markup and styles are inline in `index.html` so it paints before any JS, and `src/boot.js` holds it until the hero's real dependencies are ready (React's first commit, the web font, decoded hero photos and Centient screens, the WebGPU field's first frame), capped at 4s after the app starts. It plays once a visit: release sets `sessionStorage['boot-seen']`, and after that the head script adds `is-warm`, which hides the loader, keeps the prerendered nav and tab bar for the first frame (so a page arriving from the blog has them to morph into) and makes the stylesheets block render. Warm, `boot.js` lets go on React's first commit. Replacing a named element mid-transition aborts it, so at `pagereveal` the prerendered nav and tab bar move out of `#root` (`data-held`) and React's own stay hidden and unnamed until `boot.js` removes the held ones once the transition is over; React can commit mid-flight. The whole page change (`vt-leave` and `vt-enter`) is paused on the old page until this one is in (at most 1.5s), and framer-motion's `MotionGlobalConfig.instantAnimations` is on until the change finishes, so the hero and any section reveal land at once and the page rises in whole; the spinner (named `page-spinner`, held like the nav) shows if the wait passes 0.7s. A warm visit opening on a section imports `BelowFold` in `main.jsx` before the first render, because a lazy section is held behind its fallback for React's ~300ms minimum. The Firefox fallback moves only `#root > :is(main, footer)`: the skip link hides by transform, and moving it showed it. Anything that moves on its own in the first screen should wait on `useBooted()`. (`src/components/Loader` is the old fixed 3-second one and is unused.)

**`src/utils/validation.js`** — client-side form validation and rate limiting (`checkRateLimit`) for the contact form. Rate limit state is in-memory (resets on page reload).

**`src/mobile-detection.js`** — custom hook (`useMobileDetection`) exported and aliased as `useIsMobile` in App.jsx.

## Theming

Dark/light mode is toggled via `data-theme="light"` on `<html>` and persisted to `localStorage`. CSS variables (`--accent-primary`, `--text-primary`, `--bg-primary`, etc.) drive all theming — define both theme variants in `src/index.css` when adding new colors.

## Deployment

Deployed to Netlify. `netlify.toml` sets `publish = "dist"` and `command = "npm run build"`. Pushing to `main` triggers automatic deploy to [cemmacabales.com](https://cemmacabales.com/). The `public/` directory is copied verbatim into `dist/` — static files like `MacabalesResume1.pdf`, `robots.txt`, and `_redirects` live there.

## Build Notes

- `console.log` calls are stripped by Terser in production builds — debug logging in the source is safe to leave.
- Chunks are manually split in `vite.config.js` (`vendor`, `animations`, `icons`, `email`, `analytics`, `components`, `ui`). If you add a heavy new dependency, consider adding it to `manualChunks`.
- Source maps are disabled in production (`sourcemap: false`).

## Design Context

This project has a full impeccable design system. Read these before any UI work:

- **`PRODUCT.md`** — register (brand), users, purpose, brand personality ("Curious, creative, driven"), anti-references, and 5 design principles.
- **`DESIGN.md`** — visual tokens (colors, typography, elevation, components), Named Rules, Do's and Don'ts. The Creative North Star is **"The Curious Machine"**.
- **`.impeccable/design.json`** — machine-readable sidecar with tonal ramps, shadow/motion tokens, and self-contained component HTML+CSS for the live panel.
- **`.impeccable/live/config.json`** — live mode pre-configured for Vite/React SPA (Vite entry: `index.html`).

Key constraints: Electric Mint (`#64ffda`) is the sole accent. WCAG 2.1 AAA contrast target. Single typeface (Inter). MagnetLines background preserved on desktop. No gradient text, no side-stripe borders, no second accent color.

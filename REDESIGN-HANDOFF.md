# Bento redesign handoff

Written 2026-09-26 at the end of the session that built the redesign. Read this first, then `PRODUCT.md`. Treat `DESIGN.md` with care: it still describes the **old** dark design (see "Stale docs" below).

## State

- **Branch:** `redesign/bento` (cut from `main` at `0fee8d2`). **Nothing is committed yet.** All work is uncommitted in the working tree. Commit it before experimenting.
- **Build:** `npm run build` passes. ESLint is clean on every file this session touched. `npx eslint src` still reports errors in old, now-unimported components (`Loader`, `Dock`, `TechStack`, `Certificates`, `CareerTimeline`, `DecryptedText`, `TextType`, `ScrollThread`, `TiltCard`) and a parse error in `netlify/functions/chat.js` (ESLint treats it as a script, which is a config quirk and was already there).
- **Deploy:** not pushed. Pushing to `main` auto-deploys to cemmacabales.com, so merge deliberately.
- **Dev server:** `npm run dev` on port 3000. `.claude/launch.json` defines `portfolio-dev` for the in-app browser.

## What the brief was

Carl showed a Hostinger portfolio template (light gray canvas, white rounded tiles, pill nav, one saturated tile, a project list with thumbnails, a dark contact block) and asked for:
1. The **design method**, not a copy: minimal, bento, easy on the eyes.
2. Apple **liquid glass** touches.
3. After seeing round one: **rearrange the bento** so it doesn't mirror the template, present him as an **AI + software engineer**, and make **Centient** (his $5,000 Instawards grant project) **project #1 and the highlight**.

He approved the current state as "looks good for now" and wants to keep refining style in a new session.

## Page structure (single page, no router)

`src/App.jsx` composes the page from these components (each has a paired `.css`):

| Section | Component | What's in it |
|---|---|---|
| Nav | `SiteNav.jsx` | Floating glass bar: name pill, `Work / About / Contact` capsule with a sliding **lens** (the liquid-glass selection that glides between items), theme toggle. On ≤760px the links move to an iOS-style **bottom glass tab bar**. |
| `#home` | `HeroBento.jsx` | 12-col bento. Row 1: **main tile** (headline + inset portrait, MagnetLines field behind the copy) and a side column (mint **Ask my assistant** tile, **CV** download, **GitHub**). Row 2: full-width **Centient feature tile** (grant pill, pitch, stack chips, "Try the beta" / "Read the case study", product screenshot bleeding off the corner). Row 3: **About** + **What I work on** (AI & ML / Software engineering pill groups). |
| `#work` | `WorkList.jsx` | "Selected work (07)" list: index, thumbnail, name, category/year, plus toggle. A row expands in place into a tile with image, summary, metrics, tech, and links. Centient is row 01 with a "Featured" flag. |
| `#about` | `BackgroundBento.jsx` | "Background" bento: **Software I've shipped** (Centient, Pink Raft, iPrayUST), Education, Research (2 IEEE papers + ICIPCN certificate image), Tools (monochrome icon grid that tints to brand color on hover), Certificates, live **Local time** in Quezon City. |
| `#contact` | `ContactPanel.jsx` | Dark tile: headline, email pill + GitHub/LinkedIn/phone circles, single-step form (name, email, subject, message) with inline errors, footer strip with the cookie line and back-to-top. |
| Overlays | `AiChatbot.jsx`, `ModelSelectionModal.jsx`, `GradualBlur.jsx` | Chat restyled with a glass launcher. The model picker gained Escape-to-close and focus handling. GradualBlur is kept at the top only, as an iOS-style scroll-edge blur under the nav. |

All copy and project data live in **`src/data/portfolio.js`** (`profile`, `disciplines`, `featured`, `projects`, `education`, `shipped`, `research`, `certificates`, `stack`). Edit content there, not in components.

Hooks in `src/hooks/`: `useTheme` (light/dark + circular View Transition reveal from the toggle), `useScrollState` (active section + scrolled flag, one rAF listener), `useGlassSheen` (cursor-following highlight on `.glass[data-sheen]`), `useLocalTime`. `src/utils/assistant.js` exposes `openAssistant()`, which fires a window event the chatbot listens for.

## Design system as built

- **Theme:** light by default (a hiring manager on a laptop in a bright office). Dark mode is opt-in via the toggle. The choice is stored under localStorage key **`theme-v2`**; the old key `theme` was abandoned on purpose because the old site wrote it on every visit. An inline script in `index.html` applies the theme before first paint. The attribute is `data-theme="light" | "dark"` on `<html>`, always set explicitly. This differs from what `CLAUDE.md` says, so update that line.
- **Tokens:** `src/index.css`, in OKLCH. Neutrals are tinted toward the mint hue (175). Key tokens: `--canvas`, `--tile`, `--tile-sunk`, `--line`, `--line-strong`, `--ink`, `--ink-2`, `--accent`, `--mint` (#64ffda, the one saturated color), `--mint-ink`, `--inverse*` (contact tile), `--glass-*`. Contrast was checked: `--ink-2` is ≥7:1 on tiles and canvas in both themes (AAA), and `--mint-ink` on mint is 10.6:1.
- **Type:** `-apple-system` first (SF Pro on Apple devices), then self-hosted **Inter Variable** (`@fontsource-variable/inter/opsz.css`, imported in `main.jsx`). The CSP only allows self-hosted fonts, so don't add Google Fonts links.
- **Cascade layers (important):** `@layer reset, primitives;`. The reset lives in `index.css`, and all shared primitives (`.shell`, `.tile`, `.btn*`, `.pill`, `.glass`, `.chip`, section heads) live in `App.css` inside `@layer primitives`. Component CSS is **unlayered**, so it always wins regardless of load order. Without this, `.glass { position: relative }` was overriding component positioning. Keep new shared primitives inside the layer.
- **Liquid glass:** `.glass` = blur(22px) + saturate(185%) + translucent fill + a gradient rim (`::before`, mask trick) + an optional cursor sheen (`::after`, add `data-sheen`). It's used only on things that float: nav pieces, chips over images, the chat launcher. It has solid fallbacks for missing `backdrop-filter` support and for `prefers-reduced-transparency`. It's labeled in code as an approximation (Apple doesn't ship a web material).
- **Corners:** 28px tiles, with `corner-shape: squircle` as progressive enhancement (Chromium only). Inset media uses `radius - 10px`.
- **Motion:** Framer Motion, with `<MotionConfig reducedMotion="user">` wrapping the app. Hero tiles rise with a blur pull, the headline reveals word by word, sections reveal on view, the nav lens moves on a spring, the token bars stream only on hover, and the theme switch is a circular reveal. Every CSS animation has a `prefers-reduced-motion` alternative.
- **MagnetLines:** rewritten for performance (line centers cached in page coordinates, rAF-throttled, angle continuity so the eased rotation never spins the long way). It now lives inside the main tile, desktop only. Touch devices get a static dot grid instead.
- **z-index scale:** `--z-blur 130`, `--z-nav 200`, `--z-chat 300`, `--z-modal 400`.

## Content facts and sources (don't invent beyond these)

- **Centient** (from `~/centient`: README, CONTEXT.md, brag share copy). A human-feedback labeling platform where contributors rank AI answer pairs and are paid in USDC on Stellar per accepted answer. It has quality guards (gold tasks, rate limits, spam and bias detection, agreement checks) and co-signed payouts from a multisig account. The Withdraw button was removed because 8 of 10 balances were stuck under the old 1 USDC minimum. **$5,000 Instawards grant** (Carl's figure). Beta: https://beta.centient.work (returns 200). Repo: https://github.com/cemmacabales/centient (public). Stack: Next.js, TypeScript, PostgreSQL/Prisma, Stellar SDK, Redis, Railway. The site deliberately doesn't name the grant's parent program or claim Carl built it solo; confirm with him before adding either.
- **Assets added:** `src/assets/centient-payout.jpg` (cropped from `~/centient/brag-output-2026-09-23-191123/brag.jpg`) and `src/assets/centient-owl.png` (from `~/centient/public/logo.png`).
- **Pink Raft, iPrayUST, papers, metrics:** from `resume.md` and `netlify/functions/chat.js`.
- **Graduation:** Carl graduated from Mapúa in 2026, so the copy says so plainly (a recent commit removed "class of 2026" phrasing from the chatbot).

## Behavior changes beyond visuals

- The **chatbot system prompt** (`netlify/functions/chat.js`) gained a Centient section. This changes the live assistant when deployed.
- The **Edge Exercise Coach** source link now points to `github.com/cemmacabales/pose_est_v2`, because `pose-estimation-classifier` returns 404.
- The **contact form** is now single-step. Every `alert()` is gone, errors are inline, and focus moves to the first invalid field. `validation.js` now accepts accented and Unicode names, keeps line breaks in messages, and uses friendlier error copy. The old form also trimmed input on every keystroke, which made spaces impossible to type; that's fixed.
- **The form still can't send.** The `VITE_EMAILJS_*` keys are missing from `.env` (it only has `GROQ_API_KEY`) and from Netlify. With them missing, Vite folds the send path away and the form shows "The form can't send right now. Email me at …". Add the three keys to `.env` and Netlify, then rebuild.
- **Removed from the page:** the 3-second `Loader`, the bottom `Dock`, the category toggle, `DecryptedText`/`ScrambledText` headers, and the `mobile-fixes.css` / `css-compatibility-fixes.css` links in `index.html` (they only patched old classes). The old component files still exist, unused. Delete them in a cleanup pass if Carl agrees.
- `index.html`: pinch-zoom is re-enabled (`user-scalable=no` removed), `color-scheme` is now `light dark`, and theme-color updates with the theme.
- `vite.config.js` `manualChunks` now lists the new components.

## Verified vs. not verified

Verified in the in-app browser at 1440×900 (light and dark) and 375×812: hero, feature tile, row expansion, Background, contact, glass nav lens, and the mobile tab bar.

Not verified, or verified only partially:
- The last two CSS tweaks weren't re-screenshotted: the mobile crop of the Centient screenshot (`.featured-shot` at ≤760px) and the stacked name/role on mobile.
- Tablet widths (761–1279px) were never screenshotted; the layouts exist in CSS.
- The theme View Transition reveal, smooth-scroll from "Read the case study", and the pointer sheen were only exercised through JS. The preview pane's simulated clicks and smooth scrolling are unreliable (it only paints when a screenshot is taken), so check these in a real browser.
- Safari and Firefox weren't tested (`corner-shape` degrades to plain rounded corners; `:has()` and cascade layers are supported).

## Stale docs to fix first

1. **`DESIGN.md` and `.impeccable/design.json` describe the old void-black, dark-first system.** Impeccable reads them at the start of every session, so regenerate them from the code first (`/impeccable document`), or the next pass will pull back toward the old look.
2. **`CLAUDE.md` / `AGENTS.md`:** the theming line (`data-theme="light"` only), the component list (Dock, Loader, DecryptedText…), and the "3-second loader" note are out of date.
3. The `index.html` canonical/OG URLs still point at `cemmacabales.tech`, but the site moved to `cemmacabales.com`.

## Ideas for the style pass (not requested yet, just candidates)

- The mint assistant tile has generous empty space at 1440px; it could carry a sample question or two.
- The feature tile's screenshot could get a subtle parallax or tilt on pointer move.
- Tighten the tablet layouts once they've been looked at.
- Consider `@view-transition` or scroll-driven reveals to replace some Framer on-view reveals.
- Run `/impeccable critique` against the new surface to get a fresh score (the last snapshot, 22/40, is for the old design).

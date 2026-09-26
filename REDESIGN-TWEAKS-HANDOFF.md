# Redesign tweaks handoff (round 2)

Written 2026-09-26. Carl reviewed the bento redesign and asked for seven tweaks. This file tells the next session what to change and where.

Read in this order:
1. This file.
2. `REDESIGN-HANDOFF.md`: page structure, design system, content facts. Two parts of it are now stale; see "Corrections" below.
3. `PRODUCT.md`.

## Git and workflow

- **Base:** `feat/redesign` (commit `f49f220`, "feat: portfolio redesign"). Carl committed and pushed the whole redesign there.
- **Work branch:** `feat/redesign-tweaks`, cut from `feat/redesign`. This handoff is its first commit. Do all the tweaks on this branch.
- **When done:** push, then open a PR from `feat/redesign-tweaks` into `feat/redesign`. **Never merge; Carl merges.** Never push to `main`, because it auto-deploys to cemmacabales.com.
- **Commits:** author and committer must be `cemmacabales <carlmacabales31@gmail.com>`. No `Co-Authored-By` lines, no AI or agent trailers, no other co-authors.
- **Checks before pushing:** `npm run build`, ESLint on every file you touched (`npx eslint <files>`; the full `npx eslint src` has known old errors, listed in `REDESIGN-HANDOFF.md`), and screenshots at 1440×900 (light and dark), about 1024 wide, and 375×812. Also check that reduced motion works: every new animation needs a `prefers-reduced-motion` fallback, and Framer respects `<MotionConfig reducedMotion="user">`.

## Corrections to `REDESIGN-HANDOFF.md`

- The branch is `feat/redesign`, not `redesign/bento`, and the work **is** committed (`f49f220`). Ignore "Nothing is committed yet."
- Its "Stale docs" section still applies: `DESIGN.md`, `.impeccable/design.json`, `CLAUDE.md`, and `AGENTS.md` describe the **old** dark design. Don't let them pull the look back to void-black. Fixing them is out of scope this round unless Carl asks.

## The seven tweaks

Carl's words are quoted. Line numbers are from `f49f220`.

### 1. Zoom the portrait out a little

> "picture is too near my face haha can you zoom out a bit? just a bit"

- **Where:** `src/components/HeroBento.css:165-180` (`.main-photo`, `.main-photo img`); mobile rule at about `:605` (`.main-photo { aspect-ratio: 1 / 1 }`).
- **Why it reads close:** `src/assets/me.jpeg` is 1320×1365, almost square. On desktop the main tile is split `1.4fr / 1fr` (`HeroBento.css:38`), so the photo box is a tall portrait (roughly 360×540 at 1440 wide). `object-fit: cover` fills the height and crops the sides, which makes the face feel big.
- **Approach:** the photo's edges are a near-black studio backdrop (top and sides) and a black gown (bottom), so the image can be scaled down inside the frame over a matching near-black fill without a visible seam. `.main-photo` already has `background: oklch(0.16 0.004 175)`; match it to the photo's edge color. Examples: `object-fit: contain` with a small `object-position` nudge, or keep `cover` and `scale(0.88–0.92)` with `transform-origin` at top center. Another option is to widen the photo column slightly (for example `1.4fr` to `1.25fr`). Keep the change subtle ("just a bit"), and don't cut off the mortarboard/hair or the medal.
- **Don't** swap in the older `me.jpeg` from git history (`2e23907`); it's a different photo (barong, not the graduation portrait).
- **Done when:** his head and shoulders sit with more breathing room on desktop, tablet, and mobile, and no letterbox edge is visible in light or dark theme.

### 2. Rework the CV tile so it doesn't copy the template

> "cv looks too similar to the inspiration. maybe not use 'CV'? change it"

- **Where:** `src/components/HeroBento.jsx`, the `tile-cv` block (giant `CV` wordmark `.cv-mark` plus a Download button); CSS at `HeroBento.css:295-317`.
- **Direction:** drop the giant "CV" letters, which is the Hostinger template's move. Give the tile its own identity. Options:
  - a small preview of the résumé's first page that lifts or tilts on hover, with a label like "Résumé" and a meta line (for example "PDF · updated Sep 2026");
  - a document glyph with a page-flip micro-animation.

  Keep it quiet, since it's a small tile next to GitHub.
- **Keep:** the download behavior (`profile.resume` = `/MacabalesResume1.pdf`, `download="Carl-Macabales-CV.pdf"`) and the accessible label. Update the visually hidden text if the visible wording changes.
- **Check the facts** (page count, date) against the actual PDF before printing them on the tile.

### 3. Remove the "Featured" flag in Selected work

> "remove featured to centient in selected work"

- **Where:** `src/components/WorkList.jsx:48` (`{project.featured && <span className="work-flag">Featured</span>}`) and `.work-flag` in `src/components/WorkList.css:85`.
- Remove both. `project.featured` is only read there, so drop `featured: true` from `projects[0]` in `src/data/portfolio.js` too.
- **Leave the hero's "Featured project" label** on the Centient tile alone; that's the hero, not Selected work.

### 4. Centient visual: a slideshow of real screens, starting with the homescreen

> "change the picture of centient. better to use homescreen and make it animation slide use different screens for centient."

- **Where now:** one image, `featured.image` = `src/assets/centient-payout.jpg` (the "+0.25 USDC on its way" toast). It renders as `.featured-shot` inside `.featured-visual` at the bottom of `HeroBento.jsx`. CSS is at `HeroBento.css:473-505`, responsive rules at `:577-586` and `:630-635`, and the reduced-motion block at `:662-679`. The same image is also the Centient thumbnail and expanded image in `WorkList` (via `projects[0].image`).
- **Build:**
  - Add `featured.screens: [{ src, alt }]` to `src/data/portfolio.js`, with the **homescreen first**.
  - Make a small carousel component that auto-advances every ~3.5s with an Apple-style transition (crossfade plus slight scale/blur, or a horizontal slide on a spring). Put the screens in a device frame if they're phone screens.
  - Pause on hover and focus, and when the tile is offscreen (IntersectionObserver). Show dots or a progress indicator, and give each screen real alt text.
  - Under reduced motion, show the homescreen static.
  - Use the homescreen as the WorkList thumbnail too.
- **Screens needed:** none exist in this repo, and the Centient repo has none either (only the logo, mascots, and `og-image.png`). Capture them from https://beta.centient.work (testnet), using a mobile viewport (390×844 at 2x DPR), and save them as WebP of about 150 KB or less in `src/assets/centient/`. Candidate screens, named after the Centient components:
  - landing/homescreen (`InAppLanding`)
  - onboarding (`OnboardingScreen`)
  - ranking two AI answers (`TaskCard`)
  - the payout toast (current `centient-payout.jpg`)
  - earnings/account (`EarningsBadge`, `AccountSheet`)
  - payout setup (`PayoutSetup`)

  Use a demo account, and don't show anyone's real email or wallet address.
- **Heads-up:** in cloud sessions the egress proxy blocked `beta.centient.work`, so capture locally, or ask Carl to drop the screenshots into `src/assets/centient/`.

### 5. Animate "What I work on", Apple-style, using the skills

> "what i work on tab is too static. make it animated. use skills. i like this to be more apple styled"

- **Where:** `src/components/HeroBento.jsx`, the `tile-skills` block. It renders `disciplines` from `src/data/portfolio.js:49-71` as two static pill groups: "AI & machine learning" (5 items) and "Software engineering" (6 items). CSS is at `HeroBento.css:523-544`.
- **Use the skills first:** before designing, read `.agents/skills/high-end-visual-design/SKILL.md`, `.agents/skills/design-taste-frontend/SKILL.md`, and `.agents/skills/redesign-existing-projects/SKILL.md`, and apply them. Also use `impeccable` if it's installed in the session.
- **Direction:** pick **one** motion idea and do it well. Candidates:
  - **Segmented control** (AI & ML | Software) using the same liquid-glass lens as the nav (`SiteNav.jsx`, `LENS_SPRING = { stiffness: 460, damping: 38, mass: 0.9 }`). Pills re-flow with Framer `layout` and a staggered blur-in, auto-cycling every few seconds until the visitor interacts.
  - **Two marquee rows** drifting in opposite directions with soft edge-fade masks. They pause on hover and are static under reduced motion.
  - **A keynote-style word rotator:** one large line ("I work on …") whose last word cycles through the items with a vertical blur/slide.
- Reuse the existing easing `[0.16, 1, 0.3, 1]`. Content comes from `disciplines` only; don't invent skills.

### 6. Fill the empty space under Education and Tools

> "for tools i reach for and education. theres a big white space under it since its matching the bento beside it. it looks ok, but add something there to make it not blank. something that can look cool and pleasing as well. probably a filler with animation or so?"

- **Where:** `src/components/BackgroundBento.jsx`; grid at `src/components/BackgroundBento.css:1-9`:
  - Row 1: `Software I've shipped` (7 cols) + `Education` (5)
  - Row 2: `Tools I reach for` (7) + `Research` (5, has the ICIPCN certificate image)
  - Row 3: `Certificates` (8) + `Local time` (4)

  Education and Tools stretch to match their taller neighbors, which leaves a blank band at the bottom of each.
- **Build:** a decorative filler at the bottom of each tile that takes the leftover height (`margin-top: auto; flex: 1; min-height: 0`), `aria-hidden`, animated, and calm. Ideas:
  - **Education:** a thin path from St. Paul (2021–2023) to Mapúa (2023–2026) with a slow traveling glow dot, or a line-art mortarboard drawing itself on view.
  - **Tools:** a slow marquee or orbit of the monochrome tool glyphs that already exist in `stack` (20 items), or a terminal line that types `npm run build` and then `✓ built`.
- It must disappear gracefully when there's no spare height (tablet and mobile, where tiles stack). Use a container query, or hide it below the breakpoint. Static under reduced motion. Use mint as the only accent.

### 7. Give Local time more color

> "add more color to local time just to make it pop off more"

- **Where:** `ClockTile` in `src/components/BackgroundBento.jsx` (uses `useLocalTime` and `dayPart(hour)`); CSS at `BackgroundBento.css:246-279`. It's currently plain ink on a white tile.
- **Direction:** make it the colorful tile. Options:
  - a sky gradient that follows the time of day in Manila (dawn, day, dusk, night, driven by `hour`);
  - a small sun or moon moving along an arc by hour;
  - a softly blinking colon.

  At minimum, make it a mint-filled tile like "Ask my assistant".
- **Constraints:**
  - The docs' "mint is the only accent" rule gives way here because Carl asked for more color, but keep the extra color inside this tile.
  - Text must stay ≥7:1 contrast (AAA) in both themes; check dark mode.
  - `useLocalTime` only ticks once a minute; if you add seconds or a blinking colon, keep it cheap and stop it under reduced motion.

## Out of scope unless Carl asks

- The EmailJS keys (the form still can't send), deleting old unused components, regenerating `DESIGN.md`, and the `cemmacabales.tech` to `.com` canonical fix. They're all listed in `REDESIGN-HANDOFF.md`.

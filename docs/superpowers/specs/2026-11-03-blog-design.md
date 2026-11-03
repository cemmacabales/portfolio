# Blog: design

Date: 2026-11-03. Status: boards approved with every recommended pick ("Yes, use the picks"). Boards: `docs/design/blog/boards.html` (open it through the dev server: `/docs/design/blog/boards.html`).

## Why

Carl wants a blog where each post feels like its own project, not a template. The first post is the story of Deni. Hiring managers and collaborators skim the home page in under two minutes; the blog is where someone who wants depth goes next, and where a LinkedIn share can point.

## What Carl decided

| | Decision |
|---|---|
| Where it lives | Real pages at `/blog/` and `/blog/deni/`, next to the one-page home. Not a screen inside the home, not a router in `App.jsx`. |
| Moving between pages | Cross-document view transitions. The nav holds still; Deni's sky and phone fly between the home's hero, the index cover and the post's hero. |
| Nav label | **Blog**, between About and Contact. A fifth tab on phones. |
| Hero button | Deni's "Read the case study" becomes **Read the story**, linking to `/blog/deni/`. Deni's work row gets the same button. |
| Colors | Inside a post, the post's world replaces mint. The nav keeps the site's look. This bends DESIGN.md's one-accent rule inside posts only. |
| Title | **Deni was supposed to be just for my dad.** |
| Words | Claude drafts from Carl's LinkedIn caption, the meditrack specs and the git history; Carl edits. Professional but casual, nothing overstated. |

## Goals

- `/blog/` lists posts as covers, each drawn in its post's world. Deni's cover sky follows the reader's clock, using Deni's own hours.
- `/blog/deni/` reads as one day in four chapters, each with its own sky:
  - 01 Morning: Why it exists
  - 02 Afternoon: Foil and sky
  - 03 Evening: Everything stays on the phone
  - 04 Night: Shipping it
- The post's contents is a pearl foil pack. A chapter's blister presses in once the reader has finished it. When all four are in, one slow sweep of light crosses the foil, once.
- Each page is prerendered: crawlers and no-JS readers get the whole post; JS readers see it at once and React hydrates it.
- The home's speed holds: its code path stays the same except for the nav, two buttons and transition CSS.

## Non-goals

- No MDX or CMS. Posts are JSX, so a chapter can hold live pieces of its project.
- No comments, tags pages, RSS, search, or pagination. One post.
- No chatbot, typing test, boot loader or WebGPU field on blog pages.
- No sheet for the phone's chapter strip: its blisters are the links.

## Anti-goals (would be failures even if it works)

- A post that could be any project's post: generic cards, a mint-on-gray article.
- Claims Carl never made: health outcomes, invented motives, usage numbers.
- Text on the sky below AAA contrast.
- Breaking the home: the theme switch's circular reveal, the boot loader, prerender, or the PSI 94.
- Apple's rings, the Apple logo, or the Health app's look anywhere in the Deni post.

## The frame (same on every post)

- `SiteNav` with a `page` prop. On the home nothing changes but the new Blog link. On blog pages the lens rests on Blog and the links point to `/#work`, `/#about`, `/#contact`, the brand to `/`.
- Same type (`--font-sans`), tokens, theme toggle, `GradualBlur` under the nav, skip link.
- Post header: "All posts", title, dek, byline (Carl Macabales · date · reading time).
- Reading column: max 64ch, 20px/1.65 on desktop, 18px on phones.
- Footer: All posts, Back to my work.
- AAA contrast in both themes. Reduced motion: no morphs (plain cross-fade), no blister press, no sweep.

## Deni's world (only on `/blog/deni/`)

- **Paper.** Light: pearl `#F3F5FA`. Dark: night ink `#0D1124`. `body.world-deni` overrides `--canvas`, so the nav blur and page match.
- **Ink.** Light `#141B2D`, secondary `#4A5164` (7.3:1 on pearl). Dark `#E6E9F3`, secondary `#B4BBCE`.
- **Accent.** Deni blue `#2F6BF2` for fills; links use `#1C44AE` (7.7:1 on pearl) in light and `#9DB7FF` in dark. Rose `#E8445A` only on the capsule.
- **Skies** (Deni's hours: morning 5 AM–noon, afternoon noon–5 PM, evening 5–10 PM, night 10 PM–5 AM). The hero and chapter openers use them. Text on a sky is white and sits only where the sky is dark enough for 7:1 (body size) or 4.5:1 (24px and up).
- **Foil.** Pearl foil gradient for the pack and the end card; graphite in dark.
- **Numerals.** Thin (weight 200), "2 of 4", like the app's "3 of 5".
- **Motion.** From the app: a read chapter's blister presses in and its pill drops out (≈450ms, ease-out). The finish sweep runs once over 1.6s. No springs, no confetti.
- **Material on the page.** The Foil and sky sheet, CSS iPhones with real screens (Add, Today, Journal, Report), a card of the data rules on evening sky glass, the build log as one blister per day (never rings), the 1:48 film in the shared `FilmPlayer`, the App Store link.

## Moving between pages

- `@view-transition { navigation: auto; }` on the home and blog pages.
- Named groups: `site-nav` and `tab-bar` (static, every page), `deni-sky` and `deni-phone`.
  - Home: named only when "Read the story" in the hero is clicked (a `vt-deni` class on the featured tile), and cleared on `pageshow`. A click from the work row names nothing; the nav holds and the page cross-fades.
  - Index: the Deni cover's sky and phone carry the names.
  - Post: the hero's sky and phone carry the names.
- Root cross-fade 0.35s; named groups 0.5s on `--ease-out`.
- The theme switch keeps its circular reveal: `useTheme` puts `is-theming` on `<html>` for the length of its transition. The reveal CSS is scoped to `:root.is-theming`, and named groups are switched off during it.
- Reduced motion: every name is `none`, so only the cross-fade plays.
- Arriving on the home from a blog page skips the boot loader's 400ms minimum (the files are cached). The loader still waits for the hero's real work.

## Index (`/blog/`)

- Head: "Blog", "How the work got made.", "Why each project exists, what I tried, and what shipped."
- Deni's cover: a large tile, sky on one side with two phones (Today, Insights), words on the other: icon, "Deni · iPhone app", date and reading time, title, dek, three tags.
- The sky follows the reader's clock. An inline head script sets `data-sky` on `<html>` before first paint, and CSS picks the sky and its label ("Evening sky, like Deni at this hour"), so the prerender and hydration agree.

## Build and delivery

- Vite multi-page: `index.html`, `blog/index.html`, `blog/deni/index.html`.
- Manual chunks change so blog pages never download the home's `ui` or `gpu` chunks or GSAP: a `shared` chunk (nav, theme, film player, blur, Deni's shared data) before `ui`, and GSAP split from framer-motion.
- The async-CSS plugin only rewrites the home's `index.html`; blog pages keep blocking CSS, since their HTML is the page.
- `scripts/prerender.js` renders all three pages. Blog markup goes straight into `#root` (visible). The hero phone is `fetchpriority="high"` and not lazy.
- Blog entries hydrate with `hydrateRoot` when `#root` has markup, and `createRoot` in dev. PostHog loads in an idle moment after load.
- `sitemap.xml`, `llms.txt`, and JSON-LD (`Blog`, `BlogPosting`) list the posts. An OG image (1200×630 JPG) for the Deni post.
- URLs end in a slash, so Netlify serves `blog/deni/index.html` without a redirect.

## Left to the builder

- Exact sky stops, as long as text contrast holds.
- Breakpoints for the rail versus the strip (rail from 1100px).
- Paragraph wording within the facts listed in the plan; Carl edits it after.

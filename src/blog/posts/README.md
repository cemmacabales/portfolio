# Building a post

A post is one project's story told in that project's own world. The site
gives the frame: `BlogPage` brings the nav, theme toggle, blur under the nav,
footer, Inter and the reading measure. Everything inside `<main>` belongs to
the post: its paper, ink, accent, motifs and motion, taken from the project
itself. Deni (`deni/`) is the reference: read it before starting another.

## What a post is made of

For a post with slug `<slug>` (lowercase, one word if it can be):

| File | What it holds |
|---|---|
| `blog/<slug>/index.html` | The page itself. Copy `blog/deni/index.html`, then change the title, description, canonical, Open Graph and Twitter tags, `article:published_time`, `theme-color`, the JSON-LD, the body class and the script path. Keep the theme head script and the speculation rules as they are. The `page-reveal` plugin adds the page-change script by itself. |
| `public/blog/<slug>/og.jpg` | The share image, 1200 × 630. |
| `src/blog/posts/<slug>/meta.js` | What the index and the post both say: `slug`, `href` (`/blog/<slug>/`, always with the trailing slash), `title`, `dek`, `date` (ISO), `readMinutes` (the post's words over 230, rounded up), `project`, `icon`, `tags`. |
| `src/blog/posts/<slug>/main.jsx` | Imports the font and `index.css`, then `mountBlogPage(<Post />)`. Four lines; copy Deni's. |
| `src/blog/posts/<slug>/<Slug>Post.jsx` | The post, wrapped in `<BlogPage>`. |
| `src/blog/posts/<slug>/<Slug>Cover.jsx` | The post's cover on `/blog/`: a picture of its world that fills `.post-cover-art`. It needs its own height and `overflow: hidden`. |
| `src/blog/posts/<slug>/<slug>-tokens.css` | The world's colors and motifs that the post and its cover share. |
| `src/blog/posts/<slug>/<slug>.css` | Everything only the post uses. |

Then wire it in, in four places:

1. `src/blog/posts.js`: add `{ ...<slug>Post, Cover: <Slug>Cover }`, newest first.
2. `src/entry-server.jsx`: add `'blog/<slug>/index.html': () => renderToString(<Post />)` to `blogPages`, so the build prerenders it.
3. `vite.config.js`: add `<slug>: 'blog/<slug>/index.html'` to `rollupOptions.input`.
4. `public/sitemap.xml`: add a `<url>` for `https://cemmacabales.com/blog/<slug>/`. The build stamps `<lastmod>`.

## The world

- **Paper and ink.** Put `class="world-<slug>"` on `<body>` and override the
  site's tokens on `:root:has(> body.world-<slug>)`: at least `--canvas`,
  `--ink`, `--ink-2` and `--focus`, plus the post's own (`--<slug>-text`,
  `--<slug>-link`, `--<slug>-line`…). Set them on `:root`, not the body, so
  overscroll shows the same paper.
- **Both themes.** Repeat every override under
  `:root[data-theme='dark']:has(> body.world-<slug>)`. If the project has no
  dark mode, find its dark in its own palette (Deni's paper turns to its night
  sky's ink, its foil to graphite).
- **Contrast.** WCAG AAA: 7:1 for body text, 4.5:1 for large text, on every
  surface it sits on, in both themes. Write each ratio in a comment next to
  the color, as `deni.css` does.
- **One accent per world.** Mint (`#64ffda`) stays in the nav. Inside the post
  the project's own accent takes its place (Deni blue). No gradient text, no
  side-stripe borders.
- **Borrow the project's design language, not its screens.** Find the one or
  two ideas the project is built on and let the post's structure grow from
  them. Deni is a foil pill pack under a sky that follows the hour, so its
  chapters are hours of one day, its contents are a blister pack that presses
  in as you read, and its build log is a strip of blisters, one a day. Take the
  method, not the layout tile for tile.
- **The hero** starts under the floating nav
  (`.world-<slug> .blog-main { padding-top: 0 }`) and carries the title, dek
  and byline. Wherever text sits on a picture or gradient, it must still hold
  7:1.
- **Chapters.** A `chapters.js` array (`id`, `title`, plus whatever the world
  needs) drives the sections' ids, the contents nav and the reading progress.
  `src/blog/useChapterProgress.js` tracks which one the reader is in and which
  they've read.
- **The cover** is the world in miniature, not a screenshot of the post. It
  should read at a glance in both themes and at phone width (the card is
  340px tall there).

## Rules the build and the page depend on

- **Never import `src/data/portfolio.js` from blog code**, directly or through
  a component that does. Anything a post shares with the home goes in its own
  module (like `src/data/deni.js`), listed in the `shared` manual chunk in
  `vite.config.js`, along with any component from `src/components/` the post
  uses (`FilmPlayer` is there for this). Otherwise the post downloads the
  home's whole `ui` chunk.
- **Nothing reads `window` or `document` at render time.** The build renders
  every post in Node (`scripts/prerender.js`). Measure in effects, and format
  dates in UTC so the prerender and the browser agree.
- **Images** go in `src/assets/blog/<slug>/` as WebP with a smaller variant for
  `srcSet` (Deni uses `-800` and `-720`). Exactly one image, the hero's, gets
  `priority`. Every image gets real alt text, or `alt=""` if it's decoration.
- **Motion** is opacity and transform only, and every animation has a
  `prefers-reduced-motion: reduce` fallback.
- **Facts** come from a primary source (the repo, the manuscript, the App
  Store listing), never from memory, and every number is checked against it.
- **Analytics.** Outbound links worth knowing about send a `project_*` PostHog
  event with a `source`, as Deni's App Store links do. Never send what the
  reader typed.

## Checking it

- `npm run build`. The prerender step prints a line for each page it writes;
  a missing line means a missing `blogPages` entry.
- `npm run preview` (port 4173), then open `/blog/` and the post at desktop
  and phone width, in light and dark.
- Check the contrast of every text color you added.
- Page changes don't run in dev mode (Vite injects the CSS late), so check
  them in the preview.
- `npm run lint` must not add problems.

## The posts so far

- **Deni** (`deni/`): a foil pill pack under a sky that follows the hour.
  Chapters are hours of one day; the contents are a blister pack.
- **Thesis** (`thesis/`): a radiologist's lightbox. Light theme, the box is
  on; dark theme, the reading room. The contents are a stack of CT slices,
  and the kidney is a white outline on the film so mint stays the site's.
  Its facts live in `src/data/thesis.js`, shared with the home's thesis tile
  (and listed in the `shared` chunk); the budget numbers and reviewed cases
  are in `thesis/budget.js` and `thesis/cases.js`, with their sources.
- **Centient** (`centient/`): a payslip, from Centient's own receipt design
  language: stubs torn at both ends, dotted leaders, dashed rules. The hero
  is the sprint's receipt, the contents are its line items (stamped green
  once read), and gold is kept for money, as in the app. Its numbers are in
  `centient/ledger.js`, with their sources; the owl is shared with the home
  through `src/data/centient.js`, in the `shared` chunk.

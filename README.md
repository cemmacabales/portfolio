# Carl Macabales – Portfolio

Source for **[cemmacabales.com](https://cemmacabales.com/)**, the portfolio of Carl Emmanuel Macabales: an AI and software engineer in Quezon City, Philippines, and a 2026 Mapúa University graduate (BS Computer Science, AI specialization). He builds the model and the product around it, from published ML research in medical imaging and clinical NLP to full-stack products on Next.js, PostgreSQL, and Stellar.

**Live site:** [cemmacabales.com](https://cemmacabales.com/)

## On the site

- **[Centient](https://beta.centient.work)**: a human-feedback platform for AI teams that pays contributors in USDC on Stellar. $5,000 Instawards grant.
- **Research**: [kidney abnormality segmentation in CT](https://doi.org/10.1109/ICIPCN67432.2026.11438968) (IEEE ICIPCN 2026) and [a RAG assistant for the 2024 ESC atrial fibrillation guidelines](https://doi.org/10.1109/CSPA68262.2026.11517831) (IEEE CSPA 2026, first author).
- **Pink Raft**: no-code payment flows on Stellar. 1st runner-up, Stellar Hackathon.
- Experience, education, the tools he reaches for, and an assistant that answers questions about his work.

---

## Tech stack

- **React 19** and **Vite 7**
- **Framer Motion** and **GSAP** for animation
- **vgpu** (WebGPU) for the hero's shape field, desktop only
- **Netlify Functions**: `chat` (the site's assistant, on Groq) and `github` (the GitHub activity tile)
- **EmailJS** for the contact form
- **Lucide** and **Devicon** for icons, **Inter** for type
- **Netlify** for hosting

## Getting started

### Prerequisites

- Node.js 22 (Vite 7 needs 20.19 or newer; Netlify builds with 22)
- npm

### Installation

```bash
npm install
cp .env.example .env
```

Then fill in `.env`:

| Variable | Used by |
|---|---|
| `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` | Contact form. Without them, sending fails. |
| `GROQ_API_KEY` | The assistant (`netlify/functions/chat.js`) |
| `GITHUB_TOKEN` (optional) | Raises the GitHub API limit for the activity tile. It works without one. |

### Development

```bash
npm run dev
```

Opens the site at `http://localhost:3000`. The dev server also serves both Netlify Functions, so the assistant and the GitHub tile work locally.

### Build

```bash
npm run build
```

Builds the site into `dist/`, then prerenders it: `src/entry-server.jsx` renders the app once and `scripts/prerender.js` writes that HTML into `dist/index.html`. Crawlers that don't run JavaScript read the full page instead of an empty root. Because of this, components must not read `window`, `document`, or `localStorage` while rendering. Do that in an effect.

### Preview the production build

```bash
npm run preview
```

Serves `dist/` at `http://localhost:4173`.

### Lint

```bash
npm run lint
```

## Deployment

Netlify builds and deploys every push to `main` (see `netlify.toml`). `public/_redirects` sends old section URLs to their anchors, and unknown paths get `404.html` with a real 404 status.

## Contact

- **Website:** [cemmacabales.com](https://cemmacabales.com/)
- **Email:** carlmacabales31@gmail.com
- **LinkedIn:** [Carl Emmanuel Macabales](https://www.linkedin.com/in/carl-emmanuel-macabales-a78742311/)
- **GitHub:** [@cemmacabales](https://github.com/cemmacabales)

import CentientHome from '../assets/centient/home.jpg'
import CentientRank from '../assets/centient/rank.jpg'
import CentientPaid from '../assets/centient/paid.jpg'
import CentientAccount from '../assets/centient/account.jpg'
import CentientOwl from '../assets/centient-owl.png'
import BlocklabsLogo from '../assets/blocklabs.png'
import PinkRaftLogo from '../assets/pinkraft.svg'
import PoseEstimationImage from '../assets/Pose Estimation.webp'
import EscImage from '../assets/esc.webp'
import AxialModelTestingImage from '../assets/axial model testing.webp'
import ReadMyFaceImage from '../assets/readmyface.webp'
import MyAptImage from '../assets/myapt.webp'
import PetchinguImage from '../assets/petchingu.webp'
import DeniCover from '../assets/deni/cover.webp'
import DeniPromo from '../assets/deni/promo.mp4'
import DeniPromoPoster from '../assets/deni/promo-poster.webp'
import MapuaImage from '../assets/Mapua.webp'
import StPaulImage from '../assets/stpaul.webp'
import IpsaImage from '../assets/ipsa.webp'
import GradPhoto from '../assets/me.webp'
import BarongPhoto from '../assets/me-barong.webp'
import IpsaPhoto from '../assets/me-ipsa.jpg'
// Row thumbnails: small copies, so the list never decodes full screenshots.
import CentientThumb from '../assets/thumbs/home.webp'
import PoseEstimationThumb from '../assets/thumbs/Pose Estimation.webp'
import EscThumb from '../assets/thumbs/esc.webp'
import AxialModelTestingThumb from '../assets/thumbs/axial model testing.webp'
import ReadMyFaceThumb from '../assets/thumbs/readmyface.webp'
import MyAptThumb from '../assets/thumbs/myapt.webp'
import PetchinguThumb from '../assets/thumbs/petchingu.webp'
import DeniThumb from '../assets/thumbs/deni.webp'
import IcipcnCert from '../assets/cert-icipcn.webp'
import CspaCert from '../assets/cert-cspa.webp'
import SpiderMan2Cover from '../assets/games/spiderman-2.webp'
import Gt7Cover from '../assets/games/gt7.webp'
import RagnarokCover from '../assets/games/ragnarok.webp'

import pythonIcon from 'devicon/icons/python/python-plain.svg'
import pytorchIcon from 'devicon/icons/pytorch/pytorch-original.svg'
import tensorflowIcon from 'devicon/icons/tensorflow/tensorflow-original.svg'
import sklearnIcon from 'devicon/icons/scikitlearn/scikitlearn-plain.svg'
import opencvIcon from 'devicon/icons/opencv/opencv-plain.svg'
import numpyIcon from 'devicon/icons/numpy/numpy-plain.svg'
import pandasIcon from 'devicon/icons/pandas/pandas-plain.svg'
import fastapiIcon from 'devicon/icons/fastapi/fastapi-plain.svg'
import flaskIcon from 'devicon/icons/flask/flask-original.svg'
import reactIcon from 'devicon/icons/react/react-original.svg'
import typescriptIcon from 'devicon/icons/typescript/typescript-plain.svg'
import javascriptIcon from 'devicon/icons/javascript/javascript-plain.svg'
import nodeIcon from 'devicon/icons/nodejs/nodejs-plain.svg'
import nextIcon from 'devicon/icons/nextjs/nextjs-plain.svg'
import prismaIcon from 'devicon/icons/prisma/prisma-original.svg'
import redisIcon from 'devicon/icons/redis/redis-plain.svg'
import firebaseIcon from 'devicon/icons/firebase/firebase-plain.svg'
import postgresIcon from 'devicon/icons/postgresql/postgresql-plain.svg'
import dockerIcon from 'devicon/icons/docker/docker-plain.svg'
import gitIcon from 'devicon/icons/git/git-plain.svg'

export const profile = {
  name: 'Carl Emmanuel Macabales',
  shortName: 'Carl Macabales',
  role: 'AI & software engineer',
  location: 'Quezon City, PH',
  email: 'carlmacabales31@gmail.com',
  phone: '+63 956 389 3104',
  phoneHref: 'tel:+639563893104',
  github: 'https://github.com/cemmacabales',
  linkedin: 'https://www.linkedin.com/in/carl-emmanuel-macabales-a78742311/',
  resume: '/MacabalesResume1.pdf',
  timeZone: 'Asia/Manila',
}

// The About tile. `offClock` reads as one paragraph: strings are prose, and
// each object is a hobby the tile's stage acts out (`scene` names the
// animation in HobbyScenes.jsx, `label` is the stage caption). Everything
// here came from Carl; keep it that way.
export const about = {
  hello: 'Hi, I’m Carl.',
  from: 'I grew up in Al\u00a0Khobar, Saudi Arabia, and I’m based in Quezon\u00a0City now.',
  offClock: [
    'Off the clock, you’ll find me playing ',
    { scene: 'hoops', text: 'basketball', label: 'Basketball' },
    ', ',
    { scene: 'lift', text: 'lifting', label: 'Lifting' },
    ', or queueing up ',
    { scene: 'games', text: 'shooters, MOBAs, and RPGs', label: 'Shooters, MOBAs, RPGs' },
    '. ',
    { scene: 'music', text: 'Hip-hop and R&B', label: 'On repeat: hip-hop, R&B' },
    ' are always on, I’m hooked on ',
    { scene: 'kdrama', text: 'K-dramas', label: 'Currently watching: K-dramas' },
    ' right now, I have ',
    { scene: 'dogs', text: 'two dogs', label: 'Two dogs' },
    ', and I can solve a ',
    { scene: 'cube', text: 'Rubik’s cube', label: 'Solved one-handed' },
    ' with one hand.',
  ],
}

// The Socials tile. `verb` is what each app's own button says.
export const socials = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@crlemmanuel_',
    verb: 'Follow',
    url: 'https://www.instagram.com/crlemmanuel_/',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: profile.shortName,
    verb: 'Connect',
    url: profile.linkedin,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'carl.macabales',
    verb: 'Add friend',
    url: 'https://www.facebook.com/carl.macabales/',
  },
]

// The My setup tile: the machine, the box that keeps the files, and the
// apps that stay open. All of it came from Carl.
export const setup = {
  machine: { name: 'MacBook Air', detail: 'Apple M2 · 8 GB memory' },
  server: { name: 'Raspberry Pi', detail: 'Storage server' },
  apps: [
    { id: 'claude', name: 'Claude Code', role: 'Agent' },
    { id: 'codex', name: 'Codex', role: 'Agent' },
    { id: 'cursor', name: 'Cursor', role: 'Editor' },
  ],
  // The whole desk, shown when the tile expands, in the order the list reads.
  gear: [
    { id: 'mac', name: 'MacBook Air', detail: 'Apple M2 · 8 GB memory' },
    { id: 'monitor', name: 'LG 27″ monitor', detail: '1440p · 120 Hz' },
    { id: 'keyboard', name: 'MCHOSE G75', detail: 'Black · Cabbage Tofu switches' },
    { id: 'mouse', name: 'UGREEN vertical mouse', detail: 'Ergonomic grip' },
    { id: 'pi', name: 'Raspberry Pi', detail: 'Storage server' },
    { id: 'phone', name: 'iPhone 17 Pro Max', detail: '12 GB · 256 GB' },
    { id: 'ps5', name: 'PlayStation 5', detail: 'On rotation' },
  ],
  // Carl's favorites, shown on the PS5 home screen. Covers via Wikipedia;
  // `size` is each cover's pixels and `focus` how far down its best band sits.
  games: [
    { id: 'spiderman-2', title: 'Marvel’s Spider-Man 2', cover: SpiderMan2Cover, size: [288, 346], focus: 0.6 },
    { id: 'gt7', title: 'Gran Turismo 7', cover: Gt7Cover, size: [273, 365], focus: 0.5 },
    { id: 'ragnarok', title: 'God of War Ragnarök', cover: RagnarokCover, size: [287, 352], focus: 0.56 },
  ],
}

// My setup's second view: how work moves across that desk, as two Shortcuts.
// `app` picks each step's icon; the stage draws the step by its `id`. The
// Colab picks and the thesis run (nnU-Net v2, 290 3D CT scans, A100) came
// from Carl; the Space is his live one on Hugging Face.
export const workflow = [
  {
    id: 'ship',
    name: 'Ship a feature',
    steps: [
      { id: 'plan', app: 'claude', name: 'Plan it', detail: 'Claude Code drafts the plan. I edit it before any code.' },
      { id: 'build', app: 'cursor', name: 'Build in parallel', detail: 'Agents in separate worktrees, steered in Cursor' },
      { id: 'check', app: 'check', name: 'Check it runs', detail: 'Lint, build, and a real browser at three sizes' },
      { id: 'review', app: 'codex', name: 'Get a second opinion', detail: 'Codex reviews every pull request before merge' },
      { id: 'ship', app: 'netlify', name: 'Ship it', detail: 'Main deploys on Netlify. PostHog watches.' },
    ],
  },
  {
    id: 'train',
    name: 'Train a model',
    steps: [
      { id: 'data', app: 'kaggle', name: 'Get the data', detail: 'Datasets from Kaggle, pulled straight into Colab' },
      { id: 'gpu', app: 'colab', name: 'Pick the GPU', detail: 'T4 for light work, L4 for fine-tunes, A100 for heavy runs' },
      { id: 'train', app: 'pytorch', name: 'Train', detail: 'My thesis: nnU-Net v2 on 290 3D CT scans, on an A100' },
      { id: 'curves', app: 'chart', name: 'Read the curves', detail: 'Loss and Dice every epoch, before any number counts' },
      { id: 'share', app: 'hf', name: 'Put it online', detail: 'Models from the Hub, demos as Gradio Spaces' },
    ],
  },
]

export const featured = {
  slug: 'centient',
  name: 'Centient',
  tagline: 'Train AI, cent by cent.',
  award: '$5,000 Instawards grant',
  logo: CentientOwl,
  // Screens for the hero slideshow, in the order a contributor meets them.
  screens: [
    {
      src: CentientHome,
      caption: 'Sign in with a Stellar wallet',
      alt: 'Centient home screen: “Train AI, cent by cent.” with a Connect Freighter button',
    },
    {
      src: CentientRank,
      caption: 'Pick the better answer, say why',
      alt: 'A Centient task with response A selected and the reason typed in',
    },
    {
      src: CentientPaid,
      caption: 'Paid per accepted answer, on-chain',
      alt: 'Centient confirming “+0.25 USDC on its way” after an answer is accepted',
    },
    {
      src: CentientAccount,
      caption: 'Every payout tracked to confirmed',
      alt: 'Centient account sheet: 0.5 USDC earned, two submissions marked confirmed',
    },
  ],
  pitch:
    'People rank pairs of AI answers and get paid in USDC on Stellar the moment an answer is accepted, with no bank account and nothing to cash out. Quality guards catch spam and bias, and every payout is co-signed from a multisig account that no single key can drain.',
  stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stellar'],
  beta: 'https://beta.centient.work',
}

// Order is the order shown in "Selected work". `metrics` are real results
// from the papers and write-ups; leave the array empty rather than invent one.
export const projects = [
  {
    slug: 'centient',
    name: 'Centient',
    category: 'Full-stack · USDC on Stellar',
    year: '2026',
    image: CentientHome,
    thumb: CentientThumb,
    imageAlt: 'Centient home screen: “Train AI, cent by cent.” with a Connect Freighter button',
    summary:
      'A human-feedback platform for AI teams: contributors compare two AI answers, say why one is better, and are paid in USDC on Stellar as soon as the answer is accepted. Gold tasks, rate limits, and agreement checks keep the rankings honest. Payouts are co-signed from a multisig account, and after most balances sat stuck below the old withdrawal minimum, the Withdraw button went away: every accepted answer now pays the wallet directly.',
    metrics: [
      { value: '$5,000', label: 'Instawards grant' },
      { value: '2 of 3', label: 'keys co-sign every payout, enforced in CI' },
    ],
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stellar SDK', 'Redis', 'Railway'],
    links: {
      demo: 'https://beta.centient.work',
      code: 'https://github.com/cemmacabales/centient',
    },
    demoLabel: 'Try the beta',
  },
  {
    // The cover frames real iOS screens in Apple's iPhone 18 Pro bezel. The
    // film is the 60-second promo, played from the row (see FilmPlayer).
    slug: 'deni',
    name: 'Deni',
    category: 'iPhone app · Medication tracker',
    year: '2026',
    image: DeniCover,
    thumb: DeniThumb,
    imageAlt:
      'Deni on three iPhones: today’s doses on a pearl foil pack under a morning sky, the mood journal, and a week of doses in Insights',
    summary:
      'A medication tracker for iPhone. My dad started maintenance meds early in life, and it’s my mom who keeps him on track. Not everyone has someone like that. Deni is meant to be that reminder for anyone who doesn’t, or for anyone who simply wants something dependable to lean on. Deni organizes your meds like they’re all in one cabinet, so you always know what to take and when. A journal tracks how you’re feeling alongside your doses, and Insights sums up your week in a one-page report you can share with your doctor.',
    metrics: [],
    tech: ['React Native', 'Expo', 'TypeScript', 'SQLite'],
    links: { code: 'https://github.com/cemmacabales/meditrack' },
    film: {
      src: DeniPromo,
      poster: DeniPromoPoster,
      title: 'Deni promo film',
      length: '1:00',
    },
    note: 'Coming soon to iPhone.',
  },
  {
    slug: 'edge-coach',
    name: 'Edge Exercise Coach',
    category: 'Computer vision · Edge AI',
    year: '2026',
    image: PoseEstimationImage,
    thumb: PoseEstimationThumb,
    imageAlt: 'Raspberry Pi desktop showing a live skeleton overlay on a person doing a shoulder abduction, graded correct',
    summary:
      'Classifies exercises and grades form in real time on a Raspberry Pi 5. BlazePose landmarks feed a dual-head LSTM trained on 451,638 augmented 30-frame windows. After a session, a RAG chat explains what to fix: retrieval runs on the Pi with an ONNX encoder, so PyTorch never ships to the device.',
    metrics: [
      { value: '97.15%', label: 'exercise classification, 9 movements' },
      { value: '25–30 fps', label: 'live inference on a Raspberry Pi 5' },
    ],
    tech: ['MediaPipe', 'LSTM', 'TFLite', 'ONNX', 'Groq', 'Raspberry Pi'],
    links: { code: 'https://github.com/cemmacabales/pose_est_v2' },
    note: 'Runs on a Raspberry Pi, so there’s no web demo.',
  },
  {
    slug: 'af-guidelines',
    name: 'AF Guideline Assistant',
    category: 'Clinical NLP · RAG',
    year: '2026',
    image: EscImage,
    thumb: EscThumb,
    imageAlt: 'Cardiology AI assistant answering a question about the ESC 2024 atrial fibrillation guidelines, with cited source pages',
    summary:
      'Answers clinical questions from 100+ pages of the 2024 ESC atrial fibrillation guidelines. MedCPT embeddings, FAISS search, and BGE reranking ground three quantized models (Llama 3, Phi-3, Qwen3), tested on 20 clinical queries with a case-by-case look at every hallucination.',
    metrics: [
      { value: '0.835', label: 'BERTScore F1' },
      { value: '~0.7 s', label: 'response latency, quantized' },
    ],
    tech: ['Llama 3', 'Phi-3', 'Qwen3', 'FAISS', 'MedCPT'],
    links: {
      code: 'https://github.com/cemmacabales/AFIB.git',
      paper: 'https://ieeexplore.ieee.org/document/11517831',
    },
    models: [
      { name: 'Llama3', url: 'https://huggingface.co/spaces/johnnydang88/Llama3' },
      { name: 'Qwen3', url: 'https://huggingface.co/spaces/johnnydang88/Qwen3' },
      { name: 'Phi3', url: 'https://huggingface.co/spaces/johnnydang88/Phi3' },
    ],
  },
  {
    slug: 'renal-ct',
    name: 'Renal CT Detection',
    category: 'Medical imaging · YOLOv12',
    year: '2026',
    image: AxialModelTestingImage,
    thumb: AxialModelTestingThumb,
    imageAlt: 'Six axial CT slices of the abdomen with detection boxes around kidney cysts, stones, and tumors',
    summary:
      'Finds cysts, stones, and tumors in axial and coronal CT slices with YOLOv12, trained on 14,761 curated and augmented scans. Presented at IEEE ICIPCN 2026 at Kathmandu University, Nepal.',
    metrics: [
      { value: '0.946', label: 'mAP@0.5, axial slices' },
      { value: '0.885', label: 'mAP@0.5, coronal slices' },
    ],
    tech: ['YOLOv12', 'Python', 'Streamlit'],
    links: {
      demo: 'https://kidney-abnormality-detection.streamlit.app/',
      code: 'https://github.com/cemmacabales/KidneyDetection.git',
      paper: 'https://ieeexplore.ieee.org/document/11438968',
    },
  },
  {
    slug: 'read-my-face',
    name: 'Read My Face',
    category: 'Real-time emotion detection',
    year: '2025',
    image: ReadMyFaceImage,
    thumb: ReadMyFaceThumb,
    imageAlt: 'Read My Face start screen listing the seven emotions it detects',
    summary:
      'Reads seven facial expressions from a webcam and answers each one with GSAP-driven visual feedback. The face-api.js models run entirely in the browser.',
    metrics: [],
    tech: ['React', 'face-api.js', 'GSAP'],
    links: {
      demo: 'https://readmyfaceai.netlify.app',
      code: 'https://github.com/cemmacabales/emotion-detector.git',
    },
  },
  {
    slug: 'myapt',
    name: 'MyApt',
    category: 'Property management dashboard',
    year: '2025',
    image: MyAptImage,
    thumb: MyAptThumb,
    imageAlt: 'MyApt sign-in screen',
    summary:
      'A dashboard for running apartment properties: tenants, units, and live Firebase data with charts. Demo login: test@test.com / test123.',
    metrics: [],
    tech: ['React', 'Firebase', 'SCSS'],
    links: {
      demo: 'https://myapthome.netlify.app',
      code: 'https://github.com/cemmacabales/myapt-july8-2025-main.git',
    },
  },
  {
    slug: 'petchingu',
    name: 'Petchingu',
    category: 'Pet care app',
    year: '2025',
    image: PetchinguImage,
    thumb: PetchinguThumb,
    imageAlt: 'Petchingu banner: the pet app for a pet parent',
    summary:
      'Keeps a pet’s health records, vet appointments, and daily care routines in one place. Built with React and TypeScript on an Appwrite backend.',
    metrics: [],
    tech: ['React', 'TypeScript', 'Appwrite'],
    links: { code: 'https://github.com/cemmacabales/petchinguuu.git' },
    note: 'The web demo is offline for now.',
  },
]

export const education = [
  {
    school: 'Mapúa University',
    detail: 'BS Computer Science, AI specialization',
    period: '2023–2026',
    place: 'Makati',
    logo: MapuaImage,
    photo: { src: GradPhoto, alt: 'Carl in Mapúa graduation robes', position: '50% 35%' },
  },
  {
    school: 'St. Paul University',
    detail: 'Senior high school, STEM',
    period: '2021–2023',
    place: 'Quezon City',
    logo: StPaulImage,
    photo: { src: BarongPhoto, alt: 'Carl smiling in a white barong', position: '50% 35%' },
  },
  {
    school: 'International Philippine School in Al Khobar',
    detail: 'Grade school to high school, Saudi Arabia',
    period: '2009–2021',
    place: 'Al Khobar',
    logo: IpsaImage,
    photo: {
      src: IpsaPhoto,
      alt: 'Young Carl in his school uniform, next to his Ben 10 school bag',
      position: '50% 30%',
    },
  },
]

// The Experience tile: roles, then software shipped outside of coursework,
// newest first in each group. `start`/`end` are ISO dates (an `end` of null
// means the role is current); the tile works out the tenure from them. In
// `points`, **double asterisks** mark the figures the tile sets in bold.
// Artisam's title and dates are from Carl's contract; the BLOKC's name and title
// follow his résumé, and its bullets are from his LinkedIn.
export const experience = [
  {
    id: 'artisam',
    group: 'roles',
    name: 'Artisam Labs',
    title: 'Lead Developer',
    kind: 'Contract',
    start: '2026-09-07',
    end: null,
    monogram: 'AL',
    points: [
      'Leads the build of **Centient** through a four-week sprint, with a reviewed deliverable and a QA gate every week.',
      'Replaced balance-and-withdraw with a payout for every accepted answer, after **8 of 10** balances sat stuck under the 1 USDC minimum.',
      'Every payout is co-signed **2 of 3** from a multisig account, and a CI lane races concurrent payouts to prove **zero double-pays**.',
      'Wrote the beta tester guides for desktop, Android, and iOS, plus the script for tester interviews.',
    ],
    see: 'centient',
  },
  {
    id: 'blocklabs',
    group: 'roles',
    name: 'The BLOKC',
    title: 'Software Engineering Intern',
    kind: 'Internship',
    start: '2026-04',
    end: '2026-06',
    logo: BlocklabsLogo,
    points: [
      'Led a **5-intern** pod across three blockchain products. Shared review and test workflows cut feature turnaround from **4 weeks to 2** and post-release errors by **~40%**.',
      'Shipped a 6-phase on-chain payout system with atomic withdrawals and anti-fraud controls: **10K+** simulated payouts on Stellar testnet, **zero** double-spends.',
      'Ran security QA on a learning management system, filing **30+** reproducible issues (IDOR, broken access control, rate-limit bypass) and cutting escaped defects by **~35%**.',
      'Built an LLM adapter across Groq, Anthropic, Gemini, Vertex AI, and Ollama that turns prompts into Stellar payment flows: **~94%** success, **~70%** fewer malformed-output crashes.',
    ],
  },
  {
    id: 'centient',
    group: 'shipped',
    name: 'Centient',
    title: 'Centient',
    tagline: 'Human-feedback labeling, paid in USDC on Stellar',
    date: '2026',
    logo: CentientOwl,
    proof: '$5,000 Instawards grant',
    points: [
      'People compare two AI answers, say why one is better, and are paid in USDC the moment the answer is accepted.',
      'No bank account and nothing to cash out: each payout lands in the contributor’s own Stellar wallet.',
      'Gold tasks, rate limits, and agreement checks keep the rankings honest.',
    ],
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stellar'],
    links: [
      { label: 'Try the beta', url: 'https://beta.centient.work' },
      { label: 'Source', url: 'https://github.com/cemmacabales/centient' },
    ],
  },
  {
    id: 'pinkraft',
    group: 'shipped',
    name: 'Pink Raft',
    title: 'Pink Raft',
    tagline: 'No-code payment flows on Stellar',
    date: 'May 2026',
    role: 'Full-stack and AI integration lead',
    logo: PinkRaftLogo,
    proof: '1st runner-up, Stellar Hackathon',
    points: [
      'Drag in triggers and actions, and a live Soroban contract deploys in under **60 seconds**.',
      'Cut AI replies from **~10 s to ~2 s** with null-stripping, Zod schema hardening, and trigger-conflict checks that replace silent failures.',
      'WebAuthn 2FA, non-custodial wallet signing (Freighter, xBull, Albedo), and a live on-chain event feed.',
    ],
    stack: ['Next.js', 'PostgreSQL', 'Redis', 'Soroban'],
  },
]

// Newest first. `paper` is the title as printed on the certificate; `date` is
// the day it was presented, drawn on the row as a Calendar icon.
export const research = [
  {
    id: 'cspa',
    title: 'RAG clinical guideline chatbot for atrial fibrillation',
    venue: 'IEEE CSPA 2026 · IEEE Xplore',
    url: 'https://ieeexplore.ieee.org/document/11517831',
    paper:
      'Open-Source LLMs for Evidence-Grounded Clinical Question Answering: A RAG Framework Based on the 2024 ESC Atrial Fibrillation Guidelines',
    event: '22nd IEEE International Colloquium on Signal Processing & Its Applications',
    when: '1–2 May 2026',
    date: { month: 'May', day: 1, weekday: 'Fri' },
    cert: CspaCert,
    certAlt:
      'CSPA 2026 certificate of participation for the RAG framework paper on the 2024 ESC atrial fibrillation guidelines',
  },
  {
    id: 'icipcn',
    title: 'Multi-class kidney abnormality segmentation in CT',
    venue: 'IEEE ICIPCN 2026 · Kathmandu University',
    url: 'https://doi.org/10.1109/ICIPCN67432.2026.11438968',
    paper:
      'Clinically Oriented Deep Learning Framework for Multi-Class Kidney Abnormality Instance Segmentation in CT Images',
    event: '6th International Conference on Image Processing and Capsule Networks · Dhulikhel, Nepal',
    when: '27–29 January 2026',
    date: { month: 'Jan', day: 27, weekday: 'Tue' },
    cert: IcipcnCert,
    certAlt: 'IEEE certificate of presentation for the kidney abnormality paper at ICIPCN 2026',
  },
]

/*
 * The thesis tile and its story. Every figure comes from the final manuscript
 * (THESIS_AMM_vR18, June 2026) or the public repo, nnunetv2_3DKidney. Dice is
 * the mean over 5-fold cross-validation. Classes always run stone, cyst,
 * tumor: the order whose neighboring colors passed the palette check.
 */
export const thesis = {
  headline: 'One 3D model for kidney cysts, stones, and tumors',
  title:
    'A Clinical-Oriented AI Framework for Multi-Class Kidney Abnormality Detection and Segmentation',
  meta: 'BS Computer Science thesis · Mapúa University · 2026',
  summary:
    'We trained nnU-Net v2 on 290 CT scans to outline the kidney and all three abnormalities at once, then tested it against three models that each learn only one. Training them together raised the Dice score for every abnormality.',
  authors: ['Carl Emmanuel M. Macabales', 'Yñikko Arzee Neo D. Aguas', 'Robin Jairic T. Macatangay'],
  adviser: 'Dr. Lysa V. Comia',
  links: {
    code: 'https://github.com/cemmacabales/nnunetv2_3DKidney',
    demo: 'https://drive.google.com/file/d/1uWdfFnwQ7WdANk_sAqBJlz6SmNzQaGIk/view',
  },
  // The slice on the tile: the deployed app's output for case multi_016.
  scan: {
    slice: 29,
    of: 94,
    alt: 'Axial CT slice through the abdomen at the level of both kidneys. The model outlines both kidneys and a small tumor at the lower edge of one.',
  },
  kidney: 0.955,
  results: [
    {
      id: 'stone',
      name: 'Stone',
      alone: 0,
      together: 0.512,
      story: 'Alone, the model kept no stones at all. Together, 84% of the stones it flags are real.',
    },
    {
      id: 'cyst',
      name: 'Cyst',
      alone: 0.222,
      together: 0.501,
      story: 'Alone, it marked the bladder and gallbladder as kidney cysts. With the kidney beside it, cyst precision rose from 0.27 to 0.71.',
    },
    {
      id: 'tumor',
      name: 'Tumor',
      alone: 0.613,
      together: 0.763,
      story: 'It finds 89% of tumors, and 86% of what it marks as tumor is one.',
    },
  ],
  // Per-case paired Wilcoxon signed-rank tests, one-tailed, over scans where the class is present.
  significance: [
    { id: 'stone', p: ['5.6', '−12'], n: 75 },
    { id: 'cyst', p: ['6.9', '−22'], n: 170 },
    { id: 'tumor', p: ['6.2', '−15'], n: 165 },
  ],
  dataset: [
    { id: 'stone', label: 'Stones only', n: 74 },
    { id: 'cyst', label: 'Cysts only', n: 50 },
    { id: 'tumor', label: 'Tumors only', n: 45 },
    { id: 'multi', label: 'More than one', n: 121 },
  ],
  // Stone detection by fold (pseudo-Dice in nnU-Net's training log). Alone:
  // first seen, peak, and the epoch it fell back to zero for good. Together:
  // first seen, then held through epoch 1,000.
  stones: {
    alone: [
      { fold: 0, first: 1, peak: 19, best: 0.356, gone: 25 },
      { fold: 1, first: 8, peak: 30, best: 0.505, gone: 34 },
      { fold: 2, first: 10, peak: 26, best: 0.542, gone: 39 },
      { fold: 3, first: 11, peak: 33, best: 0.479, gone: 34 },
      { fold: 4, first: 7, peak: 28, best: 0.184, gone: 32 },
    ],
    together: [
      { fold: 0, first: 70 },
      { fold: 1, first: 51 },
      { fold: 2, first: 50 },
      { fold: 3, first: 350 },
      { fold: 4, first: 26 },
    ],
  },
  // Seconds per CT volume on the A100, CUDA-event timed (Table 19).
  latency: { alone: 12.61, perPass: 4.2, together: 4.81 },
  specs: [
    {
      label: 'Data',
      value: '290 CT volumes from KiTS23, MSWAL, and extra stone and cyst cases. DICOM converted with dcm2niix; labels drawn and checked in 3D Slicer, supervised by a radiologist.',
    },
    { label: 'Preprocessing', value: 'HU clipped to −135 to 215, resampled to 1 mm voxels, z-score normalized.' },
    { label: 'Model', value: 'nnU-Net v2, 3D full resolution: a six-stage U-Net (32 to 320 channels) with deep supervision.' },
    {
      label: 'Training',
      value: '128 × 128 × 128 patches, 1,000 epochs of 250 iterations, SGD with Nesterov momentum 0.99, Dice plus cross-entropy loss.',
    },
    { label: 'Validation', value: '5-fold cross-validation, so every scan is tested exactly once.' },
    { label: 'Hardware', value: 'One NVIDIA A100 (40 GB) on Google Colab Pro+.' },
    { label: 'Metrics', value: 'Dice, IoU, HD95, precision, recall, F1, and paired Wilcoxon signed-rank tests.' },
    { label: 'Deployment', value: 'A Gradio app with axial, coronal, and sagittal views and a 3D surface.' },
  ],
}

// `group` is the Tools tile's filter (ml, web, infra). `tint` is the brand
// color shown on hover. Omit it for marks that are black or white, which
// would vanish in one of the two themes.
export const stack = [
  { name: 'Python', group: 'ml', icon: pythonIcon, tint: '#3776ab' },
  { name: 'PyTorch', group: 'ml', icon: pytorchIcon, tint: '#ee4c2c' },
  { name: 'TensorFlow', group: 'ml', icon: tensorflowIcon, tint: '#ff6f00' },
  { name: 'scikit-learn', group: 'ml', icon: sklearnIcon, tint: '#f7931e' },
  { name: 'OpenCV', group: 'ml', icon: opencvIcon, tint: '#5c3ee8' },
  { name: 'NumPy', group: 'ml', icon: numpyIcon, tint: '#4dabcf' },
  { name: 'pandas', group: 'ml', icon: pandasIcon, tint: '#e70488' },
  { name: 'FastAPI', group: 'web', icon: fastapiIcon, tint: '#009688' },
  { name: 'Flask', group: 'web', icon: flaskIcon },
  { name: 'TypeScript', group: 'web', icon: typescriptIcon, tint: '#3178c6' },
  { name: 'JavaScript', group: 'web', icon: javascriptIcon, tint: '#e5c700' },
  { name: 'React', group: 'web', icon: reactIcon, tint: '#149eca' },
  { name: 'Next.js', group: 'web', icon: nextIcon },
  { name: 'Node.js', group: 'web', icon: nodeIcon, tint: '#5fa04e' },
  { name: 'PostgreSQL', group: 'infra', icon: postgresIcon, tint: '#4169e1' },
  { name: 'Prisma', group: 'infra', icon: prismaIcon, tint: '#5a67d8' },
  { name: 'Redis', group: 'infra', icon: redisIcon, tint: '#dc382d' },
  { name: 'Firebase', group: 'infra', icon: firebaseIcon, tint: '#f5a100' },
  { name: 'Docker', group: 'infra', icon: dockerIcon, tint: '#2496ed' },
  { name: 'Git', group: 'infra', icon: gitIcon, tint: '#f05032' },
]

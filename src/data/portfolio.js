import CentientHome from '../assets/centient/home.jpg'
import CentientRank from '../assets/centient/rank.jpg'
import CentientPaid from '../assets/centient/paid.jpg'
import CentientAccount from '../assets/centient/account.jpg'
import CentientOwl from '../assets/centient-owl.png'
import PoseEstimationImage from '../assets/Pose Estimation.png'
import EscImage from '../assets/esc.png'
import AxialModelTestingImage from '../assets/axial model testing.png'
import ReadMyFaceImage from '../assets/readmyface.png'
import MyAptImage from '../assets/myapt.png'
import PetchinguImage from '../assets/petchingu.png'
import MapuaImage from '../assets/Mapua.png'
import StPaulImage from '../assets/stpaul.png'
import IpsaImage from '../assets/ipsa.jpg'

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
}

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
    slug: 'edge-coach',
    name: 'Edge Exercise Coach',
    category: 'Computer vision · Edge AI',
    year: '2026',
    image: PoseEstimationImage,
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
    logo: MapuaImage,
  },
  {
    school: 'St. Paul University',
    detail: 'Senior high school, STEM',
    period: '2021–2023',
    logo: StPaulImage,
  },
  {
    school: 'International Philippine School in Al Khobar',
    detail: 'Grade school to high school, Saudi Arabia',
    period: '2009–2021',
    logo: IpsaImage,
  },
]

// Software shipped outside of coursework, newest first.
export const shipped = [
  {
    name: 'Centient',
    what: 'Human-feedback labeling paid in USDC on Stellar',
    proof: '$5,000 Instawards grant',
    year: '2026',
    url: 'https://beta.centient.work',
  },
  {
    name: 'Pink Raft',
    what: 'No-code payment flows that deploy Soroban contracts in under a minute; AI replies cut from ~10 s to ~2 s',
    proof: '1st runner-up, Stellar Hackathon',
    year: '2026',
  },
]

export const research = [
  {
    title: 'Multi-class kidney abnormality segmentation in CT',
    venue: 'IEEE ICIPCN 2026 · presented at Kathmandu University',
    url: 'https://doi.org/10.1109/ICIPCN67432.2026.11438968',
  },
  {
    title: 'RAG clinical guideline chatbot for atrial fibrillation',
    venue: 'CSPA 2026 · IEEE Xplore',
    url: 'https://ieeexplore.ieee.org/document/11517831',
  },
]

export const certificates = [
  {
    title: 'Computer Simulations',
    issuer: 'UC Davis',
    date: 'Jul 2025',
    url: 'https://coursera.org/share/a95589f4ec752a9847970d52171374e6',
  },
  {
    title: 'Cyber-Physical Systems: Modeling and Simulation',
    issuer: 'UC Santa Cruz',
    date: 'Jul 2025',
    url: 'https://coursera.org/share/44bb5e2ecfbc300c65243276e490b43d',
  },
  {
    title: 'Data Warehouse Concepts, Design, and Data Integration',
    issuer: 'University of Colorado',
    date: 'Jul 2025',
    url: 'https://coursera.org/share/f19cb1587ae281697b6409b32d091ab8',
  },
  {
    title: 'Engineering Practices for Building Quality Software',
    issuer: 'University of Minnesota',
    date: 'Jul 2025',
    url: 'https://coursera.org/share/3ec74c9e80af33781f9c9ca8af54d8bb',
  },
]

// `tint` is the brand color shown on hover. Omit it for marks that are
// black or white, which would vanish in one of the two themes.
export const stack = [
  { name: 'Python', icon: pythonIcon, tint: '#3776ab' },
  { name: 'PyTorch', icon: pytorchIcon, tint: '#ee4c2c' },
  { name: 'TensorFlow', icon: tensorflowIcon, tint: '#ff6f00' },
  { name: 'scikit-learn', icon: sklearnIcon, tint: '#f7931e' },
  { name: 'OpenCV', icon: opencvIcon, tint: '#5c3ee8' },
  { name: 'NumPy', icon: numpyIcon, tint: '#4dabcf' },
  { name: 'pandas', icon: pandasIcon, tint: '#e70488' },
  { name: 'FastAPI', icon: fastapiIcon, tint: '#009688' },
  { name: 'Flask', icon: flaskIcon },
  { name: 'TypeScript', icon: typescriptIcon, tint: '#3178c6' },
  { name: 'JavaScript', icon: javascriptIcon, tint: '#e5c700' },
  { name: 'React', icon: reactIcon, tint: '#149eca' },
  { name: 'Next.js', icon: nextIcon },
  { name: 'Node.js', icon: nodeIcon, tint: '#5fa04e' },
  { name: 'PostgreSQL', icon: postgresIcon, tint: '#4169e1' },
  { name: 'Prisma', icon: prismaIcon, tint: '#5a67d8' },
  { name: 'Redis', icon: redisIcon, tint: '#dc382d' },
  { name: 'Firebase', icon: firebaseIcon, tint: '#f5a100' },
  { name: 'Docker', icon: dockerIcon, tint: '#2496ed' },
  { name: 'Git', icon: gitIcon, tint: '#f05032' },
]

# Carl Emmanuel M. Macabales
**0956 389 3104 | carlmacabales31@gmail.com | cemmacabales.com | linkedin/cemmacabales | github/cemmacabales**

<!-- Plain-text mirror of resume.tex, which builds public/MacabalesResume1.pdf. Keep the two in sync. -->

## EDUCATION
**Mapúa University** | Makati, Philippines
*Bachelor of Science in Computer Science, Specializing in Artificial Intelligence* | Aug. 2023 - Jul. 2026

## EXPERIENCE
**Artisam Labs — Centient**
*Lead Developer (Contract) | Next.js, TypeScript, PostgreSQL, Prisma, Redis, Stellar SDK* | Sep. 2026 - Present
* Lead the build of Centient, a human-feedback platform that won a $5,000 Instawards grant: contributors rank AI answers and are paid in USDC on Stellar, with gold tasks and agreement checks guarding quality.
* Replaced withdrawals with instant per-answer payouts after 8 of 10 balances sat stuck under the 1 USDC minimum.
* Secured payouts with 2-of-3 multisig co-signing, plus a CI race test proving zero double-pays.

**The BLOKC (BLOCKLABS Inc.)**
*Software Engineering Intern* | Apr. - Jun. 2026
* Led a 5-intern engineering pod across three products, standardizing code review and test workflows to cut average feature turnaround from 4 weeks to 2 weeks while lowering post-release error rate by ~40%.
* Ran security-focused QA for a Learning Management System, filing 30+ reproducible issues covering IDOR, broken access control, and rate-limit bypass, cutting the pre-release defect escape rate by ~35%.
* Built a multi-provider LLM adapter (Groq, Anthropic, Gemini, Vertex AI, Ollama) for Paiflow that turns prompts into Stellar payment flows: ~94% success, ~70% fewer malformed-output crashes.
* Shipped a 6-phase on-chain payout system with atomic withdrawals and anti-fraud controls, stress-testing 10K+ simulated payouts on Stellar testnet with zero double-spends and 5/5 supervisor ratings.

## PUBLICATIONS
**Multi-Class Kidney Abnormality Segmentation** | Aug. 2025 - Jan. 2026
*AI - Deep Learning Computer Vision | IEEE ICIPCN 2026, Kathmandu University, Nepal*
* Developed a YOLOv12 model to detect kidney cysts, stones, and tumors, trained on 14,761 augmented CT images.
* Achieved mAP@0.5 of 0.946 (axial) and 0.885 (coronal), reducing radiologist workload.

**RAG-Based Clinical Guideline Chatbot for Atrial Fibrillation** | Dec. 2025 - Mar. 2026
*AI - Natural Language Processing | IEEE CSPA 2026 | First Author*
* Built a RAG chatbot (Llama-3, Phi-3, Qwen3) for querying 100+ pages of ESC AF guidelines.
* Improved retrieval with MedCPT, FAISS, and BGE reranking, reaching BERTScore F1 0.835, ROUGE-1 0.456.
* Evaluated on 20 clinical queries, hitting faithfulness up to 8.75/10 at ~0.7s latency and 7.9 tok/s.

## PROJECTS
**Real-Time AI Exercise Coaching System** | Apr. - Jun. 2026
*AI - Computer Vision | Python, MediaPipe BlazePose, TFLite, ONNX, Raspberry Pi 5*
* Trained a dual-head LSTM on 451,638 windows from 174 videos: 97.15% exercise and 92.81% form accuracy.
* Exported to a 219 KB TFLite model with BlazePose Lite, hitting 25-30 FPS on a Raspberry Pi 5.
* Built a ~115 MB on-device RAG chatbot over PDF fitness manuals, removing PyTorch from the Pi runtime.

## ACTIVITIES
**Pink Raft — 1st Runner-Up, Stellar Hackathon 2026** | May 2026
*Full-Stack Engineer & AI Integration Lead*
* Built a no-code Stellar/Soroban payment flow builder that deploys live smart contracts in under 60 seconds.
* Cut AI response latency ~80% (10s → 2s) via schema hardening; shipped WebAuthn 2FA and non-custodial wallets.

## TECHNICAL SKILLS
* **Languages:** Python, TypeScript, JavaScript, Java, SQL, R, HTML/CSS
* **Frameworks & Libraries:** React, Next.js, React Native, Expo, Node.js, FastAPI, Flask, Stellar SDK, Soroban
* **AI/ML:** RAG, NLP, Computer Vision, Object Detection, PyTorch, TFLite, ONNX, OpenCV, NumPy, pandas
* **Developer Tools:** Git, Docker, Railway, Sentry, Streamlit, NVIDIA CUDA
* **Cloud & Databases:** PostgreSQL, Prisma, Redis, Firebase, Appwrite, Google Cloud Platform, RESTful APIs

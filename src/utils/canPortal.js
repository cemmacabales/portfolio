// Overlays portal to <body> from the first render. The browser renders the
// page from scratch (main.jsx uses createRoot, not hydration), so there's no
// server markup to match, and waiting a render to mount them would re-render
// each tile once more on load. The build-time prerender has no document.
export const canPortal = typeof document !== 'undefined'

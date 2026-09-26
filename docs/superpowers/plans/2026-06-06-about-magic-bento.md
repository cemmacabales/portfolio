# About Section MagicBento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left text block in the About Me section with an interactive MagicBento card grid using Electric Mint glow effects.

**Architecture:** Copy the generic MagicBento component from the React Bits spec into `src/components/`, add a `cardData` prop so content is injected from outside, then create a thin `AboutBento.jsx` wrapper that owns Carl's content and passes `glowColor="100, 255, 218"`. App.jsx swaps the `about-text` inner JSX for `<AboutBento />` inside the existing `motion.div` wrapper.

**Tech Stack:** React, GSAP (already installed), CSS custom properties (Electric Mint `#64ffda` = `100, 255, 218` RGB)

---

### Task 1: Create feature branch

**Files:**
- No file changes

- [ ] **Step 1: Create and switch to branch**

```bash
git checkout -b feature/about-magic-bento
```

Expected: `Switched to a new branch 'feature/about-magic-bento'`

---

### Task 2: Create MagicBento.jsx

**Files:**
- Create: `src/components/MagicBento.jsx`

This is the generic component from the React Bits spec with one modification: the top-level `cardData` array is renamed to `defaultCardData` and exposed as a prop so callers can inject their own content.

- [ ] **Step 1: Create `src/components/MagicBento.jsx`**

```jsx
import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const defaultCardData = [
  { color: 'var(--card-bg)', title: 'Analytics', description: 'Track user behavior', label: 'Insights' },
  { color: 'var(--card-bg)', title: 'Dashboard', description: 'Centralized data view', label: 'Overview' },
  { color: 'var(--card-bg)', title: 'Collaboration', description: 'Work together seamlessly', label: 'Teamwork' },
  { color: 'var(--card-bg)', title: 'Automation', description: 'Streamline workflows', label: 'Efficiency' },
  { color: 'var(--card-bg)', title: 'Integration', description: 'Connect favorite tools', label: 'Connectivity' },
  { color: 'var(--card-bg)', title: 'Security', description: 'Enterprise-grade protection', label: 'Protection' }
];

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = radius => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => { particle.parentNode?.removeChild(particle); }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();
    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) {
        gsap.to(element, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) {
        gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      }
      if (enableMagnetism) {
        gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(element, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      }
      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;
        magnetismAnimationRef.current = gsap.to(element, { x: magnetX, y: magnetY, duration: 0.3, ease: 'power2.out' });
      }
    };

    const handleClick = e => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y), Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={`${className} particle-container`} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

const GlobalSpotlight = ({ gridRef, disableAnimations = false, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }) => {
  const spotlightRef = useRef(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = e => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach(card => { card.style.setProperty('--glow-intensity', '0'); });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }
        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });

      const targetOpacity = minDistance <= proximity
        ? 0.8
        : minDistance <= fadeDistance
          ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
          : 0;

      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => { card.style.setProperty('--glow-intensity', '0'); });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  cardData = defaultCardData
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
          const cardProps = {
            className: baseClassName,
            style: { backgroundColor: card.color, '--glow-color': glowColor }
          };

          if (enableStars) {
            return (
              <ParticleCard key={index} {...cardProps} disableAnimations={shouldDisableAnimations} particleCount={particleCount} glowColor={glowColor} enableTilt={enableTilt} clickEffect={clickEffect} enableMagnetism={enableMagnetism}>
                <div className="magic-bento-card__header">
                  <div className="magic-bento-card__label">{card.label}</div>
                </div>
                <div className="magic-bento-card__content">
                  <h2 className="magic-bento-card__title">{card.title}</h2>
                  <p className="magic-bento-card__description">{card.description}</p>
                </div>
              </ParticleCard>
            );
          }

          return (
            <div key={index} {...cardProps}
              ref={el => {
                if (!el) return;
                const handleMouseMove = e => {
                  if (shouldDisableAnimations) return;
                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  if (enableTilt) {
                    gsap.to(el, { rotateX: ((y - centerY) / centerY) * -10, rotateY: ((x - centerX) / centerX) * 10, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
                  }
                  if (enableMagnetism) {
                    gsap.to(el, { x: (x - centerX) * 0.05, y: (y - centerY) * 0.05, duration: 0.3, ease: 'power2.out' });
                  }
                };
                const handleMouseLeave = () => {
                  if (shouldDisableAnimations) return;
                  if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
                  if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
                };
                const handleClick = e => {
                  if (!clickEffect || shouldDisableAnimations) return;
                  const rect = el.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const maxDistance = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
                  const ripple = document.createElement('div');
                  ripple.style.cssText = `position:absolute;width:${maxDistance*2}px;height:${maxDistance*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x-maxDistance}px;top:${y-maxDistance}px;pointer-events:none;z-index:1000;`;
                  el.appendChild(ripple);
                  gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
                };
                el.addEventListener('mousemove', handleMouseMove);
                el.addEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('click', handleClick);
              }}
            >
              <div className="magic-bento-card__header">
                <div className="magic-bento-card__label">{card.label}</div>
              </div>
              <div className="magic-bento-card__content">
                <h2 className="magic-bento-card__title">{card.title}</h2>
                <p className="magic-bento-card__description">{card.description}</p>
              </div>
            </div>
          );
        })}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MagicBento.jsx
git commit -m "feat: add generic MagicBento component with cardData prop"
```

---

### Task 3: Create MagicBento.css

**Files:**
- Create: `src/components/MagicBento.css`

All purple color values (`rgba(132, 0, 255, ...)`) are replaced with Electric Mint (`rgba(100, 255, 218, ...)`). The `:root` block removes the purple-named variables and introduces mint equivalents. Card background and border use portfolio CSS variables.

- [ ] **Step 1: Create `src/components/MagicBento.css`**

```css
:root {
  --mint-primary: rgba(100, 255, 218, 1);
  --mint-glow: rgba(100, 255, 218, 0.2);
  --mint-border: rgba(100, 255, 218, 0.8);
  --bento-border-color: rgba(255, 255, 255, 0.08);
  color-scheme: light dark;
}

.card-grid {
  display: grid;
  gap: 0.5em;
  padding: 0.75em;
  max-width: 54em;
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);
}

.magic-bento-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  aspect-ratio: 4/3;
  min-height: 200px;
  width: 100%;
  max-width: 100%;
  padding: 1.25em;
  border-radius: 20px;
  border: 1px solid var(--bento-border-color);
  background: var(--bg-secondary, #1a1a1a);
  font-weight: 300;
  overflow: hidden;
  transition: all 0.3s ease;

  --glow-x: 50%;
  --glow-y: 50%;
  --glow-intensity: 0;
  --glow-radius: 200px;
}

.magic-bento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.magic-bento-card__header,
.magic-bento-card__content {
  display: flex;
  position: relative;
  color: var(--text-primary, #ffffff);
}

.magic-bento-card__header {
  gap: 0.75em;
  justify-content: space-between;
}

.magic-bento-card__content {
  flex-direction: column;
}

.magic-bento-card__label {
  font-size: 16px;
  color: rgba(100, 255, 218, 0.85);
  font-weight: 500;
}

.magic-bento-card__title,
.magic-bento-card__description {
  --clamp-title: 1;
  --clamp-desc: 2;
}

.magic-bento-card__title {
  font-weight: 400;
  font-size: 16px;
  margin: 0 0 0.25em;
}

.magic-bento-card__description {
  font-size: 12px;
  line-height: 1.2;
  opacity: 0.7;
  color: var(--text-secondary, #a0a0a0);
}

.magic-bento-card--text-autohide .magic-bento-card__title,
.magic-bento-card--text-autohide .magic-bento-card__description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.magic-bento-card--text-autohide .magic-bento-card__title {
  -webkit-line-clamp: var(--clamp-title);
  line-clamp: var(--clamp-title);
}

.magic-bento-card--text-autohide .magic-bento-card__description {
  -webkit-line-clamp: var(--clamp-desc);
  line-clamp: var(--clamp-desc);
}

@media (max-width: 599px) {
  .card-grid {
    grid-template-columns: 1fr;
    width: 90%;
    margin: 0 auto;
    padding: 0.5em;
  }

  .magic-bento-card {
    width: 100%;
    min-height: 180px;
  }
}

@media (min-width: 600px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .magic-bento-card:nth-child(3) {
    grid-column: span 2;
    grid-row: span 2;
  }

  .magic-bento-card:nth-child(4) {
    grid-column: 1 / span 2;
    grid-row: 2 / span 2;
  }

  .magic-bento-card:nth-child(6) {
    grid-column: 4;
    grid-row: 3;
  }
}

/* Border glow effect */
.magic-bento-card--border-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  padding: 6px;
  background: radial-gradient(
    var(--glow-radius) circle at var(--glow-x) var(--glow-y),
    rgba(100, 255, 218, calc(var(--glow-intensity) * 0.8)) 0%,
    rgba(100, 255, 218, calc(var(--glow-intensity) * 0.4)) 30%,
    transparent 60%
  );
  border-radius: inherit;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.magic-bento-card--border-glow:hover::after {
  opacity: 1;
}

.magic-bento-card--border-glow:hover {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.4),
    0 0 30px var(--mint-glow);
}

.particle-container {
  position: relative;
  overflow: hidden;
}

.particle::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 50%;
  z-index: -1;
}

.particle-container:hover {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 0 30px var(--mint-glow);
}

.global-spotlight {
  mix-blend-mode: screen;
  will-change: transform, opacity;
  z-index: 200 !important;
  pointer-events: none;
}

.bento-section {
  position: relative;
  user-select: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MagicBento.css
git commit -m "feat: add MagicBento CSS with Electric Mint color scheme"
```

---

### Task 4: Create AboutBento.jsx

**Files:**
- Create: `src/components/AboutBento.jsx`

Thin wrapper that owns Carl's card content. No CSS file needed — MagicBento.css handles all styling.

- [ ] **Step 1: Create `src/components/AboutBento.jsx`**

```jsx
import MagicBento from './MagicBento';

const cardData = [
  {
    color: 'var(--bg-secondary)',
    title: 'Machine Learning',
    description: 'Building intelligent systems',
    label: 'AI / ML'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Mapúa University',
    description: '3rd-year CS, AI specialization',
    label: 'Student'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Full-Stack',
    description: 'End-to-end digital solutions',
    label: 'Dev'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Gaming & Making',
    description: 'Games, open-source & making things',
    label: 'Hobbies'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Problem Solving',
    description: 'Tackling challenging problems',
    label: 'Drive'
  }
];

const AboutBento = () => (
  <MagicBento
    cardData={cardData}
    glowColor="100, 255, 218"
    textAutoHide={true}
    enableStars={true}
    enableSpotlight={true}
    enableBorderGlow={true}
    enableTilt={false}
    enableMagnetism={true}
    clickEffect={true}
    spotlightRadius={300}
    particleCount={12}
  />
);

export default AboutBento;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AboutBento.jsx
git commit -m "feat: add AboutBento wrapper with Carl's card content"
```

---

### Task 5: Update App.jsx

**Files:**
- Modify: `src/App.jsx` (lines ~911–946)

Replace the inner content of the `motion.div.about-text` with `<AboutBento />`. Keep the `motion.div` wrapper and `about-text` className intact — they handle the entrance animation and layout position.

- [ ] **Step 1: Add AboutBento import at the top of `src/App.jsx`**

Find the existing component imports block (around line 10–25, near other `import ... from './components/...'` lines) and add:

```jsx
import AboutBento from './components/AboutBento';
```

- [ ] **Step 2: Replace the about-text motion.div content**

Find this block in `src/App.jsx` (approximately lines 911–946):

```jsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  viewport={{ once: true }}
  className="about-text"
>
  <div className="about-text-group">
    <DecryptedText
      text="Who I am"
      speed={50}
      maxIterations={999999}
      sequential={false}
      className="about-subtitle-decrypted"
      parentClassName="about-subtitle-wrapper"
    />
    <ScrambledText
      className="scrambled-text-demo"
      radius={100}
      duration={1.2}
      speed={0.5}
      scrambleChars=".:"
    >
      I'm a 3rd-year student at Mapúa University specializing in Artificial Intelligence. I enjoy working with machine learning and have experience in both backend and frontend development, allowing me to build complete and functional digital solutions.
    </ScrambledText>
  </div>
  <ScrambledText
    className="scrambled-text-demo"
    radius={100}
    duration={1.2}
    speed={0.5}
    scrambleChars=".:"
  >
    Outside of academics, I enjoy playing video games, coding, making things from scratch, and solving challenging problems. I'm also passionate about exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community.
  </ScrambledText>
</motion.div>
```

Replace with:

```jsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  viewport={{ once: true }}
  className="about-text"
>
  <AboutBento />
</motion.div>
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: replace about-text block with AboutBento component"
```

---

### Task 6: Add CSS layout overrides

**Files:**
- Modify: `src/App.css`

Override the bento grid to 2 columns inside the about section left column, set the first card to span full width, and reset the default nth-child span rules that are designed for 4-column desktop layout.

- [ ] **Step 1: Add overrides at the end of `src/App.css`**

Append these rules at the bottom of `src/App.css`:

```css
/* ── AboutBento grid overrides ─────────────────────────────────────── */
.about-text .card-grid {
  grid-template-columns: repeat(2, 1fr);
  max-width: 100%;
  padding: 0;
  font-size: 1rem;
}

/* Reset default MagicBento nth-child spanning rules for 4-col layout */
.about-text .magic-bento-card:nth-child(3),
.about-text .magic-bento-card:nth-child(4),
.about-text .magic-bento-card:nth-child(6) {
  grid-column: unset;
  grid-row: unset;
}

/* First card spans full width as the hero card */
.about-text .magic-bento-card:nth-child(1) {
  grid-column: 1 / -1;
  aspect-ratio: 16 / 5;
  min-height: 100px;
}

/* Remaining cards: uniform 4/3 aspect ratio */
.about-text .magic-bento-card:nth-child(n+2) {
  aspect-ratio: 4 / 3;
  min-height: 120px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.css
git commit -m "feat: add CSS grid overrides for AboutBento in about section"
```

---

### Task 7: Visual verification

**Files:**
- No file changes

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and scroll to the About Me section.

- [ ] **Step 2: Check these things**

1. Left side shows the bento grid (not the old text)
2. Hero card (AI/ML) spans the full width of the left column
3. 4 small cards fill the 2×2 grid below
4. Hovering a card shows Electric Mint border glow and particles
5. Cursor spotlight follows across the bento area
6. Right side (CareerTimeline) is unaffected
7. Section entrance animation still slides in from the left
8. On mobile (≤768px), bento cards stack full-width with no animations

- [ ] **Step 3: Fix any visual regressions before proceeding**

Common issues and fixes:
- Cards too tall → reduce `min-height` on `.about-text .magic-bento-card:nth-child(n+2)` in App.css
- Hero card too short → increase `aspect-ratio` on `.about-text .magic-bento-card:nth-child(1)` 
- Grid overflows left column → check `.about-text` has `overflow: hidden` or `width: 100%` in App.css
- Glow appears purple instead of mint → verify `glowColor="100, 255, 218"` in AboutBento.jsx

---

### Task 8: Lint check + final commit

**Files:**
- No file changes

- [ ] **Step 1: Run linter**

```bash
npm run lint
```

Expected: no errors. If there are unused import warnings from App.jsx (removed ScrambledText / DecryptedText usage), check whether those components are used elsewhere before removing their imports.

- [ ] **Step 2: Verify DecryptedText / ScrambledText imports are still needed**

In `src/App.jsx`, search for any remaining uses of `DecryptedText` and `ScrambledText`. These components are used in many other sections (hero, projects, skills) so their imports should remain. Only remove an import if zero uses remain.

- [ ] **Step 3: Commit lint-clean state**

```bash
git add -p  # stage any lint fixes only
git commit -m "chore: lint clean after AboutBento integration"
```

If there were no lint fixes, skip this commit.

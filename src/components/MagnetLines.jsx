import { useRef, useEffect } from "react";
import "./MagnetLines.css";

export default function MagnetLines({
  rows = 20,
  columns = 20,
  containerSize = "80vmin",
  lineColor = "#efefef",
  lineWidth = "1vmin",
  lineHeight = "6vmin",
  baseAngle = -10,
  scrollReactive = false,
  className = "",
  style = {}
}) {
  const containerRef = useRef(null);

  // Scroll energy: the field brightens and breathes with scroll velocity, then settles.
  // One inherited CSS variable (`--scroll-energy`) drives the paint; no per-line work.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !scrollReactive) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let energy = 0;
    let lastY = window.scrollY;
    let raf = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const v = Math.min(Math.abs(y - lastY), 60);
      lastY = y;
      energy = Math.min(energy + v / 55, 1);
    };

    const tick = () => {
      energy *= 0.9; // exponential decay back to rest
      if (energy < 0.001) energy = 0;
      container.style.setProperty("--scroll-energy", energy.toFixed(3));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      container.style.removeProperty("--scroll-energy");
    };
  }, [scrollReactive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll("span");

    const onPointerMove = (pointer) => {
      // Check if mouse is over dock or other UI elements
      const dockElement = document.querySelector('.dock-panel');
      if (dockElement) {
        const dockRect = dockElement.getBoundingClientRect();
        if (pointer.x >= dockRect.left && pointer.x <= dockRect.right &&
            pointer.y >= dockRect.top && pointer.y <= dockRect.bottom) {
          return; // Don't animate when hovering over dock
        }
      }

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;

        const b = pointer.x - centerX;
        const a = pointer.y - centerY;
        const c = Math.sqrt(a * a + b * b) || 1;
        const r =
          (Math.acos(b / c) * 180) / Math.PI * (pointer.y > centerY ? 1 : -1);

        item.style.setProperty("--rotate", `${r}deg`);
      });
    };

    window.addEventListener("pointermove", onPointerMove);

    if (items.length) {
      const middleIndex = Math.floor(items.length / 2);
      const rect = items[middleIndex].getBoundingClientRect();
      onPointerMove({ x: rect.x, y: rect.y });
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  const total = rows * columns;
  const spans = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      style={{
        "--rotate": `${baseAngle}deg`,
        backgroundColor: lineColor,
        width: lineWidth,
        height: lineHeight
      }}
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`magnetLines-container ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style
      }}
    >
      {spans}
    </div>
  );
} 
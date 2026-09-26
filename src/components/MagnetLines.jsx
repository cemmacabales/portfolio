import { useRef, useEffect } from "react";
import "./MagnetLines.css";

export default function MagnetLines({
  rows = 20,
  columns = 20,
  containerSize = "80vmin",
  width,
  height,
  lineColor = "#efefef",
  lineWidth = "1vmin",
  lineHeight = "6vmin",
  baseAngle = -10,
  className = "",
  style = {}
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll("span"));
    // Line centers in page coordinates, so scrolling never invalidates them.
    // Re-measured only when layout can actually have moved.
    let centers = [];
    const angles = items.map(() => baseAngle);
    let frame = 0;
    let pointer = null;

    const measure = () => {
      const { scrollX, scrollY } = window;
      centers = items.map((item) => {
        const rect = item.getBoundingClientRect();
        return [rect.x + rect.width / 2 + scrollX, rect.y + rect.height / 2 + scrollY];
      });
    };

    const apply = () => {
      frame = 0;
      if (!pointer || centers.length !== items.length) return;
      const px = pointer.x + window.scrollX;
      const py = pointer.y + window.scrollY;
      items.forEach((item, i) => {
        const [cx, cy] = centers[i];
        let angle = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
        // A line looks the same flipped 180°, so pick the equivalent angle
        // nearest the last one; the eased transition then never spins around.
        const previous = angles[i];
        while (angle - previous > 90) angle -= 180;
        while (angle - previous < -90) angle += 180;
        angles[i] = angle;
        item.style.setProperty("--rotate", `${angle}deg`);
      });
    };

    const onPointerMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    measure();
    // Entrance animations transform the container; measure again once settled.
    const settle = setTimeout(measure, 1400);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [baseAngle, rows, columns]);

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
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: width ?? containerSize,
        height: height ?? containerSize,
        ...style
      }}
    >
      {spans}
    </div>
  );
}

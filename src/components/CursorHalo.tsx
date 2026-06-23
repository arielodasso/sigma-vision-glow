import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Subtle white halo cursor that follows the pointer and grows over
 * interactive elements. Matches Sigma's monochrome aesthetic.
 * Disabled on touch devices, reduced motion, and admin routes.
 */
const CursorHalo = () => {
  const location = useLocation();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      setEnabled(false);
      return;
    }
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;
    setEnabled(true);

    let raf = 0;
    let next = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      next = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement | null;
      const isActive = !!t?.closest(
        "a, button, [role='button'], [data-cta], input, textarea, select, label"
      );
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setPos(next);
        setActive(isActive);
        raf = 0;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isAdmin]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${active ? 2.6 : 1})`,
        transition: "transform 0.18s ease-out, opacity 0.2s",
        opacity: active ? 0.95 : 0.55,
      }}
    >
      <div
        className="rounded-full bg-white"
        style={{
          width: 18,
          height: 18,
          boxShadow: active
            ? "0 0 28px hsl(0 0% 100% / 0.5)"
            : "0 0 14px hsl(0 0% 100% / 0.35)",
        }}
      />
    </div>
  );
};

export default CursorHalo;

"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  // Starts false so server and client render the same (no cursor) markup;
  // the effect below flips it after mount once we can safely check
  // matchMedia, avoiding a hydration mismatch.
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReducedMotion) return;

    // Syncs with a platform capability (pointer type) that only exists
    // client-side; this one-time flag can't be known during initial render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setHovering(!!target.closest("a, button, input, textarea, select, [role='button']"));
    }

    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div
        className="absolute h-1.5 w-1.5 rounded-full bg-[var(--gold)] transition-transform duration-100"
        style={{ left: pos.x - 3, top: pos.y - 3 }}
      />
      <div
        className="absolute rounded-full border border-[var(--gold)] transition-all duration-150 ease-out"
        style={{
          left: pos.x - (hovering ? 20 : 12),
          top: pos.y - (hovering ? 20 : 12),
          width: hovering ? 40 : 24,
          height: hovering ? 40 : 24,
          opacity: hovering ? 0.5 : 0.3,
        }}
      />
    </div>
  );
}

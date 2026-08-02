import { useCallback, useEffect, useRef, type ReactNode } from "react";

/**
 * Sub-2° pointer tilt for showcase glass. Pure transform updates on the
 * inner node (rAF-throttled, only while hovering) — GPU-composited, no
 * React state, no layout. Falls back to nothing on touch devices.
 */
export default function TiltCard({
  children,
  className = "",
  max = 1.6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const release = useRef(0);
  const promoted = useRef(false);
  const rect = useRef<DOMRect | null>(null);
  const target = useRef({ rx: 0, ry: 0 });

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(release.current);
      window.removeEventListener("scroll", invalidate);
    },
    []
  );

  const write = () => {
    raf.current = 0;
    const el = inner.current;
    if (!el) return;
    el.style.transform = `perspective(1000px) rotateX(${target.current.rx}deg) rotateY(${target.current.ry}deg)`;
  };

  /* Promote only while the pointer is actually on the card.
     `will-change: transform` was set permanently in the style prop, so every
     TiltCard on the page held a compositor layer for an effect that can only
     ever run under the cursor — and on touch devices, never. Set on enter,
     dropped once the 400ms release transition has run. */
  const promote = (on: boolean) => {
    const el = inner.current;
    // guarded: assigning the same value on every pointermove is a pointless
    // CSSOM write, and this handler runs at pointer rate (up to 120Hz)
    if (!el || promoted.current === on) return;
    promoted.current = on;
    el.style.willChange = on ? "transform" : "auto";
  };

  /* Scrolling under a hovered card moves its box, so the cached rect has to be
     dropped — the next pointermove re-reads it. Only bound while hovering.
     Identity must be stable, or add/remove would target different functions
     across renders and the listener would leak. */
  const invalidate = useCallback(() => {
    rect.current = null;
  }, []);

  const onEnter = () => {
    window.clearTimeout(release.current);
    promote(true);
    // Cache the box per hover. Reading it inside onMove forced a style +
    // layout flush on every single pointer event, which is exactly the kind of
    // per-move layout thrash that makes a hover feel heavy.
    rect.current = inner.current?.getBoundingClientRect() ?? null;
    window.addEventListener("scroll", invalidate, { passive: true });
  };

  const onMove = (e: React.PointerEvent) => {
    // re-read only when the cache was invalidated, not on every move
    const r = (rect.current ??= inner.current?.getBoundingClientRect() ?? null);
    if (!r || !r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    target.current = { rx: -py * max * 2, ry: px * max * 2 };
    if (!raf.current) raf.current = requestAnimationFrame(write);
  };

  const reset = () => {
    window.removeEventListener("scroll", invalidate);
    rect.current = null;
    target.current = { rx: 0, ry: 0 };
    if (!raf.current) raf.current = requestAnimationFrame(write);
    // hold the layer until the card has finished easing back to flat
    window.clearTimeout(release.current);
    release.current = window.setTimeout(() => promote(false), 460);
  };

  return (
    <div
      className={className}
      // NOTE: no `transform-style: preserve-3d` here. It put every card into a
      // 3D rendering context, which broke pointer hit-testing on the card (the
      // tilt is unaffected — the perspective() lives in the child's own
      // transform, so it still reads as depth).
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div
        ref={inner}
        className="no-theme-anim h-full"
        style={{ transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        {children}
      </div>
    </div>
  );
}

import { useRef, type ReactNode } from "react";

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
  const target = useRef({ rx: 0, ry: 0 });

  const write = () => {
    raf.current = 0;
    const el = inner.current;
    if (!el) return;
    el.style.transform = `perspective(1000px) rotateX(${target.current.rx}deg) rotateY(${target.current.ry}deg)`;
  };

  const onMove = (e: React.PointerEvent) => {
    const el = inner.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    target.current = { rx: -py * max * 2, ry: px * max * 2 };
    if (!raf.current) raf.current = requestAnimationFrame(write);
  };

  const reset = () => {
    target.current = { rx: 0, ry: 0 };
    if (!raf.current) raf.current = requestAnimationFrame(write);
  };

  return (
    <div
      className={className}
      // NOTE: no `transform-style: preserve-3d` here. It put every card into a
      // 3D rendering context, which broke pointer hit-testing on the card (the
      // tilt is unaffected — the perspective() lives in the child's own
      // transform, so it still reads as depth).
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div
        ref={inner}
        className="no-theme-anim h-full"
        style={{
          transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

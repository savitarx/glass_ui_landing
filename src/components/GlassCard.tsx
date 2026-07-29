import { forwardRef, useEffect, useRef, type HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  /** Nested cards: skip the backdrop-filter pass for smooth scrolling. */
  lite?: boolean;
  radius?: string;
};

/**
 * Reusable optical-glass surface with sheen + edge-catch.
 *
 * PERF: `backdrop-filter` is the most expensive property on this page — the
 * compositor re-blurs everything behind the panel whenever that content moves,
 * which during a scroll means every single frame, for every panel, including
 * the ones far off screen. So each panel only keeps its backdrop-filter while
 * it is near the viewport; the rest drop to a plain translucent fill. The swap
 * happens a full viewport early, so it is never visible.
 */
const GlassCard = forwardRef<HTMLDivElement, Props>(
  (
    { className = "", strong, lite, radius = "rounded-[32px]", children, ...rest },
    ref
  ) => {
    const inner = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      // `lite` panels have no backdrop-filter to begin with — nothing to gate.
      if (lite) return;
      const el = inner.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => el.classList.toggle("glass-far", !e.isIntersecting),
        { rootMargin: "100% 0px 100% 0px" } // arm one viewport early
      );
      io.observe(el);
      return () => io.disconnect();
    }, [lite]);

    const base = lite ? "glass-lite" : "glass";
    return (
      <div
        ref={(node) => {
          inner.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={`${base} glass-sheen ${strong && !lite ? "glass-strong" : ""} ${radius} ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;

import { forwardRef, useEffect, useRef, type HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  /** Nested cards: skip the backdrop-filter pass for smooth scrolling. */
  lite?: boolean;
  radius?: string;
  /**
   * Adds a light that travels around the card's edge while hovered — on top
   * of the existing sheen and edge-catch, which are untouched.
   *
   * Opt-in rather than automatic: the effect repaints the element each frame
   * it runs, which is trivial for a content card (~0.15 MPx) but wasteful on
   * the full-width section panels, so those don't get it.
   */
  glow?: boolean;
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
    {
      className = "",
      strong,
      lite,
      glow,
      radius = "rounded-[32px]",
      children,
      ...rest
    },
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
        className={`${base} glass-sheen ${glow ? "glass-glow" : ""} ${strong && !lite ? "glass-strong" : ""} ${radius} ${className}`}
        {...rest}
      >
        {children}
        {/* Rendered LAST and absolutely positioned, so it is out of flow and
            cannot shift any layout, and a `space-y` parent would only give it
            a margin that has no effect. .glass/.glass-lite are both
            position:relative already, so inset:0 anchors correctly. */}
        {glow && <span className="glass-glow__ring" aria-hidden />}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;

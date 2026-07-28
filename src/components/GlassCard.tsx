import { forwardRef, type HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  /** Nested cards: skip the backdrop-filter pass for smooth scrolling. */
  lite?: boolean;
  radius?: string;
};

/** Reusable optical-glass surface with sheen + edge-catch. */
const GlassCard = forwardRef<HTMLDivElement, Props>(
  (
    { className = "", strong, lite, radius = "rounded-[32px]", children, ...rest },
    ref
  ) => {
    const base = lite ? "glass-lite" : "glass";
    return (
      <div
        ref={ref}
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

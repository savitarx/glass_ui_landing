import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-medium transition-shadow duration-300 ease-apple select-none";

  // Softer, more diffused glow (larger blur, lower opacity) that lifts on hover.
  const styles =
    variant === "primary"
      ? "text-white shadow-[0_10px_30px_-14px_rgba(109,94,252,0.6),0_2px_8px_-4px_rgba(109,94,252,0.5)] hover:shadow-[0_18px_46px_-16px_rgba(109,94,252,0.7),0_3px_10px_-4px_rgba(109,94,252,0.55)]"
      : "glass-lite glass-sheen text-soft hover:text-[color:var(--text)]";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
      className={`${base} ${styles} ${className}`}
      style={
        variant === "primary"
          ? {
              background:
                "linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #3a2fd0))",
            }
          : undefined
      }
    >
      {/* glass reflection: a soft top-edge sheen sitting over the fill */}
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 38%, transparent 62%)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)",
          }}
        />
      )}
      <span className="relative z-[1] inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

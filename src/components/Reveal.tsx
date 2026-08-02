import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";

/**
 * Entrance reveal: fade + slight upward drift + a gentle 98% → 100% scale,
 * eased on a soft spring so it settles like glass rather than snapping.
 * GPU-only (opacity + transform), ~520ms perceived.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 20,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  /* The reveal plays ONCE (viewport.once). Holding `will-change` after it
     finishes pins a compositor layer per instance for the rest of the session
     — measured at 26 such elements on the home page — so it is released as
     soon as the entrance settles. */
  const [settled, setSettled] = useState(false);

  return (
    <motion.div
      className={className}
      style={{ willChange: settled ? "auto" : "transform, opacity" }}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      onAnimationComplete={() => setSettled(true)}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 0.9,
        delay,
        opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
      }}
    >
      {children}
    </motion.div>
  );
}

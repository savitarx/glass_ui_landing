import { motion } from "framer-motion";
import type { ReactNode } from "react";

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
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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

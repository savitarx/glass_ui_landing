import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

type Props = {
  /**
   * Element that actually scrolls. Omit for page-level scrolling (window),
   * pass the modal's scroll container when used inside a dialog.
   */
  scroller?: React.RefObject<HTMLElement | null>;
  /** distance scrolled before it appears */
  threshold?: number;
  className?: string;
};

/**
 * Glass "back to top" pill. Fades + lifts into view once you've scrolled past
 * the threshold, and returns the surface to the top when pressed.
 *
 * Works against either the window or a specific scroll container, so the same
 * component serves the standalone pages and the project modal.
 */
export default function ScrollTop({
  scroller,
  threshold = 320,
  className = "",
}: Props) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = scroller?.current ?? null;
    const target: HTMLElement | Window = el ?? window;

    const read = () =>
      el ? el.scrollTop : window.scrollY || document.documentElement.scrollTop;

    /* No rAF wrapper: the handler is a single comparison, and React bails out
       when the value is unchanged, so this costs less than scheduling a frame.
       It also avoids depending on rAF firing at all. */
    const onScroll = () => {
      const next = read() > threshold;
      setShown((prev) => (prev === next ? prev : next));
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener("scroll", onScroll);
  }, [scroller, threshold]);

  const toTop = () => {
    const el = scroller?.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Page-level: go through Lenis when it's driving the scroll. Its rAF loop
    // parks itself once idle, so it must be woken or the scrollTo never runs.
    const w = window as unknown as {
      __lenis?: { scrollTo: (v: number) => void };
      __lenisWake?: () => void;
    };
    if (w.__lenis) {
      w.__lenis.scrollTo(0);
      w.__lenisWake?.();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          title="Back to top"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.6 }}
          className={`scroll-top glass-lite glass-sheen ${className}`}
        >
          <ArrowUp size={18} strokeWidth={2.4} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

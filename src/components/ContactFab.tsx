import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { navigate } from "../hooks/useRoute";

/**
 * Floating "start a project" button, bottom-right.
 *
 * Appears once the visitor has scrolled past the hero — showing it immediately
 * would just duplicate the hero's own CTA on top of itself. It shares the
 * corner with the back-to-top pill, so the two are stacked by CSS rather than
 * overlapping (see .contact-fab in index.css).
 *
 * Desktop keeps the full glossy treatment. Phones switch to a plainer frosted
 * surface: a fixed control over a small screen covers real content, so the
 * highlights and reflections are dropped there and only the blur remains.
 */
export default function ContactFab() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    /* Same reasoning as ScrollTop: Lenis drives the page scroll and native
       `scroll` events do not reliably fire while it is active, so we listen to
       both. Lenis is created by a parent effect that runs after this one, so a
       single retry covers the ordering. */
    const read = () => window.scrollY || document.documentElement.scrollTop;
    const onScroll = () => {
      const next = read() > 620;
      setShown((prev) => (prev === next ? prev : next));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    type Lenis = {
      on: (e: string, f: () => void) => void;
      off: (e: string, f: () => void) => void;
    };
    let lenis: Lenis | null = null;
    let retry = 0;
    const attach = () => {
      const l = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (!l?.on) return false;
      l.on("scroll", onScroll);
      lenis = l;
      return true;
    };
    if (!attach()) retry = window.setTimeout(attach, 400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (retry) window.clearTimeout(retry);
      lenis?.off("scroll", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          type="button"
          onClick={() => navigate("/get-started")}
          aria-label="Start a project"
          title="Start a project"
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.9 }}
          /* Transform lives here, not in CSS: framer writes an inline
             `transform`, which would beat any :hover rule in the stylesheet. */
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.6 }}
          className="contact-fab glass-lite glass-sheen"
        >
          <MessageCircle size={19} strokeWidth={2.1} aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

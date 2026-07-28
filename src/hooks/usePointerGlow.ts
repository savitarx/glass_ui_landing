import { useEffect } from "react";

/**
 * One global pointer listener → writes --gx / --gy (0..1 viewport) on <html>,
 * rAF-throttled. Every glass surface reads these to drift its reflection.
 * No React re-renders, no per-card listeners — effectively free.
 */
export function usePointerGlow() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip touch
    let raf = 0;
    let x = 0.5;
    let y = 0.22;

    const apply = () => {
      raf = 0;
      const root = document.documentElement;
      root.style.setProperty("--gx", x.toFixed(4));
      root.style.setProperty("--gy", y.toFixed(4));
    };
    const onMove = (e: PointerEvent) => {
      // While a modal is open the page behind it is blurred and mostly hidden,
      // so drifting the glow only costs repaints on every backdrop-filter
      // panel — which shows up as flicker. Freeze it until the modal closes.
      if (document.documentElement.hasAttribute("data-modal-open")) return;
      x = e.clientX / window.innerWidth;
      y = e.clientY / window.innerHeight;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

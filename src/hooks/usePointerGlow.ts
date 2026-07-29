import { useEffect } from "react";

/**
 * One global pointer listener → writes --gx / --gy (0..1 viewport) on <html>,
 * rAF-throttled. Every glass surface reads these to drift its reflection.
 * No React re-renders, no per-card listeners — effectively free.
 */
export function usePointerGlow() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip touch
    // PERF: writing a custom property on <html> invalidates style for every
    // element that inherits it, which forces each backdrop-filter panel to
    // recomposite. Skip it entirely on weaker devices — the sheen is static
    // there and nobody misses the drift.
    if (document.documentElement.dataset.perf === "low") return;
    let raf = 0;
    let x = 0.5;
    let y = 0.22;
    let lastX = -1;
    let lastY = -1;

    const apply = () => {
      raf = 0;
      // Quantised to ~1/60th of the viewport: sub-pixel changes were triggering
      // a full-document style invalidation on every single mouse move for a
      // reflection shift nobody can see.
      const qx = Math.round(x * 60) / 60;
      const qy = Math.round(y * 60) / 60;
      if (qx === lastX && qy === lastY) return;
      lastX = qx;
      lastY = qy;
      const root = document.documentElement;
      root.style.setProperty("--gx", qx.toFixed(4));
      root.style.setProperty("--gy", qy.toFixed(4));
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

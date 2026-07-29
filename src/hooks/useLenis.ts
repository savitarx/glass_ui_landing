import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Installs a single global Lenis smooth-scroll instance and exposes it on
 * window.__lenis so nav links can scrollTo() sections.
 */
export function useLenis() {
  useEffect(() => {
    // PERF: smooth scroll is a luxury with a real cost — it runs a permanent
    // rAF loop AND stretches every wheel gesture over ~1.2s, and for that whole
    // time every on-screen backdrop-filter panel is re-blurred each frame.
    // Weak devices and reduced-motion users get native scrolling instead.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || document.documentElement.dataset.perf === "low") return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // PERF: the rAF loop parks itself once Lenis has settled and is woken by
    // scroll input, instead of ticking 60x/s for the life of the page.
    let raf = 0;
    let idle = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      // `velocity` is ~0 once the smoothing has caught up with the real scroll
      if (Math.abs(lenis.velocity) < 0.05) {
        if (++idle > 20) {
          raf = 0;
          return; // park
        }
      } else {
        idle = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      idle = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("keydown", wake);
    lenis.on("scroll", wake);

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    // so scrollToId() can restart the loop if it happens to be parked
    (window as unknown as { __lenisWake?: () => void }).__lenisWake = wake;

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", wake);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: -110, duration: 1.25 });
    // the rAF loop parks itself when idle — make sure it's running
    (window as unknown as { __lenisWake?: () => void }).__lenisWake?.();
  } else {
    // low-perf / reduced-motion path: no Lenis instance at all
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

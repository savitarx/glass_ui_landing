import { useEffect, useState } from "react";

export type PerfTier = "high" | "low";

/**
 * Decides how much visual work this device can afford, and publishes it as
 * `<html data-perf="high|low">` so CSS can react too.
 *
 * Two stages:
 *  1. A cheap static guess from device hints (cores / memory / touch /
 *     reduced-motion / save-data) — applied before the first paint.
 *  2. A short live FPS probe. Hints lie constantly (an old dual-GPU laptop can
 *     report 8 cores), so if the page can't actually hold ~45fps we downgrade.
 *     This is what protects weaker laptops we can't detect any other way.
 *
 * `low` turns off the WebGL blob, the ambient-light drift and the heaviest
 * blurs — the layout and glass look stay intact.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(() => {
    if (typeof window === "undefined") return "high";
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const cores = nav.hardwareConcurrency ?? 8;
    const mem = nav.deviceMemory ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.matchMedia("(max-width: 900px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = nav.connection?.saveData === true;

    if (reduced || saveData || coarse || small || cores <= 4 || mem <= 4) {
      return "low";
    }
    return "high";
  });

  // publish immediately so CSS can gate the expensive effects
  useEffect(() => {
    document.documentElement.dataset.perf = tier;
  }, [tier]);

  /* Re-evaluate the size-based half of the guess when the viewport changes.
     It used to be read only once at mount, so resizing a window (or rotating a
     phone) left the tier stale — measured reporting "high" at a 418px viewport,
     which meant a phone-sized screen kept all the desktop-only effects. */
  useEffect(() => {
    const sync = () => {
      const small =
        window.matchMedia("(max-width: 900px)").matches ||
        window.matchMedia("(pointer: coarse)").matches;
      if (small) setTier("low");
    };
    const ro = new ResizeObserver(sync);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  // live FPS probe — only worth running if we currently think we're "high"
  useEffect(() => {
    if (tier !== "high") return;
    let raf = 0;
    let frames = 0;
    let start = 0;
    let stopped = false;

    const tick = (t: number) => {
      if (stopped) return;
      if (!start) start = t;
      frames++;
      const elapsed = t - start;
      if (elapsed >= 2000) {
        const fps = (frames * 1000) / elapsed;
        if (fps < 45) setTier("low"); // can't keep up → shed the heavy effects
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    // let the entrance animations settle before measuring
    const delay = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 1200);

    return () => {
      stopped = true;
      window.clearTimeout(delay);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tier]);

  return tier;
}

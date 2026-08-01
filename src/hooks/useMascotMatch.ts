import { useEffect } from "react";

/**
 * Keeps the light-mode mascot's plate matched to the page colour.
 *
 * The source clip sits on a near-white plate (~rgb(255,253,254)). To make that
 * rectangle disappear it has to be scaled down to the page's own luminance —
 * previously a hard-coded `brightness(0.92)`, which silently broke every time
 * the page tone was adjusted (the plate reappeared as a visible box twice).
 *
 * This reads the ACTUAL page colour at runtime and publishes the correct ratio
 * as `--mascot-b`, so the blend can no longer drift out of sync with the theme.
 */

/** luminance-ish average of a CSS colour string */
function avg(color: string): number | null {
  const m = color.match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  return (+m[0] + +m[1] + +m[2]) / 3;
}

/** the plate's own average, measured from the asset */
const PLATE = (255 + 253 + 254) / 3;

export function useMascotMatch() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      /* Only derive while the LIGHT theme is active. The plate correction is
         applied in light mode only, and reading --page-1 under `.dark` yields
         the dark page (~rgb 25) — which produced a ratio of 0.098 and would
         have crushed the mascot to black the moment the theme flipped back. */
      if (root.classList.contains("dark")) return;

      // --page-1 is a hex literal; resolve it through a probe element so we get
      // back a computed rgb() regardless of the notation used in the token.
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;opacity:0;pointer-events:none;background:var(--page-1)";
      root.appendChild(probe);
      const page = avg(getComputedStyle(probe).backgroundColor);
      probe.remove();
      if (!page) return;

      // clamp: a value above 1 would brighten the plate, which never helps
      const ratio = Math.min(1, page / PLATE);
      root.style.setProperty("--mascot-b", ratio.toFixed(4));
    };

    sync();
    // the token changes with the theme, so re-derive on that flip
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
}

import { useEffect, useRef } from "react";

/**
 * The ambient glass orb that drifts behind the page as you scroll.
 *
 * This replaces the WebGL/MeshTransmissionMaterial version. That one re-rendered
 * the scene several times per frame, forever, which pinned the GPU at ~100% on
 * ordinary laptops. This costs essentially nothing:
 *
 *  - Colour comes from layered radial-gradients, NOT `filter: blur()`. Gradients
 *    are rasterised once; a blur of this size is re-rasterised whenever the layer
 *    changes and is one of the most expensive things you can put on a page.
 *  - Movement is `translate3d` only — never scale, never blur, never opacity on a
 *    blurred parent — so the compositor just moves an existing texture.
 *  - One shared rAF that only runs while the scroll position is still changing,
 *    then parks itself. Idle scrolling costs zero frames.
 */
export default function AmbientOrb() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let running = false;
    let curX = 0;
    let curY = 0;
    let tgtX = 0;
    let tgtY = 0;

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      // same journey as before: upper-left → centre → right
      tgtX = -26 + p * 62; // vw
      tgtY = 12 - p * 26; // vh
      kick();
    };

    const frame = () => {
      curX += (tgtX - curX) * 0.06;
      curY += (tgtY - curY) * 0.06;
      el.style.transform = `translate3d(${curX.toFixed(2)}vw, ${curY.toFixed(2)}vh, 0)`;
      if (Math.abs(tgtX - curX) > 0.02 || Math.abs(tgtY - curY) > 0.02) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        running = false; // park — no work while nothing is moving
      }
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll, { passive: true });
    readScroll();
    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="orb-layer" aria-hidden>
      <div ref={ref} className="orb">
        <span className="orb__body" />
        <span className="orb__hi" />
      </div>
    </div>
  );
}

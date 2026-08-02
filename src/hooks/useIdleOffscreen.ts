import { useEffect, useRef } from "react";

/**
 * Adds `idle-off` to an element whenever it leaves the viewport.
 *
 * Infinite CSS animations keep running — and keep their compositor layers
 * alive — long after the element has scrolled away, where nobody can see
 * them. CSS pairs this class with `animation-play-state: paused` and
 * `will-change: auto`, so an off-screen decoration costs neither frames nor
 * GPU memory.
 *
 * `rootMargin` keeps a margin of pre-roll so motion is already running by the
 * time the element scrolls back into sight.
 */
export function useIdleOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("idle-off", !e.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

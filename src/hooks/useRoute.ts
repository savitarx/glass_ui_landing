import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Minimal hash router — no dependency, and it works on any static host without
 * server rewrite rules (a real path would 404 on refresh unless the host is
 * configured for SPA fallback).
 *
 *   "#/get-started"  →  "/get-started"
 *   ""               →  "/"
 *
 * Scroll behaviour is deliberate and differs by destination:
 *   · a standalone page (get-started / privacy / terms) always opens at the TOP
 *   · returning HOME restores the exact position you left from, so clicking
 *     e.g. "Privacy" in the footer and coming back puts you back at the footer
 *     instead of the top of the page
 */

/* The browser restores its own scroll offset on history navigation, which
   fights both behaviours above. We manage it ourselves. */
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

type LenisLike = {
  scrollTo: (v: number, o?: { immediate?: boolean }) => void;
};

function read(): string {
  const h = window.location.hash.replace(/^#/, "");
  if (!h || h === "/") return "/";
  // ignore in-page anchors like "#projects" used by the one-page nav
  if (!h.startsWith("/")) return "/";
  return h.replace(/\/+$/, "") || "/";
}

const currentScroll = () =>
  window.scrollY || document.documentElement.scrollTop || 0;

/** Where the user was on the home page when they navigated away. */
let homeScroll = 0;
/** The route we are currently showing — needed to know what we're leaving. */
let activeRoute = typeof window === "undefined" ? "/" : read();

function applyScroll(y: number) {
  const w = window as unknown as { __lenis?: LenisLike };
  window.scrollTo(0, y);
  // Lenis keeps its own position; without this it snaps back to where it was.
  w.__lenis?.scrollTo(y, { immediate: true });
}

/**
 * Applying once isn't enough, and blind retries aren't either.
 *
 * The scroll is set while the OUTGOING view is still mounted, so the document
 * is still the old (often much shorter) height and the browser CLAMPS the
 * target — restoring 4200px on a page that is currently 1500px tall silently
 * lands at ~630. So this re-applies until the position is actually reached,
 * on a timeout ladder rather than rAF alone (rAF can be throttled, and then
 * the correction never runs at all).
 */
function settleScroll(y: number) {
  const delays = [0, 16, 32, 64, 120, 240, 400];
  delays.forEach((d) =>
    window.setTimeout(() => {
      // stop early once we're there — avoids fighting a user who has scrolled
      if (Math.abs(currentScroll() - y) <= 2) return;
      applyScroll(y);
    }, d)
  );
  applyScroll(y);
}

/** Top for standalone pages; the remembered offset for home. */
function scrollForRoute(route: string) {
  settleScroll(route === "/" ? homeScroll : 0);
}

export function navigate(path: string) {
  const target = path === "/" ? "" : `#${path}`;

  // Leaving home → remember exactly where we were, before anything moves.
  if (activeRoute === "/" && path !== "/") homeScroll = currentScroll();

  if (window.location.hash === target) {
    // already on this route — still honour its scroll rule
    activeRoute = path;
    scrollForRoute(path);
    return;
  }
  // the hashchange handler below does the rest
  window.location.hash = target;
}

export function useRoute(): string {
  const [route, setRoute] = useState(read);
  /** skip the scroll pass on first mount — nothing has navigated yet */
  const first = useRef(true);

  useEffect(() => {
    const onChange = () => {
      const next = read();
      // covers browser back/forward too, not just navigate()
      if (activeRoute === "/" && next !== "/") homeScroll = currentScroll();
      activeRoute = next;
      setRoute(next);
      // NOTE: the scroll is applied in the layout effect below, not here.
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  /* Scroll AFTER the new route is in the DOM but BEFORE the browser paints.
     This used to run inside the hashchange handler, which fires before React
     re-renders — so it scrolled to the saved offset (e.g. 4200px) while the
     short standalone page was still mounted. The viewport ended up past the end
     of that page's content, showing nothing but the fixed lavender/violet
     background field: the purple flash seen when returning home.
     useLayoutEffect runs after the commit and before paint, so that
     intermediate state can never be shown. */
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollForRoute(route);
  }, [route]);

  return route;
}

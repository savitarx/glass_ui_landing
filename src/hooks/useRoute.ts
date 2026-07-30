import { useEffect, useState } from "react";

/**
 * Minimal hash router — no dependency, and it works on any static host without
 * server rewrite rules (a real path would 404 on refresh unless the host is
 * configured for SPA fallback).
 *
 *   "#/get-started"  →  "/get-started"
 *   ""               →  "/"
 */
function read(): string {
  const h = window.location.hash.replace(/^#/, "");
  if (!h || h === "/") return "/";
  // ignore in-page anchors like "#projects" used by the one-page nav
  if (!h.startsWith("/")) return "/";
  return h.replace(/\/+$/, "") || "/";
}

export function navigate(path: string) {
  const target = path === "/" ? "" : `#${path}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
  // land at the top of the new view rather than inheriting the old scroll
  window.scrollTo(0, 0);
}

export function useRoute(): string {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

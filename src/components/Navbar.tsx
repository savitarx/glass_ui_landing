import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { scrollToId } from "../hooks/useLenis";
import { navigate } from "../hooks/useRoute";
import Button from "./Button";

/* Contact is no longer a nav item — the Get Started button is the single,
   deliberate entry point to the inquiry page. */
const LINKS: { label: string; id: string; route?: string }[] = [
  { label: "Home", id: "home" },
  { label: "Projects", id: "projects" },
  { label: "Stack", id: "stack" },
  { label: "Reviews", id: "reviews" },
  { label: "About Us", id: "about" },
  { label: "Help", id: "help" },
];

/**
 * One nav, two forms:
 *  - floating=false → a static header row that lives INSIDE the hero card
 *    (so it reads as part of the hero section). Shown at the top.
 *  - floating=true  → the detached glass pill, fixed, that appears once you
 *    scroll past the hero. No merge animation between them.
 */
export default function SiteNav({ floating = true }: { floating?: boolean }) {
  const { theme, toggle } = useTheme();
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(!floating);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });

    let onScroll: (() => void) | undefined;
    let idle: number | undefined;
    if (floating) {
      // Show while actively scrolling (past the hero); hide when idle or at top.
      onScroll = () => {
        if (idle) window.clearTimeout(idle);
        if (window.scrollY < 160) {
          setShown(false);
          return;
        }
        setShown(true);
        idle = window.setTimeout(() => {
          if (!openRef.current) setShown(false);
        }, 1100);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return () => {
      obs.disconnect();
      if (onScroll) window.removeEventListener("scroll", onScroll);
      if (idle) window.clearTimeout(idle);
    };
  }, [floating]);

  const go = (id: string) => {
    setOpen(false);
    const link = LINKS.find((l) => l.id === id);
    if (link?.route) {
      navigate(link.route);
      return;
    }
    scrollToId(id);
  };

  /** Get Started always opens the inquiry page. */
  const goStarted = () => {
    setOpen(false);
    navigate("/get-started");
  };

  const logo = (
    <button onClick={() => go("home")} className="flex items-center gap-2.5 pl-1">
      <span
        className="grid h-8 w-8 place-items-center rounded-xl text-white shadow-[0_8px_20px_-8px_rgba(109,94,252,0.9)]"
        style={{ background: "linear-gradient(150deg, var(--accent), var(--accent-2))" }}
      >
        <Sparkles size={16} />
      </span>
      <span className="text-[0.98rem] font-semibold tracking-tight">
      &nbsp;Invisos
      </span>
    </button>
  );

  const links = (
    <div className="hidden items-center gap-1 lg:flex">
      {LINKS.map((l) => {
        const isActive = active === l.id;
        return (
          <button
            key={l.id}
            onClick={() => go(l.id)}
            className={`group relative rounded-full px-3.5 py-2 text-[0.9rem] font-medium text-[color:var(--text)] transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-[0.65] hover:opacity-100"
            }`}
          >
            {l.label}
            {isActive ? (
              <motion.span
                layoutId={floating ? "nav-underline-f" : "nav-underline-h"}
                className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : (
              // hover underline: fades + grows from the centre for inactive links
              <span
                className="absolute inset-x-3 -bottom-0.5 h-[2px] origin-center scale-x-0 rounded-full opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-60"
                style={{ background: "var(--text-dim)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );

  const controls = (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="grid h-9 w-9 place-items-center rounded-full text-soft transition-colors duration-300 hover:text-[color:var(--text)] hover:bg-[color:var(--glass-inner)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 30, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </motion.span>
        </AnimatePresence>
      </button>
      <div className="hidden sm:block">
        <Button onClick={goStarted} className="!px-5 !py-2.5">
          Get Started
        </Button>
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="grid h-9 w-9 place-items-center rounded-full text-soft lg:hidden"
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
    </div>
  );

  const mobileMenu = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`glass glass-sheen pointer-events-auto rounded-[26px] p-3 lg:hidden ${
            floating
              ? "absolute top-[74px] w-[calc(100%-2rem)] max-w-sm"
              : "mt-4"
          }`}
        >
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`block w-full rounded-2xl px-4 py-3 text-left text-[1rem] font-medium transition-colors ${
                active === l.id
                  ? "text-[color:var(--text)] bg-[color:var(--glass-inner)]"
                  : "text-soft"
              }`}
            >
              {l.label}
            </button>
          ))}
          <div className="p-2">
            <Button onClick={goStarted} className="w-full">
              Get Started
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Hero variant — part of the hero card
  if (!floating) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--hairline)] pb-5">
          {logo}
          {links}
          {controls}
        </div>
        {mobileMenu}
      </div>
    );
  }

  // Floating pill — appears when scrolled past the hero
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: shown || open ? 0 : -90, opacity: shown || open ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: shown || open ? "auto" : "none" }}
        className="glass glass-strong glass-sheen nav-floating mt-4 flex w-full max-w-6xl items-center justify-between rounded-full py-2 pl-5 pr-2 shadow-glass-hover"
      >
        {logo}
        {links}
        {controls}
      </motion.nav>
      {mobileMenu}
    </div>
  );
}

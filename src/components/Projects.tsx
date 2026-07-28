import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

type Project = {
  title: string;
  desc: string;
  detail: string;
  meta: string;
  tech: string[];
  grad: string;
};

const PROJECTS: Project[] = [
  {
    title: "Aurora Banking",
    desc: "A calm, trustworthy fintech experience with a fully tokenised design system.",
    detail:
      "We rebuilt Aurora's mobile and web banking from the ground up around a single tokenised design system — one source of truth for colour, type, spacing and motion. The result is a calm, trustworthy product that ships new screens in days, not weeks, and reads beautifully in light and dark.",
    meta: "2024 · Fintech · Product + Design System",
    tech: ["React", "TypeScript", "Framer Motion"],
    grad: "linear-gradient(140deg,#b9a8ff,#8fb4ff)",
  },
  {
    title: "Lumen Health",
    desc: "Patient-first telehealth platform focused on clarity and accessibility.",
    detail:
      "Lumen needed a telehealth platform that felt reassuring rather than clinical. We designed an accessible, patient-first flow — from booking to consultation to follow-up — meeting WCAG AA throughout, with a component library that the in-house team now extends on their own.",
    meta: "2023 · Healthcare · Web App",
    tech: ["Next.js", "Node", "Accessibility"],
    grad: "linear-gradient(140deg,#9eecd6,#8fb4ff)",
  },
  {
    title: "Cove Commerce",
    desc: "Headless storefront with a refined, editorial shopping experience.",
    detail:
      "A headless storefront where the shopping experience reads like an editorial. We paired a GraphQL commerce backend with buttery page transitions and rich media, lifting conversion while keeping the brand's quiet, premium tone intact.",
    meta: "2024 · E-commerce · Storefront",
    tech: ["Vite", "GraphQL", "UX"],
    grad: "linear-gradient(140deg,#ffb2d8,#b9a8ff)",
  },
  {
    title: "Northwind CRM",
    desc: "An operations suite that makes complex workflows feel effortless.",
    detail:
      "Northwind's teams juggled dense, complex workflows. We distilled them into an operations suite that feels effortless — progressive disclosure, keyboard-first flows, and a performant Rust core — so power users move fast without ever feeling overwhelmed.",
    meta: "2023 · SaaS · Operations",
    tech: ["React", "Rust", "System Design"],
    grad: "linear-gradient(140deg,#8fb4ff,#9eecd6)",
  },
  {
    title: "Studio Muse",
    desc: "A creative portfolio engine with buttery transitions and rich media.",
    detail:
      "A portfolio engine for creatives who care about craft. WebGL-backed transitions, smart media handling, and a CMS that stays out of the way — every case study loads fast and animates smoothly, on any device.",
    meta: "2024 · Creative · Platform",
    tech: ["Astro", "WebGL", "Framer Motion"],
    grad: "linear-gradient(140deg,#c6b8ff,#ffb2d8)",
  },
  {
    title: "Atlas Analytics",
    desc: "Quiet, legible dashboards that turn data into confident decisions.",
    detail:
      "Atlas turns dense data into confident decisions. We built quiet, legible dashboards with an accessible colour system and D3-powered charts that stay readable at a glance — no chart junk, just signal.",
    meta: "2023 · Analytics · Dashboard",
    tech: ["React", "D3", "Data Viz"],
    grad: "linear-gradient(140deg,#a8d8ff,#b9a8ff)",
  },
];

function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  // Rendered into <body> via a portal so it escapes the .stage transform
  // context — otherwise position:fixed anchors to that tall element and the
  // panel lands far below the viewport.
  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        className="glass glass-sheen glass-nodrift relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-[26px]"
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 22, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-white/90 backdrop-blur-md transition-colors hover:bg-black/20"
          style={{ background: "rgba(0,0,0,0.22)" }}
        >
          <X size={18} />
        </button>

        <div className="relative h-40 w-full sm:h-52" style={{ background: p.grad }}>
          <div className="absolute inset-0 bg-white/10" />
        </div>

        <div className="p-5 sm:p-8">
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-dim sm:text-[0.75rem]">
            {p.meta}
          </div>
          <h3 className="mt-2 text-[1.4rem] font-semibold tracking-tight sm:text-[1.85rem]">
            {p.title}
          </h3>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-soft sm:text-[1rem]">
            {p.detail}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {p.tech.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-[0.7rem] font-medium text-dim sm:text-[0.74rem]"
                style={{
                  background: "var(--glass-inner)",
                  border: "1px solid var(--hairline)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <button
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.9rem] font-medium text-white sm:text-[0.95rem]"
            style={{
              background:
                "linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #3a2fd0))",
            }}
          >
            Visit project <ArrowUpRight size={17} />
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default function Projects() {
  const [active, setActive] = useState<Project | null>(null);

  /* Scroll-lock + Escape + glow-freeze are driven by `active`, NOT by the
     modal's mount lifecycle. If the exit animation ever stalls, the dialog
     may linger in the DOM — tying cleanup to unmount would leave the page
     scroll-locked. Keyed on state, everything releases the moment it closes. */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    const root = document.documentElement;
    root.classList.add("lenis-stopped");
    // pauses the pointer-driven glow so the blurred page behind stops
    // repainting on every cursor move while the dialog is up
    root.setAttribute("data-modal-open", "");
    lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      root.classList.remove("lenis-stopped");
      root.removeAttribute("data-modal-open");
      lenis?.start();
    };
  }, [active]);

  return (
    <section id="projects" className="px-4 pt-24 sm:pt-32">
      <GlassCard className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <SectionHeading
          eyebrow="Selected Work"
          title="Products we're proud of"
          subtitle="A few of the experiences we've designed and engineered end-to-end. Tap a card for the story."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.08} className="h-full">
              <TiltCard className="group h-full">
                <GlassCard
                  lite
                  radius="rounded-[26px]"
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.title} — view project details`}
                  onClick={() => setActive(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(p);
                    }
                  }}
                  className="flex h-full cursor-pointer flex-col overflow-hidden p-4 transition-shadow duration-400 hover:shadow-glass-hover"
                >
                  <div
                    className="relative mb-5 h-40 w-full overflow-hidden rounded-[18px]"
                    style={{ background: p.grad }}
                  >
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="absolute -inset-y-4 -left-1/3 w-1/3 rotate-12 bg-white/25 blur-md transition-transform duration-700 group-hover:translate-x-[420%]" />
                  </div>

                  <h3 className="text-[1.1rem] font-semibold tracking-tight sm:text-[1.15rem]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-soft sm:text-[0.92rem]">
                    {p.desc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full px-3 py-1 text-[0.7rem] font-medium text-dim sm:text-[0.72rem]"
                        style={{
                          background: "var(--glass-inner)",
                          border: "1px solid var(--hairline)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9rem] font-medium accent">
                    View project
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </GlassCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {active && <ProjectModal p={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

type Fact = { label: string; value: string };
type Stat = { value: string; label: string };
type Section = { heading: string; body: string; bullets?: string[] };

type Project = {
  title: string;
  desc: string;
  detail: string;
  meta: string;
  tech: string[];
  grad: string;
  /** one-line positioning statement shown under the title in the modal */
  tagline: string;
  /** engagement facts rendered as a definition grid */
  facts: Fact[];
  /** headline outcome numbers */
  stats: Stat[];
  /** the long-form case study */
  sections: Section[];
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
    tagline:
      "Rebuilding a retail bank's entire surface area on one tokenised foundation.",
    facts: [
      { label: "Timeline", value: "9 months" },
      { label: "Team", value: "2 designers · 4 engineers" },
      { label: "Engagement", value: "Product + Design System" },
      { label: "Platforms", value: "iOS · Android · Web" },
    ],
    stats: [
      { value: "4.9★", label: "App Store rating" },
      { value: "−62%", label: "Time to ship a screen" },
      { value: "310+", label: "Components shipped" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Aurora had grown by acquisition. Three product teams had three different button components, two type scales and no shared definition of what 'primary' meant. Every new feature restarted the same arguments, and the apps had drifted far enough apart that customers noticed.",
      },
      {
        heading: "The challenge",
        body: "A bank cannot pause to rebuild. We needed to replace the foundation underneath a product serving 400,000 daily users without a freeze, a big-bang release, or a single regression in a regulated flow.",
        bullets: [
          "Three divergent codebases with no shared primitives",
          "Strict accessibility and audit requirements on every money-moving screen",
          "A dark mode that had been promised to customers twice and shipped zero times",
        ],
      },
      {
        heading: "What we built",
        body: "A three-layer token architecture — primitive, semantic, component — expressed once and compiled out to Swift, Kotlin and CSS. Design decisions now live in one place and propagate everywhere within a release cycle.",
        bullets: [
          "310 components with visual regression coverage on every state",
          "Light and dark derived from the same semantic layer, so neither can drift",
          "Motion tokens that keep timing consistent across platforms",
          "A migration codemod that rewrote 40% of legacy call sites automatically",
        ],
      },
      {
        heading: "Under the hood",
        body: "The web client is React and TypeScript with a strict component contract — every prop is a token reference, never a raw value, which makes an off-system colour a type error rather than a code review argument. Framer Motion drives transitions off the shared motion scale.",
      },
      {
        heading: "The outcome",
        body: "Dark mode shipped six weeks after the token layer landed, as a configuration change rather than a project. New screens that used to take a fortnight now reach production in three days, and the design team stopped being a bottleneck on routine work.",
      },
    ],
  },
  {
    title: "Lumen Health",
    desc: "Patient-first telehealth platform focused on clarity and accessibility.",
    detail:
      "Lumen needed a telehealth platform that felt reassuring rather than clinical. We designed an accessible, patient-first flow — from booking to consultation to follow-up — meeting WCAG AA throughout, with a component library that the in-house team now extends on their own.",
    meta: "2023 · Healthcare · Web App",
    tech: ["Next.js", "Node", "Accessibility"],
    grad: "linear-gradient(140deg,#9eecd6,#8fb4ff)",
    tagline:
      "A telehealth platform that reassures rather than intimidates — accessible to WCAG AA throughout.",
    facts: [
      { label: "Timeline", value: "7 months" },
      { label: "Team", value: "1 designer · 3 engineers" },
      { label: "Engagement", value: "End-to-end product" },
      { label: "Compliance", value: "WCAG 2.1 AA · HIPAA" },
    ],
    stats: [
      { value: "+41%", label: "Appointments completed" },
      { value: "AA", label: "Verified on every flow" },
      { value: "−28%", label: "Support tickets" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Lumen's booking funnel lost almost half its users between choosing a clinician and joining the call. The product worked; it simply felt like paperwork at the exact moment people were most anxious.",
      },
      {
        heading: "Designing for a worried user",
        body: "We rewrote the flow around a single question at a time, in plain language, with the next step always visible. Nothing is asked twice, and nothing medical is phrased in a way that invites panic.",
        bullets: [
          "Booking reduced from 11 fields across 4 screens to 5 fields across 2",
          "A pre-call check that tests camera, microphone and bandwidth before the appointment",
          "Plain-language summaries after every consultation, written for a 12-year-old reading level",
        ],
      },
      {
        heading: "Accessibility as a constraint, not a pass",
        body: "AA was treated as a build requirement rather than an audit at the end. Every interactive element was keyboard-tested and screen-reader-tested as part of its definition of done.",
        bullets: [
          "Full keyboard paths through booking, consultation and follow-up",
          "Contrast validated automatically in CI — a failing ratio breaks the build",
          "Focus order and live-region announcements verified with NVDA and VoiceOver",
        ],
      },
      {
        heading: "Under the hood",
        body: "Next.js with server-rendered routes so the first meaningful paint arrives fast on hospital wifi, a Node service layer brokering the records API, and a component library the in-house team now extends without us.",
      },
      {
        heading: "The outcome",
        body: "Completed appointments rose 41% quarter on quarter, and the drop-off between selection and call effectively disappeared. The support team's most common ticket — 'my camera isn't working' — fell away once the pre-call check shipped.",
      },
    ],
  },
  {
    title: "Cove Commerce",
    desc: "Headless storefront with a refined, editorial shopping experience.",
    detail:
      "A headless storefront where the shopping experience reads like an editorial. We paired a GraphQL commerce backend with buttery page transitions and rich media, lifting conversion while keeping the brand's quiet, premium tone intact.",
    meta: "2024 · E-commerce · Storefront",
    tech: ["Vite", "GraphQL", "UX"],
    grad: "linear-gradient(140deg,#ffb2d8,#b9a8ff)",
    tagline:
      "A headless storefront where the shopping experience reads like an editorial.",
    facts: [
      { label: "Timeline", value: "5 months" },
      { label: "Team", value: "2 designers · 3 engineers" },
      { label: "Engagement", value: "Storefront rebuild" },
      { label: "Markets", value: "8 regions · 4 currencies" },
    ],
    stats: [
      { value: "+23%", label: "Conversion rate" },
      { value: "0.9s", label: "Largest contentful paint" },
      { value: "−45%", label: "Bounce on product pages" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Cove sells considered, expensive objects, but their storefront looked like every other template — dense grids, aggressive badges, and a checkout that shouted. The brand's restraint disappeared the moment someone tried to buy something.",
      },
      {
        heading: "Editorial, not catalogue",
        body: "We treated each product page as a piece of writing rather than a spec sheet. Photography leads, copy breathes, and the specifications sit below the fold for the people who want them.",
        bullets: [
          "Full-bleed imagery with art-directed crops per breakpoint",
          "One clear call to action per screen — no competing buttons",
          "Related products framed as 'goes well with' rather than an upsell rail",
        ],
      },
      {
        heading: "Speed as a design feature",
        body: "Premium reads as fast. We moved the storefront onto a headless GraphQL backend and shipped a Vite build tuned for a sub-second first paint, even on mid-range Android over 4G.",
        bullets: [
          "Route-level code splitting with predictive prefetch on hover and viewport",
          "Images served as AVIF with WebP fallback, sized per device pixel ratio",
          "Cart state resolved optimistically so adding an item never blocks on the network",
        ],
      },
      {
        heading: "The outcome",
        body: "Conversion rose 23% against the previous storefront on matched traffic, and the average session covered more products, not fewer — people browsed further because browsing stopped feeling like work.",
      },
    ],
  },
  {
    title: "Northwind CRM",
    desc: "An operations suite that makes complex workflows feel effortless.",
    detail:
      "Northwind's teams juggled dense, complex workflows. We distilled them into an operations suite that feels effortless — progressive disclosure, keyboard-first flows, and a performant Rust core — so power users move fast without ever feeling overwhelmed.",
    meta: "2023 · SaaS · Operations",
    tech: ["React", "Rust", "System Design"],
    grad: "linear-gradient(140deg,#8fb4ff,#9eecd6)",
    tagline:
      "Dense, complex operations work distilled into something that feels effortless.",
    facts: [
      { label: "Timeline", value: "11 months" },
      { label: "Team", value: "1 designer · 5 engineers" },
      { label: "Engagement", value: "Platform rebuild" },
      { label: "Scale", value: "12M records · 900 seats" },
    ],
    stats: [
      { value: "−54%", label: "Time on core task" },
      { value: "16ms", label: "P95 interaction latency" },
      { value: "900", label: "Daily active operators" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Northwind's operators live in the product for eight hours a day. They had learned to work around it — spreadsheets on second monitors, a shared document of tribal knowledge, and a training period measured in weeks.",
      },
      {
        heading: "Designing for expertise",
        body: "Software for people who use it all day should optimise for the hundredth hour, not the first. We inverted the usual priorities: density over whitespace, keyboard over mouse, recall over discovery.",
        bullets: [
          "A command palette covering every action in the product",
          "Progressive disclosure so complexity appears on demand, not by default",
          "Bulk operations on any list, with an undo window on everything destructive",
          "Layouts operators can save and reuse per workflow",
        ],
      },
      {
        heading: "Under the hood",
        body: "The bottleneck was never the UI framework — it was pulling 12 million records through a general-purpose API. We moved the aggregation layer to Rust and streamed results into a virtualised React table.",
        bullets: [
          "Rust service handling filtering and aggregation close to the data",
          "Virtualised rendering so list size stops mattering to the client",
          "Optimistic writes with server reconciliation, so the UI never waits on a round trip",
        ],
      },
      {
        heading: "The outcome",
        body: "The core daily task went from just over four minutes to under two. New operators reached competence in days rather than weeks, and the shared workarounds document was quietly deleted.",
      },
    ],
  },
  {
    title: "Studio Muse",
    desc: "A creative portfolio engine with buttery transitions and rich media.",
    detail:
      "A portfolio engine for creatives who care about craft. WebGL-backed transitions, smart media handling, and a CMS that stays out of the way — every case study loads fast and animates smoothly, on any device.",
    meta: "2024 · Creative · Platform",
    tech: ["Astro", "WebGL", "Framer Motion"],
    grad: "linear-gradient(140deg,#c6b8ff,#ffb2d8)",
    tagline:
      "A portfolio engine for creatives who care about craft — fast, quiet, and out of the way.",
    facts: [
      { label: "Timeline", value: "4 months" },
      { label: "Team", value: "2 designers · 2 engineers" },
      { label: "Engagement", value: "Platform + CMS" },
      { label: "Users", value: "1,200 studios" },
    ],
    stats: [
      { value: "98", label: "Lighthouse performance" },
      { value: "60fps", label: "Held on mid-range mobile" },
      { value: "3.5×", label: "Faster case-study setup" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Studio Muse's customers are designers and photographers — an audience that will forgive almost anything except a site that feels cheap. The existing builder produced portfolios that loaded slowly and animated badly, which reflected on their work.",
      },
      {
        heading: "Motion with a budget",
        body: "Every transition had to earn its cost. We set a hard rule that no animation may touch a property that triggers layout, and that the whole page must hold 60fps on a four-year-old Android.",
        bullets: [
          "WebGL transitions between case studies, with a CSS fallback path",
          "Transform and opacity only — never width, height, or filter, in any animation",
          "All decorative motion pauses off-screen and respects reduced-motion",
        ],
      },
      {
        heading: "A CMS that disappears",
        body: "Astro renders the public site as static HTML with islands of interactivity, so a portfolio is cheap to host and near-instant to load. Editors work in a stripped-back interface built around dragging images into a page.",
        bullets: [
          "Static output with partial hydration only where interaction exists",
          "Automatic responsive derivatives generated on upload",
          "Draft previews that share a URL without exposing the whole account",
        ],
      },
      {
        heading: "The outcome",
        body: "Setting up a case study went from a long afternoon to under an hour, and portfolios built on the platform score in the high nineties on Lighthouse by default rather than after tuning.",
      },
    ],
  },
  {
    title: "Atlas Analytics",
    desc: "Quiet, legible dashboards that turn data into confident decisions.",
    detail:
      "Atlas turns dense data into confident decisions. We built quiet, legible dashboards with an accessible colour system and D3-powered charts that stay readable at a glance — no chart junk, just signal.",
    meta: "2023 · Analytics · Dashboard",
    tech: ["React", "D3", "Data Viz"],
    grad: "linear-gradient(140deg,#a8d8ff,#b9a8ff)",
    tagline:
      "Dense data turned into confident decisions — no chart junk, just signal.",
    facts: [
      { label: "Timeline", value: "6 months" },
      { label: "Team", value: "1 designer · 3 engineers" },
      { label: "Engagement", value: "Dashboard + design system" },
      { label: "Data", value: "40M events / day" },
    ],
    stats: [
      { value: "−70%", label: "Time to first insight" },
      { value: "8", label: "Colour-blind-safe series" },
      { value: "120ms", label: "Median chart render" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "Atlas had built every chart type a customer had ever requested. The result was a dashboard nobody could read: eleven colours competing for attention, four different ways to show a trend, and no visual hierarchy telling anyone where to look first.",
      },
      {
        heading: "Fewer charts, better chosen",
        body: "We cut the chart library roughly in half and wrote a form heuristic that maps a question to exactly one appropriate visualisation, so the product stops offering choices that lead somewhere bad.",
        bullets: [
          "A categorical palette validated for deuteranopia, protanopia and tritanopia",
          "Sequential and diverging scales derived from the same base hues",
          "One accent reserved exclusively for the metric currently under investigation",
          "Every chart legible in light and dark without a separate palette",
        ],
      },
      {
        heading: "Under the hood",
        body: "D3 handles scales and shape generation while React owns the DOM, which keeps rendering predictable and lets us memoise aggressively. Heavy aggregation is pushed to the query layer so the browser only ever receives what it draws.",
        bullets: [
          "Downsampling with LTTB so a million points still read as the same curve",
          "Canvas for dense scatter plots, SVG everywhere legibility matters more",
          "Tooltips and crosshairs driven by a single pointer handler per chart",
        ],
      },
      {
        heading: "The outcome",
        body: "Time from opening the dashboard to stating a conclusion fell by roughly 70% in moderated testing. The support team stopped receiving screenshots captioned 'what am I looking at?'",
      },
    ],
  },
];

function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  /* The panel's backdrop blur is only enabled once the entrance animation has
     finished, and is dropped again the moment it starts leaving. Blurring a
     moving/scaling element re-computes the filter every frame — gating it keeps
     open/close buttery while still giving real glass while you read. */
  const [settled, setSettled] = useState(false);
  // Fallback: don't rely solely on the animation callback firing — if it's ever
  // missed the panel would never get its glass back.
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  // Rendered into <body> via a portal so it escapes the .stage transform
  // context — otherwise position:fixed anchors to that tall element and the
  // panel lands far below the viewport.
  return createPortal(
    /* The padding on this flex container IS the breathing room around the
       dialog — the panel is capped at 100% of that inset box, so the gap is
       equal on all four sides at every breakpoint. */
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-5 sm:p-8 lg:p-12">
      <motion.div
        className="modal-scrim absolute inset-0"
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
        /* data-lenis-prevent tells the smooth-scroll library to ignore wheel
           and touch events that start inside this element. Without it Lenis
           preventDefault()s them for the page, and the dialog never scrolls. */
        data-lenis-prevent
        className={`glass glass-sheen glass-nodrift modal-scroll relative z-10 max-h-full w-full max-w-3xl overflow-y-auto overflow-x-hidden rounded-[28px]${
          settled ? " is-settled" : ""
        }`}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setSettled(true)}
      >
        {/* close button rides along with the scroll container */}
        <button
          onClick={onClose}
          aria-label="Close"
          /* solid fill rather than backdrop-blur — one less blur surface */
          className="sticky left-full top-4 z-20 mr-4 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/90 transition-colors hover:bg-black/60"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <X size={18} />
        </button>

        {/* cover */}
        <div
          className="relative -mt-[52px] h-44 w-full sm:h-56"
          style={{ background: p.grad }}
        >
          <div className="absolute inset-0 bg-white/10" />
          {/* fade the cover into the panel body */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background: "linear-gradient(to top, var(--modal-bg), transparent)",
            }}
          />
        </div>

        <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-12 sm:pt-8">
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-dim sm:text-[0.75rem]">
            {p.meta}
          </div>
          <h3 className="mt-2 text-[1.6rem] font-semibold tracking-tight sm:text-[2.15rem]">
            {p.title}
          </h3>
          <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-soft sm:text-[1.1rem]">
            {p.tagline}
          </p>

          {/* headline outcome numbers */}
          <div className="mt-7 grid grid-cols-3 gap-3">
            {p.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl px-3 py-4 text-center sm:px-4"
                style={{
                  background: "var(--glass-inner)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <div className="text-[1.15rem] font-semibold tracking-tight sm:text-[1.5rem]">
                  {s.value}
                </div>
                <div className="mt-1 text-[0.68rem] leading-tight text-dim sm:text-[0.75rem]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* engagement facts */}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y py-6 sm:grid-cols-4" style={{ borderColor: "var(--hairline)" }}>
            {p.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[0.68rem] uppercase tracking-wider text-dim sm:text-[0.72rem]">
                  {f.label}
                </dt>
                <dd className="mt-1 text-[0.88rem] font-medium sm:text-[0.95rem]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* the long-form case study */}
          <div className="mt-8 space-y-8">
            {p.sections.map((s) => (
              <section key={s.heading}>
                <h4 className="text-[1.05rem] font-semibold tracking-tight sm:text-[1.2rem]">
                  {s.heading}
                </h4>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-soft sm:text-[1rem]">
                  {s.body}
                </p>
                {s.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[0.9rem] leading-relaxed text-soft sm:text-[0.97rem]"
                      >
                        <span
                          className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* stack */}
          <div className="mt-9">
            <div className="text-[0.68rem] uppercase tracking-wider text-dim sm:text-[0.72rem]">
              Built with
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-3.5 py-1.5 text-[0.75rem] font-medium text-dim sm:text-[0.8rem]"
                  style={{
                    background: "var(--glass-inner)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.9rem] font-medium text-white sm:text-[0.95rem]"
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

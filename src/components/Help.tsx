import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import Button from "./Button";
import { navigate } from "../hooks/useRoute";
import { RECIPIENT } from "../lib/sendInquiry";

const FAQ = [
  {
    q: "What kind of projects do you take on?",
    a: "We partner on web apps, product design systems, marketing sites, and complex product interfaces — typically for teams who care deeply about craft.",
  },
  {
    q: "How long does a typical engagement last?",
    a: "Most projects run between six and sixteen weeks. We scope carefully up front so timelines stay calm and predictable.",
  },
  {
    q: "Do you work with existing design or code?",
    a: "Absolutely. We can extend your current system, refactor toward one, or build fresh — whatever serves the product best.",
  },
  {
    q: "What does working together look like?",
    a: "A small senior team, weekly check-ins, and a shared workspace. You'll always know exactly where things stand.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard
      lite
      radius="rounded-[22px]"
      className="overflow-hidden transition-shadow duration-400"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[1.02rem] font-medium">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
          style={{
            background: "var(--glass-inner)",
            border: "1px solid var(--hairline)",
            color: "var(--accent)",
          }}
        >
          <Plus size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-soft">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function Help() {
  return (
    <section id="help" className="px-4 pt-14 sm:pt-20">
      <GlassCard className="mx-auto max-w-4xl px-6 py-12 sm:px-12 sm:py-16">
        <SectionHeading
          eyebrow="Help"
          title="Frequently asked"
          subtitle="Everything you might want to know before reaching out."
          align="center"
        />
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <Item {...f} />
            </Reveal>
          ))}
        </div>

        {/* anything the FAQ doesn't cover routes straight to the enquiry page */}
        <Reveal delay={0.3}>
          {/* a real GlassCard, not a flat --glass-inner fill: it now carries
              the same edge-catch, sheen and layered shadow as the FAQ items
              above, so it reads as glass in both themes */}
          <GlassCard
            lite
            radius="rounded-[24px]"
            className="mx-auto mt-10 max-w-2xl px-6 py-7 text-center sm:px-8"
          >
            <h3 className="text-[1.05rem] font-semibold tracking-tight sm:text-[1.15rem]">
              Still have questions?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[0.92rem] leading-relaxed text-soft">
              If your question isn't answered above, get in touch — we reply to
              every enquiry within 24 hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => navigate("/get-started")}>
                Contact us <ArrowUpRight size={17} />
              </Button>
              <a
                href={`mailto:${RECIPIENT}`}
                className="text-[0.9rem] font-medium underline decoration-1 underline-offset-4 transition-opacity hover:opacity-80"
                style={{ color: "var(--link)" }}
              >
                {RECIPIENT}
              </a>
            </div>
          </GlassCard>
        </Reveal>
      </GlassCard>
    </section>
  );
}

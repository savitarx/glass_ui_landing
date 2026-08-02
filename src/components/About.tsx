import { Compass, Eye, Gem } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const PILLARS = [
  {
    icon: Compass,
    title: "Mission",
    text: "To craft software that feels calm, human, and effortless — raising the standard for digital quality.",
  },
  {
    icon: Eye,
    title: "Vision",
    text: "A world where every product a person touches respects their attention and their time.",
  },
  {
    icon: Gem,
    title: "Values",
    text: "Restraint over noise. Craft over speed for its own sake. Honesty in every detail we ship.",
  },
];

const TIMELINE = [
  { year: "2024", text: "Team Invisos founded as a website design studio." },
  { year: "2024", text: "Grew into a full design-and-engineering practice." },
  { year: "2025", text: "Shipped our 25th product across fintech, health & commerce." },
  { year: "2026", text: "Recognised for craft with quality design honours" },
];

export default function About() {
  return (
    <section id="about" className="px-4 pt-14 sm:pt-20">
      <GlassCard className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <SectionHeading
          eyebrow="About Us"
          title="A studio built on intention"
          subtitle="We're a small, senior team that believes the best products come from care, clarity, and restraint."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <GlassCard
                lite
                radius="rounded-[24px]"
                className="h-full p-6 transition-shadow duration-400 hover:shadow-glass-hover"
              >
                <div
                  className="mb-4 grid h-12 w-12 place-items-center rounded-2xl"
                  style={{
                    background: "var(--glass-inner)",
                    border: "1px solid var(--hairline)",
                    color: "var(--accent)",
                  }}
                >
                  <p.icon size={20} />
                </div>
                <h3 className="text-[1.2rem] font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-soft">
                  {p.text}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        {/* Timeline */}
        <Reveal delay={0.1}>
          <div className="mt-12">
            <h3 className="mb-6 text-[1.15rem] font-semibold tracking-tight">
              Our journey
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TIMELINE.map((t, i) => (
                /* keyed by index, not year — two milestones share "2024", and
                   duplicate keys made React reconcile these rows against the
                   wrong nodes on every re-render */
                <div key={i} className="relative">
                  <GlassCard lite radius="rounded-[22px]" className="h-full p-5">
                    <div
                      className="text-[1.4rem] font-semibold tracking-tight"
                      style={{ color: "var(--accent)" }}
                    >
                      {t.year}
                    </div>
                    <p className="mt-2 text-[0.9rem] leading-relaxed text-soft">
                      {t.text}
                    </p>
                  </GlassCard>
                  {i < TIMELINE.length - 1 && (
                    <div className="absolute right-[-14px] top-1/2 hidden h-px w-4 bg-[color:var(--hairline)] lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </GlassCard>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const REVIEWS = [
  {
    quote:
      "Team Invisos delivered the most refined product experience we've ever shipped. Every detail felt intentional.",
    name: "Marina Vale",
    role: "CPO, Aurora",
    initials: "MV",
  },
  {
    quote:
      "Calm, precise, and remarkably fast. They think like designers and build like world-class engineers.",
    name: "Kai Nakamura",
    role: "Founder, Cove",
    initials: "KN",
  },
  {
    quote:
      "The polish is Apple-tier. Our users constantly tell us the app simply feels better than anything else.",
    name: "Selene Ortiz",
    role: "Design Lead, Lumen",
    initials: "SO",
  },
  {
    quote:
      "A partner, not a vendor. They cared about our outcomes as if the product were their own.",
    name: "Dominic Reeve",
    role: "VP Product, Northwind",
    initials: "DR",
  },
  {
    quote:
      "Impeccable craft and communication. The result belongs in a design award showcase.",
    name: "Aria Fenn",
    role: "CEO, Studio Muse",
    initials: "AF",
  },
];

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <GlassCard
      lite
      radius="rounded-[26px]"
      className="mx-3 flex w-[340px] shrink-0 flex-col p-6 sm:w-[380px]"
    >
      <div className="mb-3 flex gap-0.5" style={{ color: "var(--accent)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <p className="text-[1.02rem] leading-relaxed text-[color:var(--text-soft)]">
        “{r.quote}”
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div
          className="grid h-11 w-11 place-items-center rounded-full text-[0.85rem] font-semibold text-white"
          style={{
            background: "linear-gradient(150deg, var(--accent), var(--accent-2))",
          }}
        >
          {r.initials}
        </div>
        <div>
          <div className="text-[0.95rem] font-semibold">{r.name}</div>
          <div className="text-[0.82rem] text-dim">{r.role}</div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Reviews() {
  const loop = [...REVIEWS, ...REVIEWS];
  const track = useRef<HTMLDivElement>(null);

  /* The marquee runs on EVERY device (it was previously paused wholesale on
     the low-perf tier, which stopped it on phones). It is only parked while
     the section is off screen, so it costs nothing when nobody can see it. */
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("marquee-idle", !e.isIntersecting),
      { rootMargin: "20% 0px 20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="reviews" className="px-4 pt-24 sm:pt-32">
      <GlassCard className="mx-auto max-w-6xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
        <SectionHeading
          eyebrow="Client Reviews"
          title="Trusted by teams who care"
          subtitle="We measure success by the quiet confidence our partners feel in their product."
        />

        <Reveal delay={0.1}>
          <div className="marquee-pause relative mt-12">
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[color:var(--page-2)] to-transparent opacity-70" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[color:var(--page-2)] to-transparent opacity-70" />
            <div className="overflow-hidden">
              <div ref={track} className="marquee-track flex animate-marquee">
                {loop.map((r, i) => (
                  <ReviewCard key={i} r={r} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </GlassCard>
    </section>
  );
}

import { motion } from "framer-motion";
import { ArrowUpRight, Check, Plus, Wand2 } from "lucide-react";
import GlassCard from "./GlassCard";
import Button from "./Button";
import SiteNav from "./Navbar";
import { scrollToId } from "../hooks/useLenis";
import { navigate } from "../hooks/useRoute";
import { useIdleOffscreen } from "../hooks/useIdleOffscreen";

/* A small floating glass widget used inside the hero artwork */
function Widget({
  className = "",
  delay = 0,
  float = 12,
  children,
}: {
  className?: string;
  delay?: number;
  float?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <div
        className="float-y"
        style={
          {
            "--fl": `${float}px`,
            "--fd": `${7 + delay * 3}s`,
            animationDelay: `${delay}s`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const art = useIdleOffscreen<HTMLDivElement>();
  return (
    <section id="home" className="px-4 pt-4 sm:pt-6">
      <GlassCard
        id="hero-card"
        className="glass-refract mx-auto max-w-6xl overflow-hidden px-6 pb-12 pt-5 sm:px-12 sm:pb-16 sm:pt-6 lg:pb-20"
      >
        {/* the navbar lives inside the hero card at the top */}
        <SiteNav floating={false} />

        <div className="grid items-center gap-12 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="glass-lite glass-sheen mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium text-soft"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              Premium software studio
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
              className="text-[2.05rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[3.4rem] sm:leading-[1.05] lg:text-[3.9rem]"
            >
              Building premium
              <br />
              digital experiences 
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
              className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-soft sm:mt-6 sm:text-[1.05rem]"
            >
              Team Invisos is a design-led engineering studio crafting
              elegant products with obsessive attention to detail — from first
              pixel to production.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Button onClick={() => scrollToId("projects")}>
                Explore Projects <ArrowUpRight size={18} />
              </Button>
              <Button variant="ghost" onClick={() => navigate("/get-started")}>
                Talk to an Expert
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-8 flex items-center gap-4 text-[0.8rem] text-dim sm:mt-10 sm:gap-6 sm:text-[0.85rem]"
            >
              <div>
                <div className="text-xl font-semibold text-[color:var(--text)]">
                  24*7
                </div>
                Support
              </div>
              <div className="h-8 w-px bg-[color:var(--hairline)]" />
              <div>
                <div className="text-xl font-semibold text-[color:var(--text)]">
                  2 years
                </div>
                Of craft
              </div>
              <div className="h-8 w-px bg-[color:var(--hairline)]" />
              <div>
                <div className="text-xl font-semibold text-[color:var(--text)]">
                  4.9/5
                </div>
                Client rating
              </div>
            </motion.div>
          </div>

          {/* Right — abstract floating glass artwork (hidden on phones for a clean, static hero) */}
          {/* The five float-y widgets animate forever; parked once scrolled past. */}
          <div
            ref={art}
            className="relative mx-auto hidden h-[440px] w-full max-w-[460px] sm:block sm:h-[480px]"
          >
            {/* soft gradient wash behind the glass layers */}
            <div
              className="absolute inset-8 rounded-[36px] blur-2xl opacity-80"
              style={{
                background:
                  "linear-gradient(140deg, var(--blob-lav), var(--blob-blue) 50%, var(--blob-mint))",
              }}
            />

            {/* base layer card — top-left */}
            <Widget className="left-0 top-0" delay={0.15} float={7}>
              <GlassCard lite className="w-44 rounded-[28px] p-5 sm:w-52">
                <div className="flex items-center justify-between">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-xl text-white"
                    style={{
                      background:
                        "linear-gradient(150deg, var(--accent), var(--accent-2))",
                    }}
                  >
                    <Wand2 size={16} />
                  </div>
                  <div className="h-6 w-11 rounded-full bg-[color:var(--glass-inner)] p-0.5">
                    <div
                      className="ml-auto h-5 w-5 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  </div>
                </div>
                <div className="mt-4 h-2.5 w-3/4 rounded-full bg-[color:var(--glass-inner)]" />
                <div className="mt-2 h-2.5 w-1/2 rounded-full bg-[color:var(--glass-inner)]" />
              </GlassCard>
            </Widget>

            {/* search widget — top-right */}
            <Widget className="right-0 top-2" delay={0.3} float={9}>
              <GlassCard
                lite
                className="flex w-44 items-center gap-2 rounded-full px-4 py-3 sm:w-52"
              >
                {/* <Search size={16} className="shrink-0 text-dim" /> */}
                <span className="truncate text-[0.85rem] text-dim"></span>
                <span
                  className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: "var(--accent)" }}
                >
                  <Plus size={14} />
                </span>
              </GlassCard>
            </Widget>

            {/* checklist widget — bottom-left */}
            <Widget className="bottom-0 left-0" delay={0.45} float={7}>
              <GlassCard lite className="w-44 rounded-[26px] p-4 sm:w-48">
                <div className="mb-3 text-[0.8rem] font-semibold">Delivery</div>
                {["Plan", "Create", "Deliver"].map((t, i) => (
                  <div key={t} className="mb-2 flex items-center gap-2.5">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-white"
                      style={{
                        background: i < 3 ? "var(--accent)" : "transparent",
                        border: i < 3 ? "none" : "1px solid var(--hairline)",
                      }}
                    >
                      {i < 3 && <Check size={12} />}
                    </span>
                    <span className="text-[0.82rem] text-soft">{t}</span>
                  </div>
                ))}
              </GlassCard>
            </Widget>

            {/* small stat pill — bottom-right */}
            <Widget className="bottom-2 right-0" delay={0.55} float={9}>
              <GlassCard lite className="rounded-3xl px-5 py-4">
                <div className="text-2xl font-semibold tracking-tight">98%</div>
                <div className="text-[0.75rem] text-dim">Satisfaction</div>
              </GlassCard>
            </Widget>

            {/* floating avatar chip — in the open middle */}
            <Widget className="left-[44%] top-[43%]" delay={0.65} float={6}>
              <div
                className="h-12 w-12 rounded-2xl shadow-glass-sm"
                style={{
                  background:
                    "conic-gradient(from 200deg, var(--blob-pink), var(--blob-lav), var(--blob-blue), var(--blob-mint), var(--blob-pink))",
                }}
              />
            </Widget>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

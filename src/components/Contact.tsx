import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import GlassCard from "./GlassCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import Button from "./Button";

function Field({
  label,
  type = "text",
  textarea,
}: {
  label: string;
  type?: string;
  textarea?: boolean;
}) {
  const [val, setVal] = useState("");
  const active = val.length > 0;
  const shared =
    "peer w-full rounded-2xl bg-[color:var(--glass-inner)] px-4 pt-6 pb-2 text-[0.95rem] outline-none transition-all duration-300 focus:ring-2";
  return (
    <label className="relative block">
      {textarea ? (
        <textarea
          rows={4}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className={`${shared} resize-none`}
          style={{ border: "1px solid var(--hairline)" }}
        />
      ) : (
        <input
          type={type}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className={shared}
          style={{ border: "1px solid var(--hairline)" }}
        />
      )}
      <span
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          active
            ? "top-2 text-[0.72rem]"
            : "top-4 text-[0.95rem] text-dim"
        }`}
        style={active ? { color: "var(--accent)" } : undefined}
      >
        {label}
      </span>
    </label>
  );
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="px-4 pt-14 sm:pt-20">
      <GlassCard className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something refined"
          subtitle="Tell us about your product. We reply to every enquiry within one business day."
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <Reveal>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" />
                <Field label="Email address" type="email" />
              </div>
              <Field label="Company" />
              <Field label="Tell us about your project" textarea />
              <div className="flex items-center gap-4 pt-1">
                <Button type="submit">
                  Send message <Send size={16} />
                </Button>
                <AnimatePresence>
                  {sent && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[0.9rem]"
                      style={{ color: "var(--accent)" }}
                    >
                      Thanks — we'll be in touch shortly.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>

          {/* Business details */}
          <Reveal delay={0.1}>
            <GlassCard lite radius="rounded-[26px]" className="p-6">
              <h3 className="text-[1.1rem] font-semibold tracking-tight">
                Studio details
              </h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-soft">
                Remote-first, working with teams across the globe.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@teaminvisos.com" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 018-2049" },
                  { icon: MapPin, label: "Based in", value: "Remote · GMT ±0" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl"
                      style={{
                        background: "var(--glass-inner)",
                        border: "1px solid var(--hairline)",
                        color: "var(--accent)",
                      }}
                    >
                      <row.icon size={17} />
                    </span>
                    <div>
                      <div className="text-[0.74rem] uppercase tracking-wider text-dim">
                        {row.label}
                      </div>
                      <div className="text-[0.95rem] font-medium">
                        {row.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 rounded-2xl p-4 text-[0.86rem] leading-relaxed text-soft"
                style={{
                  background: "var(--glass-inner)",
                  border: "1px solid var(--hairline)",
                }}
              >
                Currently accepting a limited number of projects for the next
                quarter.
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </GlassCard>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Handshake,
  Rocket,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import Reveal from "../components/Reveal";
import { navigate } from "../hooks/useRoute";
import { buildInquiryMail, sendInquiry } from "../lib/sendInquiry";

/* ------------------------------------------------------------------ data */

const BUILD_OPTIONS = [
  "Landing Page",
  "Business Website",
  "SaaS Platform",
  "Mobile App",
  "E-commerce Store",
  "Dashboard",
  "AI Automation",
  "UI/UX Design",
  "Custom Software",
  "Other",
];

const BUDGETS = [
  "Just Exploring",
  "Under ₹50,000",
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000+",
];

const TIMELINES = [
  "ASAP",
  "Within 2 Weeks",
  "Within 1 Month",
  "2–3 Months",
  "Flexible",
];

const ASSETS = [
  "I have a logo",
  "I have wireframes",
  "I have a Figma design",
  "I have an existing website",
  "None",
];

const PERKS = [
  { icon: Zap, label: "Average response time", value: "Less than 24 hours" },
  { icon: Sparkles, label: "Free consultation", value: "No commitment" },
  { icon: Rocket, label: "Modern tech stack", value: "Built to last" },
  { icon: Target, label: "Tailored solutions", value: "No templates" },
  { icon: Handshake, label: "Transparent communication", value: "Always" },
];

/* ------------------------------------------------------- small building blocks */

/** Section label + optional rule, on the 8px spacing system. */
function Legend({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-dim">
        {children}
      </h2>
      <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
    </div>
  );
}

/** Floating-label text field with a visible focus ring. */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
  invalid,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  hint?: string;
  invalid?: string;
  id: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.85rem] font-medium text-soft"
      >
        {label}
        {required && (
          <span aria-hidden style={{ color: "var(--accent)" }}>
            {" "}
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        aria-invalid={!!invalid}
        aria-describedby={hint || invalid ? `${id}-desc` : undefined}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="gs-input w-full rounded-2xl px-4 py-3.5 text-[0.95rem] outline-none"
        style={invalid ? { borderColor: "#e0576f" } : undefined}
      />
      {(hint || invalid) && (
        <p
          id={`${id}-desc`}
          className="mt-2 text-[0.8rem]"
          style={{ color: invalid ? "#e0576f" : "var(--text-dim)" }}
        >
          {invalid || hint}
        </p>
      )}
    </div>
  );
}

/** Selectable card / pill. `shape` controls the silhouette. */
function Choice({
  active,
  onClick,
  children,
  shape = "pill",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  shape?: "pill" | "card";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`gs-choice ${
        shape === "card"
          ? "rounded-[18px] px-4 py-3.5 text-left"
          : "rounded-full px-4 py-2.5"
      } text-[0.9rem] font-medium${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- the page */

export default function GetStarted() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [build, setBuild] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [assets, setAssets] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  /** how the inquiry actually went out — changes the success copy */
  const [via, setVia] = useState<"server" | "mail-client">("server");

  const ta = useRef<HTMLTextAreaElement>(null);

  // auto-resize the textarea to its content
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(el.scrollHeight, 160) + "px";
  }, [description]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const errors = {
    name: touched && !name.trim() ? "Please tell us your name." : "",
    email: touched && !emailValid ? "Enter a valid work email." : "",
  };
  const canSubmit = name.trim() && emailValid;

  const toggleAsset = (a: string) =>
    setAssets((prev) => {
      if (a === "None") return prev.includes("None") ? [] : ["None"];
      const next = prev.filter((x) => x !== "None");
      return next.includes(a) ? next.filter((x) => x !== a) : [...next, a];
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit || sending) return;
    setSending(true);
    const result = await sendInquiry({
      name,
      email,
      company,
      build,
      description,
      budget,
      timeline,
      assets,
      reference,
    });
    setVia(result.via);
    setSending(false);
    setSent(true);
  };

  /* ---------------------------------------------------- success state */
  if (sent) {
    return (
      <main className="relative z-[1] mx-auto flex min-h-screen max-w-3xl items-center px-5 py-16 sm:px-8">
        <GlassCard className="w-full px-6 py-14 text-center sm:px-12 sm:py-20">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-full"
            style={{
              background:
                "linear-gradient(160deg, var(--accent), var(--accent-2))",
              boxShadow:
                "0 18px 50px -18px color-mix(in srgb, var(--accent) 70%, transparent)",
            }}
          >
            {/* the tick draws itself */}
            <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden>
              <motion.path
                d="M10 19.5 L16.5 26 L28 13"
                fill="none"
                stroke="#fff"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.6rem]"
          >
            Thank You!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.5 }}
            className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-soft sm:text-[1rem]"
          >
            {via === "server" ? (
              <>
                We've received your project inquiry. Our team will review it and
                get back to you within 24 hours.
              </>
            ) : (
              <>
                Your inquiry is ready in your email app — press send and it's on
                its way. We'll get back to you within 24 hours.
              </>
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.5 }}
            className="mt-10"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="gs-submit inline-flex items-center justify-center gap-2 rounded-full px-10 py-3.5 text-[0.95rem] font-semibold text-white sm:px-12 sm:py-4"
            >
              Home
            </button>
          </motion.div>
        </GlassCard>
      </main>
    );
  }

  /* ------------------------------------------------------------- form */
  return (
    <main className="gs-page relative z-[1] mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-16">
      {/* back to site */}
      <Reveal>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="group mb-10 inline-flex items-center gap-2 text-[0.9rem] font-medium text-dim transition-colors hover:text-[color:var(--text)]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          Back to Invisos
        </button>
      </Reveal>

      {/* hero */}
      <header className="max-w-3xl">
        <Reveal>
          <span
            className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            Get Started
          </span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:mt-5 sm:text-[3.1rem] sm:tracking-[-0.035em] lg:text-[3.7rem]">
            Let's Build Something Exceptional.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-soft sm:mt-6 sm:text-[1.1rem]">
            Tell us about your project, and we'll get back to you within 24 hours
            with the next steps.
          </p>
        </Reveal>
      </header>

      <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-10">
        {/* ------------------------------------------------ form column */}
        <Reveal delay={0.16}>
          <form onSubmit={submit} noValidate>
            <GlassCard className="px-6 py-8 sm:px-10 sm:py-12">
              {/* ABOUT YOU */}
              <section>
                <Legend>About you</Legend>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    id="gs-name"
                    label="Full Name"
                    required
                    value={name}
                    onChange={setName}
                    placeholder="John Doe"
                    invalid={errors.name}
                  />
                  <Field
                    id="gs-email"
                    label="Work Email"
                    required
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="john@company.com"
                    invalid={errors.email}
                  />
                </div>
                <div className="mt-6">
                  <Field
                    id="gs-company"
                    label="Company (Optional)"
                    value={company}
                    onChange={setCompany}
                    placeholder="Acme Technologies"
                  />
                </div>
              </section>

              {/* PROJECT DETAILS */}
              <section className="mt-14">
                <Legend>Project details</Legend>
                <p className="mb-5 text-[0.95rem] font-medium">
                  What would you like us to build?
                </p>
                <div
                  role="radiogroup"
                  aria-label="What would you like us to build?"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  {BUILD_OPTIONS.map((o) => (
                    <Choice
                      key={o}
                      shape="card"
                      active={build === o}
                      onClick={() => setBuild(build === o ? "" : o)}
                    >
                      {o}
                    </Choice>
                  ))}
                </div>
              </section>

              {/* DESCRIPTION */}
              <section className="mt-14">
                <Legend>Project description</Legend>
                <textarea
                  ref={ta}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-label="Project description"
                  placeholder="Tell us about your project, your goals, target audience, required features, or anything else that will help us understand your vision."
                  className="gs-input w-full resize-none rounded-2xl px-4 py-4 text-[0.95rem] leading-relaxed outline-none"
                  style={{ minHeight: 160 }}
                />
              </section>

              {/* BUDGET */}
              <section className="mt-14">
                <Legend>Estimated budget</Legend>
                <div role="radiogroup" aria-label="Estimated budget" className="flex flex-wrap gap-3">
                  {BUDGETS.map((b) => (
                    <Choice
                      key={b}
                      active={budget === b}
                      onClick={() => setBudget(budget === b ? "" : b)}
                    >
                      {b}
                    </Choice>
                  ))}
                </div>
              </section>

              {/* TIMELINE */}
              <section className="mt-14">
                <Legend>Timeline</Legend>
                <div role="radiogroup" aria-label="Timeline" className="flex flex-wrap gap-3">
                  {TIMELINES.map((t) => (
                    <Choice
                      key={t}
                      active={timeline === t}
                      onClick={() => setTimeline(timeline === t ? "" : t)}
                    >
                      {t}
                    </Choice>
                  ))}
                </div>
              </section>

              {/* ASSETS */}
              <section className="mt-14">
                <Legend>Project assets (optional)</Legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ASSETS.map((a) => {
                    const on = assets.includes(a);
                    return (
                      <label key={a} className="gs-check">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleAsset(a)}
                          className="sr-only"
                        />
                        <span className={`gs-box${on ? " is-on" : ""}`} aria-hidden>
                          {on && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="text-[0.92rem]">{a}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* REFERENCE */}
              <section className="mt-14">
                <Legend>Reference website (optional)</Legend>
                <Field
                  id="gs-ref"
                  label="Reference URL"
                  value={reference}
                  onChange={setReference}
                  placeholder="https://example.com"
                  hint="Share websites you like so we can better understand your style."
                />
              </section>

              {/* CTA */}
              <div className="mt-14">
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="gs-submit group inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-[0.95rem] font-semibold tracking-[-0.01em] text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-11 sm:text-[1.02rem]"
                >
                  {sending ? "Sending…" : "Send Project Inquiry"}
                  {sending ? (
                    <span className="gs-spinner" aria-hidden />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  )}
                </button>
                <AnimatePresence>
                  {touched && !canSubmit && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 text-[0.85rem]"
                      style={{ color: "#e0576f" }}
                    >
                      Please add your name and a valid email so we can reply.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </form>
        </Reveal>

        {/* --------------------------------------- floating info panel */}
        {/* Hidden entirely below lg — on a phone it pushed the form far down
            the page for information that isn't needed to fill it in. */}
        <Reveal delay={0.24} className="hidden lg:block">
          <aside className="lg:sticky lg:top-10">
            <GlassCard className="px-6 py-8 sm:px-7">
              <h2 className="text-[1.05rem] font-semibold tracking-tight">
                Why teams choose Invisos
              </h2>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-soft">
                A small senior team, working directly with you.
              </p>

              <ul className="mt-8 space-y-6">
                {PERKS.map((p) => (
                  <li key={p.label} className="flex gap-4">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{
                        background: "var(--glass-inner)",
                        border: "1px solid var(--hairline)",
                        color: "var(--accent)",
                      }}
                    >
                      <p.icon size={17} />
                    </span>
                    <div>
                      <div className="text-[0.72rem] uppercase tracking-wider text-dim">
                        {p.label}
                      </div>
                      <div className="mt-0.5 text-[0.95rem] font-medium">
                        {p.value}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div
                className="mt-8 rounded-2xl p-4 text-[0.85rem] leading-relaxed text-soft"
                style={{
                  background: "var(--glass-inner)",
                  border: "1px solid var(--hairline)",
                }}
              >
                Prefer email? Write to us directly at{" "}
                <a
                  href={buildInquiryMail()}
                  className="font-medium underline decoration-1 underline-offset-2"
                  style={{ color: "var(--accent)" }}
                >
                  thavashankarj@gmail.com
                </a>
              </div>
            </GlassCard>
          </aside>
        </Reveal>
      </div>
    </main>
  );
}
